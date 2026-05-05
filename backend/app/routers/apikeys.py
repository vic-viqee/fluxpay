from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import uuid

from app.dependencies import get_current_user
from app.models.api_key import ApiKey
from app.models.user import User
from app.utils.password import hash_password, verify_password
from app.utils.logger import logger

router = APIRouter()


@router.post("/", response_model=dict)
async def create_api_key(
    current_user: User = Depends(get_current_user),
    body: dict = None,
):
    name = body.get("name") if body else None

    api_key = f"fpk_{uuid.uuid4().hex[:16]}"
    api_secret = str(uuid.uuid4())

    hashed_secret = hash_password(api_secret)

    new_api_key = ApiKey(
        key=api_key,
        secret=hashed_secret,
        name=name or f"API Key {datetime.now(timezone.utc).strftime('%Y-%m-%d')}",
        owner_id=current_user.id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=365),
    )
    await new_api_key.create()

    return {
        "message": "API key created successfully. Save the secret now - it cannot be retrieved later.",
        "data": {
            "_id": str(new_api_key.id),
            "id": str(new_api_key.id),
            "key": new_api_key.key,
            "secret": api_secret,
            "name": new_api_key.name,
            "isActive": new_api_key.is_active,
            "createdAt": new_api_key.created_at.isoformat(),
        },
    }


@router.get("/", response_model=dict)
async def get_api_keys(
    current_user: User = Depends(get_current_user),
):
    api_keys = await ApiKey.find(
        {"ownerId": current_user.id, "isActive": True}
    ).to_list()
    return {
        "data": [
            {
                "_id": str(key.id),
                "id": str(key.id),
                "name": key.name,
                "key": key.key,
                "createdAt": key.created_at.isoformat() if key.created_at else None,
                "expiresAt": key.expires_at.isoformat() if key.expires_at else None,
                "lastUsedAt": key.last_used_at.isoformat()
                if key.last_used_at
                else None,
                "isActive": key.is_active,
            }
            for key in api_keys
        ]
    }


@router.patch("/{key_id}/revoke", response_model=dict)
async def revoke_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
):
    api_key = await ApiKey.get(key_id)
    if not api_key or str(api_key.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="API key not found")

    api_key.is_active = False
    await api_key.save()

    return {"message": "API key revoked successfully"}


@router.delete("/{key_id}", response_model=dict)
async def delete_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
):
    api_key = await ApiKey.get(key_id)
    if not api_key or str(api_key.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="API key not found")

    await api_key.delete()

    return {"id": key_id, "message": "API key deleted successfully"}
