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
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: false }, // Making username optional
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false, select: false }, // `select: false` prevents it from being returned by default
  googleId: { type: String, unique: true, sparse: true },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  businessName: { type: String, required: true }, // Making businessName required again
  businessType: { type: String, required: true }, // Making businessType required again
  kraPin: { type: String, required: false },
  businessTillOrPaybill: { type: String, required: false },
  businessPhoneNumber: { type: String, required: true }, // Making businessPhoneNumber required again
  preferredPaymentMethod: { type: String, required: true, default: 'M-Pesa STK Push' },
  businessDescription: { type: String, required: false },
  logoUrl: { type: String, required: false },
  plan: { type: String, required: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
