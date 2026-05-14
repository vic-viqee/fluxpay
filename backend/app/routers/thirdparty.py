from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from app.dependencies import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.models.webhook import Webhook
from app.services.mpesa import initiate_stk_push
from app.services.webhook import verify_api_key, find_api_key
from app.utils.phone import is_valid_mpesa_phone, format_kenyan_phone
from app.utils.logger import logger
from app.schemas.common import StandardResponse

router = APIRouter()


async def get_api_key_owner(
    x_api_key: Optional[str] = Header(default=None, alias="X-API-Key"),
    x_api_secret: Optional[str] = Header(default=None, alias="X-API-Secret"),
) -> User:
    if not x_api_key or not x_api_secret:
        raise HTTPException(status_code=401, detail="API key authentication failed")
    if not await verify_api_key(x_api_key, x_api_secret):
        raise HTTPException(status_code=401, detail="API key authentication failed")
    match = await find_api_key(x_api_key)
    if not match:
        raise HTTPException(status_code=401, detail="API key authentication failed")
    user = await User.get(match["owner_id"])
    if not user:
        raise HTTPException(status_code=404, detail="Business not found")
    return user


@router.post("/payments", response_model=StandardResponse)
async def initiate_third_party_payment(
    body: dict,
    owner: User = Depends(get_api_key_owner),
):
    amount = body.get("amount")
    phone_number = body.get("phoneNumber")
    reference = body.get("reference")

    if not amount or not phone_number:
        raise HTTPException(status_code=400, detail="amount and phoneNumber are required")

    phone_validation = is_valid_mpesa_phone(phone_number)
    if not phone_validation["isValid"]:
        raise HTTPException(status_code=400, detail=phone_validation["message"])

    formatted_phone = format_kenyan_phone(phone_number)
    account_ref = reference or f"TXN-{int(datetime.now(timezone.utc).timestamp())}"

    stk_response = await initiate_stk_push(
        formatted_phone,
        float(amount),
        owner.business_name or "FluxPay",
        body.get("description") or owner.business_name or "FluxPay",
    )

    transaction = Transaction(
        owner_id=owner.id,
        daraja_request_id=stk_response.get("CheckoutRequestID", str(uuid.uuid4())),
        amount_kes=float(amount),
        status="PENDING",
        retry_count=0,
    )
    await transaction.create()

    return StandardResponse(
        message="STK push initiated",
        data={
            "checkoutRequestId": transaction.daraja_request_id,
            "amount": transaction.amount_kes,
            "phoneNumber": formatted_phone,
            "reference": account_ref,
            "status": transaction.status,
        }
    )


@router.get("/payments/{checkout_request_id}", response_model=StandardResponse)
async def get_transaction_status(
    checkout_request_id: str,
    owner: User = Depends(get_api_key_owner),
):
    transaction = await Transaction.find_one(
        Transaction.daraja_request_id == checkout_request_id,
        Transaction.owner_id == owner.id
    )
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return StandardResponse(data=transaction.to_dict())


@router.post("/webhooks", response_model=StandardResponse)
async def register_webhook(
    body: dict,
    owner: User = Depends(get_api_key_owner),
):
    url = body.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="Webhook URL is required")

    secret = uuid.uuid4().hex + uuid.uuid4().hex
    webhook = Webhook(
        owner_id=owner.id,
        name=body.get("name"),
        url=url,
        secret=secret,
        events=body.get("events") or ["payment.success", "payment.failed"],
    )
    await webhook.create()
    
    return StandardResponse(
        message="Webhook registered successfully",
        data=webhook.to_dict()
    )


@router.get("/webhooks", response_model=StandardResponse[List[dict]])
async def list_webhooks(
    owner: User = Depends(get_api_key_owner),
):
    webhooks = (
        await Webhook.find(Webhook.owner_id == owner.id)
        .sort([("created_at", -1)])
        .to_list()
    )
    return StandardResponse(
        data=[w.to_dict() for w in webhooks]
    )


@router.delete("/webhooks/{webhook_id}", response_model=StandardResponse)
async def delete_webhook(
    webhook_id: str,
    owner: User = Depends(get_api_key_owner),
):
    webhook = await Webhook.get(webhook_id)
    if not webhook or str(webhook.owner_id) != str(owner.id):
        raise HTTPException(status_code=404, detail="Webhook not found")
    await webhook.delete()
    return StandardResponse(message="Webhook deleted successfully", data={"id": webhook_id})


@router.get("/business", response_model=StandardResponse)
async def get_business_info(
    owner: User = Depends(get_api_key_owner),
):
    return StandardResponse(
        data={
            "businessName": owner.business_name,
            "businessType": owner.business_type,
            "businessPhoneNumber": owner.business_phone_number,
        }
    )
