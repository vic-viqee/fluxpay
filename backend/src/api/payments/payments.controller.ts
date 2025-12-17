import { Response, NextFunction } from 'express';
import { initiateStkPush } from '../../services/mpesa.service';
import logger from '../../utils/logger';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import User from '../../models/User'; // Import the User model
import Transaction from '../../models/Transaction';

export const initiatePayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { amount, phone } = req.body;
    const userId = req.user?._id;

    if (!amount || !phone) {
      return res.status(400).json({ message: 'Amount and phone number are required' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const businessName = user.businessName || 'FluxPay'; // Use user's business name, or default to 'FluxPay'

    const response = await initiateStkPush(phone, amount, businessName); // Pass businessName

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

    const callbackData = req.body.Body.stkCallback;
    const resultCode = callbackData.ResultCode;
    const checkoutRequestID = callbackData.CheckoutRequestID;


    const transaction = await Transaction.findOne({ checkoutRequestID: checkoutRequestID });

    if (!transaction) {
      logger.error('Transaction not found for checkoutRequestID:', checkoutRequestID);
      // Even if the transaction is not found, we must respond to Safaricom to acknowledge receipt.
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
    
    if (resultCode === 0) {
      // Payment was successful
      const amount = callbackData.CallbackMetadata.Item.find((i: any) => i.Name === 'Amount')?.Value;
      const mpesaReceiptNumber = callbackData.CallbackMetadata.Item.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
      logger.info(`Payment of ${amount} with receipt ${mpesaReceiptNumber} was successful.`);

      transaction.status = 'successful';
      transaction.mpesaReceiptNumber = mpesaReceiptNumber;
      await transaction.save();
      logger.info('Transaction updated successfully');
    } else {
      // Payment failed
      const resultDesc = callbackData.ResultDesc;
      logger.error(`Payment failed: ${resultDesc}`);

      transaction.status = 'failed';
      await transaction.save();
      logger.info('Transaction updated to failed');
    }

    // Respond to Safaricom to acknowledge receipt of the callback
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    next(error);
  }
};
