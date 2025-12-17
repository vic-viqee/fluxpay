import { Response, NextFunction } from 'express';
import { initiateStkPush } from '../../services/mpesa.service';
import logger from '../../utils/logger';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import User from '../../models/User';
import Transaction from '../../models/Transaction';

export const initiatePayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Accept EITHER 'phone' OR 'phoneNumber'
    let { amount, phone, phoneNumber } = req.body;
    
    if (!phone && phoneNumber) {
        phone = phoneNumber;
    }

    if (!amount || !phone) {
      return res.status(400).json({ message: 'Amount and phone number are required' });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const businessName = user.businessName || 'FluxPay'; 

    // 2. FIX TS Error: Cast response to 'any' so we can access properties
    const response: any = await initiateStkPush(phone, amount, businessName);

    const newTransaction = new Transaction({
      userId,
      checkoutRequestID: response.CheckoutRequestID,
      amount,
      phone,
      status: 'pending',
    });

    await newTransaction.save();
    
    res.status(200).json({ message: 'STK push initiated successfully', data: response });
  } catch (error) {
    next(error);
  }
};

export const handleCallback = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    logger.info('M-Pesa Callback Received:', req.body);

    // Safely access nested properties
    const body = req.body.Body || req.body; 
    const callbackData = body.stkCallback;
    
    if (!callbackData) {
        logger.error('Invalid Callback Data');
        return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const resultCode = callbackData.ResultCode;
    const checkoutRequestID = callbackData.CheckoutRequestID;

    const transaction = await Transaction.findOne({ checkoutRequestID: checkoutRequestID });

    if (!transaction) {
      logger.error('Transaction not found for checkoutRequestID:', checkoutRequestID);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
    
    if (resultCode === 0) {
      // Payment was successful
      const meta = callbackData.CallbackMetadata?.Item || [];
      const amount = meta.find((i: any) => i.Name === 'Amount')?.Value;
      const mpesaReceiptNumber = meta.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
      
      logger.info(`Payment of ${amount} with receipt ${mpesaReceiptNumber} was successful.`);

      // 3. FIX TS Error: Use 'completed' instead of 'successful' to match your Model
      transaction.status = 'completed';
      transaction.mpesaReceiptNumber = mpesaReceiptNumber;
      await transaction.save();
    } else {
      // Payment failed
      const resultDesc = callbackData.ResultDesc;
      logger.error(`Payment failed: ${resultDesc}`);

      transaction.status = 'failed';
      await transaction.save();
    }

    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    next(error);
  }
};