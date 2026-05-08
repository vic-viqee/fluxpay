from datetime import datetime, timezone
from typing import Optional
from beanie import Document, PydanticObjectId
from pydantic import Field, field_validator
import re


class Client(Document):
    name: str
    phone_number: str = Field(alias="phoneNumber")
    email: Optional[str] = None
    owner_id: PydanticObjectId = Field(alias="ownerId")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "clients"
        indexes = [
            "owner_id",
            "phone_number",
        ]

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not re.match(r"^254(1|7)\d{8}$", v):
            raise ValueError("Phone number must be in format 254XXXXXXXX")
        return v
