from datetime import datetime, timezone
from typing import Optional
from beanie import Document, PydanticObjectId
from pydantic import Field


class ApiKey(Document):
    key: str = Field(unique=True)
    secret: str
    name: str
    owner_id: PydanticObjectId = Field(alias="ownerId")
    last_used_at: Optional[datetime] = Field(default=None, alias="lastUsedAt")
    expires_at: Optional[datetime] = Field(default=None, alias="expiresAt")
    is_active: bool = Field(default=True, alias="isActive")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "apikeys"
        populate_by_name = True
        indexes = [
            "owner_id",
            "key",
        ]
