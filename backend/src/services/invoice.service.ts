import mongoose, { Types } from 'mongoose';
import Invoice, { IInvoice } from '../models/Invoice';
import { calculateVat, generateInvoiceNumber } from '../utils/tax';
import logger from '../utils/logger';

export const getNextInvoiceNumber = async (ownerId: Types.ObjectId): Promise<string> => {
  const lastInvoice = await Invoice.findOne({ ownerId })
    .sort({ createdAt: -1 });
  
  let sequence = 1;
  if (lastInvoice) {
    const match = lastInvoice.invoiceNumber.match(/INV-\d{4}-(\d+)$/);
    if (match) {
      sequence = parseInt(match[1], 10) + 1;
    }
  }
  
  return generateInvoiceNumber(sequence);
};

export const createInvoice = async (data: {
  ownerId: Types.ObjectId;
  clientId?: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  planId?: Types.ObjectId;
  amount: number;
  billingPeriod?: string;
  dueDate: Date;
  notes?: string;
  applyVat?: boolean;
}): Promise<IInvoice> => {
  const { ownerId, clientId, subscriptionId, planId, amount, billingPeriod, dueDate, notes, applyVat = true } = data;
  
  const invoiceNumber = await getNextInvoiceNumber(ownerId);
  const vatRate = applyVat ? 16 : 0;
  const vatCalc = calculateVat(amount, vatRate);
  
  const invoice = await Invoice.create({
    invoiceNumber,
    ownerId,
    clientId,
    subscriptionId,
    planId,
    amountKes: amount,
    vatRate,
    vatAmount: vatCalc.vatAmount,
    totalAmount: vatCalc.total,
    billingPeriod,
    dueDate,
    notes,
    status: 'DRAFT',
  });
  
  logger.info(`Invoice created: ${invoiceNumber} for owner: ${ownerId}`);
  return invoice;
};

export const markInvoiceAsPaid = async (
  invoiceId: Types.ObjectId,
  mpesaReceiptNo: string
): Promise<IInvoice | null> => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) return null;
  
  invoice.status = 'PAID';
  invoice.paidDate = new Date();
  invoice.mpesaReceiptNo = mpesaReceiptNo;
  await invoice.save();
  
  logger.info(`Invoice marked as paid: ${invoice.invoiceNumber}`);
  return invoice;
};

export const markInvoiceAsOverdue = async (ownerId: Types.ObjectId): Promise<number> => {
  const result = await Invoice.updateMany(
    { 
      ownerId, 
      status: { $in: ['DRAFT', 'SENT'] },
      dueDate: { $lt: new Date() },
    },
    { status: 'OVERDUE' }
  );
  
  if (result.modifiedCount > 0) {
    logger.info(`Marked ${result.modifiedCount} invoices as overdue for owner: ${ownerId}`);
  }
  
  return result.modifiedCount;
};

export const getInvoiceSummary = async (ownerId: Types.ObjectId) => {
  const summary = await Invoice.aggregate([
    { $match: { ownerId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$totalAmount' },
      },
    },
  ]);
  
  const result = {
    DRAFT: { count: 0, total: 0 },
    SENT: { count: 0, total: 0 },
    PAID: { count: 0, total: 0 },
    OVERDUE: { count: 0, total: 0 },
    CANCELLED: { count: 0, total: 0 },
  };
  
  for (const s of summary) {
    if (s._id in result) {
      result[s._id as keyof typeof result] = { count: s.count, total: s.total };
    }
  }
  
  return result;
};

export const getInvoicesByStatus = async (
  ownerId: Types.ObjectId,
  status: string,
  limit = 50,
  skip = 0
) => {
  return Invoice.find({ ownerId, status })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};