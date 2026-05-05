from loguru import logger
import sys
import os

logger.remove()

log_format = "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"

logger.add(sys.stderr, format=log_format, level="INFO")

log_file = os.environ.get("LOG_FILE", "combined.log")
logger.add(log_file, rotation="10 MB", retention="30 days", level="DEBUG")

__all__ = ["logger"]
