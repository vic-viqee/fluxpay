from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Optional
import re


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    username: Optional[str] = None
    email: EmailStr
    password: str
    business_name: str
    business_type: Optional[str] = None
    business_phone_number: str
    kra_pin: Optional[str] = None
    business_till_or_paybill: Optional[str] = None
    preferred_payment_method: Optional[str] = None
    business_description: Optional[str] = None
    plan: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain number")
        if not re.search(r"[^A-Za-z0-9]", v):
            raise ValueError("Password must contain special character")
        return v


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain number")
        if not re.search(r"[^A-Za-z0-9]", v):
            raise ValueError("Password must contain special character")
        return v


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain number")
        if not re.search(r"[^A-Za-z0-9]", v):
            raise ValueError("Password must contain special character")
        return v


class GoogleAuthCodeRequest(BaseModel):
    code: str


class GoogleRegistrationContextRequest(BaseModel):
    ticket: str


class GoogleCompleteRegistrationRequest(BaseModel):
    ticket: str
    business_name: str
    business_type: str
    business_phone_number: str
    kra_pin: Optional[str] = None
    business_till_or_paybill: Optional[str] = None
    preferred_payment_method: Optional[str] = None
    business_description: Optional[str] = None
    plan: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    username: Optional[str] = None
    business_name: str
    business_type: Optional[str] = None
    business_phone_number: str
    service_type: str
    plan: Optional[str] = None
    role: str
    logo_url: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def convert_id(cls, data):
        if hasattr(data, "id"):
            data.id = str(data.id)
        elif isinstance(data, dict) and "id" in data:
            data["id"] = str(data["id"])
        return data

    class Config:
        from_attributes = True
