import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IApiKey extends Document {
  key: string;
  secret: string;
  name: string;
  ownerId: IUser['_id'];
  lastUsedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ApiKeySchema: Schema = new Schema({
  key: { type: String, required: true, unique: true },
  secret: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lastUsedAt: { type: Date },
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

ApiKeySchema.index({ ownerId: 1 });
ApiKeySchema.index({ key: 1 });

export default mongoose.model<IApiKey>('ApiKey', ApiKeySchema);