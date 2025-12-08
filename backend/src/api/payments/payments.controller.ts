import { Response, NextFunction } from 'express';
import { initiateStkPush } from '../../services/mpesa.service';
import logger from '../../utils/logger';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import User from '../../models/User'; // Import the User model

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

    // You can also save the transaction to the database here with a 'pending' status
    
    const response = await initiateStkPush(phone, amount, businessName); // Pass businessName

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

    // You would typically find the transaction in your database using MerchantRequestID or CheckoutRequestID
    // and update its status based on the resultCode.
    if (resultCode === 0) {
      // Payment was successful
      const amount = callbackData.CallbackMetadata.Item.find((i: any) => i.Name === 'Amount')?.Value;
      const mpesaReceiptNumber = callbackData.CallbackMetadata.Item.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
      logger.info(`Payment of ${amount} with receipt ${mpesaReceiptNumber} was successful.`);
    } else {
      // Payment failed
      const resultDesc = callbackData.ResultDesc;
      logger.error(`Payment failed: ${resultDesc}`);
    }

    // Respond to Safaricom to acknowledge receipt of the callback
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    next(error);
  }
};
