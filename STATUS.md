# STATUS.md - Project Status Summary

Last updated: 2026-02-28

This file is the canonical implementation and verification status for FluxPay.

## Implemented in Code

- React + Vite frontend and Express + TypeScript backend are in place.
- Auth: signup/login, refresh-token flow, Google OAuth flow, forgot/reset password.
- Signup password hardening is active:
  - Frontend requires password + confirm password before continuing.
  - Frontend enforces strong-password requirements in step validation.
  - Backend rejects weak passwords at API level.
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
- Dashboard/subscriptions create-subscription UX was fixed:
  - Duplicate/non-functional empty-state create button path removed from dashboard context.
  - Subscriptions empty-state create button now opens the modal correctly.
  - Modal supports inline quick creation of a service plan when no plans exist.
  - Modal includes a shortcut to `/plans` (`Go to Plans`) for full plan management.
  - Existing-client (409) flow now resolves by reusing the existing client by phone.
  - Phone validation in subscription modal accepts `2541` and `2547` prefixes.
- Global security headers and global rate limiter are active.
- Pricing checkout endpoint has per-IP and per-phone throttling.
- Production logger writes to console and files, improving Render observability.
- Sync file deletes in auth flow were replaced with safe async cleanup.
- Simulated STK helper naming is clarified in frontend (`initiateSimulatedStkPushPayment`).
- Google OAuth hardening was implemented:
  - Server-signed registration tickets replace query-param profile handoff.
  - OAuth `state` is validated on callback.
  - Final Google registration no longer trusts client-supplied `googleId`/`email`.
  - One-time registration-ticket consumption is enforced.
- New-user logo upload visibility fix was implemented:
  - Upload destination and static serving now use the same resolved uploads directory.
  - `logoUrl` generation now prefers explicit `BACKEND_URL` and falls back to request-derived base URL (`protocol://host`), preventing bad localhost URLs in production.
  - This resolves dashboard logo display for newly registered users with uploaded logos.
- End-to-end UX stabilization pass (signup/login -> dashboard -> plans -> subscriptions) was completed:
  - Dashboard now reads user state from `AuthContext` (single source of truth), removing duplicate `MainLayout` fetch/desync risk.
  - Corrupted dashboard/subscription copy rendering was cleaned up (broken character encoding removed).
  - Subscription table now handles deleted/missing plans gracefully instead of crashing on `planId.name`.
  - Plan deletion now blocks when subscriptions still reference that plan, with a clear API error (`409`).
  - Google auth CTA links in login/signup are now environment-driven from frontend API base URL (no hardcoded Render host).
- New-user first-run onboarding UX pass was completed:
  - Dashboard now shows a setup checklist with direct actions for initial plan creation and first subscription creation.
  - Dashboard subscriptions table empty-state CTA now opens the create-subscription modal directly.
  - Create-subscription modal now prevents selecting `Existing Client` when no clients exist and explains what to do.
  - Inline quick-plan creation now shows positive confirmation before continuing subscription creation.
  - Removed outdated signup copy claiming logo upload was not implemented.
- Frontend UX & Analytics Visualizations pass was completed:
  - Analytics Dashboard: Fully implemented with Recharts, featuring Revenue Trends (Area Chart), Transaction Status (Pie Chart), and Subscription Health (Bar Chart).
  - Interactive Dashboard: Added manual data refresh with rotation animations, quick-action shortcuts (Add Customer, New Plan, Business Settings), and improved stat cards.
  - Loading & Empty States: Implemented pulsed skeleton loaders for `SubscriptionsTable` and `TransactionsTable` to eliminate layout shifts. Enhanced empty states with `lucide-react` icons and clear CTA buttons.
  - Mobile Responsiveness: Updated Sidebar with navigation icons and a responsive overlay. Refined `DashboardNavbar` with a glassmorphism effect, sticky positioning, and dynamic page titles.
- **Customer-First Focus & Onboarding UX pass was completed**:
  - **Business Success Center**: Replaced developer-centric documentation with a practical guide for Kenyan entrepreneurs.
  - **Simplified Landing Page**: Removed "Developer API" focus and emphasized "Simplified Collections" and "Business Insights."
  - **Frictionless Signup**: Implemented **Auto-Login** after email registration, redirecting users directly to the dashboard.
  - **Enhanced Backend Security**: Implemented **SHA-256 hashing for password reset tokens** in the database.
  - **Password Management**: Added a secure **Change Password** feature in the Settings page with a modern, tabbed interface.
  - **UI/UX Cleanup**: Refined Navbar and Footer to point to business resources ("How it Works", "Success Center") and removed technical jargon.
  - **Deployment Fixes**: Resolved TypeScript errors blocking Render builds (unused `isSubmitting` in Signup, incorrect argument count for `authLogin`, and corrected `authMiddleware` import in auth routes).

## Verified

- Core auth and API surface were validated in local development.
- Frontend subscription flow changes are type-checked (`npx tsc --noEmit`).
- Auth hardening updates are type-checked in backend and frontend (`npx tsc --noEmit`).
- Signup password-confirmation and strong-password enforcement changes are type-checked in backend and frontend (`npx tsc --noEmit`).
- Logo upload path/base-url fix is type-checked in backend (`npx tsc --noEmit`).
- End-to-end UX pass changes are type-checked in backend and frontend (`npx tsc --noEmit`).
- New-user first-run onboarding UX pass is type-checked in backend and frontend (`npx tsc --noEmit`).
- Frontend UX & Analytics Visualizations are type-checked and visually verified in local development.
- Reset token hashing and auto-login logic were reviewed and type-checked.
- Change-password feature was reviewed and type-checked.
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

## Improvement Backlog

- [x] 1. Hash password reset tokens in DB instead of storing raw tokens.
- [ ] 2. Move OAuth state/code/registration-ticket replay tracking from in-memory `Map` to shared storage for multi-instance reliability.
- [ ] 3. Unify upload write path and static serve path so fallback temp-dir mode still serves uploaded logos reliably.
- [x] 4. Implement frontend refresh-token handling (token rotation/retry flow) so sessions survive access-token expiry.
- [ ] 5. Remove legacy `token` query-param fallback in Google callback page; keep code-exchange-only flow.
- [x] 6. Replace hardcoded Google auth backend URLs in frontend with environment-driven API base.
- [ ] 7. Add stricter auth-specific rate limits (login/forgot/reset/google exchange) beyond global limiter.
- [ ] 8. Strengthen security headers with CSP and HSTS (in production).
- [ ] 9. Add working ESLint configuration so `npm run lint` becomes an actual quality gate.
- [ ] 10. Update `/api/docs` endpoint list to include latest auth endpoints and flow changes.
- [ ] 11. Fix `.env.example` drift (`JWT_REFRESH_SECRET`, and `VITE_API_URL` with `/api` path).
- [ ] 12. Add automated tests for critical flows (auth, subscriptions, payment callbacks, and key regressions).

## Active Implementation Checklist

- [x] 1. Plan creation and management (create/list/edit/delete) in app UI and API support
- [x] 2. Subscription creation flow improvements (existing client selection + robust create path)
- [x] 3. Feature availability logic cleanup (remove time/payment-based nav gating)
- [x] 4. Real settings/profile page with editable business profile and dark/light mode toggle
- [x] 5. Session/auth behavior hardening (refresh-token storage and automatic access-token refresh)

## Future Plans (Dashboard/User Flow)

- [x] 1. Auto-login immediately after successful email signup (skip forced login step)
- [x] 2. Guided first-time onboarding checklist on dashboard (plan -> client -> subscription -> payment)
- [x] 3. Context-aware primary CTA on dashboard based on onboarding stage
- [ ] 4. Separate production payment flow and clearly isolated test/simulated payment UI
- [ ] 5. Expand settings/security with password-change flow and broader account controls

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
- [x] 11. Subscription creation UX and no-plan fallback flow hardening (dashboard/subscriptions/modal)
- [x] 12. OAuth security handshake hardening (signed ticket + state validation + trusted registration context)
- [x] 13. Signup password confirmation and strong-password policy enforcement (frontend + backend)
- [x] 14. New-user logo upload/dashboard visibility fix (upload path + logo URL base hardening)
- [x] 15. New-user first-run onboarding UX hardening (checklist + empty-state/create flow improvements)
- [x] 16. Customer-first focus & Onboarding UX pass (Success center, landing page pivot, auto-login, hashed tokens, password management)
