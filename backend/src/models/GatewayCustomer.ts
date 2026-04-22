import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IGatewayCustomer extends Document {
  ownerId: IUser['_id'];
  name: string;
  email?: string;
  phoneNumber: string;
  totalTransactions: number;
  totalAmount: number;
  lastTransactionDate?: Date;
  lastTransactionStatus?: 'PENDING' | 'SUCCESS' | 'FAILED';
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const GatewayCustomerSchema: Schema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String },
  phoneNumber: { type: String, required: true },
  totalTransactions: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  lastTransactionDate: { type: Date },
  lastTransactionStatus: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'] },
  notes: { type: String },
  tags: [{ type: String }],
}, { timestamps: true });

GatewayCustomerSchema.index({ ownerId: 1 });
GatewayCustomerSchema.index({ phoneNumber: 1 });
GatewayCustomerSchema.index({ email: 1 });

export default mongoose.model<IGatewayCustomer>('GatewayCustomer', GatewayCustomerSchema);
