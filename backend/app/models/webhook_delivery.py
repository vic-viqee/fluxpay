from datetime import datetime, timezone
from typing import Optional, Any
from beanie import PydanticObjectId
from pydantic import Field
from app.models.base import BaseDocument


class WebhookDelivery(BaseDocument):
    webhook_id: PydanticObjectId = Field(alias="webhookId")
    owner_id: PydanticObjectId = Field(alias="ownerId")
    event: str
    payload: dict[str, Any]
    payload_signature: Optional[str] = Field(default=None, alias="payloadSignature")
    success: bool = False
    response_status: Optional[int] = Field(default=None, alias="responseStatus")
    response_body: Optional[str] = Field(default=None, alias="responseBody")
    error: Optional[str] = None
    attempts: int = Field(default=1)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "webhook_deliveries"
        indexes = [
            "webhook_id",
            "owner_id",
            "event",
            [("created_at", -1)],
        ]