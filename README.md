# FluxPay - M-Pesa Payment and Subscription Platform

## Project Overview

FluxPay is a full-stack web app for Kenyan businesses to manage clients, service plans, subscriptions, and M-Pesa collections.

- Frontend: React + Vite + TypeScript + Tailwind
- Backend: Node.js + Express + TypeScript + MongoDB (Mongoose)

## Implemented Features

### Frontend
- JWT-authenticated app flow (login/signup + protected routes).
- Dashboard with subscriptions and transactions tables.
- Service plan creation flow.
- Subscription creation flow using `AddSubscriptionModal` (creates client first, then creates subscription with `clientId` + `planId`).
- STK push simulation UI.
- Public pricing checkout flow for new users (Starter/Growth) with plan-based STK push.

### Backend
- Auth: signup, login, refresh-token flow, Google OAuth callback flow, forgot/reset password.
- M-Pesa: STK push initiation + callback handling.
- Phone validation/normalization for Kenyan M-Pesa numbers.
- Public pricing STK endpoint with strict phone prefix rule (`2541` or `2547`) and fixed business name `FluxPay`.
- Public pricing STK requests are persisted and reconciled via callback handling.
- CRUD for subscriptions.
- Service plan create/list endpoints.
- Client create/list endpoints.
- Customers analytics endpoint.
- Dashboard analytics endpoint.
- User settings get/update endpoints.
- API docs endpoint with route index.
- User profile endpoint (`/api/users/me`).
- Transactions list endpoint (`/api/transactions`).
- Logo upload middleware + static upload serving.
- Global API hardening with security headers and request rate limiting.
- Route-level anti-abuse throttling for pricing checkout endpoint (per-IP and per-phone).
- Production logger now outputs to console (Render-friendly) and file transports.

## Current API Surface

All endpoints are under `/api`.

- Auth: `/auth/signup`, `/auth/login`, `/auth/refresh-token`, `/auth/google`, `/auth/google/callback`, `/auth/forgot-password`, `/auth/reset-password/:token`
- Payments: `/payments/stk-push`, `/payments/simulate-stk-push`, `/payments/pricing-stk-push`, `/payments/callback`
- Subscriptions: `POST/GET /subscriptions`, `GET/PUT/DELETE /subscriptions/:id`
- Plans: `POST/GET /plans`
- Clients: `POST/GET /clients`
- Customers: `GET /customers`
- Analytics: `GET /analytics`
- Settings: `GET/PUT /settings`
- Docs: `GET /docs`
- Users: `GET /users/me`
- Transactions: `GET /transactions`

## Known Gaps / Remaining Work

- Deployment reliability on Render still needs verification, but startup hardening is now in place:
  - Backend `start` now builds before running (`npm run build && node dist/server.js`).
  - Google OAuth strategy is conditionally enabled only when credentials are set.
  - Uploads directory initialization now has safer fallback behavior.
  - Global uncaught/unhandled error logging handlers are registered.
  - JWT secret fallbacks are disabled in production (fail-fast on missing secrets).
  - Google callback no longer exposes access/refresh tokens in URL query; one-time code exchange is used instead.

## Recent Hardening Updates

- Fixed billing transaction creation flow to avoid duplicate unique `darajaRequestId` collisions.
- Corrected M-Pesa auth token cache expiry logic.
- Added one-time Google auth code exchange endpoint (`POST /api/auth/google/exchange-code`).
- Added global rate limiter + security headers middleware.
- Added pricing checkout route throttles.
- Added dedicated model for public checkout transactions and callback reconciliation.
- Replaced sync file cleanup (`unlinkSync`) with safe async cleanup in auth flow.
- Clarified frontend API naming for simulated STK push (`initiateSimulatedStkPushPayment`).

## Environment Variables (Backend)

Create `backend/.env` with at least:

- `PORT`
- `JWT_SECRET`
- `MONGODB_URI`
- `CONSUMER_KEY`
- `CONSUMER_SECRET`
- `SHORTCODE`
- `PASSKEY`
- `CALLBACK_URL`
- Optional OAuth/email settings used by auth/password-reset flows.

## Local Run

1. Start MongoDB.
2. Backend:
   - `cd backend`
   - `npm install`
   - `npm run dev`
3. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

Set `frontend/.env` only if needed:

- `VITE_API_URL=http://localhost:3000/api`
