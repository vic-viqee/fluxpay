import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface ISubscription extends Document {
  user: IUser['_id'];
  customerName: string; // New field
  phoneNumber: string; // New field
  amount: number;
  billingFrequency: 'daily' | 'weekly' | 'monthly'; // New field
  plan: string;
  status: 'active' | 'inactive' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  notes?: string; // New field (optional)
}

const SubscriptionSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true }, // New field
  phoneNumber: { type: String, required: true }, // New field
  amount: { type: Number, required: true },
  billingFrequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true }, // New field
  plan: { type: String, required: true, default: 'Custom' }, // Default to 'Custom' for dashboard created subs
  status: { type: String, enum: ['active', 'inactive', 'cancelled'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  notes: { type: String }, // New field
}, { timestamps: true });

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
