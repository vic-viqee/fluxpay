import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import PublicCheckoutButton from '../../models/PublicCheckoutButton';
import GatewayTransaction from '../../models/GatewayTransaction';
import GatewayCustomer from '../../models/GatewayCustomer';
import config from '../../config';
import { initiateStkPush } from '../../services/mpesa.service';
import User from '../../models/User';

export const getButtonById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { buttonId } = req.params;

    const button = await PublicCheckoutButton.findOne({ buttonId, isActive: true })
      .populate('ownerId', 'businessName businessLogo businessPhoneNumber');

    if (!button) {
      return res.status(404).json({ message: 'Payment button not found' });
    }

    const owner = button.ownerId as any;

    res.status(200).json({
      _id: button._id,
      buttonId: button.buttonId,
      title: button.title,
      description: button.description,
      defaultAmount: button.defaultAmount,
      allowCustomAmount: button.allowCustomAmount,
      redirectUrl: button.redirectUrl,
      buttonText: button.buttonText,
      buttonColor: button.buttonColor,
      ownerName: owner?.businessName || 'FluxPay Merchant',
      ownerLogo: owner?.businessLogo,
      ownerPhone: owner?.businessPhoneNumber
    });
  } catch (error) {
    next(error);
  }
};

export const trackButtonClick = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { buttonId } = req.params;

    await PublicCheckoutButton.findOneAndUpdate(
      { buttonId },
      { $inc: { totalClicks: 1 } }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const initiateButtonPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { buttonId } = req.params;
    const { phoneNumber, amount, customerName, customerEmail } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'phoneNumber is required' });
    }

    const button = await PublicCheckoutButton.findOne({ buttonId, isActive: true })
      .populate('ownerId', 'businessName businessPhoneNumber shortCodeTill');

    if (!button) {
      return res.status(404).json({ message: 'Payment button not found' });
    }

    const finalAmount = amount || button.defaultAmount;
    if (!finalAmount) {
      return res.status(400).json({ message: 'Amount is required when button does not have a default amount' });
    }

    const normalizedPhone = phoneNumber.startsWith('0') ? `254${phoneNumber.substring(1)}` : phoneNumber;
    const owner = button.ownerId as any;

    let customer: any = null;
    if (customerEmail || normalizedPhone) {
      customer = await GatewayCustomer.findOne({
        ownerId: owner._id,
        $or: [
          { email: customerEmail },
          { phoneNumber: normalizedPhone }
        ].filter(q => q.email || q.phoneNumber)
      });

      if (!customer && (customerName || customerEmail)) {
        customer = await GatewayCustomer.create({
          ownerId: owner._id,
          name: customerName || customerEmail?.split('@')[0] || 'Guest',
          email: customerEmail,
          phoneNumber: normalizedPhone
        });
      }
    }

    const accountRef = `BTN-${buttonId.slice(0, 8)}`;
    const desc = button.title;

    let stkResponse: any;
    try {
      stkResponse = await initiateStkPush(
        normalizedPhone,
        finalAmount,
        accountRef,
        desc
      );
    } catch (mpesaError: any) {
      if (mpesaError.message === 'Failed to initiate STK push' || mpesaError.message?.includes('mpesa')) {
        stkResponse = { CheckoutRequestID: `SIM-${Date.now()}` };
      } else {
        throw mpesaError;
      }
    }

    const transaction = await GatewayTransaction.create({
      ownerId: owner._id,
      customerId: customer?._id,
      amountKes: finalAmount,
      status: 'PENDING',
      phoneNumber: normalizedPhone,
      accountReference: accountRef,
      transactionDesc: desc,
      paymentMethod: 'STK_PUSH',
      paymentSource: 'payment_button',
      darajaRequestId: stkResponse.CheckoutRequestID,
      checkoutRequestId: stkResponse.CheckoutRequestID
    });

    const response: any = {
      message: 'Payment initiated',
      transactionId: transaction._id,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      status: transaction.status,
      redirectUrl: button.redirectUrl
    };

    if (button.redirectUrl) {
      response.redirectUrl = `${button.redirectUrl}?transactionId=${transaction._id}&status=pending`;
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getButtonStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const buttons = await PublicCheckoutButton.find({ ownerId: user._id })
      .sort({ createdAt: -1 });

    const stats = await Promise.all(buttons.map(async (button) => {
      const totalAmount = await GatewayTransaction.aggregate([
        { 
          $match: { 
            ownerId: user._id,
            accountReference: { $regex: `^BTN-${button.buttonId.slice(0, 8)}` },
            status: 'SUCCESS'
          }
        },
        { $group: { _id: null, total: { $sum: '$amountKes' } } }
      ]);

      return {
        ...button.toObject(),
        totalAmount: totalAmount[0]?.total || 0
      };
    }));

    res.status(200).json({ data: stats });
  } catch (error) {
    next(error);
  }
};

export const createButton = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const { title, description, defaultAmount, allowCustomAmount, redirectUrl, buttonText, buttonColor } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'title is required' });
    }

    const buttonId = crypto.randomBytes(8).toString('hex');

    const button = await PublicCheckoutButton.create({
      ownerId: user._id,
      buttonId,
      title,
      description,
      defaultAmount: defaultAmount || undefined,
      allowCustomAmount: allowCustomAmount !== false,
      redirectUrl,
      buttonText: buttonText || 'Pay with M-Pesa',
      buttonColor: buttonColor || '#25D366'
    });

    res.status(201).json(button);
  } catch (error) {
    next(error);
  }
};

export const updateButton = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const { id } = req.params;
    const updates = req.body;

    delete updates.ownerId;
    delete updates.buttonId;
    delete updates.totalClicks;
    delete updates.totalPayments;

    const button = await PublicCheckoutButton.findOneAndUpdate(
      { _id: id, ownerId: user._id },
      updates,
      { new: true }
    );

    if (!button) {
      return res.status(404).json({ message: 'Button not found' });
    }

    res.status(200).json(button);
  } catch (error) {
    next(error);
  }
};

export const deleteButton = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const { id } = req.params;

    const button = await PublicCheckoutButton.findOneAndDelete({ _id: id, ownerId: user._id });

    if (!button) {
      return res.status(404).json({ message: 'Button not found' });
    }

    res.status(200).json({ message: 'Button deleted' });
  } catch (error) {
    next(error);
  }
};