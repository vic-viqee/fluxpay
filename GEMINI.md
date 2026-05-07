# FluxPay - Feature Roadmap & Technical Specifications

FluxPay is a dual-purpose platform: a **Subscription Billing Engine** and a **Payment Gateway** specifically optimized for M-Pesa. This document serves as the master plan for transitioning from a "Functional Build" to a "Production-Grade Pro Platform."

---

## 🚀 Current Core Features (Implemented)
- **FastAPI Backend**: Asynchronous, type-safe, and high-performance.
- **M-Pesa Integration**: STK Push (Express), C2B (Paybill/Till), and Reversals.
- **Subscription Engine**: Automated daily billing via scheduler, 3-tier retry logic, and automated email notifications.
- **Payment Gateway**: Public checkout links and direct API for STK initiation.
- **Merchant Dashboard**: Transaction tracking, customer management, and basic analytics.
- **Auth System**: Regular credentials, Google OAuth, and secure JWT (Cookie + Header) management.
- **Idempotency Support**: Implemented for critical API operations via `X-Idempotency-Key` header using middleware.
- **Webhook Secrets**: Secure webhook secrets generated and stored per user.
- **Request Rate Limiting**: Applied to authentication endpoints (`/api/auth/login`, `/api/auth/signup`) with a default limit of 60 requests/minute/IP.

---

## 🛠 Phase 1: Security & Reliability (The Foundation)
*Goal: Ensure the system is "Bank-Grade" secure and prevents double-charging.*

### 1.1 Idempotency Support
- **What**: Prevent duplicate transactions if an API call is retried.
- **Spec**: Implemented `X-Idempotency-Key` header check using middleware. Keys are stored in MongoDB for 24 hours. Applied to `/api/gateway/initiate`.

### 1.2 Webhook Hardening (HMAC Signatures)
- **What**: Secure merchant notifications.
- **Spec**: Outgoing webhooks are signed using HMAC-SHA256 with a per-webhook `secret`. The signature is sent in the `X-Webhook-Signature` header. Secrets are automatically generated for each webhook.

### 1.3 Request Rate Limiting
- **What**: Prevent API abuse and ensure fair usage.
- **Spec**: Applied a default rate limit of **60 requests per minute per IP address** to authentication endpoints (`/api/auth/login`, `/api/auth/signup`). This protects against brute-force attacks.

### 1.4 Customer Phone Number Validation Fix
- **What**: Allow creation of customers with Kenyan phone numbers starting with `2541` or `2547`.
- **Spec**: Updated the phone number validation regex in `backend/app/models/gateway_customer.py` from `^2547\d{8}$` to `^254(1|7)\d{8}$`.

---

## 🧑‍💻 Phase 2: Developer Experience (The Gateway)
*Goal: Make FluxPay the preferred choice for developers.*

### 2.1 Sandbox / Test Mode
- **What**: A safe environment for developers to test without using real money.
- **Spec**: Introduce `pk_test_` and `pk_live_` API key prefixes. Implement a `Simulated STK Push` service that mimics Daraja responses. Add a "Test Mode" toggle in the frontend dashboard.

### 2.2 FluxPay Elements (Embedded Checkout)
- **What**: A drop-in JS component for merchant websites.
- **Spec**: An iframe-based checkout window that handles the phone number input and STK triggering without the customer leaving the merchant's site.

---

## 📈 Phase 3: Advanced Billing (The Growth)
*Goal: Match Stripe's billing complexity.*

### 3.1 Trial Periods & Proration
- **What**: Flexible billing cycles.
- **Spec**: Add `trial_days` to `ServicePlan`. Implement proration logic in `billing.py` for mid-cycle plan upgrades/downgrades.

### 3.2 Advanced Analytics (MRR/Churn)
- **What**: Financial insights for merchants.
- **Spec**: Implement MRR (Monthly Recurring Revenue), Churn Rate, and ARR (Annual Run Rate) calculations.

---

## 🏦 Phase 4: Operations & Compliance (The Scale)
*Goal: Automate business operations.*

### 4.1 Settlement & Payouts
- **What**: Move collected funds to merchant's bank/M-Pesa.
- **Spec**: Develop a "Payout Request" flow and a system to track "Account Balance" vs "Available for Payout."

### 4.2 Tax Engine (VAT)
- **What**: Automatically handle Kenyan tax laws.
- **Spec**: Toggle-able VAT (16%) calculation on invoices and checkout totals.

---

## 📝 Implementation Notes for Future Agents
- **Beanie / MongoDB**: Always use `alias` for camelCase compatibility with legacy data.
- **Middleware**: `CORSMiddleware` must always be the outermost layer. `IdempotencyMiddleware` is placed after security headers but before CORS.
- **Logging**: Use `logger.info` for critical production paths (Render defaults hide DEBUG).
- **JWT**: Use the dual-mode (Cookie for SPA, Header for API) defined in `dependencies.py`.
- **Rate Limiting**: Applied to critical endpoints like `/api/auth/login` and `/api/auth/signup` (60 requests/minute/IP).
- **Idempotency**: Middleware implemented, applied to `/api/gateway/initiate`.
- **Webhooks**: Signed with HMAC-SHA256 using per-webhook secrets. Secrets are auto-generated.
- **Customer Phone Validation**: Updated regex to `^254(1|7)\d{8}$` to support common Kenyan phone number formats.
