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


# Import just auth router first to test
from app.routers import auth

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
logger.info("Added auth router")

# Comment out others for now - will add back once auth works
# from app.routers import gateway_auth
# app.include_router(gateway_auth.router, prefix="/api/gateway-auth", tags=["Gateway Auth"])
