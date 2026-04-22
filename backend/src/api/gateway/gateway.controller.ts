import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import GatewayTransaction from '../../models/GatewayTransaction';
import GatewayCustomer from '../../models/GatewayCustomer';
import PaymentLink from '../../models/PaymentLink';
import config from '../../config';
import { initiateStkPush } from '../../services/mpesa.service';

export const initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const { phoneNumber, amount, accountReference, transactionDesc, customerName, customerEmail } = req.body;

    if (!phoneNumber || !amount || !accountReference) {
      return res.status(400).json({ message: 'phoneNumber, amount, and accountReference are required' });
    }

    const normalizedPhone = phoneNumber.startsWith('0') ? `254${phoneNumber.substring(1)}` : phoneNumber;
    
    let customer: any = null;
    if (customerEmail || normalizedPhone) {
      customer = await GatewayCustomer.findOne({
        ownerId: user._id,
        $or: [
          { email: customerEmail },
          { phoneNumber: normalizedPhone }
        ].filter(q => q.email || q.phoneNumber)
      });

      if (!customer && (customerName || customerEmail)) {
        customer = await GatewayCustomer.create({
          ownerId: user._id,
          name: customerName || customerEmail?.split('@')[0] || 'Unknown',
          email: customerEmail,
          phoneNumber: normalizedPhone
        });
      }
    }

    const stkResponse: any = await initiateStkPush(
      normalizedPhone,
      amount,
      accountReference,
      transactionDesc || user.businessName || 'FluxPay'
    );

    const transaction = await GatewayTransaction.create({
      ownerId: user._id,
      customerId: customer?._id,
      amountKes: amount,
      status: 'PENDING',
      phoneNumber: normalizedPhone,
      accountReference,
      transactionDesc,
      paymentMethod: 'STK_PUSH',
      paymentSource: 'gateway_api',
      darajaRequestId: stkResponse.CheckoutRequestID,
      checkoutRequestId: stkResponse.CheckoutRequestID
    });

    res.status(200).json({
      message: 'Payment initiated',
      transactionId: transaction._id,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      status: transaction.status
    });
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ message: error.message || 'Failed to initiate payment' });
  }
};

export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const { page = 1, limit = 20, status, startDate, endDate, search } = req.query;

    const query: any = { ownerId: user._id };

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) query.transactionDate.$gte = new Date(startDate as string);
      if (endDate) query.transactionDate.$lte = new Date(endDate as string);
    }

    if (search) {
      query.$or = [
        { phoneNumber: { $regex: search, $options: 'i' } },
        { accountReference: { $regex: search, $options: 'i' } },
        { mpesaReceiptNo: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      GatewayTransaction.find(query)
        .sort({ transactionDate: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('customerId', 'name phoneNumber'),
      GatewayTransaction.countDocuments(query)
    ]);

    const stats = await GatewayTransaction.aggregate([
      { $match: { ownerId: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$amountKes' }
        }
      }
    ]);

    res.status(200).json({
      data: transactions,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
      stats
    });
  } catch (error) {
    next(error);
  }
};

export const getTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const { id } = req.params;

    const transaction = await GatewayTransaction.findOne({ _id: id, ownerId: user._id })
      .populate('customerId', 'name phoneNumber email');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json(transaction);
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;

    const [todayStats, monthStats, recentTransactions, customerCount] = await Promise.all([
      GatewayTransaction.aggregate([
        {
          $match: {
            ownerId: user._id,
            transactionDate: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            total: { $sum: '$amountKes' }
          }
        }
      ]),
      GatewayTransaction.aggregate([
        {
          $match: {
            ownerId: user._id,
            transactionDate: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            total: { $sum: '$amountKes' }
          }
        }
      ]),
      GatewayTransaction.find({ ownerId: user._id })
        .sort({ transactionDate: -1 })
        .limit(5)
        .populate('customerId', 'name'),
      GatewayCustomer.countDocuments({ ownerId: user._id })
    ]);

    const formatStats = (stats: any[]) => ({
      success: { count: 0, total: 0 },
      pending: { count: 0, total: 0 },
      failed: { count: 0, total: 0 }
    });

    const today = formatStats(todayStats);
    const month = formatStats(monthStats);

    todayStats.forEach((s: any) => {
      if (s._id === 'SUCCESS') today.success = { count: s.count, total: s.total };
      if (s._id === 'PENDING') today.pending = { count: s.count, total: s.total };
      if (s._id === 'FAILED') today.failed = { count: s.count, total: s.total };
    });

    monthStats.forEach((s: any) => {
      if (s._id === 'SUCCESS') month.success = { count: s.count, total: s.total };
      if (s._id === 'PENDING') month.pending = { count: s.count, total: s.total };
      if (s._id === 'FAILED') month.failed = { count: s.count, total: s.total };
    });

    res.status(200).json({
      today,
      month,
      recentTransactions,
      customerCount,
      totalCustomers: customerCount
    });
  } catch (error) {
    next(error);
  }
};

export const createPaymentLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const { title, description, amount, expiresAt, maxUses, customerPhone, customerEmail, redirectUrl, webhookUrl } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ message: 'title and amount are required' });
    }

    const shortCode = crypto.randomBytes(4).toString('hex');
    const paymentLink = `${config.frontendUrl}/pay/${shortCode}`;

    const link = await PaymentLink.create({
      ownerId: user._id,
      title,
      description,
      amount,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      maxUses,
      customerPhone,
      customerEmail,
      redirectUrl,
      webhookUrl,
      paymentLink
    });

    res.status(201).json(link);
  } catch (error) {
    next(error);
  }
};

export const getPaymentLinkByCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;

    const link = await PaymentLink.findOne({ paymentLink: `${config.frontendUrl}/pay/${code}` })
      .populate('ownerId', 'businessName businessLogo');

    if (!link) {
      return res.status(404).json({ message: 'Payment link not found' });
    }

    if (link.status === 'EXPIRED' || (link.expiresAt && new Date(link.expiresAt) < new Date())) {
      return res.status(410).json({ message: 'Payment link has expired' });
    }

    if (link.status === 'USED' || (link.maxUses && link.currentUses >= link.maxUses)) {
      return res.status(410).json({ message: 'Payment link has reached maximum uses' });
    }

    const owner = link.ownerId as any;
    res.status(200).json({
      _id: link._id,
      title: link.title,
      description: link.description,
      amount: link.amount,
      currency: link.currency,
      ownerName: owner?.businessName || 'FluxPay Merchant',
      ownerLogo: owner?.businessLogo,
      paymentLink: link.paymentLink
    });
  } catch (error) {
    next(error);
  }
};

export const payPaymentLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    const { phoneNumber, customerName, customerEmail } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'phoneNumber is required' });
    }

    const link = await PaymentLink.findOne({ paymentLink: `${config.frontendUrl}/pay/${code}` });

    if (!link) {
      return res.status(404).json({ message: 'Payment link not found' });
    }

    if (link.status === 'EXPIRED' || (link.expiresAt && new Date(link.expiresAt) < new Date())) {
      return res.status(410).json({ message: 'Payment link has expired' });
    }

    if (link.maxUses && link.currentUses >= link.maxUses) {
      return res.status(410).json({ message: 'Payment link has reached maximum uses' });
    }

    const normalizedPhone = phoneNumber.replace(/^0/, '254').replace(/^\+?254(\d{9})$/, '254$1');

    let customer: any = null;
    if (customerEmail || normalizedPhone) {
      customer = await GatewayCustomer.findOne({
        ownerId: link.ownerId,
        $or: [
          { email: customerEmail },
          { phoneNumber: normalizedPhone }
        ].filter(q => q.email || q.phoneNumber)
      });

      if (!customer) {
        customer = await GatewayCustomer.create({
          ownerId: link.ownerId,
          name: customerName || customerEmail?.split('@')[0] || 'Guest',
          email: customerEmail,
          phoneNumber: normalizedPhone
        });
      }
    }

    const transaction = await GatewayTransaction.create({
      ownerId: link.ownerId,
      customerId: customer?._id,
      amountKes: link.amount,
      status: 'PENDING',
      phoneNumber: normalizedPhone,
      accountReference: code,
      transactionDesc: link.title,
      paymentMethod: 'STK_PUSH',
      paymentSource: 'payment_link',
      paymentLinkId: link._id
    });

    res.status(200).json({
      message: 'Payment initiated',
      transactionId: transaction._id,
      checkoutRequestId: transaction.checkoutRequestId,
      status: transaction.status
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentLinks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const { page = 1, limit = 20, status } = req.query;

    const query: any = { ownerId: user._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [links, total] = await Promise.all([
      PaymentLink.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      PaymentLink.countDocuments(query)
    ]);

    res.status(200).json({
      data: links,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (error) {
    next(error);
  }
};

export const deletePaymentLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const { id } = req.params;

    const link = await PaymentLink.findOneAndDelete({ _id: id, ownerId: user._id });

    if (!link) {
      return res.status(404).json({ message: 'Payment link not found' });
    }

    res.status(200).json({ message: 'Payment link deleted' });
  } catch (error) {
    next(error);
  }
};

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const { page = 1, limit = 20, search } = req.query;

    const query: any = { ownerId: user._id };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [customers, total] = await Promise.all([
      GatewayCustomer.find(query)
        .sort({ lastTransactionDate: -1 })
        .skip(skip)
        .limit(Number(limit)),
      GatewayCustomer.countDocuments(query)
    ]);

    res.status(200).json({
      data: customers,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const { name, email, phoneNumber, notes, tags } = req.body;

    if (!name || !phoneNumber) {
      return res.status(400).json({ message: 'name and phoneNumber are required' });
    }

    const existing = await GatewayCustomer.findOne({
      ownerId: user._id,
      phoneNumber
    });

    if (existing) {
      return res.status(409).json({ message: 'Customer with this phone number already exists' });
    }

    const customer = await GatewayCustomer.create({
      ownerId: user._id,
      name,
      email,
      phoneNumber,
      notes,
      tags
    });

    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const { id } = req.params;
    const { name, email, notes, tags } = req.body;

    const customer = await GatewayCustomer.findOneAndUpdate(
      { _id: id, ownerId: user._id },
      { name, email, notes, tags },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const { id } = req.params;

    const customer = await GatewayCustomer.findOneAndDelete({ _id: id, ownerId: user._id });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({ message: 'Customer deleted' });
  } catch (error) {
    next(error);
  }
};

export const handleMpesaCallback = async (req: Request, res: Response) => {
  try {
    const { Body } = req.body;

    if (!Body?.stkCallback) {
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Received' });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;

    const transaction = await GatewayTransaction.findOne({ checkoutRequestId: CheckoutRequestID });

    if (!transaction) {
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Received' });
    }

    if (ResultCode === 0) {
      const metadata = CallbackMetadata?.Item || [];
      const getItem = (name: string) => metadata.find((i: any) => i.Name === name)?.Value;

      transaction.status = 'SUCCESS';
      transaction.mpesaReceiptNo = getItem('MpesaReceiptNumber');
      transaction.darajaRequestId = getItem('TransactionId');
      transaction.callbackData = req.body;
    } else {
      transaction.status = 'FAILED';
      transaction.failureReason = ResultDesc;
      transaction.callbackData = req.body;
    }

    await transaction.save();

    if (ResultCode === 0 && (transaction as any).paymentLinkId) {
      await PaymentLink.findByIdAndUpdate((transaction as any).paymentLinkId, { $inc: { currentUses: 1 } });
    }

    const webhookUrl = (transaction as any).ownerId?.webhookUrl;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: `payment.${transaction.status.toLowerCase()}`,
            transactionId: transaction._id,
            amount: transaction.amountKes,
            phoneNumber: transaction.phoneNumber,
            status: transaction.status,
            mpesaReceiptNo: transaction.mpesaReceiptNo,
            timestamp: new Date()
          })
        });
      } catch (webhookError) {
        console.error('Webhook failed:', webhookError);
      }
    }

    res.status(200).json({ ResultCode: 0, ResultDesc: 'Received' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Received' });
  }
};
