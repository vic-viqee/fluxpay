import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { initiateStkPush } from '../../services/mpesa.service';
import logger from '../../utils/logger';
import User from '../../models/User';
import Transaction from '../../models/Transaction';
import Subscription from '../../models/Subscription';
import PublicCheckoutTransaction from '../../models/PublicCheckoutTransaction';
import { IUser } from '../../models/User';
import { isValidMpesaPhoneNumber } from '../../utils/phone';
import config from '../../config';

const verifyMpesaSignature = (req: Request): boolean => {
  const signature = req.headers['x-mpesa-signature'] as string;
  if (!signature) {
    logger.warn('M-Pesa callback missing signature header');
    return false;
  }

  const callbackUrl = config.mpesa.callbackUrl;
  const secret = config.mpesa.passKey;
  const data = JSON.stringify(req.body);
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

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

export const initiatePricingStkPush = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber, plan } = req.body;

    if (!phoneNumber || !plan) {
      return res.status(400).json({ message: 'Phone number and plan are required.' });
    }

    const planKey = String(plan).toLowerCase();
    const planAmounts: Record<string, number> = {
      starter: 999,
      growth: 2499,
    };

    const amount = planAmounts[planKey];
    if (!amount) {
      return res.status(400).json({ message: 'Unsupported plan for STK checkout.' });
    }

    const phoneValidation = isValidMpesaPhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      return res.status(400).json({ message: phoneValidation.message });
    }

    const formatted = phoneNumber.replace(/\D/g, '');
    if (!(formatted.startsWith('2541') || formatted.startsWith('2547'))) {
      return res.status(400).json({ message: 'Phone number must start with 2541 or 2547.' });
    }

    const response: any = await initiateStkPush(phoneNumber, amount, 'FluxPay');

    const publicTransaction = new PublicCheckoutTransaction({
      plan: planKey,
      phoneNumber,
      amountKes: amount,
      darajaRequestId: response.CheckoutRequestID,
      status: 'PENDING',
    });
    await publicTransaction.save();

    return res.status(200).json({
      message: 'STK push initiated successfully',
      data: response,
      plan: planKey,
      amount,
    });
  } catch (error) {
    logger.error('Pricing STK Push Error:', error);
    next(error);
  }
};

export const handleCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      const isValid = verifyMpesaSignature(req);
      if (!isValid) {
        logger.error('Invalid M-Pesa callback signature');
        return res.status(403).json({ ResultCode: 0, ResultDesc: 'Accepted' });
      }
    }
    
    const body = req.body.Body || req.body; 
    const callbackData = body.stkCallback;
    
    if (!callbackData) {
      logger.warn('M-Pesa Callback received with no stkCallback data.', req.body);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const checkoutRequestId = callbackData.CheckoutRequestID;
    
    let transaction = await Transaction.findOne({ darajaRequestId: checkoutRequestId });
    let publicTransaction = transaction
      ? null
      : await PublicCheckoutTransaction.findOne({ darajaRequestId: checkoutRequestId });

    if (!transaction && !publicTransaction) {
      logger.error('Transaction not found for darajaRequestId:', checkoutRequestId);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const currentStatus = transaction?.status || publicTransaction?.status;
    if (currentStatus === 'SUCCESS') {
      logger.info(`Transaction ${checkoutRequestId} already processed as SUCCESS. Ignoring duplicate callback.`);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    if (callbackData.ResultCode === 0) {
      const meta = callbackData.CallbackMetadata?.Item || [];
      const mpesaReceiptNo = meta.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;

      if (transaction) {
        transaction.status = 'SUCCESS';
        transaction.mpesaReceiptNo = mpesaReceiptNo;
        await transaction.save();
      } else if (publicTransaction) {
        publicTransaction.status = 'SUCCESS';
        publicTransaction.mpesaReceiptNo = mpesaReceiptNo;
        await publicTransaction.save();
      }
    } else {
      if (transaction) {
        transaction.status = 'FAILED';
        await transaction.save();
      } else if (publicTransaction) {
        publicTransaction.status = 'FAILED';
        await publicTransaction.save();
      }
    }

    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    logger.error('Callback Error:', error);
    next(error);
  }
};
