import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IGatewayTransaction extends Document {
  ownerId: IUser['_id'];
  customerId?: IUser['_id'];
  paymentLinkId?: IUser['_id'];
  amountKes: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  mpesaReceiptNo?: string;
  darajaRequestId?: string;
  checkoutRequestId?: string;
  phoneNumber: string;
  accountReference: string;
  transactionDesc?: string;
  paymentMethod: 'STK_PUSH' | 'PAYMENT_LINK' | 'TILL' | 'QR';
  paymentSource: 'gateway_api' | 'payment_link' | 'dynamic_till';
  transactionId?: string;
  callbackData?: any;
  failureReason?: string;
  transactionDate: Date;
}

const GatewayTransactionSchema: Schema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User' },
  paymentLinkId: { type: Schema.Types.ObjectId, ref: 'PaymentLink' },
  amountKes: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'], default: 'PENDING' },
  mpesaReceiptNo: { type: String },
  darajaRequestId: { type: String },
  checkoutRequestId: { type: String },
  phoneNumber: { type: String, required: true },
  accountReference: { type: String, required: true },
  transactionDesc: { type: String },
  paymentMethod: { type: String, enum: ['STK_PUSH', 'PAYMENT_LINK', 'TILL', 'QR'], default: 'STK_PUSH' },
  paymentSource: { type: String, enum: ['gateway_api', 'payment_link', 'dynamic_till'], default: 'gateway_api' },
  transactionId: { type: String },
  callbackData: { type: Schema.Types.Mixed },
  failureReason: { type: String },
  transactionDate: { type: Date, default: Date.now },
}, { timestamps: true });

GatewayTransactionSchema.index({ ownerId: 1, transactionDate: -1 });
GatewayTransactionSchema.index({ darajaRequestId: 1 });
GatewayTransactionSchema.index({ mpesaReceiptNo: 1 });
GatewayTransactionSchema.index({ status: 1 });
GatewayTransactionSchema.index({ accountReference: 1 });

export default mongoose.model<IGatewayTransaction>('GatewayTransaction', GatewayTransactionSchema);
