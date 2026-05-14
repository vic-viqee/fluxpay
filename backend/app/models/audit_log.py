from datetime import datetime, timezone
from typing import Optional, Any
from beanie import PydanticObjectId
from pydantic import Field
from app.models.base import BaseDocument


class AuditLog(BaseDocument):
    admin_id: PydanticObjectId = Field(alias="adminId")
    action: str
    resource: str
    resource_id: Optional[str] = Field(default=None, alias="resourceId")
    details: Optional[dict[str, Any]] = None
    ip_address: Optional[str] = Field(default=None, alias="ipAddress")
    user_agent: Optional[str] = Field(default=None, alias="userAgent")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "auditlogs"
        indexes = [
            [("admin_id", -1), ("created_at", -1)],
            [("resource", 1), ("resource_id", 1)],
            [("created_at", -1)],
        ]
