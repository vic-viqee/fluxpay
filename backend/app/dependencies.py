from fastapi import Depends, HTTPException, status, Cookie, Request, Header
from typing import Optional
from jose import JWTError, jwt
from datetime import datetime, timezone

from app.config import get_settings, Settings
from app.models.user import User
from app.models.portal_user import PortalUser
from app.utils.logger import logger


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
            logger.warning("JWT payload missing 'id'")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token is invalid",
            )
    except JWTError as e:
        logger.warning(f"JWT decoding failed: {e}")
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


async def get_current_portal_user(
    authorization: Optional[str] = Header(default=None),
) -> PortalUser:
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token, authorization denied",
        )

    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        subject: Optional[str] = payload.get("sub")
        if not subject or not subject.startswith("portal_"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        portal_user_id = subject.replace("portal_", "", 1)
    except JWTError as e:
        logger.warning(f"Portal JWT decoding failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid or expired",
        )

    portal_user = await PortalUser.get(portal_user_id)
    if not portal_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return portal_user


async def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
