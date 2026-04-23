import mongoose, { Schema, Document } from 'mongoose';

export interface IPublicCheckoutButton extends Document {
  ownerId: mongoose.Types.ObjectId;
  buttonId: string;
  title: string;
  description?: string;
  defaultAmount?: number;
  allowCustomAmount: boolean;
  redirectUrl?: string;
  buttonText: string;
  buttonColor: string;
  isActive: boolean;
  totalClicks: number;
  totalPayments: number;
  createdAt: Date;
  updatedAt: Date;
}

const PublicCheckoutButtonSchema: Schema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  buttonId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  defaultAmount: { type: Number },
  allowCustomAmount: { type: Boolean, default: true },
  redirectUrl: { type: String },
  buttonText: { type: String, default: 'Pay with M-Pesa' },
  buttonColor: { type: String, default: '#25D366' },
  isActive: { type: Boolean, default: true },
  totalClicks: { type: Number, default: 0 },
  totalPayments: { type: Number, default: 0 },
}, {
  timestamps: true
});

PublicCheckoutButtonSchema.index({ buttonId: 1 });
PublicCheckoutButtonSchema.index({ ownerId: 1 });

export default mongoose.model<IPublicCheckoutButton>('PublicCheckoutButton', PublicCheckoutButtonSchema);