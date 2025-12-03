/**
 * Shared Data Transfer Objects (DTOs) for FluxPay API
 * Keep synchronized with backend schema
 */

// ============ Auth & User ============

export interface UserDto {
  id: string
  email: string
  fullName?: string
  role: 'merchant' | 'admin'
  merchantId?: string
  createdAt: string
}

export interface SignUpRequest {
  email: string
  password: string
  fullName?: string
  businessName?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserDto
}

export interface RefreshTokenRequest {
  refreshToken: string
}

// ============ Merchant & Onboarding ============

export type MerchantStatus = 'pending' | 'approved' | 'rejected'
export type KycStatus = 'pending' | 'verified' | 'failed'

export interface MerchantDto {
  id: string
  name: string
  country?: string
  contactPhone?: string
  status: MerchantStatus
  kycStatus: KycStatus
  createdAt: string
}

export interface CreateMerchantRequest {
  name: string
  country?: string
  contactPhone?: string
}

export interface UpdateMerchantRequest {
  name?: string
  country?: string
  contactPhone?: string
}

// ============ Virtual Till ============

export interface TillDto {
  id: string
  merchantId: string
  name: string
  code: string
  balanceCents: number
  currency: 'KES' | 'USD'
  createdAt: string
}

export interface CreateTillRequest {
  merchantId: string
  name: string
  currency: 'KES' | 'USD'
}

export interface UpdateTillRequest {
  name?: string
}

// ============ Payments (STK) ============

export interface StkInitiateRequest {
  merchantId: string
  amountCents: number
  phone: string
  callbackUrl?: string
  metadata?: Record<string, string>
}

export interface StkInitiateResponse {
  checkoutRequestId: string
  merchantRequestId: string
  expiresAt: string
}

export type PaymentStatus = 'pending' | 'success' | 'failed'

export interface StkStatusDto {
  checkoutRequestId: string
  status: PaymentStatus
  mpesaResultCode?: string
  mpesaReceiptNo?: string
}

export interface PaymentDto {
  id: string
  merchantId: string
  tillId?: string
  amountCents: number
  currency: 'KES' | 'USD'
  status: PaymentStatus
  checkoutRequestId?: string
  mpesaReceiptNo?: string
  metadata?: Record<string, string>
  createdAt: string
}

// ============ Subscriptions ============

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing'

export interface PlanDto {
  id: string
  name: string
  description?: string
  priceCents: number
  currency: 'KES' | 'USD'
  interval: 'monthly' | 'yearly'
  trialDays?: number
  createdAt: string
}

export interface SubscriptionDto {
  id: string
  planId: string
  merchantId: string
  customerId: string
  status: SubscriptionStatus
  currentPeriodEnd: string
  nextBillingAt?: string
  createdAt: string
}

export interface CreateSubscriptionRequest {
  merchantId: string
  planId: string
  customerId: string
  paymentMethodId?: string
}

export interface CancelSubscriptionRequest {
  subscriptionId: string
  reason?: string
}

// ============ Invoices ============

export type InvoiceStatus = 'pending' | 'paid' | 'cancelled'

export interface InvoiceItemDto {
  description: string
  amountCents: number
  quantity: number
}

export interface InvoiceDto {
  id: string
  merchantId: string
  invoiceNumber: string
  customerName: string
  amountCents: number
  currency: 'KES' | 'USD'
  status: InvoiceStatus
  dueDate?: string
  pdfUrl?: string
  createdAt: string
}

export interface CreateInvoiceRequest {
  merchantId: string
  customerName: string
  items: InvoiceItemDto[]
  dueDate?: string
  metadata?: Record<string, string>
}

// ============ Error Response ============

export interface ErrorResponse {
  error: string
  code?: string
  details?: Record<string, any>
  statusCode?: number
}

// ============ Pagination ============

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ============ Dashboard / Analytics ============

export interface DashboardSummaryDto {
  totalBalanceCents: number
  monthlyRecurringRevenueCents: number
  totalTransactions: number
  activeSubscriptions: number
  currency: 'KES' | 'USD'
}

export interface TransactionHistoryDto {
  id: string
  type: 'payment' | 'payout' | 'refund'
  amountCents: number
  currency: 'KES' | 'USD'
  status: PaymentStatus
  description?: string
  createdAt: string
}
