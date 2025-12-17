import { Response, NextFunction } from 'express';
import { initiateStkPush } from '../../services/mpesa.service';
import logger from '../../utils/logger';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import User from '../../models/User';
import Transaction from '../../models/Transaction';

export const initiatePayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Handle variable name mismatch (phone vs phoneNumber)
    let { amount, phone, phoneNumber } = req.body;
    if (!phone && phoneNumber) phone = phoneNumber;

    if (!amount || !phone) {
      return res.status(400).json({ message: 'Amount and phone number are required' });
    }

    const userId = req.user?._id;
    const user = await User.findById(userId);
    const businessName = user?.businessName || 'FluxPay'; 

    // 2. Initiate STK Push
    // Cast to 'any' to avoid TypeScript blocking access to properties
    const response: any = await initiateStkPush(phone, amount, businessName);

    // 3. Save to DB
    const newTransaction = new Transaction({
      userId,
      checkoutRequestID: response.CheckoutRequestID,
      amount,
      phone,
      status: 'pending', // This is safe
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
    
    if (!callbackData) return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });

    const transaction = await Transaction.findOne({ checkoutRequestID: callbackData.CheckoutRequestID });
    
    if (!transaction) {
        // Transaction might not exist if the initial save failed (like in your recent error)
        return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
    
    if (callbackData.ResultCode === 0) {
      // Payment Successful
      const meta = callbackData.CallbackMetadata?.Item || [];
      const mpesaReceiptNumber = meta.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
      
      // CRITICAL FIX: Must be 'completed' to match Mongoose Enum. 'successful' will crash it.
      transaction.status = 'completed'; 
      transaction.mpesaReceiptNumber = mpesaReceiptNumber;
      await transaction.save();
    } else {
      // Payment Failed
      transaction.status = 'failed';
      await transaction.save();
    }

    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    logger.error('Callback Error:', error);
    next(error);
  }
};