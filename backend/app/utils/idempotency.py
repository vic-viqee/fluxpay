from fastapi import Request, Response, HTTPException
from datetime import datetime, timezone, timedelta
from typing import Optional, Any
import json

from app.models.idempotency_key import IdempotencyKey
from app.models.user import User

async def check_idempotency(request: Request, user: User) -> Optional[Response]:
    idempotency_key = request.headers.get("X-Idempotency-Key")
    if not idempotency_key:
        return None

    # Check if key already exists
    existing = await IdempotencyKey.find_one({
        "key": idempotency_key,
        "owner_id": str(user.id)
    })

    if existing:
        return Response(
            content=json.dumps(existing.response_body),
            status_code=existing.response_code,
            media_type="application/json"
        )
    
    return None

async def save_idempotency(
    key: str, 
    user_id: str, 
    path: str, 
    response_code: int, 
    response_body: dict[str, Any]
):
    # Expire after 24 hours
    expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    
    idempotency = IdempotencyKey(
        key=key,
        owner_id=user_id,
        request_path=path,
        response_code=response_code,
        response_body=response_body,
        expires_at=expires_at
    )
    await idempotency.create()
