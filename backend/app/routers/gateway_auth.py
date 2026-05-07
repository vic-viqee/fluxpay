from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from typing import Optional
import os
from pathlib import Path
import uuid
import time
from jose import jwt
import json
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel

from app.dependencies import (
    get_current_user,
    get_current_admin_user,
    get_optional_user,
    get_client_ip,
)
from app.config import get_settings
from app.models.user import User
from app.utils.password import hash_password, verify_password, is_strong_password
from app.utils.tokens import generate_access_token, generate_refresh_token
from app.utils.logger import logger
from app.services.email import send_reset_password_email
from app.services.audit import log_audit_event

router = APIRouter()

# In-memory stores for Google OAuth flow (same as original)
google_auth_code_store = {}
used_google_registration_tickets = {}


def prune_expired_stores():
    now = int(time.time() * 1000)
    to_delete = []
    for code, entry in google_auth_code_store.items():
        if entry["expiresAt"] <= now:
            to_delete.append(code)
    for code in to_delete:
        del google_auth_code_store[code]

    to_delete = []
    for jti, expires_at in used_google_registration_tickets.items():
        if expires_at <= now:
            to_delete.append(jti)
    for jti in to_delete:
        del used_google_registration_tickets[jti]


setInterval = lambda func, ms: None


def generate_google_auth_code(token: str, refresh_token: str) -> str:
    code = str(uuid.uuid4())
    google_auth_code_store[code] = {
        "token": token,
        "refreshToken": refresh_token,
        "expiresAt": int(time.time() * 1000) + 2 * 60 * 1000,
    }
    return code


def generate_google_registration_ticket(profile: dict) -> str:
    settings = get_settings()
    payload = {
        "purpose": "google_registration",
        "googleId": profile["id"],
        "email": profile["email"],
        "username": profile.get("displayName", profile["email"].split("@")[0]),
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def verify_google_registration_ticket(ticket: str) -> dict:
    settings = get_settings()
    try:
        decoded = jwt.decode(ticket, settings.jwt_secret, algorithms=["HS256"])
        if decoded.get("purpose") != "google_registration":
            raise ValueError("Invalid registration ticket")
        return {
            "googleId": decoded["googleId"],
            "email": decoded["email"],
            "username": decoded["username"],
            "jti": decoded["jti"],
            "expiresAt": decoded.get("exp", 0) * 1000,
        }
    except jwt.InvalidTokenError:
        raise ValueError("Invalid or expired registration ticket")


class GatewaySignupRequest(BaseModel):
    email: str
    password: str
    businessName: str
    businessPhoneNumber: str
    businessTillOrPaybill: Optional[str] = None
    businessType: Optional[str] = None


class GatewayLoginRequest(BaseModel):
    email: str
    password: str


class GatewayForgotPasswordRequest(BaseModel):
    email: str


class GatewayResetPasswordRequest(BaseModel):
    password: str


@router.post("/signup")
async def gateway_signup(
    request: Request,
    body: GatewaySignupRequest,
):
    try:
        prune_expired_stores()

        if not is_strong_password(body.password):
            raise HTTPException(
                status_code=400,
                detail="Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
            )

        existing_user = await User.find_one(
            {"email": body.email, "service_type": "gateway"}
        )

        if existing_user:
            raise HTTPException(
                status_code=409, detail="User with that email already exists"
            )

        hashed_password = hash_password(body.password)
        now = datetime.now(timezone.utc)
        next_month = now.month + 1 if now.month < 12 else 1
        next_year = now.year if now.month < 12 else now.year + 1

new_user = User(
            email=body.email,
            password_hash=hashed_password,
            business_name=body.businessName,
            business_phone_number=body.businessPhoneNumber,
            business_till_or_paybill=body.businessTillOrPaybill,
            business_type=body.businessType or "retail",
            service_type="gateway",
            role="user",
            plan="free",
            transaction_limit=50,
            current_month_transactions=0,
        )
        await new_user.create()

        logger.info(f"New gateway user signed up: {body.email}")

        access_token = generate_access_token(str(new_user.id), new_user.email)
        refresh_token = generate_refresh_token(
            str(new_user.id), new_user.email, gateway=True
        )

        response_content = {
            "message": "Registration successful",
            "token": access_token,
            "refreshToken": refresh_token,
            "user": {
                "id": str(new_user.id),
                "email": new_user.email,
                "businessName": new_user.business_name,
                "businessPhoneNumber": new_user.business_phone_number,
                "serviceType": new_user.service_type,
                "plan": new_user.plan,
                "transactionLimit": new_user.transaction_limit,
                "currentMonthTransactions": new_user.current_month_transactions,
            },
        }

        response = Response(
            content=json.dumps(response_content),
            status_code=201,
            media_type="application/json",
        )
        response.set_cookie(
            key="accessToken",
            value=access_token,
            httponly=True,
            max_age=60 * 60,
            path="/",
        )
        response.set_cookie(
            key="refreshToken",
            value=refresh_token,
            httponly=True,
            max_age=7 * 24 * 60 * 60,
            path="/",
        )

        # Try to log audit event but don't fail if it errors
        try:
            await log_audit_event(
                admin_id=str(new_user.id),
                action="GATEWAY_SIGNUP",
                resource="User",
                resource_id=str(new_user.id),
                details={"email": body.email, "business_name": body.businessName},
                ip_address=await get_client_ip(request),
                user_agent=request.headers.get("user-agent"),
            )
        except Exception as audit_err:
            logger.error(f"Audit logging failed (non-critical): {audit_err}")

        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Gateway signup error: {e}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@router.post("/login")
async def gateway_login(
    request: Request,
    response: Response,
    body: GatewayLoginRequest,
):
    prune_expired_stores()

    user = await User.find_one(
        {"email": body.email, "service_type": "gateway"}, projection_model=None
    )

    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    is_match = verify_password(body.password, user.password_hash)
    if not is_match:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    logger.info(f"Gateway user logged in: {body.email}")

    access_token = generate_access_token(str(user.id), user.email)
    refresh_token = generate_refresh_token(str(user.id), user.email, gateway=True)

    response_content = {
        "message": "Logged in successfully",
        "token": access_token,
        "refreshToken": refresh_token,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "businessName": user.business_name,
            "businessPhoneNumber": user.business_phone_number,
            "serviceType": user.service_type,
            "plan": user.plan,
            "transactionLimit": user.transaction_limit,
            "currentMonthTransactions": user.current_month_transactions,
        },
    }

    response = Response(
        content=json.dumps(response_content),
        status_code=200,
        media_type="application/json",
    )
    response.set_cookie(
        key="accessToken",
        value=access_token,
        httponly=True,
        max_age=60 * 60,
        path="/",
    )
    response.set_cookie(
        key="refreshToken",
        value=refresh_token,
        httponly=True,
        max_age=7 * 24 * 60 * 60,
        path="/",
    )

    await log_audit_event(
        admin_id=str(user.id),
        action="GATEWAY_LOGIN",
        resource="User",
        resource_id=str(user.id),
        details={"email": body.email},
        ip_address=await get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return response


@router.post("/forgot-password")
async def gateway_forgot_password(
    request: Request,
    body: GatewayForgotPasswordRequest,
):
    prune_expired_stores()

    user = await User.find_one({"email": body.email, "service_type": "gateway"})

    if not user:
        return Response(
            content=json.dumps(
                {
                    "message": "If an account with that email exists, a password reset link has been sent."
                }
            ),
            status_code=200,
            media_type="application/json",
        )

    reset_token = uuid.uuid4().hex
    hashed_token = hash_password(reset_token)

    user.password_reset_token = hashed_token
    user.password_reset_expires = datetime.now(timezone.utc) + timedelta(hours=1)
    await user.save()

    await send_reset_password_email(user.email, reset_token)

    await log_audit_event(
        admin_id=str(user.id),
        action="GATEWAY_FORGOT_PASSWORD",
        resource="User",
        resource_id=str(user.id),
        details={"email": body.email},
        ip_address=await get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return Response(
        content=json.dumps(
            {
                "message": "If an account with that email exists, a password reset link has been sent."
            }
        ),
        status_code=200,
        media_type="application/json",
    )


@router.post("/reset-password/{token}")
async def gateway_reset_password(
    request: Request,
    token: str,
    body: GatewayResetPasswordRequest,
):
    prune_expired_stores()

    if not body.password or len(body.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters",
        )

    hashed_token = hash_password(token)

    user = await User.find_one(
        {
            "password_reset_token": hashed_token,
            "password_reset_expires": {"$gt": datetime.now(timezone.utc)},
            "service_type": "gateway",
        },
        projection_model=None,
    )

    if not user:
        raise HTTPException(
            status_code=400, detail="Password reset token is invalid or has expired."
        )

    user.password_hash = hash_password(body.password)
    user.password_reset_token = None
    user.password_reset_expires = None
    await user.save()

    await log_audit_event(
        admin_id=str(user.id),
        action="GATEWAY_RESET_PASSWORD",
        resource="User",
        resource_id=str(user.id),
        details={},
        ip_address=await get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return Response(
        content=json.dumps({"message": "Password has been reset successfully."}),
        status_code=200,
        media_type="application/json",
    )
