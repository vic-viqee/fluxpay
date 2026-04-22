import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IPaymentLink extends Document {
  ownerId: IUser['_id'];
  title: string;
  description?: string;
  amount: number;
  currency: string;
  status: 'ACTIVE' | 'EXPIRED' | 'USED';
  expiresAt?: Date;
  maxUses?: number;
  currentUses: number;
  customerPhone?: string;
  customerEmail?: string;
  redirectUrl?: string;
  webhookUrl?: string;
  paymentLink: string;
  transactions: IUser['_id'][];
  createdAt: Date;
  updatedAt: Date;
}

const PaymentLinkSchema: Schema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'KES' },
  status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'USED'], default: 'ACTIVE' },
  expiresAt: { type: Date },
  maxUses: { type: Number },
  currentUses: { type: Number, default: 0 },
  customerPhone: { type: String },
  customerEmail: { type: String },
  redirectUrl: { type: String },
  webhookUrl: { type: String },
  paymentLink: { type: String, required: true, unique: true },
  transactions: [{ type: Schema.Types.ObjectId, ref: 'GatewayTransaction' }],
}, { timestamps: true });

PaymentLinkSchema.index({ ownerId: 1 });
PaymentLinkSchema.index({ paymentLink: 1 });
PaymentLinkSchema.index({ status: 1 });

export default mongoose.model<IPaymentLink>('PaymentLink', PaymentLinkSchema);
