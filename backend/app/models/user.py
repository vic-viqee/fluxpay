from datetime import datetime, timezone
from typing import Optional, Literal
from beanie import Document, TimeSeriesConfig
from pydantic import Field, EmailStr

from app.models.utils import next_month_first_day


class User(Document):
    username: Optional[str] = None
    email: EmailStr
    password_hash: Optional[str] = Field(default=None, exclude=True)
    google_id: Optional[str] = Field(default=None, unique=True, sparse=True)
    password_reset_token: Optional[str] = None
    password_reset_expires: Optional[datetime] = None
    business_name: str
    business_type: Optional[str] = None
    kra_pin: Optional[str] = None
    business_till_or_paybill: Optional[str] = None
    business_phone_number: str
    preferred_payment_method: str = "M-Pesa STK Push"
    business_description: Optional[str] = None
    logo_url: Optional[str] = None
    plan: Optional[str] = None
    role: Literal["user", "admin"] = "user"
    service_type: Literal["subscription", "gateway", "both"] = "both"
    transaction_limit: int = 100
    current_month_transactions: int = 0
    transaction_count_reset_at: datetime = Field(default_factory=next_month_first_day)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
        indexes = [
            "email",
            "google_id",
            "role",
            "service_type",
        ]
