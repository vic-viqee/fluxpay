from datetime import datetime, timedelta, timezone
from jose import jwt
from app.config import get_settings


def generate_access_token(user_id: str, email: str) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(
        seconds=settings.jwt_access_expires_in
    )
    payload = {
        "id": user_id,
        "email": email,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def generate_refresh_token(user_id: str, email: str, gateway: bool = False) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(
        seconds=settings.jwt_refresh_expires_in
    )
    payload = {
        "id": user_id,
        "email": email,
        "exp": expire,
    }
    if gateway:
        payload["gateway"] = True
    return jwt.encode(payload, settings.jwt_refresh_secret, algorithm="HS256")


def decode_token(token: str, secret: str) -> dict:
    return jwt.decode(token, secret, algorithms=["HS256"])
