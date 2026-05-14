from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional

from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.common import StandardResponse
from app.utils.logger import logger

router = APIRouter()


@router.get("/me", response_model=StandardResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    return StandardResponse(data=current_user.to_dict())


@router.put("/me", response_model=StandardResponse)
async def update_current_user_info(
    user_update: dict,
    current_user: User = Depends(get_current_user),
):
    # Mapping of camelCase to snake_case for proper attribute update
    field_map = {
        "username": "username",
        "businessName": "business_name",
        "businessType": "business_type",
        "businessPhoneNumber": "business_phone_number",
        "kraPin": "kra_pin",
        "businessTillOrPaybill": "business_till_or_paybill",
        "preferredPaymentMethod": "preferred_payment_method",
        "businessDescription": "business_description",
        "plan": "plan",
    }

    for incoming_field, value in user_update.items():
        if incoming_field in field_map:
            setattr(current_user, field_map[incoming_field], value)

    await current_user.save()

    return StandardResponse(
        message="User updated successfully",
        data=current_user.to_dict()
    )
