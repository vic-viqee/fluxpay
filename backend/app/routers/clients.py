from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from app.dependencies import get_current_user
from app.models.client import Client
from app.models.user import User
from app.schemas.gateway import ClientCreate
from app.schemas.common import StandardResponse

router = APIRouter()


@router.post("/", response_model=StandardResponse)
async def create_client(
    client: ClientCreate,
    current_user: User = Depends(get_current_user),
):
    data = client.model_dump()
    data["owner_id"] = current_user.id
    new_client = Client(**data)
    await new_client.create()
    return StandardResponse(
        message="Client created successfully",
        data=new_client.to_dict()
    )


@router.get("/", response_model=StandardResponse[List[dict]])
async def get_clients(
    current_user: User = Depends(get_current_user),
):
    clients = await Client.find(Client.owner_id == current_user.id).to_list()
    return StandardResponse(data=[c.to_dict() for c in clients])


@router.get("/{client_id}", response_model=StandardResponse)
async def get_client(
    client_id: str,
    current_user: User = Depends(get_current_user),
):
    client = await Client.get(client_id)
    if not client or str(client.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Client not found")
    return StandardResponse(data=client.to_dict())


@router.put("/{client_id}", response_model=StandardResponse)
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

    return StandardResponse(
        message="Client updated successfully",
        data=client.to_dict()
    )


@router.get("/phone/{phone_number}", response_model=StandardResponse)
async def get_client_by_phone(
    phone_number: str,
    current_user: User = Depends(get_current_user),
):
    client = await Client.find_one(
        Client.owner_id == current_user.id,
        Client.phone_number == phone_number
    )
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return StandardResponse(data=client.to_dict())


@router.delete("/{client_id}", response_model=StandardResponse)
async def delete_client(
    client_id: str,
    current_user: User = Depends(get_current_user),
):
    client = await Client.get(client_id)
    if not client or str(client.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Client not found")

    await client.delete()
    return StandardResponse(
        message="Client deleted successfully",
        data={"id": client_id}
    )
