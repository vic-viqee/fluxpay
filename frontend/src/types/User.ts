export interface IUser {
  _id: string;
  username: string;
  email: string;
  businessName?: string;
  businessType?: string;
  kraPin?: string;
  businessTillOrPaybill?: string;
  businessPhoneNumber?: string;
  preferredPaymentMethod?: string;
  businessDescription?: string;
  logoUrl?: string; // Add logoUrl
  plan?: string;
  createdAt: string; // Dates are often strings when fetched from API
  updatedAt: string;
  has_received_payment?: boolean; // From backend getMe
}