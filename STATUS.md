# STATUS.md - Project Status Summary

Last updated: 2026-02-26

This file is the canonical implementation and verification status for FluxPay.

## Implemented in Code

- React + Vite frontend and Express + TypeScript backend are in place.
- Auth: signup/login, refresh-token flow, Google OAuth flow, forgot/reset password.
- Google callback uses one-time auth code exchange (`POST /api/auth/google/exchange-code`) instead of token query params.
- M-Pesa STK push and callback handling are implemented.
- M-Pesa auth token cache expiry handling is fixed.
- Kenyan phone formatting/validation utilities are implemented.
- Public pricing checkout is implemented for non-auth users via `POST /api/payments/pricing-stk-push`.
- Pricing checkout phone input enforces prefixes `2541` or `2547`, and STK requests use `FluxPay` as business name.
- Public pricing STK pushes are persisted and reconciled in callback processing.
- Plans API is implemented (`POST/GET /api/plans`).
- Clients API is implemented (`POST/GET /api/clients`).
- Subscriptions CRUD is implemented (`/api/subscriptions`).
- Customers endpoint is implemented (`GET /api/customers`).
- Analytics endpoint is implemented (`GET /api/analytics`).
- Settings endpoints are implemented (`GET/PUT /api/settings`).
- Docs endpoint is implemented (`GET /api/docs`).
- Transactions and user profile endpoints are implemented.
- Logo upload works through backend upload middleware.
- Subscriptions page uses valid creation flow (`clientId` + `planId`) consistent with dashboard modal.
- Global security headers and global rate limiter are active.
- Pricing checkout endpoint has per-IP and per-phone throttling.
- Production logger writes to console and files, improving Render observability.
- Sync file deletes in auth flow were replaced with safe async cleanup.
- Simulated STK helper naming is clarified in frontend (`initiateSimulatedStkPushPayment`).

## Verified

- Core auth and API surface were validated in local development.
- Backend startup hardening changes were implemented and reviewed:
  - Build-on-start for production start command.
  - Conditional OAuth strategy enablement when credentials are present.
  - Safer uploads directory initialization fallback behavior.
  - Global uncaught/unhandled error logging handlers.
  - Production fail-fast when required JWT secret is missing.

## Pending Verification

- Render deployment reliability after hardening changes.

## Known Issues / Notes

- `ERR_BLOCKED_BY_CLIENT` is typically extension-side (ad blocker/privacy extension), not backend logic.

## Completion Tracker

- [ ] 1. Backend deployment stability on Render (implemented, pending deploy verification)
- [x] 2. Refresh-token auth flow
- [x] 3. Customers API
- [x] 4. Analytics API
- [x] 5. Settings API
- [x] 6. Docs API
- [x] 7. Public pricing STK persistence and callback reconciliation
- [x] 8. Production console logging hardening
- [x] 9. Async-safe uploaded file cleanup
- [x] 10. Frontend STK simulation naming and usage cleanup
