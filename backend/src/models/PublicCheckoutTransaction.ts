import mongoose, { Document, Schema } from 'mongoose';

export interface IPublicCheckoutTransaction extends Document {
  plan: 'starter' | 'growth';
  phoneNumber: string;
  amountKes: number;
  darajaRequestId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  mpesaReceiptNo?: string;
}

const PublicCheckoutTransactionSchema: Schema = new Schema(
  {
    plan: { type: String, enum: ['starter', 'growth'], required: true },
    phoneNumber: { type: String, required: true, trim: true },
    amountKes: { type: Number, required: true },
    darajaRequestId: { type: String, required: true, unique: true },
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
    mpesaReceiptNo: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IPublicCheckoutTransaction>(
  'PublicCheckoutTransaction',
  PublicCheckoutTransactionSchema
);
