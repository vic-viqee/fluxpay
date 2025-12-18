import { Response, NextFunction } from 'express';
import { initiateStkPush } from '../../services/mpesa.service';
import logger from '../../utils/logger';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import User from '../../models/User';
import Transaction from '../../models/Transaction';
import Subscription from '../../models/Subscription'; // Import Subscription model

export const initiatePayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Handle variable name mismatch and get required data
    let { amount, phone, phoneNumber, subscriptionId } = req.body;
    if (!phone && phoneNumber) phone = phoneNumber;

    if (!amount || !phone || !subscriptionId) {
      return res.status(400).json({ message: 'Amount, phone number, and subscription ID are required.' });
    }

    const ownerId = req.user?._id;
    if (!ownerId) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    // Verify subscription belongs to the owner
    const subscription = await Subscription.findOne({ _id: subscriptionId, ownerId });
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found or does not belong to this user.' });
    }

    const user = await User.findById(ownerId);
    const businessName = user?.businessName || 'FluxPay'; 

    // 2. Initiate STK Push
    const response: any = await initiateStkPush(phone, amount, businessName);

    // 3. Save to DB
    const newTransaction = new Transaction({
      subscriptionId,
      ownerId,
      darajaRequestId: response.CheckoutRequestID,
      amountKes: amount,
      status: 'PENDING', // New PENDING status
      retryCount: 0,
    });

    await newTransaction.save();
    
    res.status(200).json({ message: 'STK push initiated successfully', data: response });
  } catch (error) {
    logger.error('STK Push Error:', error); 
    next(error);
  }
};

export const handleCallback = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const body = req.body.Body || req.body; 
    const callbackData = body.stkCallback;
    
    if (!callbackData) {
      logger.warn('M-Pesa Callback received with no stkCallback data.', req.body);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' }); // Acknowledge receipt
    }

    const transaction = await Transaction.findOne({ darajaRequestId: callbackData.CheckoutRequestID });
    
    if (!transaction) {
      logger.error('Transaction not found for darajaRequestId:', callbackData.CheckoutRequestID);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' }); // Acknowledge receipt
    }
    
    if (callbackData.ResultCode === 0) {
      // Payment Successful
      const meta = callbackData.CallbackMetadata?.Item || [];
      const mpesaReceiptNo = meta.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
      
      transaction.status = 'SUCCESS'; // New SUCCESS status
      transaction.mpesaReceiptNo = mpesaReceiptNo;
      await transaction.save();

      // TODO: Trigger success notifications to Alex and John
    } else {
      // Payment Failed
      transaction.status = 'FAILED'; // New FAILED status
      await transaction.save();

      // TODO: Trigger failure notifications to Alex and John
    }

    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    logger.error('Callback Error:', error);
    next(error);
  }
};