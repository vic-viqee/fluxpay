from datetime import datetime, timezone
from typing import Optional, Literal
from beanie import PydanticObjectId
from pydantic import Field
from app.models.base import BaseDocument


class Subscription(BaseDocument):
    client_id: PydanticObjectId = Field(alias="clientId")
    plan_id: PydanticObjectId = Field(alias="planId")
    owner_id: PydanticObjectId = Field(alias="ownerId")
    status: Literal[
        "PENDING_ACTIVATION", "ACTIVE", "PAUSED", "CANCELLED", "EXPIRED", "FAILED"
    ] = "PENDING_ACTIVATION"
    start_date: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), alias="startDate"
    )
    next_billing_date: datetime = Field(alias="nextBillingDate")
    notes: Optional[str] = None
    payment_failure_count: int = Field(default=0, alias="paymentFailureCount")
    last_payment_attempt: Optional[datetime] = Field(
        default=None, alias="lastPaymentAttempt"
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "subscriptions"
        indexes = [
            "owner_id",
            "client_id",
            "status",
            "next_billing_date",
        ]
