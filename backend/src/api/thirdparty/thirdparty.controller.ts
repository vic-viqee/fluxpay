import { Request, Response, NextFunction } from 'express';
import { initiateStkPush } from '../../services/mpesa.service';
import Transaction from '../../models/Transaction';
import User from '../../models/User';
import Webhook from '../../models/Webhook';
import logger from '../../utils/logger';
import { isValidMpesaPhoneNumber } from '../../utils/phone';
import { forwardWebhook } from '../../services/webhook.service';
import { IUser } from '../../models/User';

export const initiateThirdPartyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, phoneNumber, reference, description } = req.body;
    const ownerId = req.apiKeyOwnerId;

    if (!amount || !phoneNumber) {
      return res.status(400).json({ message: 'amount and phoneNumber are required' });
    }

    const phoneValidation = isValidMpesaPhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      return res.status(400).json({ message: phoneValidation.message });
    }

    if (!ownerId) {
      return res.status(401).json({ message: 'API key authentication failed' });
    }

    const user = await User.findById(ownerId) as IUser;
    if (!user) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (!user.businessPhoneNumber) {
      return res.status(400).json({ message: 'Business M-Pesa phone not configured' });
    }

    const businessName = user.businessName || 'FluxPay';
    const accountRef = reference || `TXN-${Date.now()}`;

    const stkResponse: any = await initiateStkPush(
      phoneNumber,
      amount,
      businessName
    );

    const transaction = new Transaction({
      ownerId,
      darajaRequestId: stkResponse.CheckoutRequestID,
      amountKes: amount,
      status: 'PENDING',
      retryCount: 0,
    });
    await transaction.save();

    logger.info(`Third-party payment initiated: ${stkResponse.CheckoutRequestID} for ${businessName}`);

    res.status(200).json({
      success: true,
      message: 'STK push initiated',
      data: {
        checkoutRequestId: stkResponse.CheckoutRequestID,
        amount,
        phoneNumber,
        reference: accountRef,
        status: 'PENDING',
      },
    });
  } catch (error: any) {
    logger.error('Third-party payment error:', error);
    next(error);
  }
};

export const getTransactionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { checkoutRequestId } = req.params;
    const ownerId = req.apiKeyOwnerId;

    if (!ownerId) {
      return res.status(401).json({ message: 'API key authentication failed' });
    }

    const transaction = await Transaction.findOne({
      darajaRequestId: checkoutRequestId,
      ownerId,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json({
      data: {
        checkoutRequestId: transaction.darajaRequestId,
        amount: transaction.amountKes,
        status: transaction.status,
        mpesaReceiptNo: transaction.mpesaReceiptNo,
        createdAt: (transaction as any).createdAt,
        updatedAt: (transaction as any).updatedAt,
      },
    });
  } catch (error) {
    logger.error('Get transaction status error:', error);
    next(error);
  }
};

export const registerWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url, events } = req.body;
    const ownerId = req.apiKeyOwnerId;
    const user = req.user as IUser;

    if (!url) {
      return res.status(400).json({ message: 'Webhook URL is required' });
    }

    if (!ownerId) {
      return res.status(401).json({ message: 'API key authentication failed' });
    }

    const crypto = await import('crypto');
    const secret = crypto.randomBytes(32).toString('hex');

    const webhook = await Webhook.create({
      url,
      secret,
      events: events || ['payment.success', 'payment.failed'],
      ownerId,
    });

    logger.info(`Webhook registered: ${url} for user: ${user?.email}`);

    res.status(201).json({
      message: 'Webhook registered successfully',
      data: {
        id: webhook._id,
        url: webhook.url,
        events: webhook.events,
        secret: webhook.secret,
        isActive: webhook.isActive,
      },
    });
  } catch (error) {
    logger.error('Register webhook error:', error);
    next(error);
  }
};

export const listWebhooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.apiKeyOwnerId;

    if (!ownerId) {
      return res.status(401).json({ message: 'API key authentication failed' });
    }

    const webhooks = await Webhook.find({ ownerId })
      .select('-secret')
      .sort({ createdAt: -1 });

    res.status(200).json({ data: webhooks });
  } catch (error) {
    logger.error('List webhooks error:', error);
    next(error);
  }
};

export const deleteWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const ownerId = req.apiKeyOwnerId;

    if (!ownerId) {
      return res.status(401).json({ message: 'API key authentication failed' });
    }

    const webhook = await Webhook.findOneAndDelete({ _id: id, ownerId });

    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }

    logger.info(`Webhook deleted: ${webhook.url}`);

    res.status(200).json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    logger.error('Delete webhook error:', error);
    next(error);
  }
};

export const getBusinessInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.apiKeyOwnerId;

    if (!ownerId) {
      return res.status(401).json({ message: 'API key authentication failed' });
    }

    const user = await User.findById(ownerId);

    if (!user) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.status(200).json({
      data: {
        businessName: user.businessName,
        businessType: user.businessType,
        businessPhoneNumber: user.businessPhoneNumber,
      },
    });
  } catch (error) {
    logger.error('Get business info error:', error);
    next(error);
  }
};