from datetime import datetime, timezone
from typing import Optional, Literal
from beanie import PydanticObjectId
from pydantic import Field, field_validator # Import field_validator
import re # Import re module for regex
from app.models.base import BaseDocument

class GatewayCustomer(BaseDocument):
    owner_id: PydanticObjectId = Field(alias="ownerId")
    name: str
    email: Optional[str] = None
    phone_number: str = Field(alias="phoneNumber")
    total_transactions: int = Field(default=0, alias="totalTransactions")
    total_amount: float = Field(default=0, alias="totalAmount")
    last_transaction_date: Optional[datetime] = Field(
        default=None, alias="lastTransactionDate"
    )
    last_transaction_status: Optional[Literal["PENDING", "SUCCESS", "FAILED"]] = Field(
        default=None, alias="lastTransactionStatus"
    )
    notes: Optional[str] = None
    tags: Optional[list[str]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "gatewaycustomers"
        indexes = [
            "owner_id",
            "phone_number",
            "email",
        ]

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not re.match(r"^254(1|7)\d{8}$", v):
            raise ValueError("Phone number must be in format 254XXXXXXXX")
        return v
