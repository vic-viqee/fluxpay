import mongoose, { Schema, Document } from 'mongoose';
import { IClient } from './Client';
import { IServicePlan } from './ServicePlan';
import { IUser } from './User';

export interface ISubscription extends Document {
  clientId: IClient['_id'];
  planId: IServicePlan['_id'];
  ownerId: IUser['_id'];
  status: 'PENDING_ACTIVATION' | 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED' | 'FAILED';
  startDate: Date;
  nextBillingDate: Date;
  notes?: string;
  paymentFailureCount?: number;
  lastPaymentAttempt?: Date;
}

const SubscriptionSchema: Schema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  planId: { type: Schema.Types.ObjectId, ref: 'ServicePlan', required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['PENDING_ACTIVATION', 'ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED', 'FAILED'], default: 'PENDING_ACTIVATION' },
  startDate: { type: Date, default: Date.now },
  nextBillingDate: { type: Date, required: true },
  notes: { type: String },
  paymentFailureCount: { type: Number, default: 0 },
  lastPaymentAttempt: { type: Date },
}, { timestamps: true });

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
