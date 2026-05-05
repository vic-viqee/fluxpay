# FluxPay

FluxPay is a specialized M-Pesa payment and subscription platform designed specifically for Kenyan businesses. It provides a robust, developer-friendly way to integrate M-Pesa collections into your application while managing recurring billing and customer subscriptions automatically.

## Live Demo

- **Frontend**: [https://fluxpay-frontend.onrender.com](https://fluxpay-frontend.onrender.com)
- **Backend API**: https://fluxpay-backend.onrender.com/api
- **API Documentation**: https://fluxpay-backend.onrender.com/docs

## What FluxPay Does

FluxPay bridges the gap between M-Pesa's APIs and your business needs. It handles:
- **Automated Collections**: Simple STK Push integration for instant payments
- **Subscription Management**: Automated recurring billing for service plans
- **Business Analytics**: Comprehensive insights into revenue, customer health, and transaction trends
- **Customer Portals**: Pre-built checkout and management interfaces for your customers
- **Email Support**: Integrated email notifications for password resets and system updates

## Key Features

- **Two Products in One**: FluxPay offers both subscription billing AND payment gateway services
- **Gateway Portal** (`/gateway`): Standalone payment portal for Retail/POS and E-commerce businesses
- **Admin Dashboard**: Full-featured admin panel with dark theme, tabs for overview, businesses, transactions, subscriptions, API keys, webhooks, plan limits, and audit trail
- **Analytics Dashboard**: Real-time revenue trends, transaction status distribution, and subscription health visualizations
- **Data Export**: CSV export for transactions and customer lists
- **Streamlined Onboarding**: Auto-login after signup and frictionless registration
- **Enhanced Security**: JWT-based session management with refresh tokens and httpOnly cookies
- **M-Pesa Integration**: Automated STK push for collections and recurring billing

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Recharts |
| Backend | Python, FastAPI, MongoDB (Beanie ODM) |
| Database | MongoDB |
| Email | Brevo (production) / Mailhog (local) |
| Deployment | Docker, Render |

## Local Development

### Prerequisites

- Python 3.12+
- Node.js 18+
- Docker and Docker Compose
- M-Pesa Developer Account (for production credentials)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/vic-viqee/fluxpay.git
   cd fluxpay
   ```

2. **Start infrastructure (MongoDB + Mailhog)**
   ```bash
   docker-compose up -d mongo mailhog
   ```

3. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # venv\Scripts\activate   # Windows
   
   pip install -r requirements.txt
   cp .env.example .env
   ```

4. **Configure `.env` file**
   
   The essential variables to set:
   ```env
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/fluxpay
   
   # JWT Secrets (generate your own in production)
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
   
   # URLs
   BACKEND_URL=http://localhost:8000
   FRONTEND_URL=http://localhost:5173
   
   # CORS
   ALLOWED_ORIGINS=http://localhost:5173
   
   # Google OAuth (optional - enables real Google login)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
   
   # Email (for local testing use Mailhog)
   EMAIL_HOST=localhost
   EMAIL_PORT=1025
   EMAIL_SECURE=false
   EMAIL_FROM=no-reply@fluxpay.com
   
   # M-Pesa (get from https://developer.safaricom.co.ke/)
   MPESA_CONSUMER_KEY=your_consumer_key
   MPESA_CONSUMER_SECRET=your_consumer_secret
   MPESA_SHORTCODE=your_shortcode
   MPESA_PASSKEY=your_passkey
   ```

5. **Run the Backend**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

   Or use the provided script:
   ```bash
   python run.py
   ```

6. **Frontend Setup** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Mailhog (email testing): http://localhost:8025

### Testing Google OAuth Locally

To enable real Google login:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials with redirect URI: `http://localhost:8000/api/auth/google/callback`
3. Add credentials to `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```
4. Restart the backend

## Docker Development

Run everything with Docker:

```bash
docker-compose up -d
```

This starts:
- MongoDB on port 27017
- Mailhog on ports 1025 (SMTP) and 8025 (Web UI)
- Backend on port 8000
- Frontend on port 5173

## API Overview

All endpoints are under `/api`.

| Category | Endpoints |
|----------|------------|
| **Auth** | `/auth/signup`, `/auth/login`, `/auth/refresh-token`, `/auth/google`, `/auth/forgot-password`, `/auth/reset-password/:token`, `/auth/change-password` |
| **Gateway Auth** | `/gateway-auth/signup`, `/gateway-auth/login`, `/gateway-auth/forgot-password`, `/gateway-auth/reset-password/:token` |
| **Payments** | `/payments/stk-push`, `/payments/simulate-stk-push`, `/payments/callback` |
| **Gateway** | `/gateway/initiate`, `/gateway/transactions`, `/gateway/customers`, `/gateway/payment-links`, `/gateway/callback` |
| **Subscriptions** | `POST/GET /subscriptions`, `GET/PUT/DELETE /subscriptions/:id` |
| **Plans** | `POST/GET /plans`, `PUT/DELETE /plans/:id` |
| **Clients** | `POST/GET /clients`, `PUT/DELETE /clients/:id` |
| **Transactions** | `GET /transactions` |
| **Analytics** | `GET /analytics` |
| **API Keys** | `POST/GET /apikeys`, `PATCH /apikeys/:id/revoke`, `DELETE /apikeys/:id` |
| **Admin** | `/admin/overview`, `/admin/businesses`, `/admin/transactions`, `/admin/subscriptions`, `/admin/apikeys`, `/admin/webhooks`, `/admin/plan-limits`, `/admin/audit-logs` |

## Gateway Portal

The Gateway Portal is for businesses using FluxPay as a payment processor:

- **URL**: `/gateway`
- **Signup**: `/gateway/signup`
- **Login**: `/gateway/login`

Features:
- Dynamic Till (QR code + Till display)
- Payment Links
- Transaction History with CSV export
- Customer Management
- API Keys for integration
- Webhooks for real-time notifications

## Security Notes

- Signup enforces strong passwords (minimum 8 chars with uppercase, lowercase, number, and symbol)
- JWT access tokens expire in 1 hour, refresh tokens in 7 days
- Tokens are stored in httpOnly cookies for XSS protection
- Password reset uses secure hashed tokens

## Deployment

### Render (Recommended)

1. Push code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set environment variables from your `.env` file
5. Deploy!

The backend will automatically use the Google OAuth credentials stored in Render's environment.

## Project Structure

```
fluxpay/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── models/    # MongoDB models (Beanie)
│   │   ├── routers/   # API endpoints
│   │   ├── services/  # Business logic
│   │   ├── utils/     # Helper functions
│   │   └── middleware/# Middleware
│   ├── Dockerfile
│   ├── requirements.txt
│   └── run.py
├── frontend/          # React frontend
│   ├── src/
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```