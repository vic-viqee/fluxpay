import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IWebhook extends Document {
  url: string;
  secret: string;
  events: string[];
  ownerId: IUser['_id'];
  isActive: boolean;
  lastTriggeredAt?: Date;
  failureCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookSchema: Schema = new Schema({
  url: { type: String, required: true },
  secret: { type: String, required: true },
  events: { 
    type: [String], 
    enum: ['payment.success', 'payment.failed', 'subscription.created', 'subscription.expired', 'subscription.cancelled'],
    default: ['payment.success', 'payment.failed']
  },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  lastTriggeredAt: { type: Date },
  failureCount: { type: Number, default: 0 },
}, { timestamps: true });

WebhookSchema.index({ ownerId: 1 });

export default mongoose.model<IWebhook>('Webhook', WebhookSchema);