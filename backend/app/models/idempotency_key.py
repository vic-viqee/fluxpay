from datetime import datetime, timezone
from typing import Optional, Any
from beanie import Document
from pydantic import Field


class IdempotencyKey(Document):
    key: str
    owner_id: str
    request_path: str
    response_code: int
    response_body: dict[str, Any]
    expires_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "idempotency_keys"
        indexes = [
            "key",
            "owner_id",
            [("expires_at", 1)],
        ]
