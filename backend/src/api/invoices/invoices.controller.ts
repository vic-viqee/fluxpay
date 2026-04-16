import { Request, Response, NextFunction } from 'express';
import Invoice from '../../models/Invoice';
import { createInvoice, markInvoiceAsPaid, markInvoiceAsOverdue, getInvoiceSummary } from '../../services/invoice.service';
import logger from '../../utils/logger';
import { IUser } from '../../models/User';

export const createNewInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId, subscriptionId, planId, amount, billingPeriod, dueDate, notes, applyVat } = req.body;
    const user = req.user as IUser;
    const ownerId = user._id;

    if (!amount || !dueDate) {
      return res.status(400).json({ message: 'Amount and due date are required' });
    }

    const invoice = await createInvoice({
      ownerId,
      clientId,
      subscriptionId,
      planId,
      amount,
      billingPeriod,
      dueDate: new Date(dueDate),
      notes,
      applyVat,
    });

    res.status(201).json({
      message: 'Invoice created successfully',
      data: invoice,
    });
  } catch (error) {
    logger.error('Create invoice error:', error);
    next(error);
  }
};

export const listInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser;
    const ownerId = user._id;
    const { status, limit = 50, skip = 0 } = req.query;

    const query: any = { ownerId };
    if (status) {
      query.status = status;
    }

    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .populate('clientId');

    const total = await Invoice.countDocuments(query);

    res.status(200).json({ data: invoices, total });
  } catch (error) {
    logger.error('List invoices error:', error);
    next(error);
  }
};

export const getInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user as IUser;
    const ownerId = user._id;

    const invoice = await Invoice.findOne({ _id: id, ownerId }).populate('clientId');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json({ data: invoice });
  } catch (error) {
    logger.error('Get invoice error:', error);
    next(error);
  }
};

export const updateInvoiceStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, mpesaReceiptNo } = req.body;
    const user = req.user as IUser;
    const ownerId = user._id;

    const invoice = await Invoice.findOne({ _id: id, ownerId });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (status === 'PAID' && mpesaReceiptNo) {
      invoice.status = 'PAID';
      invoice.paidDate = new Date();
      invoice.mpesaReceiptNo = mpesaReceiptNo;
    } else if (status) {
      invoice.status = status;
    }

    await invoice.save();

    res.status(200).json({
      message: 'Invoice updated successfully',
      data: invoice,
    });
  } catch (error) {
    logger.error('Update invoice error:', error);
    next(error);
  }
};

export const getInvoiceSummaryHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser;
    const ownerId = user._id;

    const summary = await getInvoiceSummary(ownerId);

    res.status(200).json({ data: summary });
  } catch (error) {
    logger.error('Get invoice summary error:', error);
    next(error);
  }
};

export const deleteInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user as IUser;
    const ownerId = user._id;

    const invoice = await Invoice.findOneAndDelete({ _id: id, ownerId });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    logger.error('Delete invoice error:', error);
    next(error);
  }
};