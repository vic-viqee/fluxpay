from datetime import datetime, timezone
from typing import Optional
from beanie import Document, PydanticObjectId
from pydantic import Field


class PublicCheckoutButton(Document):
    owner_id: PydanticObjectId = Field(alias="ownerId")
    button_id: str = Field(unique=True, alias="buttonId")
    title: str
    description: Optional[str] = None
    default_amount: Optional[float] = Field(default=None, alias="defaultAmount")
    allow_custom_amount: bool = Field(default=True, alias="allowCustomAmount")
    redirect_url: Optional[str] = Field(default=None, alias="redirectUrl")
    button_text: str = Field(default="Pay with M-Pesa", alias="buttonText")
    button_color: str = Field(default="#25D366", alias="buttonColor")
    is_active: bool = Field(default=True, alias="isActive")
    total_clicks: int = Field(default=0, alias="totalClicks")
    total_payments: int = Field(default=0, alias="totalPayments")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "publiccheckoutbuttons"
        indexes = [
            "button_id",
            "owner_id",
        ]
