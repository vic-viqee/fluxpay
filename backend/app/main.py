from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pathlib import Path

# Temporarily comment out all imports to find the issue
# from app.config import get_settings
# from app.database import init_db, close_db
# from app.utils.logger import logger


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     try:
#         await init_db()
#         logger.info("Database connected")
#     except Exception as e:
#         logger.error(f"Database connection failed: {e}")
#
#     logger.info("FluxPay Python backend started")
#     yield
#
#     try:
#         await close_db()
#         logger.info("FluxPay Python backend shut down")
#     except Exception as e:
#         logger.error(f"Error during shutdown: {e}")


# settings = get_settings()

app = FastAPI(
    title="FluxPay API",
    description="M-Pesa payment platform",
    version="2.0.0",
    # lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
