from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Request,
    UploadFile,
    File,
    Form,
)
from typing import Optional
from pathlib import Path
import uuid

from app.dependencies import get_current_user
from app.models.user import User
from app.utils.logger import logger
from app.utils.uploads import resolve_uploads_dir
from app.config import get_settings

router = APIRouter()


@router.get("/", response_model=dict)
async def get_user_settings(
    current_user: User = Depends(get_current_user),
):
    return {
        "businessName": current_user.business_name or "",
        "businessType": current_user.business_type or "",
        "kraPin": current_user.kra_pin or "",
        "businessTillOrPaybill": current_user.business_till_or_paybill or "",
        "businessPhoneNumber": current_user.business_phone_number or "",
        "preferredPaymentMethod": current_user.preferred_payment_method
        or "M-Pesa STK Push",
        "businessDescription": current_user.business_description or "",
        "logoUrl": current_user.logo_url or "",
        "plan": current_user.plan or "",
        "email": current_user.email,
        "username": current_user.username or "",
        "serviceType": current_user.service_type or "both",
    }


@router.put("/", response_model=dict)
async def update_settings(
    request: Request,
    current_user: User = Depends(get_current_user),
):
    settings = get_settings()
    form = await request.form()
    update_map = {
        "username": "username",
        "businessName": "business_name",
        "businessType": "business_type",
        "kraPin": "kra_pin",
        "businessTillOrPaybill": "business_till_or_paybill",
        "businessPhoneNumber": "business_phone_number",
        "preferredPaymentMethod": "preferred_payment_method",
        "businessDescription": "business_description",
        "serviceType": "service_type",
        "plan": "plan",
    }

    updated_any = False
    for incoming, attr in update_map.items():
        if incoming in form:
            setattr(current_user, attr, form.get(incoming))
            updated_any = True

    logo = form.get("logo")
    if hasattr(logo, "filename") and getattr(logo, "filename", ""):
        file_extension = Path(logo.filename).suffix
        filename = f"{uuid.uuid4()}{file_extension}"
        uploads_dir = resolve_uploads_dir()
        file_path = uploads_dir / filename
        with open(file_path, "wb") as buffer:
            buffer.write(await logo.read())
        current_user.logo_url = f"{settings.backend_url}/uploads/{filename}"
        updated_any = True

    if not updated_any:
        raise HTTPException(
            status_code=400, detail="No valid settings fields provided."
        )

    await current_user.save()

    return {
        "message": "User settings updated successfully",
        "settings": await get_user_settings(current_user),
    }
