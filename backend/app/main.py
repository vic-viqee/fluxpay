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


# Only auth and gateway_auth for now - other routers have import issues
from app.routers import auth

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])

try:
    from app.routers import gateway_auth

    app.include_router(
        gateway_auth.router, prefix="/api/gateway-auth", tags=["Gateway Auth"]
    )
except Exception as e:
    logger.error(f"Failed gateway_auth: {e}")

# Load all routers
router_configs = [
    ("payments", "/api/payments", "Payments"),
    ("subscriptions", "/api/subscriptions", "Subscriptions"),
    ("clients", "/api/clients", "Clients"),
    ("plans", "/api/plans", "Plans"),
    ("customers", "/api/customers", "Customers"),
    ("transactions", "/api/transactions", "Transactions"),
    ("users", "/api/users", "Users"),
    ("settings", "/api/settings", "Settings"),
    ("analytics", "/api/analytics", "Analytics"),
    ("apikeys", "/api/apikeys", "API Keys"),
    ("thirdparty", "/api/v1", "Third Party"),
    ("invoices", "/api/invoices", "Invoices"),
    ("mpesa", "/api/mpesa", "M-Pesa"),
    ("disbursements", "/api/disbursements", "Disbursements"),
    ("admin", "/api/admin", "Admin"),
    ("gateway", "/api/gateway", "Gateway"),
    ("public_checkout", "/api/pay", "Public Checkout"),
    ("docs", "/api/docs", "Docs"),
]

for module_name, prefix, tag in router_configs:
    try:
        mod = __import__(f"app.routers.{module_name}", fromlist=["router"])
        app.include_router(mod.router, prefix=prefix, tags=[tag])
    except Exception as e:
        logger.error(f"Failed to load {module_name}: {e}")
