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


@router.post("/payments", response_model=dict)
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

    return {
        "success": True,
        "message": "STK push initiated",
        "data": {
            "checkoutRequestId": transaction.daraja_request_id,
            "amount": transaction.amount_kes,
            "phoneNumber": formatted_phone,
            "reference": account_ref,
            "status": transaction.status,
        },
    }


@router.get("/payments/{checkout_request_id}", response_model=dict)
async def get_transaction_status(
    checkout_request_id: str,
    owner: User = Depends(get_api_key_owner),
):
    transaction = await Transaction.find_one(
        {"daraja_request_id": checkout_request_id, "owner_id": owner.id}
    )
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {
        "data": {
            "checkoutRequestId": transaction.daraja_request_id,
            "amount": transaction.amount_kes,
            "status": transaction.status,
            "mpesaReceiptNo": transaction.mpesa_receipt_no,
            "createdAt": transaction.created_at,
            "updatedAt": transaction.updated_at,
        }
    }


@router.post("/webhooks", response_model=dict)
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
    return {
        "message": "Webhook registered successfully",
        "data": {
            "_id": str(webhook.id),
            "id": str(webhook.id),
            "name": webhook.name,
            "url": webhook.url,
            "events": webhook.events,
            "secret": webhook.secret,
            "isActive": webhook.is_active,
        },
    }


@router.get("/webhooks", response_model=dict)
async def list_webhooks(
    owner: User = Depends(get_api_key_owner),
):
    webhooks = (
        await Webhook.find({"owner_id": owner.id})
        .sort([("created_at", -1)])
        .to_list()
    )
    return {
        "data": [
            {
                "_id": str(webhook.id),
                "id": str(webhook.id),
                "name": webhook.name,
                "url": webhook.url,
                "events": webhook.events,
                "isActive": webhook.is_active,
                "lastTriggeredAt": webhook.last_triggered_at,
                "failureCount": webhook.failure_count,
                "createdAt": webhook.created_at,
            }
            for webhook in webhooks
        ]
    }


@router.delete("/webhooks/{webhook_id}", response_model=dict)
async def delete_webhook(
    webhook_id: str,
    owner: User = Depends(get_api_key_owner),
):
    webhook = await Webhook.get(webhook_id)
    if not webhook or str(webhook.owner_id) != str(owner.id):
        raise HTTPException(status_code=404, detail="Webhook not found")
    await webhook.delete()
    return {"message": "Webhook deleted successfully"}


@router.get("/business", response_model=dict)
async def get_business_info(
    owner: User = Depends(get_api_key_owner),
):
    return {
        "data": {
            "businessName": owner.business_name,
            "businessType": owner.business_type,
            "businessPhoneNumber": owner.business_phone_number,
        }
    }
