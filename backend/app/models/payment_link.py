from datetime import datetime, timezone
from typing import Optional, Literal
from beanie import PydanticObjectId
from pydantic import Field
from app.models.base import BaseDocument


class PaymentLink(BaseDocument):
    owner_id: PydanticObjectId = Field(alias="ownerId")
    title: str
    description: Optional[str] = None
    amount: float
    currency: str = "KES"
    status: Literal["ACTIVE", "EXPIRED", "USED"] = "ACTIVE"
    expires_at: Optional[datetime] = Field(default=None, alias="expiresAt")
    max_uses: Optional[int] = Field(default=None, alias="maxUses")
    current_uses: int = Field(default=0, alias="currentUses")
    customer_phone: Optional[str] = Field(default=None, alias="customerPhone")
    customer_email: Optional[str] = Field(default=None, alias="customerEmail")
    redirect_url: Optional[str] = Field(default=None, alias="redirectUrl")
    webhook_url: Optional[str] = Field(default=None, alias="webhookUrl")
    payment_link: str = Field(unique=True, alias="paymentLink")
    transactions: list[PydanticObjectId] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "paymentlinks"
        indexes = [
            "owner_id",
            "payment_link",
            "status",
        ]
