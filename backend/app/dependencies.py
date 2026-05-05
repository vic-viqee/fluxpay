from fastapi import Depends, HTTPException, status, Cookie, Request, Header
from typing import Optional
from jose import JWTError, jwt
from datetime import datetime, timezone

from app.config import get_settings, Settings
from app.models.user import User


async def get_current_user(
    accessToken: Optional[str] = Cookie(default=None, alias="accessToken"),
    authorization: Optional[str] = Header(default=None),
) -> User:
    token = accessToken
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization.split(" ", 1)[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token, authorization denied",
        )

    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        user_id: Optional[str] = payload.get("id")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token is invalid",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid or expired",
        )

    user = await User.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


async def get_current_admin_user(
    user: User = Depends(get_current_user),
) -> User:
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user


async def get_optional_user(
    accessToken: Optional[str] = Cookie(default=None, alias="accessToken"),
    authorization: Optional[str] = Header(default=None),
) -> Optional[User]:
    token = accessToken
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization.split(" ", 1)[1]

    if not token:
        return None

    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        user_id: Optional[str] = payload.get("id")
        if user_id is None:
            return None
    except JWTError:
        return None

    user = await User.get(user_id)
    return user


async def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
