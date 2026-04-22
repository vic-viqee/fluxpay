# FluxPay

FluxPay is a specialized M-Pesa payment and subscription platform designed specifically for Kenyan businesses. It provides a robust, developer-friendly way to integrate M-Pesa collections into your application while managing recurring billing and customer subscriptions automatically.

## What FluxPay Does

FluxPay bridges the gap between M-Pesa's APIs and your business needs. It handles:
- **Automated Collections**: Simple STK Push integration for instant payments.
- **Subscription Management**: Automated recurring billing for service plans.
- **Business Analytics**: Comprehensive insights into revenue, customer health, and transaction trends.
- **Customer Portals**: Pre-built checkout and management interfaces for your customers.
- **Email Support**: Integrated email notifications (via Brevo) for password resets and system updates, with local testing via Mailhog.

## Key Features

- **Two Products in One**: FluxPay offers both subscription billing AND payment gateway services
- **Gateway Portal** (`/gateway`): Standalone payment portal for Retail/POS and E-commerce businesses
- **Admin Dashboard**: Full-featured admin panel with dark theme, tabs for overview, businesses, transactions, subscriptions, API keys, webhooks, plan limits, and audit trail.
- **Business Success Center**: Comprehensive guides on automating M-Pesa collections and scaling Kenyan businesses.
- **Analytics Dashboard**: Real-time revenue trends, transaction status distribution, and subscription health visualizations using Recharts.
- **Interactive Dashboard**: Manual data refresh, quick-action shortcuts, and a guided onboarding checklist for new users.
- **Data Export & Reporting**: One-click **CSV Export** for both Transactions and Customer lists, perfect for accounting and KRA returns.
- **Streamlined Onboarding**: Auto-login after signup and a frictionless, business-focused registration flow.
- **Enhanced Security**: Hashed password reset tokens, protected password change flow, JWT-based session management with refresh tokens, and httpOnly cookies.
- **Email Support**: Password reset and notification emails using Brevo (Production) and Mailhog (Local).
- **M-Pesa Integration**: Automated STK push for collections and recurring billing.
- **Subscription Management**: Flexible service plans and automated recurring payment processing.
- **Mobile First**: Fully responsive sidebar and navigation optimized for all screen sizes.

## Gateway Portal

The Gateway Portal is a separate portal for businesses that want to use FluxPay as a payment processor (not subscription billing).

### Gateway Features
- **Dynamic Till**: Enter amount → QR code + Till display for in-person payments
- **Payment Links**: Generate shareable payment links for customers
- **Transaction History**: Filter by date, status, amount with CSV export
- **Customer Management**: Track payers and contact info
- **Receipts**: Generate and print payment receipts
- **API Keys**: For e-commerce integration
- **Webhooks**: Real-time payment notifications

### Gateway Access
- **URL**: `/gateway`
- **Signup**: `/gateway/signup`
- **Login**: `/gateway/login`

### Payment Flows
| Flow | Use Case |
|------|---------|
| Dynamic Till | Retail/POS - merchant enters amount, customer scans QR |
| Payment Links | Shareable links for one-time payments |
| E-commerce Redirect | Online checkout → FluxPay → Return to store |

## Tech Stack

- **Frontend**: React (v18), Vite, TypeScript, Tailwind CSS, Recharts, Lucide React
- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose)
- **Email**: Nodemailer (Brevo/Mailhog)
- **Infrastructure**: Docker for local development (MongoDB, Mailhog)
- **Task Scheduling**: Node-cron for automated billing and reconciliation.

## Local Development & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Docker](https://www.docker.com/) and Docker Compose
- [M-Pesa Developer Account](https://developer.safaricom.co.ke/) (for credentials)

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/fluxpay.git
cd fluxpay
```

### Step 2: Start Infrastructure (Docker)
This will start MongoDB (database) and Mailhog (local email testing).
```bash
docker-compose up -d
```
- MongoDB: `localhost:27017`
- Mailhog UI: `http://localhost:8025`
- Mailhog SMTP: `localhost:1025`

### Step 3: Backend Configuration
```bash
cd backend
npm install
cp .env.example .env
```
Update `backend/.env` with your credentials. For local email testing, use:
```env
EMAIL_HOST=localhost
EMAIL_PORT=1025
EMAIL_SECURE=false
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=no-reply@fluxpay.com
```

### Step 4: Frontend Configuration
```bash
cd ../frontend
npm install
# VITE_API_URL should point to your backend (default: http://localhost:3000/api)
```

### Step 5: Run the Application
Start both backend and frontend in separate terminals.

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## API Overview

All endpoints are under `/api`.

- **Auth**: `/auth/signup`, `/auth/login`, `/auth/refresh-token`, `/auth/google`, `/auth/forgot-password`, `/auth/reset-password/:token`
- **Payments**: `/payments/stk-push`, `/payments/simulate-stk-push`, `/payments/callback`
- **Subscriptions**: `POST/GET /subscriptions`, `GET/PUT/DELETE /subscriptions/:id`
- **Plans**: `POST/GET /plans`, `PUT/DELETE /plans/:id`
- **Analytics**: `GET /analytics`
- **Transactions**: `GET /transactions`
- **Admin**: `/admin/overview`, `/admin/businesses`, `/admin/transactions`, `/admin/subscriptions`, `/admin/apikeys`, `/admin/webhooks`, `/admin/plan-limits`, `/admin/audit-logs` (admin only)

## Notes

- **Phone Validation**: Public pricing checkout phone validation currently allows prefixes `2541` and `2547`.
- **Security**: Signup requires password confirmation, and backend enforces strong passwords (minimum 8 chars with uppercase, lowercase, number, and symbol).
- **Email Support**: Local testing is handled via Mailhog. Emails sent will appear in the Mailhog Web UI at `http://localhost:8025`.

For detailed implementation/progress status, see `STATUS.md`.
