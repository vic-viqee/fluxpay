import mongoose, { Document, Schema } from 'mongoose';

export interface IServicePlan extends Document {
  name: string;
  amountKes: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'annually';
  billingDay: number; // Day of the month (1-31) or day of the week (1-7) depending on frequency
  ownerId: mongoose.Types.ObjectId;
}

const ServicePlanSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    amountKes: { type: Number, required: true, min: 0 },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'annually'],
      required: true,
    },
    billingDay: { type: Number, required: true, min: 1, max: 31 }, // Further validation based on frequency can be added in pre-save hooks or controllers
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IServicePlan>('ServicePlan', ServicePlanSchema);
