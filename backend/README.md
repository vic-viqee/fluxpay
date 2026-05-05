# FluxPay Backend

This is the FluxPay backend built with FastAPI.

## Overview

The Python backend provides:
- **FastAPI** framework for high-performance async API endpoints
- **Beanie ODM** for MongoDB with Pydantic models
- **Complete feature parity** with the original Node.js backend
- **MongoDB integration** using the same database (no migration needed)
- **Modern Python practices** with type hints and async/await

## Architecture

### Core Components

1. **Models** (`app/models/`) - 16 Beanie document models mirroring the original Mongoose schemas:
   - User, Transaction, Subscription, ServicePlan, Client
   - ApiKey, AuditLog, Invoice, Webhook
   - GatewayTransaction, GatewayCustomer, PaymentLink
   - Reversal, PublicCheckoutButton, PublicCheckoutTransaction
   - C2BTransaction

2. **Services** (`app/services/`) - Business logic layer:
   - M-Pesa service (STK push, B2C, C2B, reversals, balance queries)
   - Billing service (automated payment processing, retry logic)
   - Email service (password reset, payment notifications)
   - Webhook service (outgoing webhook delivery with retry logic)
   - Transaction limit service
   - Audit service
   - Invoice service
   - Disbursement service

3. **Utilities** (`app/utils/`) - Helper functions:
   - Phone number formatting and validation
   - Billing cycle calculations
   - Tax/VAT calculations
   - Password hashing and validation
   - JWT token generation and validation
   - Logging configuration
   - File upload handling

4. **API Routes** (`app/routers/`) - Complete REST API coverage:
   - Auth: Registration, login, password reset, Google OAuth
   - Gateway Auth: Gateway-specific authentication
   - Payments: STK push, simulation, pricing payments
   - Subscriptions: CRUD operations for subscriptions
   - Clients: Customer management
   - Plans: Service plan management
   - Transactions: Payment history and statistics
   - Users: Profile management
   - Settings: User preferences
   - Analytics: Business metrics and reporting
   - API Keys: Third-party access management
   - Thirdparty: Simplified endpoints for integrations
   - Invoices: Invoice generation and management
   - M-Pesa: Direct M-Pesa API access
   - Disbursements: B2C payouts
   - Admin: Administrative functions (protected)
   - Gateway: Full payment gateway functionality
   - Public Checkout: Public payment buttons and links
   - Docs: API documentation endpoint

5. **Middleware** (`app/middleware/`):
   - Request logging
   - Security headers
   - CORS configuration
   - Rate limiting
   - Authentication dependencies

6. **Scheduled Tasks** (`app/tasks/`) - APScheduler for:
   - Automated payment processing (daily)
   - Failed transaction retries
   - Other periodic maintenance tasks

7. **Email Templates** (`app/emails/`) - Jinja2 HTML templates:
   - Password reset
   - Payment failure notifications
   - Subscription suspended notices
   - Payment success confirmations

## Key Features Implemented

✅ **Authentication System**:
- Email/password registration with strong password requirements
- JWT access/refresh token mechanism with httpOnly cookies
- Google OAuth flow (same as original)
- Password reset with secure token handling
- Auto-login after registration

✅ **Payment Processing**:
- M-Pesa STK push initiation
- M-Pesa callback handling
- Payment links with expiration and usage limits
- Public checkout buttons
- Transaction tracking and status updates
- Reversal initiation

✅ **Subscription Billing**:
- Recurring payment automation
- Flexible billing frequencies (daily, weekly, monthly, etc.)
- Automatic retry logic for failed payments
- Subscription lifecycle management (activation, pausing, cancellation)
- Payment failure tracking and suspension after 3 failures

✅ **Business Features**:
- Customer management
- Service plan creation and management
- Invoice generation with VAT calculations
- API key management for third-party integrations
- Webhook system for real-time notifications
- Comprehensive analytics and reporting
- Audit trail for administrative actions

✅ **Infrastructure**:
- Docker containerization
- Environment-based configuration
- Connection pooling and caching (M-Pesa auth tokens)
- File upload handling with local storage
- Error handling and validation
- Health check endpoints

## Database Models

All 16 original MongoDB models have been recreated as Beanie documents with:
- Identical field names and types
- Same validation rules and constraints
- Equivalent indexes for performance
- Same relationships between entities
- Automatic timestamps (createdAt/updatedAt)

## API Compatibility

The Python backend maintains **exact API compatibility** with the original Node.js backend:
- Same endpoint paths and HTTP methods
- Same request/response structures
- Same status codes and error messages
- Same authentication mechanisms (cookies and headers)
- Same parameter names and validation rules

This means the existing frontend will work without modification when pointed to the Python backend.

## Getting Started

### Prerequisites

- Python 3.12+
- MongoDB instance (v4.4+)
- M-Pesa Daraja credentials (for sandbox or production)
- Email service credentials (SMTP)
- Optional: Cloudinary credentials for file uploads

### Local Development

1. **Clone the repository** (assuming you already have it)
2. **Navigate to the backend**:
   ```bash
   cd /home/viqee/Documents/projects/fluxpay/backend
   ```
3. **Create and activate virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # venv\Scripts\activate     # Windows
   ```
4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
5. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
6. **Start MongoDB** (if not already running):
   ```bash
   # Using Docker (recommended):
   docker run -d -p 27017:27017 --name mongodb mongo:5.0
   ```
7. **Run the application**:
   ```bash
   python run.py
   ```
   Or for development with auto-reload:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Docker Deployment

The backend is ready for Docker deployment:
```bash
docker-compose up -d backend-python
```

### Testing

Run the test suite:
```bash
pytest
```

### API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

See `.env.example` for all required configuration. Key sections include:

- **MongoDB**: Connection URI and database name
- **CORS**: Allowed origins for frontend communication
- **JWT**: Secret keys and expiration times
- **Google OAuth**: Client credentials and redirect URI
- **Email**: SMTP configuration for notifications
- **M-Pesa**: Daraja API credentials and endpoints
- **Cloudinary**: Optional file upload service
- **URLs**: Backend and frontend URLs for links

## Migration Strategy

Since both backends can connect to the same MongoDB database:
1. Run both backends simultaneously during transition
2. Point frontend to either backend via `VITE_API_URL` environment variable
3. Validate functionality and performance
4. Switch traffic completely to Python backend
5. Eventually retire the Node.js backend

## Performance Benefits

The Python/FastAPI implementation offers:
- **Higher concurrency** with async/await throughout
- **Better resource utilization** than Node.js for CPU-intensive tasks
- **Type safety** with Pydantic v2 models reducing runtime errors
- **Faster startup times** and lower memory footprint
- **Modern Python ecosystem** with excellent library support

## Testing Coverage

The implementation includes:
- Unit tests for all services and utilities
- Integration tests for API endpoints
- Authentication flow testing
- Payment processing simulations
- Webhook delivery testing
- Scheduled task validation

## Future Enhancements

Planned improvements for the Python backend:
1. **Redis-backed caching** for M-Pesa tokens and session data
2. **Background task queue** (Celery/RQ) for heavy operations
3. **Advanced analytics** with data warehouse integration
4. **Machine learning** for fraud detection and optimization
5. **GraphQL API** alongside REST for flexible data fetching
6. **WebSocket support** for real-time dashboard updates
7. **Enhanced monitoring** with Prometheus/Grafana integration
8. **CI/CD pipeline** with automated testing and deployment

---

**Ready for production use** - This Python backend provides a modern, maintainable, and high-performance foundation for the FluxPay platform while maintaining complete backward compatibility with existing integrations and frontend applications.