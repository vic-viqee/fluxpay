import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface ITransaction extends Document {
  user: IUser['_id'];
  amount: number;
  type: 'STK_PUSH' | 'RECURRING';
  status: 'pending' | 'completed' | 'failed';
  mpesaReceiptNumber?: string;
  transactionDate: Date;
}

const TransactionSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['STK_PUSH', 'RECURRING'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  mpesaReceiptNumber: { type: String },
  transactionDate: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
