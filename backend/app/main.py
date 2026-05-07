from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Only import config to get settings - don't run anything
from app.config import get_settings

# Don't import database - it crashes on startup
# from app.database import init_db, close_db
from app.utils.logger import logger


# Minimal lifespan - don't start DB
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("FluxPay Python backend started")
    yield
    logger.info("FluxPay Python backend shut down")


settings = get_settings()

app = FastAPI(
    title="FluxPay API",
    description="M-Pesa payment platform",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.parsed_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)


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


# Import routers one by one to find the issue
from app.routers import gateway_auth

app.include_router(
    gateway_auth.router, prefix="/api/gateway-auth", tags=["Gateway Auth"]
)
