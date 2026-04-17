import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  googleId?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  businessName?: string;
  businessType?: string;
  kraPin?: string;
  businessTillOrPaybill?: string;
  businessPhoneNumber?: string;
  preferredPaymentMethod?: string;
  businessDescription?: string;
  logoUrl?: string;
  plan?: string;
  role?: 'user' | 'admin';
  serviceType?: 'subscription' | 'gateway' | 'both';
  transactionLimit: number;
  currentMonthTransactions: number;
  transactionCountResetAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false, select: false },
  googleId: { type: String, unique: true, sparse: true },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  businessName: { type: String, required: true },
  businessType: { type: String, required: true },
  kraPin: { type: String, required: false },
  businessTillOrPaybill: { type: String, required: false },
  businessPhoneNumber: { type: String, required: true },
  preferredPaymentMethod: { type: String, required: true, default: 'M-Pesa STK Push' },
  businessDescription: { type: String, required: false },
  logoUrl: { type: String, required: false },
  plan: { type: String, required: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  serviceType: { type: String, enum: ['subscription', 'gateway', 'both'], default: 'both' },
  transactionLimit: { type: Number, default: 100 },
  currentMonthTransactions: { type: Number, default: 0 },
  transactionCountResetAt: { type: Date, default: () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }},
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
