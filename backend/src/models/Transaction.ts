import mongoose, { Schema, Document } from 'mongoose';
import { ISubscription } from './Subscription';
import { IUser } from './User';

export interface ITransaction extends Document {
  subscriptionId: ISubscription['_id'];
  ownerId: IUser['_id']; // The user who owns the subscription (e.g., Alex)
  amountKes: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  mpesaReceiptNo?: string;
  darajaRequestId: string;
  retryCount: number;
  transactionDate: Date;
}

const TransactionSchema: Schema = new Schema({
  subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amountKes: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
  mpesaReceiptNo: { type: String },
  darajaRequestId: { type: String, required: true, unique: true },
  retryCount: { type: Number, default: 0 },
  transactionDate: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);

