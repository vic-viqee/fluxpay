from datetime import datetime, timezone
from typing import Optional
from pydantic import Field, EmailStr
from app.models.base import BaseDocument


class PortalUser(BaseDocument):
    email: EmailStr
    name: str
    password_hash: Optional[str] = Field(default=None, exclude=True)
    phone_number: Optional[str] = Field(default=None, alias="phoneNumber")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "portalusers"
        indexes = [
            "email",
        ]
