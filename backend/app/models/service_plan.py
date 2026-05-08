from datetime import datetime, timezone
from typing import Literal
from beanie import Document, PydanticObjectId
from pydantic import Field


class ServicePlan(Document):
    name: str
    amount_kes: float = Field(gt=0, alias="amountKes")
    frequency: Literal["daily", "weekly", "monthly", "quarterly", "annually"]
    billing_day: int = Field(ge=1, le=31, alias="billingDay")
    owner_id: PydanticObjectId = Field(alias="ownerId")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "serviceplans"
        populate_by_name = True
        indexes = [
            "owner_id",
            "name",
        ]
