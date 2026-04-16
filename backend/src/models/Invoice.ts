import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IClient } from './Client';
import { IServicePlan } from './ServicePlan';

export interface IInvoice extends Document {
  invoiceNumber: string;
  ownerId: IUser['_id'];
  clientId?: IClient['_id'];
  subscriptionId?: mongoose.Types.ObjectId;
  planId?: IServicePlan['_id'];
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  amountKes: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  billingPeriod?: string;
  dueDate: Date;
  paidDate?: Date;
  mpesaReceiptNo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
  planId: { type: Schema.Types.ObjectId, ref: 'ServicePlan' },
  status: { 
    type: String, 
    enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'], 
    default: 'DRAFT' 
  },
  amountKes: { type: Number, required: true },
  vatRate: { type: Number, default: 16 },
  vatAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  billingPeriod: { type: String },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date },
  mpesaReceiptNo: { type: String },
  notes: { type: String },
}, { timestamps: true });

InvoiceSchema.index({ ownerId: 1 });
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ status: 1 });

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);