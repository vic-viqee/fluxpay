# AGENT.md - Project Status Summary

This file reflects the validated codebase status.

## Working

- React + Vite frontend and Express + TypeScript backend are in place.
- Auth: signup/login, refresh-token flow, Google OAuth flow, forgot/reset password.
- Google callback now uses one-time auth code exchange (`POST /api/auth/google/exchange-code`) instead of token query params.
- M-Pesa STK push and callback handling are implemented.
- M-Pesa auth token cache expiry handling is fixed.
- Kenyan phone formatting/validation utilities are implemented.
- Public pricing checkout is implemented for non-auth users via `POST /api/payments/pricing-stk-push`.
- Pricing checkout phone input now enforces prefixes `2541` or `2547`, and STK requests use `FluxPay` as business name.
- Public pricing STK pushes are now persisted and reconciled in callback processing.
- Plans API is implemented (`POST/GET /api/plans`).
- Clients API is implemented (`POST/GET /api/clients`).
- Subscriptions CRUD is implemented (`/api/subscriptions`).
- Customers endpoint is implemented (`GET /api/customers`).
- Analytics endpoint is implemented (`GET /api/analytics`).
- Settings endpoints are implemented (`GET/PUT /api/settings`).
- Docs endpoint is implemented (`GET /api/docs`).
- Transactions and user profile endpoints are implemented.
- Logo upload works through backend upload middleware.
- Subscriptions page now uses the same valid creation flow as dashboard modal (`clientId` + `planId`).
- Global security headers + global rate limiter are active.
- Pricing checkout endpoint has per-IP and per-phone throttling.
- Production logger now writes to console (in addition to files), improving Render observability.
- Sync file deletes in auth flow were replaced with safe async cleanup.
- Simulated STK helper naming is clarified in frontend (`initiateSimulatedStkPushPayment`).

## Remaining / Known Issues

- Deployment on Render needs verification after the startup-hardening changes (build-on-start, OAuth strategy guard, safer uploads dir init, and crash handlers).
- `ERR_BLOCKED_BY_CLIENT` is typically extension-side (ad blocker/privacy extension), not a backend logic error.

## Completion Tracker

- [ ] 1. Backend deployment stability on Render (fixes implemented, pending deploy verification)
- [x] 2. Refresh-token auth flow
- [x] 3. Customers API
- [x] 4. Analytics API
- [x] 5. Settings API
- [x] 6. Docs API
- [x] 7. Public pricing STK persistence + callback reconciliation
- [x] 8. Production console logging hardening
- [x] 9. Async-safe uploaded file cleanup
- [x] 10. Frontend STK simulation naming/usage cleanup
