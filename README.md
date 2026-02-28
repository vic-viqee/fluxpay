# FluxPay

M-Pesa payment and subscription platform for Kenyan businesses.

## Features

- **Analytics Dashboard**: Real-time revenue trends, transaction status distribution, and subscription health visualizations using Recharts.
- **Interactive Dashboard**: Manual data refresh, quick-action shortcuts, and a guided onboarding checklist for new users.
- **Robust UX**: Skeleton loaders for all tables to prevent layout shifts, and descriptive empty states with clear calls to action.
- **Mobile First**: Fully responsive sidebar and navigation optimized for all screen sizes.
- **M-Pesa Integration**: Automated STK push for collections and recurring billing.
- **Subscription Management**: Flexible service plans and automated recurring payment processing.
- **Secure Auth**: JWT-based session management with refresh tokens and Google OAuth 2.0.

## Stack

- Frontend: React (v18), Vite, TypeScript, Tailwind CSS, Recharts, Lucide React
- Backend: Node.js, Express, TypeScript, MongoDB (Mongoose)
- Task Scheduling: Node-cron for automated billing and reconciliation.

For detailed implementation/progress status, see `STATUS.md`.

## API Overview

All endpoints are under `/api`.

- Auth: `/auth/signup`, `/auth/login`, `/auth/refresh-token`, `/auth/google`, `/auth/google/callback`, `/auth/google/exchange-code`, `/auth/forgot-password`, `/auth/reset-password/:token`
- Payments: `/payments/stk-push`, `/payments/simulate-stk-push`, `/payments/pricing-stk-push`, `/payments/callback`
- Subscriptions: `POST/GET /subscriptions`, `GET/PUT/DELETE /subscriptions/:id`
- Plans: `POST/GET /plans`, `PUT/DELETE /plans/:id`
- Clients: `POST/GET /clients`
- Customers: `GET /customers`
- Analytics: `GET /analytics`
- Settings: `GET/PUT /settings`
- Docs: `GET /docs`
- Users: `GET /users/me`
- Transactions: `GET /transactions`

## Configuration

Create `backend/.env` with at least:

- `PORT`
- `JWT_SECRET`
- `MONGODB_URI`
- `CONSUMER_KEY`
- `CONSUMER_SECRET`
- `SHORTCODE`
- `PASSKEY`
- `CALLBACK_URL`

Optional:

- OAuth and email variables for Google auth and password reset workflows.

Set `frontend/.env` only if needed:

- `VITE_API_URL=http://localhost:3000/api`

## Local Development

1. Start MongoDB.
2. Start backend:
   - `cd backend`
   - `npm install`
   - `npm run dev`
3. Start frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

## Notes

- Public pricing checkout phone validation currently allows prefixes `2541` and `2547`.
- Signup now requires password confirmation, and backend enforces strong passwords (minimum 8 chars with uppercase, lowercase, number, and symbol).
- Backend upload handling now uses a unified resolved uploads directory for both write and static serving, and saved logo URLs are generated with robust base URL resolution for deployed environments.
- Dashboard includes a first-run setup checklist and improved empty-state actions for plan/subscription onboarding.
- For current risk items and deployment verification status, use `STATUS.md`.
