from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Request,
    UploadFile,
    File,
    Form,
    Response,
)
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
from pathlib import Path
import uuid
import time
from jose import jwt
import json
import httpx
from datetime import datetime, timedelta, timezone

from app.dependencies import (
    get_current_user,
    get_current_admin_user,
    get_optional_user,
    get_client_ip,
)
from app.config import get_settings
from app.models.user import User
from app.schemas.auth import UserResponse
from app.utils.password import hash_password, verify_password, is_strong_password
from app.utils.tokens import generate_access_token, generate_refresh_token
from app.utils.logger import logger
from app.services.email import send_reset_password_email
from app.utils.uploads import resolve_uploads_dir
from app.services.audit import log_audit_event

router = APIRouter()

# In-memory stores for Google OAuth flow (same as original)
google_auth_code_store = {}
used_google_registration_tickets = {}


def prune_expired_stores():
    now = int(time.time() * 1000)
    to_delete = [
        code
        for code, entry in google_auth_code_store.items()
        if entry["expiresAt"] <= now
    ]
    for code in to_delete:
        del google_auth_code_store[code]
    to_delete = [
        jti
        for jti, expires_at in used_google_registration_tickets.items()
        if expires_at <= now
    ]
    for jti in to_delete:
        del used_google_registration_tickets[jti]


def generate_google_auth_code(user_id: str, token: str, refresh_token: str) -> str:
    code = str(uuid.uuid4())
    google_auth_code_store[code] = {
        "userId": user_id,
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


def make_auth_response(
    user: User, message: str, status_code: int = 200, gateway: bool = False
) -> Response:
    """Create standardized auth response with token and cookies."""
    access_token = generate_access_token(str(user.id), user.email, gateway=gateway)
    refresh_token = generate_refresh_token(str(user.id), user.email, gateway=gateway)
    user_data = UserResponse.model_validate(user).model_dump()

    response_content = {
        "message": message,
        "token": access_token,
        "user": user_data,
    }

    response = Response(
        content=json.dumps(response_content),
        status_code=status_code,
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
    return response


def redirect_to_frontend(path: str) -> RedirectResponse:
    base_url = get_settings().frontend_url.rstrip("/")
    return RedirectResponse(url=f"{base_url}{path}", status_code=302)


# ---- Login schemas ----
class LoginRequest(BaseModel):
    email: str
    password: str


class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str


# ---- Signup ----
@router.post("/signup")
async def signup(
    request: Request,
    username: Optional[str] = Form(None),
    email: str = Form(...),
    password: str = Form(...),
    businessName: str = Form(...),
    businessType: Optional[str] = Form(None),
    businessPhoneNumber: str = Form(...),
    kraPin: Optional[str] = Form(None),
    businessTillOrPaybill: Optional[str] = Form(None),
    preferredPaymentMethod: Optional[str] = Form(None),
    businessDescription: Optional[str] = Form(None),
    plan: Optional[str] = Form(None),
    logo: Optional[UploadFile] = File(None),
):
    prune_expired_stores()

    if not email or not password or not businessName or not businessPhoneNumber:
        raise HTTPException(
            status_code=400,
            detail="Email, password, business name, and business phone number are required",
        )

    if not is_strong_password(password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
        )

    existing_user = await User.find_one({"email": email})
    if existing_user:
        raise HTTPException(
            status_code=409, detail="User with that email already exists"
        )

    logo_url = ""
    if logo and logo.filename:
        file_extension = Path(logo.filename).suffix
        filename = f"{uuid.uuid4()}{file_extension}"
        uploads_dir = resolve_uploads_dir()
        file_path = uploads_dir / filename
        with open(file_path, "wb") as buffer:
            content = await logo.read()
            buffer.write(content)
        logo_url = f"{get_settings().backend_url}/uploads/{filename}"

    hashed_password = hash_password(password)
    new_user = User(
        username=username,
        email=email,
        password_hash=hashed_password,
        business_name=businessName,
        business_type=businessType,
        kra_pin=kraPin,
        business_till_or_paybill=businessTillOrPaybill,
        business_phone_number=businessPhoneNumber,
        preferred_payment_method=preferredPaymentMethod or "M-Pesa STK Push",
        business_description=businessDescription,
        logo_url=logo_url,
        plan=plan,
    )
    await new_user.create()

    logger.info(f"New user signed up: {email}, Business: {businessName}")

    await log_audit_event(
        admin_id=str(new_user.id),
        action="USER_SIGNUP",
        resource="User",
        resource_id=str(new_user.id),
        details={"email": email, "business_name": businessName},
        ip_address=await get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return make_auth_response(new_user, "User registered successfully", status_code=201)


# ---- Login ----
@router.post("/login")
async def login(
    request: Request,
    login_data: LoginRequest,
):
    prune_expired_stores()

    logger.info(f"Login attempt for email: {login_data.email}")
    
    # Try case-insensitive search and catch validation errors
    try:
        user = await User.find_one({"email": {"$regex": f"^{login_data.email}$", "$options": "i"}})
    except Exception as e:
        logger.error(f"Error during user lookup/validation for {login_data.email}: {e}")
        # Try to find the raw document to see what's wrong
        raw_user = await User.get_motor_collection().find_one({"email": {"$regex": f"^{login_data.email}$", "$options": "i"}})
        if raw_user:
            logger.error(f"Raw user document found but failed to validate: {raw_user.keys()}")
            # Check for missing fields that are required in Pydantic model
            required_fields = ["businessName", "businessPhoneNumber"]
            missing = [f for f in required_fields if f not in raw_user and raw_user.get(f) is None]
            if missing:
                logger.error(f"Missing required fields in legacy document: {missing}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user:
        logger.warning(f"Login failed: User not found for email {login_data.email}")
        # Diagnostic: Count all users to see if collection is correct
        total_users = await User.count()
        logger.info(f"Total users in 'users' collection: {total_users}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.password_hash:
        logger.warning(f"Login failed: No password hash for user {login_data.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    logger.info(f"User found: {user.email}, verifying password...")
    is_match = verify_password(login_data.password, user.password_hash)
    
    if not is_match:
        logger.warning(f"Login failed: Password mismatch for user {login_data.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    logger.info(f"User logged in: {user.email}")

    await log_audit_event(
        admin_id=str(user.id),
        action="USER_LOGIN",
        resource="User",
        resource_id=str(user.id),
        details={"email": user.email},
        ip_address=await get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return make_auth_response(user, "Logged in successfully")


# ---- Refresh Token ----
@router.post("/refresh-token")
async def refresh_token_endpoint(
    request: Request,
):
    prune_expired_stores()

    # Read refresh token from cookie
    refresh_token = request.cookies.get("refreshToken")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")

    try:
        payload = jwt.decode(
            refresh_token, get_settings().jwt_refresh_secret, algorithms=["HS256"]
        )
        user_id = payload.get("id")
        email = payload.get("email")

        if not user_id or not email:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        user = await User.get(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        new_access_token = generate_access_token(user_id, email)
        new_refresh_token = generate_refresh_token(user_id, email)

        response_content = {
            "message": "Token refreshed",
            "token": new_access_token,
        }

        response = Response(
            content=json.dumps(response_content),
            status_code=200,
            media_type="application/json",
        )
        response.set_cookie(
            key="accessToken",
            value=new_access_token,
            httponly=True,
            max_age=60 * 60,
            path="/",
        )
        response.set_cookie(
            key="refreshToken",
            value=new_refresh_token,
            httponly=True,
            max_age=7 * 24 * 60 * 60,
            path="/",
        )

        return response
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


# ---- Forgot Password ----
@router.post("/forgot-password")
async def forgot_password(
    request: Request,
    body: dict,
):
    prune_expired_stores()
    email = body.get("email", "").strip()

    user = await User.find_one({"email": email})

    if not user:
        return {
            "message": "If an account with that email exists, a password reset link has been sent."
        }

    reset_token = uuid.uuid4().hex
    hashed_token = hash_password(reset_token)

    user.password_reset_token = hashed_token
    user.password_reset_expires = datetime.now(timezone.utc) + timedelta(hours=1)
    await user.save()

    await send_reset_password_email(user.email, reset_token)

    await log_audit_event(
        admin_id=str(user.id),
        action="USER_FORGOT_PASSWORD",
        resource="User",
        resource_id=str(user.id),
        details={"email": email},
        ip_address=await get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return {
        "message": "If an account with that email exists, a password reset link has been sent."
    }


# ---- Reset Password ----
@router.post("/reset-password/{token}")
async def reset_password(
    request: Request,
    token: str,
    body: dict,
):
    prune_expired_stores()
    password = body.get("password", "")

    if not password or len(password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters",
        )

    hashed_token = hash_password(token)

    user = await User.find_one(
        {
            "password_reset_token": hashed_token,
            "password_reset_expires": {"$gt": datetime.now(timezone.utc)},
        },
    )

    if not user:
        raise HTTPException(
            status_code=400, detail="Password reset token is invalid or has expired."
        )

    user.password_hash = hash_password(password)
    user.password_reset_token = None
    user.password_reset_expires = None
    await user.save()

    await log_audit_event(
        admin_id=str(user.id),
        action="USER_RESET_PASSWORD",
        resource="User",
        resource_id=str(user.id),
        details={},
        ip_address=await get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return {"message": "Password has been reset successfully."}


# ---- Change Password ----
@router.post("/change-password")
async def change_password(
    request: Request,
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
):
    prune_expired_stores()

    if not password_data.currentPassword or not password_data.newPassword:
        raise HTTPException(
            status_code=400, detail="Current and new password are required"
        )

    if not is_strong_password(password_data.newPassword):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
        )

    if not current_user.password_hash or not verify_password(
        password_data.currentPassword, current_user.password_hash
    ):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    current_user.password_hash = hash_password(password_data.newPassword)
    await current_user.save()

    await log_audit_event(
        admin_id=str(current_user.id),
        action="USER_CHANGE_PASSWORD",
        resource="User",
        resource_id=str(current_user.id),
        details={},
        ip_address=await get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return {"message": "Password changed successfully"}


# ---- Google OAuth ----
@router.get("/google")
async def google_auth():
    """Initiate Google OAuth flow"""
    settings = get_settings()

    if not settings.google_client_id:
        mock_auth_url = f"{settings.backend_url.rstrip('/')}/api/auth/google/callback?code=mock_google_code_12345&state=mock"
        return RedirectResponse(url=mock_auth_url, status_code=302)

    redirect_url = (
        f"https://accounts.google.com/o/oauth2/auth"
        f"?client_id={settings.google_client_id}"
        f"&redirect_uri={settings.google_redirect_uri}"
        f"&response_type=code"
        f"&scope=email+profile"
    )
    return RedirectResponse(url=redirect_url, status_code=302)


@router.get("/google/callback")
async def google_auth_callback(code: Optional[str] = None, state: Optional[str] = None):
    """Handle Google OAuth callback (redirect from Google)"""
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    settings = get_settings()

    # MOCK MODE
    if not settings.google_client_id:
        mock_profile = {
            "id": f"mock_google_{code}",
            "email": f"mock_{code}@example.com",
            "name": "Mock Google User",
            "given_name": "Mock",
            "family_name": "User",
            "picture": "https://example.com/avatar.jpg",
        }

        user = await User.find_one({"google_id": mock_profile["id"]})
        if not user:
            user = await User.find_one({"email": mock_profile["email"]})
            if user:
                user.google_id = mock_profile["id"]
                await user.save()

        if user:
            access_token = generate_access_token(str(user.id), user.email)
            refresh_token = generate_refresh_token(str(user.id), user.email)
            auth_code = generate_google_auth_code(str(user.id), access_token, refresh_token)
            return redirect_to_frontend(f"/auth/google/callback?code={auth_code}")
        else:
            ticket = generate_google_registration_ticket(mock_profile)
            return redirect_to_frontend(f"/auth/google/callback?ticket={ticket}")

    # REAL MODE: Exchange code for tokens
    try:
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "redirect_uri": settings.google_redirect_uri,
                    "grant_type": "authorization_code",
                },
            )
            token_response.raise_for_status()
            tokens = token_response.json()
    except Exception as e:
        logger.error(f"Google token exchange failed: {e}")
        raise HTTPException(
            status_code=400, detail="Failed to exchange code with Google"
        )

    try:
        async with httpx.AsyncClient() as client:
            user_response = await client.get(
                "https://www.googleapis.com/oauth2/v1/userinfo",
                headers={"Authorization": f"Bearer {tokens['access_token']}"},
            )
            user_response.raise_for_status()
            google_profile = user_response.json()
    except Exception as e:
        logger.error(f"Failed to get Google user info: {e}")
        raise HTTPException(
            status_code=400, detail="Failed to get user info from Google"
        )

    user = await User.find_one({"google_id": google_profile["id"]})
    if not user:
        user = await User.find_one({"email": google_profile["email"]})
        if user:
            user.google_id = google_profile["id"]
            await user.save()

    if user:
        access_token = generate_access_token(str(user.id), user.email)
        refresh_token = generate_refresh_token(str(user.id), user.email)
        auth_code = generate_google_auth_code(str(user.id), access_token, refresh_token)
        return redirect_to_frontend(f"/auth/google/callback?code={auth_code}")
    else:
        ticket = generate_google_registration_ticket(google_profile)
        return redirect_to_frontend(f"/auth/google/callback?ticket={ticket}")


class GoogleExchangeRequest(BaseModel):
    code: str


@router.post("/google/exchange-code")
async def exchange_google_auth_code(
    body: GoogleExchangeRequest,
):
    """Exchange Google auth code for tokens (frontend SPA flow)"""
    code = body.code
    entry = google_auth_code_store.get(code)
    if not entry:
        raise HTTPException(
            status_code=400, detail="Invalid or expired authorization code"
        )

    if entry["expiresAt"] <= int(time.time() * 1000):
        del google_auth_code_store[code]
        raise HTTPException(status_code=400, detail="Authorization code has expired")

    user = await User.get(entry["userId"])
    if not user:
        del google_auth_code_store[code]
        raise HTTPException(status_code=404, detail="User not found")

    del google_auth_code_store[code]
    return make_auth_response(user, "Login successful")


class GoogleRegistrationContextRequest(BaseModel):
    ticket: str


@router.post("/google/registration-context")
async def google_registration_context(body: GoogleRegistrationContextRequest):
    """Get registration context from ticket"""
    try:
        context = verify_google_registration_ticket(body.ticket)
        return {
            "email": context["email"],
            "username": context["username"],
            "googleId": context["googleId"],
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/google-complete-registration")
async def google_complete_registration(
    request: Request,
    ticket: str = Form(...),
    businessName: str = Form(...),
    businessType: str = Form(...),
    businessPhoneNumber: str = Form(...),
    kraPin: Optional[str] = Form(None),
    businessTillOrPaybill: Optional[str] = Form(None),
    preferredPaymentMethod: Optional[str] = Form(None),
    businessDescription: Optional[str] = Form(None),
    plan: Optional[str] = Form(None),
    logo: Optional[UploadFile] = File(None),
):
    """Complete Google registration with business details"""
    prune_expired_stores()

    try:
        ticket_data = verify_google_registration_ticket(ticket)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if used_google_registration_tickets.get(ticket_data["jti"]):
        raise HTTPException(
            status_code=409, detail="Registration ticket has already been used."
        )

    used_google_registration_tickets[ticket_data["jti"]] = ticket_data["expiresAt"]

    logo_url = ""
    if logo and logo.filename:
        file_extension = Path(logo.filename).suffix
        filename = f"{uuid.uuid4()}{file_extension}"
        uploads_dir = resolve_uploads_dir()
        file_path = uploads_dir / filename
        with open(file_path, "wb") as buffer:
            content = await logo.read()
            buffer.write(content)
        logo_url = f"{get_settings().backend_url}/uploads/{filename}"

    existing = await User.find_one({"google_id": ticket_data["googleId"]})
    if existing:
        return make_auth_response(existing, "Logged in successfully")

    existing_by_email = await User.find_one({"email": ticket_data["email"]})
    if existing_by_email:
        if not existing_by_email.google_id:
            existing_by_email.google_id = ticket_data["googleId"]
            await existing_by_email.save()
            return make_auth_response(existing_by_email, "Account linked successfully")
        raise HTTPException(
            status_code=409,
            detail="User with that email already exists and is linked to another Google account.",
        )

    new_user = User(
        google_id=ticket_data["googleId"],
        email=ticket_data["email"],
        username=ticket_data["username"],
        business_name=businessName,
        business_type=businessType,
        business_phone_number=businessPhoneNumber,
        kra_pin=kraPin,
        business_till_or_paybill=businessTillOrPaybill,
        preferred_payment_method=preferredPaymentMethod or "M-Pesa STK Push",
        business_description=businessDescription,
        logo_url=logo_url,
        plan=plan,
    )
    await new_user.create()

    logger.info(
        f"New Google user registered: {ticket_data['email']}, Business: {businessName}"
    )

    await log_audit_event(
        admin_id=str(new_user.id),
        action="USER_GOOGLE_SIGNUP",
        resource="User",
        resource_id=str(new_user.id),
        details={"email": ticket_data["email"], "business_name": businessName},
        ip_address=await get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return make_auth_response(new_user, "Registration successful", status_code=201)


# ---- Me ----
@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user).model_dump()


# ---- Logout ----
@router.post("/logout")
async def logout():
    response = Response(
        content=json.dumps({"message": "Logged out successfully"}),
        status_code=200,
        media_type="application/json",
    )
    response.delete_cookie(key="accessToken", path="/")
    response.delete_cookie(key="refreshToken", path="/")
    return response
