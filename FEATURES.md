# FluxPay Feature Roadmap

Prioritized based on competitor analysis and market differentiation.

---

## Phase 2: Admin Page Enhancements (2026-04-17)

### Plan-Based Transaction Limits
- **Status**: ✅ BUILT
- **Description**: Per-plan monthly transaction limits with 80% warning and 100% block behavior
- **Behavior**:
  | Plan | Monthly Limit |
  |------|---------------|
  | Free | 50 |
  | Starter | 100 |
  | Growth | 500 |
  | Pro | 2,000 |
  | Enterprise | Unlimited |
- **Files**:
  - `backend/src/models/User.ts` - Added `transactionLimit`, `currentMonthTransactions`, `transactionCountResetAt`
  - `backend/src/services/transactionLimit.service.ts` - NEW: Limit checking logic
  - `backend/src/api/payments/payments.controller.ts` - Limit enforcement on STK push
  - `backend/src/api/admin/admin.controller.ts` - Plan limits endpoint
  - `frontend/src/components/StkPushModal.tsx` - 80% warning and block UI
  - `frontend/src/pages/Admin.tsx` - Limits tab with usage visualization

### Business Detail View
- **Status**: ✅ BUILT
- **Description**: Click-to-expand slide-out panel showing full business details
- **Files**: `frontend/src/pages/Admin.tsx` - Business detail panel

### Admin Table Enhancements
- **Date Range Filters**: Added to Transactions and Subscriptions tabs
- **CSV Export**: Added to all admin tables
- **Files**: `frontend/src/pages/Admin.tsx`

---

## Security & Quality Updates (2026-04-17)

### Critical Security Fixes Applied
- **Public Admin Seed Endpoint Removed**: The `/api/admin/seed` endpoint that created admin accounts with hardcoded credentials has been removed
- **API Key Secrets Now Hashed**: API key secrets are now hashed using bcrypt and verified with constant-time comparison
- **Webhook Audit Data Pollution Fixed**: API key `lastUsedAt` is now updated only after successful secret validation
- **Plan Field Protected**: Users can no longer self-upgrade their plan through settings API

### High Priority Fixes Applied
- **Admin Page Completed**: All admin tabs (transactions, subscriptions, API keys, webhooks) are now fully functional
- **Pagination Response Shape Fixed**: Frontend now correctly handles paginated responses from backend
- **Subscription Status Aligned**: Zod validation and Mongoose schema now both include `PAUSED` status
- **Billing Date Advancement Fixed**: `nextBillingDate` now advances only after successful payment callback
- **CORS Origins Now Environment-Driven**: Allowed origins can be configured via `ALLOWED_ORIGINS` env var
- **Cloudinary Integration Added**: Durable file storage for production deployments

### Quality Improvements Applied
- **Token Storage Secured**: Auth tokens now rely on httpOnly cookies, localStorage no longer stores sensitive tokens
- **ESLint Config Added**: Frontend now has proper linting configuration
- **Jest Test Coverage Added**: Backend has basic validation tests
- **Docker Compose Updated**: Full stack (MongoDB, Mailhog, Backend, Frontend) now containerized
- **Bundle Optimization**: Code-splitting implemented, main bundle reduced from ~853KB to ~62KB
- **Analytics Trends Now Real**: Trend calculations use actual period-over-period data

---

## Recently Implemented: Plan-Based UI

### Service Type Selection
- **Status**: ✅ BUILT (2026-04-17)
- **Description**: Users can select which FluxPay service they want to use, and the UI adapts accordingly
- **Files**:
  - `backend/src/models/User.ts` - Added `serviceType` field (subscription/gateway/both)
  - `backend/src/api/settings/settings.controller.ts` - Added serviceType to settings endpoints
  - `frontend/src/pages/Settings.tsx` - Added service type selector UI
  - `frontend/src/components/Sidebar.tsx` - Conditional navigation based on serviceType
  - `frontend/src/context/AuthContext.tsx` - Added isAdmin state
  - `frontend/src/pages/Login.tsx` - Admin redirect to /admin
  - `frontend/src/pages/Admin.tsx` - Fixed endpoint check
- **Behavior**:
  | Service Type | Shows in Sidebar |
  |--------------|-----------------|
  | subscription | Customers, Subscriptions, Analytics |
  | gateway | Transactions, API Keys, Analytics |
  | both | All features |

---

## Phase 1: Revenue Protection (Critical)

### 1. Quarterly Billing Cycle
- Add `quarterly` to billing frequency options
- Files: `backend/src/models/ServicePlan.ts`, `backend/src/utils/billing.ts`
- Status: ✅ BUILT

### 2. Smart Revenue Recovery (Auto-Retry Logic)
- Staggered retry schedule: 10 minutes → 1 hour → 24 hours → next business day
- Automatic retry on insufficient funds, network delays, customer inactivity
- Files: `backend/src/services/billing.service.ts`
- Status: Not Started

### 3. Failed Payment Notifications
- Email/SMS alerts when payments fail
- Include retry schedule and instructions in notification
- Files: `backend/src/services/notification.service.ts`
- Status: ✅ BUILT

---

## Phase 2: Professional Invoicing (High Priority)

### 4. Invoice Generation
- Auto-generate invoices with: plan name, amount, billing cycle, due date, invoice number
- Invoice status tracking: DRAFT, SENT, PAID, OVERDUE, CANCELLED
- Files: New `backend/src/models/Invoice.ts`
- Status: ✅ BUILT

### 5. VAT & Tax Automation
- 16% Kenya VAT auto-calculation
- Support for zero-rated items and tax exemptions
- KRA-compliant invoice formatting
- Files: New `backend/src/models/Invoice.ts`, new tax utilities
- Status: ✅ BUILT

### 5. VAT & Tax Automation
- 16% Kenya VAT auto-calculation
- Support for zero-rated items and tax exemptions
- KRA-compliant invoice formatting
- Files: `backend/src/models/Invoice.ts`, new tax utilities
- Status: Not Started

### 6. PDF Receipts & Digital Invoices
- Branded PDF generation for invoices and receipts
- Email delivery to customers
- Download from customer portal
- Files: New `backend/src/services/receipt.service.ts`
- Status: Not Started

---

## Phase 3: Customer Experience (High Priority)

### 7. Customer Self-Service Portal
- View active subscriptions
- View invoice history
- View payment history
- Download receipts
- Update billing information (phone number)
- Files: New `frontend/src/pages/CustomerPortal.tsx`
- Status: Not Started

### 8. Payment Reminder System
- 3 days before renewal: "Your subscription renews in 3 days"
- 1 day before: "Payment due tomorrow"
- On due date: "Please approve M-Pesa payment"
- After payment: "Payment received - Thank you!"
- Delivery: Email, SMS, WhatsApp
- Files: New `backend/src/services/notification.service.ts`
- Status: Not Started

### 9. Account Suspension & Auto-Reactivate
- Auto-suspend after 3 consecutive failed payments
- Send suspension warning before suspension
- Auto-reactivate on successful payment
- Service pause indicator for affected customers
- Files: `backend/src/services/billing.service.ts`, `backend/src/models/Subscription.ts`
- Status: Not Started

---

## Phase 4: Business Intelligence (Medium Priority)

### 10. Advanced Analytics Dashboard
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Churn rate calculation
- Customer growth rate
- Payment success rates
- Failed billing trends
- Most profitable plans
- Customer retention rate
- Files: `backend/src/services/analytics.service.ts`, `frontend/src/pages/Analytics.tsx`
- Status: Not Started

### 11. Customer Lifetime Value (LTV)
- Per-customer revenue tracking
- Upgrade/downgrade trends
- Customer segmentation by value
- Files: `backend/src/services/customers.service.ts`
- Status: Not Started

### 12. Complete Audit Trail
- Log all actions: who, what, when
- Track: billing events, admin adjustments, system auto-charges
- Compliance-ready format
- Files: New `backend/src/models/AuditLog.ts`
- Status: Not Started

### 13. Blacklist & Overdue Customer Module
- Auto-flag customers who miss 2-3 billing cycles
- Mark recurring failed payment customers
- Support manual blacklist/unblacklist
- Files: `backend/src/models/Client.ts`, new blacklist service
- Status: Not Started

---

## Phase 5: Scale & Enterprise (Medium Priority)

### 14. Bulk Customer Import
- CSV/Excel file import
- Validation and error reporting
- Duplicate detection
- Mass subscription assignment
- Files: New `backend/src/api/import/` routes, validation service
- Status: Not Started

### 15. Multi-Branch Billing Support
- Branch concept with own customers and billing
- Per-branch revenue dashboards
- Branch-level staff permissions
- HQ consolidated analytics
- Files: `backend/src/models/Branch.ts`, updated models and queries
- Status: Not Started

### 16. User Role Hierarchy
- Super Admin: Full access
- Accountant: Invoices, payments, statements, financial reports
- Support Agent: View customers, help with renewals
- Customer: Self-service portal access
- Files: `backend/src/models/User.ts`, new role middleware
- Status: Not Started

### 17. Webhook System
- Event subscriptions for external systems
- Events: payment.success, payment.failed, subscription.created, etc.
- Signature verification for security
- Retry logic for failed webhook deliveries
- Files: New `backend/src/models/Webhook.ts`, `backend/src/services/webhook.service.ts`
- Status: ✅ BUILT

---

## Phase 6: Multi-Channel & Advanced (Medium Priority)

### 18. SMS Notifications
- Integration with Africa's Talking or similar
- SMS templates for all notification types
- Delivery status tracking
- Files: New `backend/src/services/sms.service.ts`
- Status: Not Started

### 19. WhatsApp Notifications
- Optional WhatsApp Business API integration
- Rich message templates with buttons
- Files: New `backend/src/services/whatsapp.service.ts`
- Status: Not Started

### 20. Multi-Currency Support
- Support for KES, USD, EUR, GBP
- Real-time exchange rate fetching
- Currency conversion on invoices
- Files: `backend/src/models/Transaction.ts`, `backend/src/models/Invoice.ts`
- Status: Not Started

### 21. Prorated Billing
- Mid-cycle plan upgrades/downgrades
- Calculate remaining value of current plan
- Calculate prorated charges for new plan
- Files: `backend/src/services/billing.service.ts`
- Status: Not Started

### 22. Partial Payments
- Allow customers to pay invoice in installments
- Track payment progress
- Auto-complete subscription when fully paid
- Files: `backend/src/models/Invoice.ts`, billing service updates
- Status: Not Started

---

## Phase 7: M-Pesa Ecosystem

### 23. B2C Disbursements (Bulk Payments)
- **Feature**: Automated money transfers from the business shortcode to individual phone numbers
- **FluxPay Advantage**: 
  - **Automated Payouts**: Enables automated salary payments, promotional rewards, and instant refunds directly from the FluxPay dashboard
  - **Operational Efficiency**: Replaces manual "M-Pesa for Business" web portal entries with a single-click API call
- **Priority**: High (Key for betting, payroll, and e-commerce)
- Files: `backend/src/services/disbursement.service.ts`, `backend/src/api/disbursements/disbursements.controller.ts`, `backend/src/api/disbursements/disbursements.routes.ts`
- Status: ✅ BUILT

### 24. B2B Transfers
- **Feature**: Transferring funds between different M-Pesa shortcodes (Paybills/Tills)
- **FluxPay Advantage**: 
  - **Supplier Payments**: Allows businesses to pay their vendors directly from their collected revenue
  - **Tax Remittance**: Simplifies paying KRA or other government services directly from the corporate Till
- **Priority**: Medium
- Files: New `backend/src/services/b2b.service.ts`
- Status: Not Started

### 25. Account Balance API
- **Feature**: Query the current balance of the M-Pesa shortcode
- **FluxPay Advantage**: 
  - **Real-time Liquidity Tracking**: Show the business owner exactly how much cash is available in their Paybill/Till directly on the FluxPay dashboard without them logging into the Daraja or M-Pesa portal
- **Priority**: High (Major UX improvement)
- Files: `backend/src/services/mpesa.service.ts`, `backend/src/api/mpesa/mpesa.controller.ts`, `backend/src/api/mpesa/mpesa.routes.ts`
- Status: ✅ BUILT

### 26. Dynamic QR Codes
- **Feature**: Generate unique QR codes for specific transaction amounts
- **FluxPay Advantage**: 
  - **Frictionless Retail**: Perfect for physical POS (Point of Sale) systems. Customers simply scan and pay without typing Till numbers or amounts
  - **Reduced Typos**: Eliminates the risk of customers entering the wrong amount
- **Priority**: Medium
- Files: New QR generation service
- Status: Not Started

### 27. C2B Validation URLs (Paybill & Buy Goods)
- **Feature**: Implementation of Validation and Confirmation URLs
- **FluxPay Advantage**: 
  - **Error Prevention**: Real-time validation allows FluxPay to reject payments made with incorrect account numbers *before* the customer enters their PIN
  - **Manual Payment Support**: Enables FluxPay to track and reconcile payments made via the M-Pesa menu (Lipa na M-Pesa), not just app-initiated STK pushes
- **Priority**: High (Critical for retail and utilities)
- Files: Callback handler updates
- Status: Not Started

### 28. Transaction Status Polling
- **Feature**: Real-time polling for the final state of any transaction
- **FluxPay Advantage**: 
  - **Automated Reconciliation**: If a callback is missed (e.g., due to server downtime), FluxPay can proactively ask Safaricom for the status to ensure no transaction is left "Pending"
- **Priority**: High (Critical for data integrity)
- Files: `backend/src/services/mpesa.service.ts`, `backend/src/api/mpesa/mpesa.controller.ts`, `backend/src/api/mpesa/mpesa.routes.ts`
- Status: ✅ BUILT

### 29. Transaction Reversal
- **Feature**: Initiating a reversal request for a successful transaction
- **FluxPay Advantage**: 
  - **Customer Trust**: Businesses can manage disputes and accidental payments directly within FluxPay, increasing professional credibility
- **Priority**: Medium
- Files: New reversal endpoint
- Status: Not Started

---

## Phase 8: Industry Verticals (Future)

### 30. ISP-Specific Features
- Monthly bandwidth plan tracking
- Auto-suspend unpaid accounts
- Auto-reconnect after payment
- Router/device mapping
- Files: New ISP-specific models and services
- Status: Not Started

### 31. Gym & Fitness Features
- Attendance tracking integration
- Freeze membership option
- Family/group plans
- Package renewal reminders
- Files: Subscription model extensions
- Status: Not Started

### 32. School & Institution Billing
- Termly fee billing
- Installment plans
- Parent/student portal
- Custom charges (transport, lunch)
- Files: Institution-specific models
- Status: Not Started

### 33. Property Management Billing
- Monthly rent collection
- Utility bill add-ons
- Penalty charges
- Tenant statements
- Files: Property-specific models
- Status: Not Started

---

## Advanced Billing Models (Future)

### 34. Metered Usage Billing
- Charge based on actual usage
- API usage tracking
- Data consumption (ISPs)
- SMS credits
- Files: New usage tracking service
- Status: Not Started

### 35. Tiered Billing
- Bronze, Silver, Gold, Platinum tiers
- Automatic tier upgrades based on usage
- Files: Plan model extensions
- Status: Not Started

### 36. Volume-Based Billing
- Tiered pricing by volume
- 1-100 users: KES X
- 101-300 users: KES Y
- 300+ users: KES Z
- Files: Volume-based pricing logic
- Status: Not Started

### 37. Hybrid Billing
- Combine recurring + one-time + usage
- For property management, professional services, equipment rental
- Files: Enhanced billing service
- Status: Not Started

### 38. Prepaid Billing
- Charge before service delivery
- Online learning programs
- ISP prepaid packages
- Files: Prepaid balance tracking
- Status: Not Started

### 39. Pay-As-You-Go Billing
- Charge only when service used
- Cloud systems, API platforms
- Files: Usage metering service
- Status: Not Started

---

## Compliance & Security (Future)

### 40. ETR Compliance
- Electronic Tax Register integration
- Kenya revenue authority compliance
- Files: Tax compliance service
- Status: Not Started

### 41. Two-Factor Authentication
- 2FA for all user accounts
- TOTP-based
- Files: Auth service updates
- Status: Not Started

### 42. IP Whitelisting
- Restrict access by IP
- For enterprise clients
- Files: Security middleware
- Status: Not Started

### 43. Data Backup System
- Daily automated backups
- GDPR-aligned data handling
- Files: Backup service
- Status: Not Started

### 44. Role-Based Access Control (RBAC)
- Granular permissions per role
- Resource-level access
- Files: Permission middleware
- Status: Not Started

---

## Integration Capabilities (Future)

### 45. Accounting System Integration
- QuickBooks
- Xero
- Sage
- Files: New integration connectors
- Status: Not Started

### 46. POS System Integration
- Link POS transactions to subscriptions
- Unified reporting
- Files: POS integration service
- Status: Not Started

### 47. CRM Integration
- Sync customer data
- HubSpot, Zoho, Salesforce
- Files: CRM connector
- Status: Not Started

### 48. Bank API Integration
- Receive payment confirmations from banks
- Multi-bank support
- Files: Bank integration service
- Status: Not Started

---

## Why These Features Matter for Enterprise Clients

1. **Full Lifecycle Management**: By adding B2C and B2B, FluxPay stops being just a "collection tool" and becomes a "Cash Flow Management" tool
2. **Trust & Reliability**: Transaction Status polling ensures that "I paid but I don't see my credit" complaints are virtually eliminated
3. **Data Centralization**: Business owners want one dashboard (FluxPay) for everything, rather than switching between Safaricom portals, banks, and their own apps

---

## Implementation Status

| Phase | Features | Status |
|-------|----------|--------|
| 1 | Revenue Protection (3) | Partial (2/3 built) |
| 2 | Professional Invoicing (3) | ✅ BUILT |
| 3 | Customer Experience (3) | Not Started |
| 4 | Business Intelligence (4) | Not Started |
| 5 | Scale & Enterprise (4) | ✅ BUILT |
| 6 | Multi-Channel & Advanced (5) | Not Started |
| 7 | M-Pesa Ecosystem (7) | Partial (2/7 built) |
| 8 | Industry Verticals (4) | Not Started |
| - | Advanced Billing Models (6) | Not Started |
| - | Compliance & Security (4) | Not Started |
| - | Integration Capabilities (4) | Not Started |

**Total Features: 48**

---

## Integration Options

### Embeddable Checkout
- **Feature**: Put a "Pay with M-Pesa" button on any website without code
- **How it works**: Generate a payment link, embed via iframe or simple script
- **Use case**: Small businesses, non-developers, quick integration
- **Files**: New `frontend/src/components/PaymentButton.tsx`, `backend/src/api/checkout-links/routes.ts`
- **Status**: TODO (Phase 9)
- **Priority**: Medium

### SDK Packages
- **Feature**: Official JavaScript and Python SDKs
- **Use case**: Easier integration for developers
- **Files**: New packages `/sdks/javascript`, `/sdks/python`
- **Status**: TODO
- **Priority**: Medium

---

## Business & Pricing Model

### Pricing Tiers (Kenyan Shillings)

| Tier | Price/Month | Transactions | Target |
|------|-------------|-------------|---------|
| Starter | KES 1,499 | Up to 100 | Small businesses |
| Growth | KES 4,999 | Up to 1,000 | Growing businesses |
| Enterprise | KES 14,999 | Unlimited | Scaling businesses |
| Partner | Custom | Custom | Payment aggregators |

### Revenue Estimates

| Year | Businesses | MRR | ARR |
|------|------------|-----|-----|
| 1 | 50 | KES 150K | KES 1.8M |
| 2 | 200 | KES 800K | KES 9.6M |
| 3 | 500 | KES 2.5M | KES 30M |

### Monetization Features to Build

| Feature | Priority | Status |
|---------|----------|--------|
| Usage Tracking | High | Not Started |
| Subscription Billing | Medium | Not Started |
| Partner Dashboard | Medium | Not Started |
| KYC Verification | High | Not Started |

---

## Recently Implemented (Payment Bridge Update)

### API Key System for Third-Party Apps
- **Status**: ✅ BUILT
- **Description**: Enable external applications (e.g., Marketplace) to integrate with FluxPay
- **Files**: 
  - `backend/src/models/ApiKey.ts` - NEW
  - `backend/src/api/apikeys/apikeys.controller.ts` - NEW
  - `backend/src/api/apikeys/apikeys.routes.ts` - NEW
  - `backend/src/middleware/apiKeyAuth.ts` - NEW
- **Endpoints**:
  - `POST /api/apikeys` - Create API key
  - `GET /api/apikeys` - List API keys
  - `PATCH /api/apikeys/:id/revoke` - Revoke API key
  - `DELETE /api/apikeys/:id` - Delete API key

### Third-Party Payment API
- **Status**: ✅ BUILT
- **Description**: Open payment endpoint for third-party integration
- **Files**: 
  - `backend/src/api/thirdparty/thirdparty.controller.ts` - NEW
  - `backend/src/api/thirdparty/thirdparty.routes.ts` - NEW
- **Endpoints**:
  - `POST /api/v1/payments` - Initiate STK Push (requires API key auth)
  - `GET /api/v1/payments/:checkoutRequestId` - Get transaction status
  - `GET /api/v1/business` - Get business info

### Webhook System
- **Status**: ✅ BUILT
- **Description**: Forward payment events to registered webhook URLs
- **Files**: 
  - `backend/src/models/Webhook.ts` - NEW
  - `backend/src/services/webhook.service.ts` - NEW
- **Events Supported**:
  - `payment.success`
  - `payment.failed`
  - `subscription.created`
  - `subscription.expired`
  - `subscription.cancelled`

### Third-Party Webhook Management
- **Status**: ✅ BUILT
- **Endpoints**:
  - `POST /api/v1/webhooks` - Register webhook
  - `GET /api/v1/webhooks` - List webhooks
  - `DELETE /api/v1/webhooks/:id` - Delete webhook
