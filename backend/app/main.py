from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse
from pathlib import Path

from app.config import get_settings
from app.database import init_db, close_db
from app.middleware.request_log import RequestLoggingMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.tasks.scheduler import start_scheduler, stop_scheduler
from app.utils.logger import logger
from app.utils.uploads import resolve_uploads_dir


def create_rate_limit_handler(limiter: Limiter):
    async def rate_limit_handler(request, exc):
        return JSONResponse(
            status_code=429,
            content={"message": str(exc)},
        )

    return rate_limit_handler


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    start_scheduler()
    logger.info("FluxPay Python backend started")
    yield
    await close_db()
    stop_scheduler()
    logger.info("FluxPay Python backend shut down")


settings = get_settings()

app = FastAPI(
    title="FluxPay API",
    description="M-Pesa payment and subscription platform API",
    version="2.0.0",
    lifespan=lifespan,
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, create_rate_limit_handler(limiter))

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(IdempotencyMiddleware) # Add idempotency middleware

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
        "X-Idempotency-Key", # Add idempotency key to allowed headers
    ],
)

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
        "uptime": time.process_time(),
    }


from app.routers import (
    auth,
    gateway_auth,
    payments,
    subscriptions,
    clients,
    plans,
    customers,
)
from app.routers import transactions, users, settings, analytics, apikeys, thirdparty
from app.routers import (
    invoices,
    mpesa,
    disbursements,
    admin,
    gateway,
    public_checkout,
    docs,
)

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
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])
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
