export interface IUser {
  _id: string;
  username: string;
  email: string;
  role?: 'user' | 'admin';
  serviceType?: 'subscription' | 'gateway' | 'both';
  businessName?: string;
  businessType?: string;
  kraPin?: string;
  businessTillOrPaybill?: string;
  businessPhoneNumber?: string;
  preferredPaymentMethod?: string;
  businessDescription?: string;
  logoUrl?: string;
  plan?: string;
  createdAt: string;
  updatedAt: string;
  has_received_payment?: boolean;
}