from datetime import datetime, timezone
from typing import Optional, Any, List
from beanie import Document, Link, PydanticObjectId
from pydantic import Field
import secrets # Import secrets module for token generation

from app.models.user import User
from app.models.gateway_transaction import GatewayTransaction

class Webhook(Document):
    owner_id: PydanticObjectId = Field(alias="ownerId")
    url: str
    secret: str = Field(default=secrets.token_hex(32)) # Generate secret on creation
    events: List[str] = Field(default=["payment.success", "payment.failed"])
    is_active: bool = Field(default=True, alias="isActive")
    last_triggered_at: Optional[datetime] = Field(default=None, alias="lastTriggeredAt")
    failure_count: int = Field(default=0, alias="failureCount")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "webhooks"
        indexes = [
            "owner_id",
            "url",
            "is_active",
            "events",
        ]
