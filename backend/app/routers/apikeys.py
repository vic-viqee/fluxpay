from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import uuid

from app.dependencies import get_current_user
from app.models.api_key import ApiKey
from app.models.user import User
from app.utils.password import hash_password, verify_password
from app.schemas.common import StandardResponse
from app.utils.logger import logger

router = APIRouter()


@router.post("/", response_model=StandardResponse)
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

    # We return the raw secret ONLY at creation time
    data = new_api_key.to_dict()
    data["secret"] = api_secret

    return StandardResponse(
        message="API key created successfully. Save the secret now - it cannot be retrieved later.",
        data=data
    )


@router.get("/", response_model=StandardResponse[List[dict]])
async def get_api_keys(
    current_user: User = Depends(get_current_user),
):
    api_keys = await ApiKey.find(
        ApiKey.owner_id == current_user.id, ApiKey.is_active == True
    ).to_list()
    
    return StandardResponse(data=[key.to_dict() for key in api_keys])


@router.patch("/{key_id}/revoke", response_model=StandardResponse)
async def revoke_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
):
    api_key = await ApiKey.get(key_id)
    if not api_key or str(api_key.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="API key not found")

    api_key.is_active = False
    await api_key.save()

    return StandardResponse(message="API key revoked successfully")


@router.delete("/{key_id}", response_model=StandardResponse)
async def delete_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
):
    api_key = await ApiKey.get(key_id)
    if not api_key or str(api_key.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="API key not found")

    await api_key.delete()

    return StandardResponse(
        message="API key deleted successfully",
        data={"id": key_id}
    )
