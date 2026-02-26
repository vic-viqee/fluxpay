import { Request, Response, NextFunction } from 'express';
import { initiateStkPush } from '../../services/mpesa.service';
import logger from '../../utils/logger';
import User from '../../models/User';
import Transaction from '../../models/Transaction';
import Subscription from '../../models/Subscription';
import { IUser } from '../../models/User';
import { isValidMpesaPhoneNumber } from '../../utils/phone'; // NEW IMPORT

export const initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { amount, phone, phoneNumber, subscriptionId } = req.body;
    if (!phone && phoneNumber) phone = phoneNumber;

    if (!amount || !phone || !subscriptionId) {
      return res.status(400).json({ message: 'Amount, phone number, and subscription ID are required.' });
    }

    // Validate phone number
    const phoneValidation = isValidMpesaPhoneNumber(phone);
    if (!phoneValidation.isValid) {
      return res.status(400).json({ message: phoneValidation.message });
    }

    const user = req.user as IUser;
    const ownerId = user?._id;
    if (!ownerId) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    const subscription = await Subscription.findOne({ _id: subscriptionId, ownerId });
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found or does not belong to this user.' });
    }

    const fetchedUser = await User.findById(ownerId);
    const businessName = fetchedUser?.businessName || 'FluxPay'; 

    const response: any = await initiateStkPush(phone, amount, businessName);

    const newTransaction = new Transaction({
      subscriptionId,
      ownerId,
      darajaRequestId: response.CheckoutRequestID,
      amountKes: amount,
      status: 'PENDING',
      retryCount: 0,
    });

    await newTransaction.save();
    
    res.status(200).json({ message: 'STK push initiated successfully', data: response });
  } catch (error) {
    logger.error('STK Push Error:', error); 
    next(error);
  }
};

export const simulateStkPush = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, phoneNumber } = req.body;

    if (!amount || !phoneNumber) {
      return res.status(400).json({ message: 'Amount and phone number are required.' });
    }

    // Validate phone number
    const phoneValidation = isValidMpesaPhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      return res.status(400).json({ message: phoneValidation.message });
    }

    const user = req.user as IUser;
    const ownerId = user?._id;
    const fetchedUser = await User.findById(ownerId);
    const businessName = fetchedUser?.businessName || 'FluxPay'; 

    const response: any = await initiateStkPush(phoneNumber, amount, businessName);

    res.status(200).json({ message: 'STK push simulation initiated successfully', data: response });
  } catch (error) {
    logger.error('STK Push Simulation Error:', error); 
    next(error);
  }
};

export const handleCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body.Body || req.body; 
    const callbackData = body.stkCallback;
    
    if (!callbackData) {
      logger.warn('M-Pesa Callback received with no stkCallback data.', req.body);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const transaction = await Transaction.findOne({ darajaRequestId: callbackData.CheckoutRequestID });
    
    if (!transaction) {
      logger.error('Transaction not found for darajaRequestId:', callbackData.CheckoutRequestID);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
    
    if (callbackData.ResultCode === 0) {
      const meta = callbackData.CallbackMetadata?.Item || [];
      const mpesaReceiptNo = meta.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
      
      transaction.status = 'SUCCESS';
      transaction.mpesaReceiptNo = mpesaReceiptNo;
      await transaction.save();

    } else {
      transaction.status = 'FAILED';
      await transaction.save();

    }

    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    logger.error('Callback Error:', error);
    next(error);
  }
};