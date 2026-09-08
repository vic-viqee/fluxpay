from fastapi import APIRouter, Depends, HTTPException, Header, Request, Response
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from app.models.user import User
from app.models.transaction import Transaction
from app.models.webhook import Webhook
from app.models.webhook_delivery import WebhookDelivery
from app.config import get_settings
from app.services.mpesa import initiate_stk_push, reverse_transaction
from app.services.webhook import (
    verify_api_key,
    find_api_key,
    deliver_webhook,
)
from app.utils.idempotency import check_idempotency, save_idempotency
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
    request: Request,
    body: dict,
    owner: User = Depends(get_api_key_owner),
):
    existing = await check_idempotency(request, owner)
    if existing:
        return existing

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
        account_ref,
        body.get("description") or owner.business_name or "FluxPay",
    )
    checkout_request_id = stk_response.get("CheckoutRequestID", str(uuid.uuid4()))

    transaction = Transaction(
        owner_id=owner.id,
        daraja_request_id=checkout_request_id,
        checkout_request_id=checkout_request_id,
        amount_kes=float(amount),
        status="PENDING",
        phone_number=formatted_phone,
        account_reference=account_ref,
        retry_count=0,
    )
    await transaction.create()

    response_body = StandardResponse(
        message="STK push initiated",
        data={
            "checkoutRequestId": checkout_request_id,
            "amount": transaction.amount_kes,
            "phoneNumber": formatted_phone,
            "reference": account_ref,
            "status": transaction.status,
        }
    ).model_dump()

    idempotency_key = request.headers.get("X-Idempotency-Key")
    if idempotency_key:
        await save_idempotency(
            idempotency_key,
            str(owner.id),
            "/api/v1/payments",
            200,
            response_body,
        )

    return StandardResponse(**response_body)


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


@router.post("/payments/{checkout_request_id}/reverse", response_model=StandardResponse)
async def reverse_third_party_payment(
    checkout_request_id: str,
    body: dict,
    owner: User = Depends(get_api_key_owner),
):
    transaction = await Transaction.find_one(
        Transaction.daraja_request_id == checkout_request_id,
        Transaction.owner_id == owner.id
    )
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if transaction.status != "SUCCESS":
        raise HTTPException(status_code=400, detail="Only successful transactions can be reversed")
    if not transaction.mpesa_receipt_no:
        raise HTTPException(status_code=400, detail="Transaction has no M-Pesa receipt number to reverse")

    settings = get_settings()
    if not settings.mpesa_shortcode:
        raise HTTPException(status_code=503, detail="M-Pesa reversal is not configured")

    initiator_name = body.get("initiatorName") if body else None
    try:
        reversal = await reverse_transaction(
            transaction.mpesa_receipt_no,
            transaction.amount_kes,
            settings.mpesa_shortcode,
            initiator_name=initiator_name,
        )
    except Exception as e:
        logger.error(f"Reversal failed for {checkout_request_id}: {e}")
        raise HTTPException(status_code=502, detail=f"Failed to initiate reversal: {e}")

    return StandardResponse(
        message="Reversal initiated",
        data={
            "checkoutRequestId": checkout_request_id,
            "conversationId": reversal.get("conversationId"),
            "originatorConversationId": reversal.get("originatorConversationId"),
            "responseCode": reversal.get("responseCode"),
            "responseDescription": reversal.get("responseDescription"),
        }
    )


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


@router.post("/webhooks/{webhook_id}/test", response_model=StandardResponse)
async def test_webhook(
    webhook_id: str,
    owner: User = Depends(get_api_key_owner),
):
    webhook = await Webhook.get(webhook_id)
    if not webhook or str(webhook.owner_id) != str(owner.id):
        raise HTTPException(status_code=404, detail="Webhook not found")

    delivery = await deliver_webhook(
        webhook,
        "ping",
        {"message": "This is a test webhook from FluxPay"},
    )

    return StandardResponse(
        data={
            "deliveryId": str(delivery.id),
            "success": delivery.success,
            "statusCode": delivery.response_status,
            "responseBody": delivery.response_body,
            "error": delivery.error,
        }
    )


@router.get("/webhooks/{webhook_id}/deliveries", response_model=StandardResponse[List[dict]])
async def list_webhook_deliveries(
    webhook_id: str,
    limit: int = 20,
    owner: User = Depends(get_api_key_owner),
):
    webhook = await Webhook.get(webhook_id)
    if not webhook or str(webhook.owner_id) != str(owner.id):
        raise HTTPException(status_code=404, detail="Webhook not found")

    limit = max(1, min(limit, 100))
    deliveries = (
        await WebhookDelivery.find(WebhookDelivery.webhook_id == webhook.id)
        .sort([("created_at", -1)])
        .limit(limit)
        .to_list()
    )
    return StandardResponse(data=[d.to_dict() for d in deliveries])


@router.post("/webhooks/{webhook_id}/replay", response_model=StandardResponse)
async def replay_webhook(
    webhook_id: str,
    body: dict,
    owner: User = Depends(get_api_key_owner),
):
    webhook = await Webhook.get(webhook_id)
    if not webhook or str(webhook.owner_id) != str(owner.id):
        raise HTTPException(status_code=404, detail="Webhook not found")

    delivery_id = body.get("deliveryId") if body else None
    if delivery_id:
        delivery = await WebhookDelivery.get(delivery_id)
        if not delivery or str(delivery.webhook_id) != str(webhook.id):
            raise HTTPException(status_code=404, detail="Delivery not found")
    else:
        delivery = (
            await WebhookDelivery.find(WebhookDelivery.webhook_id == webhook.id)
            .sort([("created_at", -1)])
            .first_or_none()
        )
        if not delivery:
            raise HTTPException(status_code=400, detail="No prior deliveries to replay")

    new_delivery = await deliver_webhook(
        webhook,
        delivery.event,
        delivery.payload,
    )

    return StandardResponse(
        data={
            "deliveryId": str(new_delivery.id),
            "event": new_delivery.event,
            "success": new_delivery.success,
            "statusCode": new_delivery.response_status,
            "responseBody": new_delivery.response_body,
            "error": new_delivery.error,
        }
    )


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