# FluxPay Feature Roadmap

**Last Updated:** 2026-04-23
**Target Market:** Kenya only (small businesses & enterprises)
**Monetization:** Transaction fees (1-3%) + Monthly subscription tiers

---

## 🚨 CRITICAL: Google OAuth Fix (COMPLETED)

### Google Sign-Up Flow
- **Status:** ✅ FIXED (2026-04-23)
- **Problem:** New users selecting Google were redirected to backend URL instead of completing registration
- **Root Cause:** `failureRedirect` in passport.authenticate intercepted new users before callback
- **Fix:** Manual passport callback pattern, proper error redirects to frontend
- **Files:** `auth.routes.ts`, `auth.controller.ts`

---

## ✅ Gateway Access Control (COMPLETED)

### Payment Gateway Discovery
- **Status:** ✅ BUILT (2026-04-23)
- **Changes:**
  - Footer now includes "Payment Gateway" link to `/gateway/signup`
  - Homepage gateway card links directly to `/gateway/signup`
  - No longer discoverable via direct URL access (must go through footer or homepage)

### Free Tier System
- **Status:** ✅ BUILT (2026-04-23)
- **Features:**
  - Free gateway accounts with 50 transactions/month
  - Auto-approved signup (no payment required)
  - Premium features shown but locked (greyed out)
  - Transaction limit progress bar on dashboard
  - Premium Features section in sidebar with lock icons
  - Plan badge in sidebar showing current plan
- **Files:**
  - `frontend/src/components/Footer.tsx` - Added Payment Gateway link
  - `frontend/src/pages/Index.tsx` - Updated gateway card link
  - `frontend/src/pages/gateway/GatewaySignup.tsx` - Free tier info banner
  - `frontend/src/pages/gateway/GatewayDashboard.tsx` - Plan banner + progress bar
  - `frontend/src/layouts/GatewayLayout.tsx` - Premium features section
  - `backend/src/api/gateway/gatewayAuth.controller.ts` - Assigns free plan by default

---

## TIER 1: CRITICAL (Must Have) - 0-4 Weeks

### 1. Embeddable Payment Button ⭐ PRIORITY #1
- **Status:** ✅ BUILT (2026-04-23)
- **Target:** Small Business
- **Description:** Generate a "Pay with M-Pesa" button code to paste on any website without code
- **Behavior:**
  - Requires login/registration to generate
  - Creates unique button with Till number embedded
  - Generates payment link automatically
  - Click → enters amount → customer pays via link
- **Use Case:** Businesses without developers, WhatsApp shops, social media sellers
- **Effort:** Low
- **Files:**
  - `backend/src/api/gateway/publicCheckout.controller.ts` - NEW controller
  - `backend/src/api/gateway/publicCheckout.routes.ts` - NEW routes
  - `backend/src/models/PublicCheckoutButton.ts` - NEW model
  - `frontend/src/pages/gateway/GatewayPaymentButtons.tsx` - NEW UI
  - `frontend/src/pages/public/PublicPaymentButton.tsx` - NEW public page
  - `frontend/src/layouts/GatewayLayout.tsx` - Added navigation
  - `frontend/src/main.tsx` - Added routes

### 2. C2B Validation URL ⭐ PRIORITY #2
- **Status:** TODO
- **Target:** All
- **Description:** Track manual payments made via `*384*#` (Lipa na M-Pesa)
- **Why Critical:** Manual M-Pesa payments (customer dials `*384*#` and enters Till) need to be tracked and reconciled
- **Use Case:** Retail shops where customers pay by dialing `*384*#` instead of scanning QR
- **Effort:** Medium
- **API Endpoint:** `POST /api/gateway/c2b/register` - Register callback URLs with Safaricom
- **Files:**
  - `backend/src/services/mpesa.service.ts` - Add C2BRegister function
  - `backend/src/api/gateway/gateway.controller.ts` - Add register C2B URLs endpoint
  - `backend/src/models/C2bTransaction.ts` - NEW model for manual payments
  - `frontend/src/pages/gateway/Settings.tsx` - Add C2B registration toggle

### 3. Transaction Reversal ⭐ PRIORITY #3
- **Status:** TODO
- **Target:** All
- **Description:** Initiate M-Pesa transaction reversal for refunds/disputes
- **Why Critical:** Businesses must handle "wrong payments" and disputes professionally
- **Use Case:** Customer pays wrong amount, customer disputes charge
- **Effort:** Low
- **API Endpoint:** `POST /api/gateway/reversal`
- **Files:**
  - `backend/src/services/mpesa.service.ts` - Add reversal function
  - `backend/src/api/gateway/gateway.controller.ts` - Add reversal endpoint
  - `frontend/src/pages/gateway/Transactions.tsx` - Add "Reverse" button per transaction

### 4. Dashboard Quick Actions ⭐ PRIORITY #4
- **Status:** TODO
- **Target:** All
- **Description:** Floating action buttons on dashboard for quick tasks
- **Buttons:** "New Payment", "Create Link", "Check Balance"
- **Effort:** Low
- **Files:**
  - `frontend/src/pages/gateway/GatewayDashboard.tsx` - Add floating action buttons

### 5. Payment Status Polling (ALREADY BUILT)
- **Status:** ✅ BUILT (promote in UI)
- **Description:** Auto-reconcile missed callbacks by polling Safaricom for transaction status
- **Action:** Add "Check Status" button to pending transactions in UI
- **Effort:** Low
- **Files:**
  - `backend/src/services/mpesa.service.ts` - Already has queryTransactionStatus
  - `frontend/src/pages/gateway/Transactions.tsx` - Add check status button

---

## TIER 2: IMPORTANT (Should Have) - 1-2 Months

### 6. Bulk B2C Disbursements
- **Status:** TODO
- **Target:** Enterprise
- **Description:** Bulk salary payments, agent payouts, promotional rewards
- **API Endpoint:** `POST /api/gateway/b2c/bulk`
- **Effort:** Medium
- **Files:**
  - `backend/src/services/mpesa.service.ts` - Add B2C bulk function
  - `backend/src/api/gateway/gateway.controller.ts` - Add bulk B2C endpoint
  - `frontend/src/pages/gateway/Disbursements.tsx` - NEW page

### 7. Till-to-Till B2B Transfers
- **Status:** TODO
- **Target:** Enterprise
- **Description:** Transfer funds between different Paybill/Till numbers
- **Use Case:** Pay suppliers directly from collected revenue
- **Effort:** Medium

### 8. Recurring Payment Links
- **Status:** TODO
- **Target:** All
- **Description:** Payment links that regenerate monthly for retainer billing
- **Effort:** Low

### 9. Business KYC/Verification
- **Status:** TODO
- **Target:** All
- **Description:** Verification flow for Safaricom live API access
- **Fields:** Business registration, ID document, bank account
- **Effort:** Medium

### 10. Real-time Till Balance Display
- **Status:** TODO (extend existing)
- **Target:** All
- **Description:** Show Till balance on dashboard without logging into Safaricom portal
- **Effort:** Low
- **API Endpoint:** `GET /api/gateway/balance` (uses existing accountBalance API)

---

## TIER 3: Competitive Edge - 2-4 Months

### 11. Dynamic QR Codes
- **Status:** TODO
- **Target:** Retail/POS
- **Description:** Generate unique QR codes for specific transaction amounts
- **Use Case:** Customer scans QR instead of typing Till - frictionless checkout
- **Effort:** Medium

### 12. Split Payments
- **Status:** TODO
- **Target:** Enterprise
- **Description:** Multiple recipients from single payment (commission structures)
- **Effort:** High

### 13. Animated Payment Status UI
- **Status:** TODO
- **Target:** All
- **Description:** Better UX with animated states ("Sending payment request...", checkmark animation)
- **Effort:** Low

### 14. Custom SMS Templates
- **Status:** TODO
- **Target:** All
- **Description:** Customizable payment confirmation SMS templates
- **Effort:** Low

### 15. Account Statement PDF
- **Status:** TODO
- **Target:** All
- **Description:** Monthly/weekly auto-generated transaction statements
- **Effort:** Low

---

## TIER 4: Professional Features - 4-6 Months

### 16. PDF Receipts Generation
- **Status:** TODO
- **Target:** All
- **Description:** KRA-compliant, branded receipt generation
- **Effort:** Medium

### 17. Multi-Branch Support
- **Status:** TODO
- **Target:** Enterprise
- **Description:** Branch-level revenue tracking, HQ consolidated analytics
- **Effort:** High

### 18. User Roles & Permissions
- **Status:** TODO
- **Target:** Enterprise
- **Description:** Super Admin, Accountant, Support Agent roles
- **Effort:** Medium

### 19. Blacklist Customer Module
- **Status:** TODO
- **Target:** All
- **Description:** Flag customers with repeat failed payments
- **Effort:** Low

### 20. CSV Bulk Customer Import
- **Status:** TODO
- **Target:** All
- **Description:** Import customers from Excel/CSV with validation
- **Effort:** Low

### 21. 2-Factor Authentication
- **Status:** TODO
- **Target:** All
- **Description:** TOTP-based 2FA for all user accounts
- **Effort:** Medium

---

## TIER 5: Growth Features - 6-12 Months

### 22. WooCommerce Plugin
- **Status:** TODO
- **Target:** E-commerce
- **Description:** Official WooCommerce payment gateway plugin
- **Effort:** Medium

### 23. WhatsApp Notifications
- **Status:** TODO
- **Target:** All
- **Description:** Payment confirmations via WhatsApp Business API
- **Effort:** Medium

### 24. SDK Packages (JavaScript/Python)
- **Status:** TODO
- **Target:** Developers
- **Description:** Official SDKs for easier API integration
- **Effort:** Medium

### 25. Accounting Integration
- **Status:** TODO
- **Target:** Enterprise
- **Description:** QuickBooks, Xero sync
- **Effort:** High

### 26. Prorated Billing
- **Status:** TODO
- **Target:** All
- **Description:** Mid-cycle plan upgrades with prorated charges
- **Effort:** Medium

### 27. Partial/Installment Payments
- **Status:** TODO
- **Target:** All
- **Description:** Pay invoices in parts over time
- **Effort:** Medium

### 28. Airtel Money Support
- **Status:** TODO
- **Target:** All
- **Description:** Expand beyond M-Pesa to Airtel Money
- **Effort:** Medium

---

## TIER 6: Advanced (Future) - 12+ Months

### 29. CRM Integration
- **Status:** TODO
- **Target:** Enterprise
- **Description:** HubSpot, Zoho, Salesforce sync
- **Effort:** High

### 30. POS Hardware Integration
- **Status:** TODO
- **Target:** Retail
- **Description:** Link physical card/M-Pesa card readers
- **Effort:** High

### 31. Bank API Integration
- **Status:** TODO
- **Target:** Enterprise
- **Description:** Multi-bank settlement APIs
- **Effort:** Very High

### 32. ETR/KRA Compliance
- **Status:** TODO
- **Target:** All
- **Description:** Electronic Tax Register integration for Kenya
- **Effort:** High

### 33. Industry-Specific Billing
- **Status:** TODO
- **Target:** Various
- **Description:** ISP features, gym/fitness, school billing, property management
- **Effort:** Medium-High

---

## Implementation Status Summary

| Tier | Features | Status |
|------|----------|--------|
| Tier 1 | 5 Critical | 2 done, 3 TODO |
| Tier 2 | 5 Important | TODO |
| Tier 3 | 5 Competitive | TODO |
| Tier 4 | 6 Professional | TODO |
| Tier 5 | 7 Growth | TODO |
| Tier 6 | 5 Advanced | TODO |

**Total: 33 features**

---

## Quick Wins Checklist

### This Week
- [x] Embeddable Payment Button (generate + embed code)
- [ ] Dashboard Quick Actions (floating buttons)
- [ ] Payment Status Polling button (promote existing feature)

### This Month
- [ ] C2B Validation URL (track manual payments)
- [ ] Transaction Reversal (refund handling)
- [ ] Recurring Payment Links
- [ ] Till Balance Display on dashboard

### This Quarter
- [ ] Bulk B2C Disbursements
- [ ] Dynamic QR Codes
- [ ] Business KYC flow
- [ ] PDF Receipts

---

## Competitive Analysis

| Feature | FluxPay | Pesapal | Paystack | Flutterwave |
|---------|---------|---------|----------|-------------|
| M-Pesa STK Push | ✅ 1-3% | ✅ 1.5-3.5% | ✅ 1.95% | ✅ 1.4% |
| Direct Daraja API | ✅ | ❌ | ❌ | ❌ |
| Transaction Polling | ✅ | ❌ | ❌ | ❌ |
| B2C Disbursements | ✅ | ✅ | ✅ | ✅ |
| Till Balance Display | ✅ | ❌ | ❌ | ❌ |
| Embeddable Button | TODO | ✅ | ✅ | ✅ |
| C2B Manual Tracking | TODO | ✅ | ✅ | ✅ |
| Card Payments | ❌ | ✅ | ✅ | ✅ |
| Multi-country | ❌ | East Africa | Pan-Africa | Pan-Africa |

---

## Pricing Model

### Transaction Fees
| Volume | Fee |
|--------|-----|
| High volume (KES 500K+/month) | 1% |
| Medium volume (KES 100K-500K) | 2% |
| Low volume | 3% |

### Subscription Tiers
| Tier | Price/Month | Transactions | Features |
|------|-------------|--------------|----------|
| Free | KES 0 | 50/month | Core features |
| Starter | KES 1,499 | 200/month | + Priority support |
| Growth | KES 4,999 | 1,000/month | + Advanced analytics |
| Pro | KES 14,999 | Unlimited | + All features |
| Partner | Custom | Custom | For aggregators |

---

## Revenue Estimates

| Year | Businesses | MRR | ARR |
|------|------------|-----|-----|
| 1 | 50 | KES 150K | KES 1.8M |
| 2 | 200 | KES 800K | KES 9.6M |
| 3 | 500 | KES 2.5M | KES 30M |

---

## Technical Notes

### M-Pesa Daraja API 3.0 (2025-2026)
- Safaricom rolled out Daraja API 3.0 in late 2025
- Fully stabilized in early 2026
- Faster onboarding, fewer support delays

### C2B URL Registration Rules
- Never use "M-Pesa", "MPesa", "Safaricom" in callback URLs
- Must be HTTPS publicly accessible URLs
- Can only register once in production (use carefully)

### Payment Confirmation Flow
```
STK Push: Customer → Safaricom → Callback → FluxPay → Receipt
C2B Manual: Customer dials *384*# → Safaricom → Confirmation URL → FluxPay
```