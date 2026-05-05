from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from app.dependencies import get_current_user
from app.models.client import Client
from app.models.user import User
from app.schemas.gateway import ClientCreate

router = APIRouter()


@router.post("/")
async def create_client(
    client: ClientCreate,
    current_user: User = Depends(get_current_user),
):
    data = client.model_dump()
    data["owner_id"] = current_user.id
    new_client = Client(**data)
    await new_client.create()
    return {
        "id": str(new_client.id),
        "message": "Client created successfully",
        "client": _serialize_client(new_client),
    }


@router.get("/")
async def get_clients(
    current_user: User = Depends(get_current_user),
):
    clients = await Client.find({"owner_id": current_user.id}).to_list()
    return [_serialize_client(c) for c in clients]


@router.get("/{client_id}")
async def get_client(
    client_id: str,
    current_user: User = Depends(get_current_user),
):
    client = await Client.get(client_id)
    if not client or str(client.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Client not found")
    return _serialize_client(client)


@router.put("/{client_id}")
async def update_client(
    client_id: str,
    client_update: ClientCreate,
    current_user: User = Depends(get_current_user),
):
    client = await Client.get(client_id)
    if not client or str(client.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Client not found")

    update_data = client_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)
    await client.save()

    return {
        "id": str(client.id),
        "message": "Client updated successfully",
        "client": _serialize_client(client),
    }


@router.delete("/{client_id}")
async def delete_client(
    client_id: str,
    current_user: User = Depends(get_current_user),
):
    client = await Client.get(client_id)
    if not client or str(client.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Client not found")

    await client.delete()
    return {"id": client_id, "message": "Client deleted successfully"}


def _serialize_client(client):
    data = client.model_dump()
    data["id"] = str(client.id)
    data["_id"] = str(client.id)
    return data
