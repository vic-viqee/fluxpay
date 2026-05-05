from datetime import datetime, timezone
from typing import Optional
from beanie import Document, PydanticObjectId
from pydantic import Field


class Webhook(Document):
    name: Optional[str] = None
    url: str
    secret: str
    events: list[str] = Field(default=["payment.success", "payment.failed"])
    owner_id: PydanticObjectId = Field(alias="ownerId")
    is_active: bool = Field(default=True, alias="isActive")
    last_triggered_at: Optional[datetime] = Field(default=None, alias="lastTriggeredAt")
    failure_count: int = Field(default=0, alias="failureCount")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "webhooks"
        indexes = [
            "owner_id",
        ]
