# FluxPay — Feature Request: Payment & Billing Core

## Purpose

This document defines requirements and specifications for implementing the core payment and billing functionality in FluxPay, including real M-Pesa STK-Push integration, shared virtual tills, automated reconciliation, retry logic, and reminders. It also outlines prerequisites before building, and the acceptance criteria for each feature.

---

## 1. Prerequisites & What We Must Get from Safaricom / Daraja

Before beginning development, ensure the following prerequisites are met:

- Obtain a **real Paybill number or Till (BuyGoods) shortcode** registered under a business or corporate entity. Consumer/personal numbers are not acceptable.  
- Complete Safaricom’s required **KYC/documentation**: company registration certificate (e.g. CR12), KRA PIN certificate, ID/passport copies of administrators, bank letter or cancelled cheque, etc.  
- Register the business account on the appropriate M-Pesa business/API portal (e.g. Org Portal / G2 portal), and ensure the Paybill/Till number is authorised for API use.  
- Generate Daraja API credentials linked to the Paybill/Till number: obtain **Consumer Key**, **Consumer Secret**, and **Passkey** (for Lipa Na M-Pesa Online / STK Push).  
- Ensure the backend callback URL is publicly accessible over HTTPS (not localhost only). For local development, tools like ngrok may be used; for production, host under a real domain with valid SSL/TLS.  
- Store all credentials (Consumer Key, Secret, Passkey) securely — never hardcode secrets in the source code. Use environment variables or a secure secrets management solution.

Only after all prerequisites are satisfied should the payment and billing core be implemented.

---

## 2. Features to Implement

### 2.1 Automated M-Pesa STK Push Payments

- Expose a backend API endpoint (e.g. `POST /api/payments/stk-push`) to initiate a payment.  
- Generate OAuth token with Daraja, then call Lipa Na M-Pesa STK Push API with required parameters: Shortcode, Passkey-derived password, amount, customer phone number, callback URL, account reference, transaction description.  
- Log every payment initiation in the database with unique internal ID, external CheckoutRequestID (or MerchantRequestID), merchant ID, customer phone, amount, invoice/subscription reference, status = `pending`.  
- Provide a webhook endpoint to receive Daraja callbacks (e.g. `/api/payments/callback`), parse the response payload, extract fields such as `ResultCode`, `MpesaReceiptNumber`, amount, phone number, transaction date.  
- On successful payment (ResultCode = 0): mark payment status `success`, persist receipt number and metadata. On failure or cancellation, mark accordingly.  
- Optionally implement fallback: if callback does not arrive within a defined timeout, use Daraja’s STK Push Query API to check status.

### 2.2 Shared Virtual Tills (For Freelancers & Small Merchants)

- Implement an internal “virtual-till” abstraction, allowing merchants without their own Paybill/Till to use a **shared real** Paybill/Till managed by FluxPay.  
- When initiating STK Push for a merchant using a virtual till: use the real shared Paybill/Till shortcode, but embed a structured `accountReference` or `transactionDesc` that uniquely identifies the FluxPay merchant, and the target customer or invoice. Example: `merchant_{merchantId}_inv_{invoiceId}`.  
- In the database, define models/entities to represent virtual till assignments, merchant-to-virtual-till mapping, and sub-transaction tracking.  
- Maintain a ledger or wallet structure per merchant: track `availableBalance`, `pendingBalance`, and transaction history. This enables withdrawals or settlement later.  
- Ensure strict data isolation: payments for one merchant must never be visible or accessible to another merchant.  

### 2.3 Auto-Reconciliation

- Upon receipt of callback (or status query), automatically match the payment to the corresponding internal record (invoice or subscription) using the unique reference (invoice ID / subscription ID / virtual-till + reference string).  
- Update invoice or subscription status to `paid`, and for subscription plans, compute and update the next billing date according to the subscription frequency.  
- Update the merchant’s wallet/ledger to reflect the credited amount.  
- Save full payment metadata: receipt number, amount, date, phone number, raw callback payload. This supports auditing, record-keeping, and dispute resolution.  
- Ensure idempotency: duplicate callbacks (or replays) must not cause double-crediting or double-processing.  
- Provide mechanisms (e.g. API endpoints or export tools) for merchants to retrieve transaction history, generate receipts (PDF or structured data), and produce exports for accounting or tax reporting.

### 2.4 Retry Logic & Automated Reminders

- Implement a retry policy for failed STK Push attempts (e.g. user cancels, network error, insufficient funds):  
  - Define configurable retry settings (merchant-specific or global defaults): number of retries, delay durations between retries (e.g. immediate, after minutes, after hours, next day).  
  - Use a reliable job scheduling / queue system (e.g. BullMQ + Redis, or a Cron + DB + TTL-based queue) to schedule retries rather than naive timeouts.  
- For recurring subscriptions: schedule automated billing (STK Push) at the appropriate time (e.g. every month).  
- Implement a reminder/notification system:  
  - Pre-billing reminders (e.g. 24 hours before next payment due), billing-day notifications, post-failure reminders.  
  - Notification channels: ideally WhatsApp or SMS; optionally email.  
  - Maintain a `notification_queue` (or similar) in the database to schedule and track reminder jobs; mark notifications as `sent` to avoid duplicates.  
  - Provide merchant-facing settings for reminders: how many reminders, when to send, when to stop, retry limits, etc.  
- If all retries fail (after reaching retry limit), mark subscription/invoice status as `unpaid` or `failed`, and optionally suspend further billing until manual intervention.

---

## 3. Acceptance Criteria (Definition of Done)

For each feature area, the following must be satisfied before merging to main branch / deploying to production:

### 3.1 STK Push Payments

- Triggering a payment via backend endpoint results in a real M-Pesa prompt to the customer’s phone.  
- After successful payment (customer enters PIN), the callback is received, payment is recorded in DB, status is updated to `success`, and correct metadata (receipt number, date, phone) is stored.  
- For failed payment or cancellation, status is updated appropriately (e.g. `failed`, with reason logged).  
- Optional: STK Push Query fallback returns correct status if callback is missing or delayed.  

### 3.2 Shared Virtual Tills

- Multiple merchants can onboard and use the same underlying Paybill/Till without interference.  
- Payments can be initiated for different merchants/customers, using correct `accountReference` mapping.  
- Upon callback, payments are correctly attributed to the right merchant and customer, recorded in their ledger.  
- Merchant wallets have correct balances; no cross-merchant data leakage.  

### 3.3 Auto-Reconciliation

- Every payment (successful or failed) is reconciled automatically.  
- Invoices or subscription records are updated correctly, including setting next billing date for recurring plans.  
- Transaction history is persisted, including raw callback data.  
- Duplicate callback or retry scenarios do not result in double-crediting or corrupted data.  
- Receipts (PDF or structured) can be generated/viewed for each payment.  

### 3.4 Retry & Reminder System

- Failed payments trigger retry attempts as per retry policy.  
- Reminders are sent as scheduled (pre-billing, on-billing, post-failure), using configured channels.  
- Retry limit is respected; after limit is reached, subscription/invoice is marked as failed/unpaid or suspended.  
- Merchant-configurable settings for retry and reminders are respected.  
- All retry and notification events are logged for audit.

---

## 4. Implementation & Architecture Recommendations

- Use a **job queue or scheduler** for retries and recurring billing (e.g. BullMQ + Redis, or cron + DB + TTL queue). Avoid naive `setTimeout` solutions.  
- Use a **wallet/ledger model** for virtual till accounting: track `pendingBalance`, `availableBalance`, and transaction entries.  
- Use **environment variables** for storing all sensitive credentials (Consumer Key, Consumer Secret, Passkey, callback URL).  
- Implement robust **logging and error handling**: log every payment initiation, callback, retry, failure, notification, ledger update.  
- Ensure **idempotency**: check for duplicate `CheckoutRequestID`, `MpesaReceiptNumber`, or duplicate callbacks before crediting.  
- Write **unit and integration tests** covering: successful payment, failed payment, retry flows, callback missing + status query, duplicate callback, subscription billing cycles, reminders scheduling, ledger operations.  
- Provide **documentation** (inside code and project docs) describing payment flow, virtual till logic, retry/reminder policy, and reconciliation rules — for future maintainers and auditing.

---

## 5. Milestones & Suggested Implementation Steps

1. Setup / verify Daraja credentials and sandbox environment; ensure callback URL is reachable.  
2. Implement basic STK Push integration (initiation + callback + DB logging).  
3. Implement virtual-till abstraction and ledger model; support payment initiation using shared Paybill/Till.  
4. Implement auto-reconciliation logic (invoice/subscription matching, wallet credit, receipt generation).  
5. Build retry logic + job scheduler; support configurable retry policy.  
6. Build reminder/notification scheduling & sending subsystem (SMS/WhatsApp/email).  
7. Add subscription billing scheduler (recurring payment) based on merchant settings.  
8. Add merchant UI (or configuration endpoints) for retry/reminder settings, wallet balance view, transaction history, export/reporting.  
9. Write comprehensive tests for all flows.  
10. Prepare documentation (this file plus inline docs) and audit logs.

---

## 6. Risks & Notes

- Using a **shared real Paybill/Till** for multiple merchants might raise compliance or Safaricom policy questions; ensure that using shared accounts with metadata-based identification is acceptable under Safaricom’s terms.  
- Callback delivery may be unreliable (delays, network issues, retries) — fallback (status query) must be robust.  
- Over-reliance on retries/reminders may lead to customer friction; ensure merchants control retry/reminder policies.  
- Logging and raw payload storage may accumulate large data — ensure proper cleanup or archiving if needed.  
- Wallet accounting must be precise and tamper-proof to avoid disputes (e.g. double credits, rounding issues, failed payments).

---

*End of file*
