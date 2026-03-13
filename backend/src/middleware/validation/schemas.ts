import { z, ZodError, ZodIssue, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((e: ZodIssue) => `${e.path.join('.')}: ${e.message}`);
        return res.status(400).json({ message: 'Validation failed', errors: messages });
      }
      next(error);
    }
  };
};

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  username: z.string().min(1, 'Username is required').optional(),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/\d/, 'Password must contain number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
  businessName: z.string().min(1, 'Business name is required'),
  businessType: z.string().min(1, 'Business type is required').optional(),
  businessPhoneNumber: z.string().min(1, 'Business phone number is required'),
  kraPin: z.string().optional(),
  businessTillOrPaybill: z.string().optional(),
  preferredPaymentMethod: z.string().optional(),
  businessDescription: z.string().optional(),
  plan: z.string().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const googleAuthCodeSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
});

export const googleRegistrationContextSchema = z.object({
  ticket: z.string().min(1, 'Registration ticket is required'),
});

export const googleCompleteRegistrationSchema = z.object({
  ticket: z.string().min(1, 'Registration ticket is required'),
  businessName: z.string().min(1, 'Business name is required'),
  businessType: z.string().min(1, 'Business type is required'),
  businessPhoneNumber: z.string().min(1, 'Business phone number is required'),
  kraPin: z.string().optional(),
  businessTillOrPaybill: z.string().optional(),
  preferredPaymentMethod: z.string().optional(),
  businessDescription: z.string().optional(),
  plan: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/\d/, 'Password must contain number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/\d/, 'Password must contain number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
});

export const paymentSchema = z.object({
  amount: z.number().positive('Amount must be positive').min(1, 'Minimum amount is 1'),
  phone: z.string().min(1, 'Phone number is required').optional(),
  phoneNumber: z.string().min(1, 'Phone number is required').optional(),
  subscriptionId: z.string().min(1, 'Subscription ID is required'),
});

export const simulateStkPushSchema = z.object({
  amount: z.number().positive('Amount must be positive').min(1, 'Minimum amount is 1'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
});

export const pricingStkPushSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required'),
  plan: z.enum(['starter', 'growth', 'Starter', 'Growth']),
});

export const subscriptionSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  planId: z.string().min(1, 'Plan ID is required'),
  notes: z.string().optional(),
});

export const updateSubscriptionSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required').optional(),
  planId: z.string().min(1, 'Plan ID is required').optional(),
  status: z.enum(['PENDING_ACTIVATION', 'ACTIVE', 'PAUSED', 'CANCELLED']).optional(),
  nextBillingDate: z.string().optional(),
  notes: z.string().optional(),
});

export const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
});

export const planSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  amountKes: z.number().positive('Amount must be positive').min(1, 'Minimum amount is 1'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'annually']),
  billingDay: z.number().int().min(1).max(31, 'Billing day must be between 1 and 31'),
});

export const updatePlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required').optional(),
  amountKes: z.number().positive('Amount must be positive').min(1, 'Minimum amount is 1').optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'annually']).optional(),
  billingDay: z.number().int().min(1).max(31, 'Billing day must be between 1 and 31').optional(),
});
