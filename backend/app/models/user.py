from datetime import datetime, timezone
from typing import Optional, Literal
from beanie import Document, TimeSeriesConfig
from pydantic import Field, EmailStr

from app.models.utils import next_month_first_day


class User(Document):
    username: Optional[str] = None
    email: EmailStr
    password_hash: Optional[str] = Field(default=None, exclude=True, alias="password")
    google_id: Optional[str] = Field(default=None, alias="googleId")
    password_reset_token: Optional[str] = Field(
        default=None, alias="passwordResetToken"
    )
    password_reset_expires: Optional[datetime] = Field(
        default=None, alias="passwordResetExpires"
    )
    business_name: str = Field(alias="businessName")
    business_type: Optional[str] = Field(default=None, alias="businessType")
    kra_pin: Optional[str] = Field(default=None, alias="kraPin")
    business_till_or_paybill: Optional[str] = Field(
        default=None, alias="businessTillOrPaybill"
    )
    business_phone_number: str = Field(alias="businessPhoneNumber")
    preferred_payment_method: str = Field(
        default="M-Pesa STK Push", alias="preferredPaymentMethod"
    )
    business_description: Optional[str] = Field(
        default=None, alias="businessDescription"
    )
    logo_url: Optional[str] = Field(default=None, alias="logoUrl")
    plan: Optional[str] = None
    role: Literal["user", "admin"] = "user"
    service_type: Literal["subscription", "gateway", "both"] = Field(
        default="both", alias="serviceType"
    )
    transaction_limit: int = Field(default=100, alias="transactionLimit")
    current_month_transactions: int = Field(default=0, alias="currentMonthTransactions")
    transaction_count_reset_at: datetime = Field(
        default_factory=next_month_first_day, alias="transactionCountResetAt"
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), alias="createdAt"
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), alias="updatedAt"
    )
    webhook_secret: Optional[str] = Field(
        default=None, exclude=True, alias="webhookSecret"
    )  # Add for webhook security

    class Settings:
        name = "users"
        indexes = [
            "email",
            "google_id",
            "role",
            "service_type",
        ]
