from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pathlib import Path

from app.config import get_settings
from app.database import init_db, close_db
from app.utils.logger import logger
from app.utils.uploads import resolve_uploads_dir


def create_rate_limit_handler():
    async def rate_limit_handler(request, exc):
        return JSONResponse(
            status_code=429,
            content={"message": str(exc)},
        )

    return rate_limit_handler


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Don't fail startup if DB unavailable - let endpoints handle it
    try:
        await init_db()
        logger.info("Database connected")
    except Exception as e:
        logger.warning(f"Database not available - running in limited mode: {e}")

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
        from app.tasks.scheduler import stop_scheduler

        stop_scheduler()
        logger.info("FluxPay Python backend shut down")
    except Exception as e:
        logger.warning(f"Error during shutdown: {e}")


settings = get_settings()

app = FastAPI(
    title="FluxPay API",
    description="M-Pesa payment and subscription platform API",
    version="2.0.0",
    lifespan=lifespan,
)

# Note: Rate limiting disabled temporarily for debugging
# from slowapi import Limiter
# from slowapi.util import get_remote_address
# from slowapi.errors import RateLimitExceeded
# limiter = Limiter(key_func=get_remote_address)
# app.state.limiter = limiter
# app.add_exception_handler(RateLimitExceeded, create_rate_limit_handler())

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.parsed_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Cookie",
        "X-API-Key",
        "X-API-Secret",
        "Accept",
        "Origin",
        "X-Idempotency-Key",
    ],
)

# Mount uploads
uploads_dir = resolve_uploads_dir()
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")


@app.get("/")
async def root():
    return {"message": "FluxPay API is running..."}


@app.get("/health")
async def health():
    import time

    return {
        "status": "healthy",
        "timestamp": time.time(),
    }


# Import all routers
try:
    from app.routers import (
        auth,
        gateway_auth,
        payments,
        subscriptions,
        clients,
        plans,
        customers,
    )
    from app.routers import (
        transactions,
        users,
        settings as user_settings,
        analytics,
        apikeys,
        thirdparty,
    )
    from app.routers import (
        invoices,
        mpesa,
        disbursements,
        admin,
        gateway,
        public_checkout,
        docs,
    )

    logger.info("All routers imported successfully")
except Exception as e:
    logger.error(f"Failed to import routers: {e}")
    # Import only what works
    from app.routers import gateway_auth

    auth = gateway_auth
    payments = gateway_auth
    subscriptions = gateway_auth
    clients = gateway_auth
    plans = gateway_auth
    customers = gateway_auth
    transactions = gateway_auth
    users = gateway_auth
    user_settings = gateway_auth
    analytics = gateway_auth
    apikeys = gateway_auth
    thirdparty = gateway_auth
    invoices = gateway_auth
    mpesa = gateway_auth
    disbursements = gateway_auth
    admin = gateway_auth
    public_checkout = gateway_auth
    docs = gateway_auth
from app.routers import (
    transactions,
    users,
    settings as user_settings,
    analytics,
    apikeys,
    thirdparty,
)
from app.routers import (
    invoices,
    mpesa,
    disbursements,
    admin,
    gateway,
    public_checkout,
    docs,
)

# Register all routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(
    gateway_auth.router, prefix="/api/gateway-auth", tags=["Gateway Auth"]
)
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(
    subscriptions.router, prefix="/api/subscriptions", tags=["Subscriptions"]
)
app.include_router(clients.router, prefix="/api/clients", tags=["Clients"])
app.include_router(plans.router, prefix="/api/plans", tags=["Plans"])
app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
app.include_router(
    transactions.router, prefix="/api/transactions", tags=["Transactions"]
)
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(user_settings.router, prefix="/api/settings", tags=["Settings"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(apikeys.router, prefix="/api/apikeys", tags=["API Keys"])
app.include_router(thirdparty.router, prefix="/api/v1", tags=["Third Party"])
app.include_router(invoices.router, prefix="/api/invoices", tags=["Invoices"])
app.include_router(mpesa.router, prefix="/api/mpesa", tags=["M-Pesa"])
app.include_router(
    disbursements.router, prefix="/api/disbursements", tags=["Disbursements"]
)
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(gateway.router, prefix="/api/gateway", tags=["Gateway"])
app.include_router(public_checkout.router, prefix="/api/pay", tags=["Public Checkout"])
app.include_router(docs.router, prefix="/api/docs", tags=["Docs"])
