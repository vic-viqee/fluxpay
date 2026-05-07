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


# Import routers one at a time
from app.routers import auth

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
logger.info("Added auth router")

from app.routers import gateway_auth

app.include_router(
    gateway_auth.router, prefix="/api/gateway-auth", tags=["Gateway Auth"]
)
logger.info("Added gateway_auth router")

from app.routers import payments

app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
logger.info("Added payments router")

from app.routers import subscriptions

app.include_router(
    subscriptions.router, prefix="/api/subscriptions", tags=["Subscriptions"]
)
logger.info("Added subscriptions router")

from app.routers import clients

app.include_router(clients.router, prefix="/api/clients", tags=["Clients"])
logger.info("Added clients router")

from app.routers import plans

app.include_router(plans.router, prefix="/api/plans", tags=["Plans"])
logger.info("Added plans router")

from app.routers import customers

app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
logger.info("Added customers router")

from app.routers import transactions

app.include_router(
    transactions.router, prefix="/api/transactions", tags=["Transactions"]
)
logger.info("Added transactions router")

from app.routers import users

app.include_router(users.router, prefix="/api/users", tags=["Users"])
logger.info("Added users router")

from app.routers import settings as user_settings

app.include_router(user_settings.router, prefix="/api/settings", tags=["Settings"])
logger.info("Added settings router")

from app.routers import analytics

app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
logger.info("Added analytics router")

from app.routers import apikeys

app.include_router(apikeys.router, prefix="/api/apikeys", tags=["API Keys"])
logger.info("Added apikeys router")

from app.routers import thirdparty

app.include_router(thirdparty.router, prefix="/api/v1", tags=["Third Party"])
logger.info("Added thirdparty router")

from app.routers import invoices

app.include_router(invoices.router, prefix="/api/invoices", tags=["Invoices"])
logger.info("Added invoices router")

from app.routers import mpesa

app.include_router(mpesa.router, prefix="/api/mpesa", tags=["M-Pesa"])
logger.info("Added mpesa router")

from app.routers import disbursements

app.include_router(
    disbursements.router, prefix="/api/disbursements", tags=["Disbursements"]
)
logger.info("Added disbursements router")

from app.routers import admin

app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
logger.info("Added admin router")

from app.routers import gateway

app.include_router(gateway.router, prefix="/api/gateway", tags=["Gateway"])
logger.info("Added gateway router")

from app.routers import public_checkout

app.include_router(public_checkout.router, prefix="/api/pay", tags=["Public Checkout"])
logger.info("Added public_checkout router")

from app.routers import docs

app.include_router(docs.router, prefix="/api/docs", tags=["Docs"])
logger.info("Added docs router")

logger.info("All routers registered")
