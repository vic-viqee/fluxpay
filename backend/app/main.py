from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database import init_db, close_db
from app.utils.logger import logger
from app.utils.uploads import resolve_uploads_dir

# Import routers statically
from app.routers import (
    auth, gateway_auth, payments, subscriptions, clients, plans,
    customers, transactions, users, settings as settings_router, analytics, apikeys,
    thirdparty, invoices, mpesa, disbursements, admin, gateway,
    public_checkout, docs
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await init_db()
        logger.info("Database connected")
    except Exception as e:
        logger.warning(f"Database not available: {e}")

    try:
        from app.tasks.scheduler import start_scheduler
        start_scheduler()
        logger.info("Scheduler started")
    except Exception as e:
        logger.warning(f"Scheduler not started: {e}")

    logger.info("FluxPay Python backend started")
    yield

    try:
        await close_db()
    except Exception as e:
        logger.warning(f"Error during shutdown: {e}")


settings = get_settings()

app = FastAPI(
    title="FluxPay API",
    description="M-Pesa payment and subscription platform API",
    version="2.0.0",
    lifespan=lifespan,
)

from app.middleware.request_log import RequestLoggingMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.parsed_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

uploads_dir = resolve_uploads_dir()
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

@app.get("/")
async def root():
    return {"message": "FluxPay API is running..."}

@app.get("/health")
async def health():
    import time
    return {"status": "healthy", "timestamp": time.time()}

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(gateway_auth.router, prefix="/api/gateway-auth", tags=["Gateway Auth"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(subscriptions.router, prefix="/api/subscriptions", tags=["Subscriptions"])
app.include_router(clients.router, prefix="/api/clients", tags=["Clients"])
app.include_router(plans.router, prefix="/api/plans", tags=["Plans"])
app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(settings_router.router, prefix="/api/settings", tags=["Settings"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(apikeys.router, prefix="/api/apikeys", tags=["API Keys"])
app.include_router(thirdparty.router, prefix="/api/v1", tags=["Third Party"])
app.include_router(invoices.router, prefix="/api/invoices", tags=["Invoices"])
app.include_router(mpesa.router, prefix="/api/mpesa", tags=["M-Pesa"])
app.include_router(disbursements.router, prefix="/api/disbursements", tags=["Disbursements"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(gateway.router, prefix="/api/gateway", tags=["Gateway"])
app.include_router(public_checkout.router, prefix="/api/pay", tags=["Public Checkout"])
app.include_router(docs.router, prefix="/api/docs", tags=["Docs"])
