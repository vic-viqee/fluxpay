import mongoose, { Document, Schema } from 'mongoose';

export interface IClient extends Document {
  name: string;
  phoneNumber: string;
  email?: string;
  ownerId: mongoose.Types.ObjectId;
}

const ClientSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      // Basic M-Pesa format validation (e.g., 2547XXXXXXXX)
      match: /^2547\d{8}$/,
    },
    email: { type: String, trim: true, lowercase: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IClient>('Client', ClientSchema);
