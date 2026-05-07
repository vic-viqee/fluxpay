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


# Import all routers
from app.routers import auth

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
logger.info("auth router added")

# Test importing gateway_auth separately
try:
    import app.routers.gateway_auth

    logger.info("gateway_auth module imported OK")
    from app.routers import gateway_auth

    app.include_router(
        gateway_auth.router, prefix="/api/gateway-auth", tags=["Gateway Auth"]
    )
    logger.info("gateway_auth router added")
except Exception as e:
    logger.error(f"Failed gateway_auth: {type(e).__name__}: {e}")
    import traceback

    logger.error(traceback.format_exc())

try:
    from app.routers import payments

    app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
    logger.info("payments router added")
except Exception as e:
    logger.error(f"Failed to add payments: {e}")

try:
    from app.routers import subscriptions

    app.include_router(
        subscriptions.router, prefix="/api/subscriptions", tags=["Subscriptions"]
    )
    logger.info("subscriptions router added")
except Exception as e:
    logger.error(f"Failed to add subscriptions: {e}")

try:
    from app.routers import clients

    app.include_router(clients.router, prefix="/api/clients", tags=["Clients"])
    logger.info("clients router added")
except Exception as e:
    logger.error(f"Failed to add clients: {e}")

try:
    from app.routers import plans

    app.include_router(plans.router, prefix="/api/plans", tags=["Plans"])
    logger.info("plans router added")
except Exception as e:
    logger.error(f"Failed to add plans: {e}")

try:
    from app.routers import customers

    app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
    logger.info("customers router added")
except Exception as e:
    logger.error(f"Failed to add customers: {e}")

try:
    from app.routers import transactions

    app.include_router(
        transactions.router, prefix="/api/transactions", tags=["Transactions"]
    )
    logger.info("transactions router added")
except Exception as e:
    logger.error(f"Failed to add transactions: {e}")

try:
    from app.routers import users

    app.include_router(users.router, prefix="/api/users", tags=["Users"])
    logger.info("users router added")
except Exception as e:
    logger.error(f"Failed to add users: {e}")

try:
    from app.routers import settings as user_settings

    app.include_router(user_settings.router, prefix="/api/settings", tags=["Settings"])
    logger.info("settings router added")
except Exception as e:
    logger.error(f"Failed to add settings: {e}")

try:
    from app.routers import analytics

    app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
    logger.info("analytics router added")
except Exception as e:
    logger.error(f"Failed to add analytics: {e}")

try:
    from app.routers import apikeys

    app.include_router(apikeys.router, prefix="/api/apikeys", tags=["API Keys"])
    logger.info("apikeys router added")
except Exception as e:
    logger.error(f"Failed to add apikeys: {e}")

try:
    from app.routers import thirdparty

    app.include_router(thirdparty.router, prefix="/api/v1", tags=["Third Party"])
    logger.info("thirdparty router added")
except Exception as e:
    logger.error(f"Failed to add thirdparty: {e}")

try:
    from app.routers import invoices

    app.include_router(invoices.router, prefix="/api/invoices", tags=["Invoices"])
    logger.info("invoices router added")
except Exception as e:
    logger.error(f"Failed to add invoices: {e}")

try:
    from app.routers import mpesa

    app.include_router(mpesa.router, prefix="/api/mpesa", tags=["M-Pesa"])
    logger.info("mpesa router added")
except Exception as e:
    logger.error(f"Failed to add mpesa: {e}")

try:
    from app.routers import disbursements

    app.include_router(
        disbursements.router, prefix="/api/disbursements", tags=["Disbursements"]
    )
    logger.info("disbursements router added")
except Exception as e:
    logger.error(f"Failed to add disbursements: {e}")

try:
    from app.routers import admin

    app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
    logger.info("admin router added")
except Exception as e:
    logger.error(f"Failed to add admin: {e}")

try:
    from app.routers import gateway

    app.include_router(gateway.router, prefix="/api/gateway", tags=["Gateway"])
    logger.info("gateway router added")
except Exception as e:
    logger.error(f"Failed to add gateway: {e}")

try:
    from app.routers import public_checkout

    app.include_router(
        public_checkout.router, prefix="/api/pay", tags=["Public Checkout"]
    )
    logger.info("public_checkout router added")
except Exception as e:
    logger.error(f"Failed to add public_checkout: {e}")

try:
    from app.routers import docs

    app.include_router(docs.router, prefix="/api/docs", tags=["Docs"])
    logger.info("docs router added")
except Exception as e:
    logger.error(f"Failed to add docs: {e}")

# Comment out others for now - will add back once auth works
# from app.routers import gateway_auth
# app.include_router(gateway_auth.router, prefix="/api/gateway-auth", tags=["Gateway Auth"])
