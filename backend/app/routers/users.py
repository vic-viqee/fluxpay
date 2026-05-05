from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional

from app.dependencies import get_current_user
from app.models.user import User
from app.utils.logger import logger

router = APIRouter()


@router.get("/me", response_model=dict)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "username": current_user.username,
        "businessName": current_user.business_name,
        "businessType": current_user.business_type,
        "businessPhoneNumber": current_user.business_phone_number,
        "serviceType": current_user.service_type,
        "role": current_user.role,
        "plan": current_user.plan,
        "logoUrl": current_user.logo_url,
        "transactionLimit": current_user.transaction_limit,
        "currentMonthTransactions": current_user.current_month_transactions,
    }


@router.put("/me", response_model=dict)
async def update_current_user_info(
    user_update: dict,
    current_user: User = Depends(get_current_user),
):
    # Filter allowed fields for update
    allowed_fields = [
        "username",
        "businessName",
        "businessType",
        "businessPhoneNumber",
        "kraPin",
        "businessTillOrPaybill",
        "preferredPaymentMethod",
        "businessDescription",
        "plan",
    ]

    update_data = {k: v for k, v in user_update.items() if k in allowed_fields}

    for field, value in update_data.items():
        setattr(current_user, field, value)

    await current_user.save()

    return {
        "id": str(current_user.id),
        "message": "User updated successfully",
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "username": current_user.username,
            "businessName": current_user.business_name,
            "businessType": current_user.business_type,
            "businessPhoneNumber": current_user.business_phone_number,
            "serviceType": current_user.service_type,
            "role": current_user.role,
            "plan": current_user.plan,
            "logoUrl": current_user.logo_url,
        },
    }
