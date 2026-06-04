from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import Any, List, Optional
from datetime import datetime, timezone
from beanie import PydanticObjectId
from pymongo import DESCENDING

from app.dependencies import get_current_user
from app.models.user import User
from app.models.gateway_transaction import GatewayTransaction
from app.models.gateway_customer import GatewayCustomer
from app.models.payment_link import PaymentLink
from app.models.c2b_transaction import C2BTransaction
from app.models.reversal import Reversal
from app.models.webhook import Webhook
from app.services.mpesa import (
    initiate_stk_push,
    register_c2b_urls,
    reverse_transaction,
)
from app.services.webhook import forward_webhook
from app.utils.logger import logger
from app.utils.phone import format_kenyan_phone
from app.utils.idempotency import check_idempotency, save_idempotency

router = APIRouter()


@router.post("/initiate", response_model=dict)
async def initiate_payment(
    payment_data: dict,
    request: Request,
    current_user: User = Depends(get_current_user),
):
    idempotency_response = await check_idempotency(request, current_user)
    if idempotency_response:
        logger.info(
            f"Returning cached response for idempotency key: {request.headers.get('X-Idempotency-Key')}"
        )
        return idempotency_response

    phone_number = payment_data.get("phoneNumber")
    amount = payment_data.get("amount")
    account_reference = payment_data.get("accountReference")
    transaction_desc = payment_data.get("transactionDesc", "")
    customer_name = payment_data.get("customerName")
    customer_email = payment_data.get("customerEmail")

    if not phone_number or not amount or account_reference is None:
        raise HTTPException(
            status_code=400,
            detail="phoneNumber, amount, and accountReference are required",
        )

    formatted_phone = format_kenyan_phone(phone_number)

    customer = None
    if customer_email or formatted_phone:
        if customer_email:
            customer = await GatewayCustomer.find_one(
                GatewayCustomer.owner_id == current_user.id,
                GatewayCustomer.email == customer_email
            )
        else:
            customer = await GatewayCustomer.find_one(
                GatewayCustomer.owner_id == current_user.id,
                GatewayCustomer.phone_number == formatted_phone
            )

        if not customer and (customer_name or customer_email):
            customer = GatewayCustomer.model_validate(
                {
                    "ownerId": current_user.id,
                    "name": customer_name or customer_email.split("@")[0]
                    if customer_email
                    else "Unknown",
                    "email": customer_email,
                    "phoneNumber": formatted_phone,
                }
            )
            await customer.create()

    try:
        stk_response = await initiate_stk_push(
            phone_number=formatted_phone,
            amount=float(amount),
            account_reference=account_reference
            or current_user.business_name
            or "FluxPay",
            transaction_desc=transaction_desc
            or current_user.business_name
            or "FluxPay",
        )

        transaction = GatewayTransaction.model_validate(
            {
                "ownerId": current_user.id,
                "customerId": customer.id if customer else None,
                "paymentLinkId": None,
                "amountKes": float(amount),
                "status": "PENDING",
                "phoneNumber": formatted_phone,
                "accountReference": account_reference,
                "transactionDesc": transaction_desc,
                "paymentMethod": "STK_PUSH",
                "paymentSource": "gateway_api",
                "darajaRequestId": stk_response.get("CheckoutRequestID", ""),
                "checkoutRequestId": stk_response.get("CheckoutRequestID", ""),
            }
        )
        await transaction.create()

        if customer:
            customer.total_transactions = (customer.total_transactions or 0) + 1
            customer.total_amount = (customer.total_amount or 0) + float(amount)
            customer.last_transaction_date = datetime.now(timezone.utc)
            await customer.save()

        logger.info(f"Payment initiated: {transaction.id} for {formatted_phone}")

        response_data = {
            "message": "Payment initiated",
            "transactionId": str(transaction.id),
            "checkoutRequestId": stk_response.get("CheckoutRequestID"),
            "status": transaction.status,
        }

        idempotency_key = request.headers.get("X-Idempotency-Key")
        if idempotency_key:
            await save_idempotency(
                key=idempotency_key,
                user_id=str(current_user.id),
                path=request.url.path,
                response_code=200,
                response_body=response_data,
            )

        return response_data
    except Exception as e:
        logger.error(f"Payment initiation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to initiate payment")


@router.get("/transactions", response_model=dict)
async def get_transactions(
    current_user: User = Depends(get_current_user),
    limit: int = 20,
    page: int = 1,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    search: Optional[str] = None,
):
    query = GatewayTransaction.owner_id == current_user.id
    if status:
        query &= GatewayTransaction.status == status

    if start_date:
        query &= GatewayTransaction.transaction_date >= datetime.fromisoformat(start_date)
    if end_date:
        query &= GatewayTransaction.transaction_date <= datetime.fromisoformat(end_date)

    if search:
        query &= (
            (GatewayTransaction.phone_number.match(search, options="i"))
            | (GatewayTransaction.account_reference.match(search, options="i"))
            | (GatewayTransaction.mpesa_receipt_no.match(search, options="i"))
        )

    skip = (page - 1) * limit

    transactions = (
        await GatewayTransaction.find(query)
        .sort([("transactionDate", DESCENDING)])
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    result = []
    for tx in transactions:
        tx_dict = tx.model_dump(by_alias=True)
        tx_dict["id"] = str(tx.id)
        tx_dict["_id"] = str(tx.id)
        tx_dict["customerId"] = None

        if tx.customer_id:
            customer = await GatewayCustomer.get(tx.customer_id)
            if customer:
                tx_dict["customerId"] = {
                    "id": str(customer.id),
                    "name": customer.name,
                    "phoneNumber": customer.phone_number,
                }
        result.append(tx_dict)

    pipeline = [
        {"$match": {"ownerId": current_user.id}},
        {
            "$group": {
                "_id": "$status",
                "count": {"$sum": 1},
                "total": {"$sum": "$amountKes"},
            }
        },
    ]
    stats_raw = await GatewayTransaction.aggregate(pipeline).to_list()

    stats = {
        "success": {"count": 0, "total": 0},
        "pending": {"count": 0, "total": 0},
        "failed": {"count": 0, "total": 0},
    }
    for s in stats_raw:
        status_key = s["_id"].lower()
        if status_key in stats:
            stats[status_key] = {"count": s["count"], "total": s["total"]}

    total = await GatewayTransaction.find(GatewayTransaction.owner_id == current_user.id).count()

    return {
        "data": result,
        "page": page,
        "totalPages": (total + limit - 1) // limit if limit > 0 else 1,
        "total": total,
        "stats": stats,
    }


@router.get("/transactions/{transaction_id}", response_model=dict)
async def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
):
    transaction = await GatewayTransaction.get(transaction_id)
    if not transaction or str(transaction.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Transaction not found")

    result = transaction.model_dump(by_alias=True)
    result["id"] = str(transaction.id)
    result["_id"] = str(transaction.id)

    if transaction.customer_id:
        customer = await GatewayCustomer.get(transaction.customer_id)
        if customer:
            result["customerId"] = {
                "name": customer.name,
                "phoneNumber": customer.phone_number,
                "email": customer.email,
            }

    return result


@router.get("/dashboard", response_model=dict)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
):
    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )

    today_pipeline = [
        {"$match": {"ownerId": current_user.id, "transactionDate": {"$gte": today_start}}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}, "total": {"$sum": "$amountKes"}}},
    ]
    today_raw = await GatewayTransaction.aggregate(today_pipeline).to_list()

    today = {"success": {"count": 0, "total": 0}, "pending": {"count": 0, "total": 0}, "failed": {"count": 0, "total": 0}}
    for s in today_raw:
        status_key = s["_id"].lower()
        if status_key in today:
            today[status_key] = {"count": s["count"], "total": s["total"]}

    month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_pipeline = [
        {"$match": {"ownerId": current_user.id, "transactionDate": {"$gte": month_start}}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}, "total": {"$sum": "$amountKes"}}},
    ]
    month_raw = await GatewayTransaction.aggregate(month_pipeline).to_list()

    month = {"success": {"count": 0, "total": 0}, "pending": {"count": 0, "total": 0}, "failed": {"count": 0, "total": 0}}
    for s in month_raw:
        status_key = s["_id"].lower()
        if status_key in month:
            month[status_key] = {"count": s["count"], "total": s["total"]}

    recent = (
        await GatewayTransaction.find(GatewayTransaction.owner_id == current_user.id)
        .sort([("transactionDate", -1)])
        .limit(5)
        .to_list()
    )

    recent_transactions = []
    for tx in recent:
        tx_dict = tx.model_dump(by_alias=True)
        tx_dict["id"] = str(tx.id)
        tx_dict["_id"] = str(tx.id)
        tx_dict["customerId"] = None

        if tx.customer_id:
            customer = await GatewayCustomer.get(tx.customer_id)
            if customer:
                tx_dict["customerId"] = {"name": customer.name, "phoneNumber": customer.phone_number}
        recent_transactions.append(tx_dict)

    total_customers = await GatewayCustomer.find(GatewayCustomer.owner_id == current_user.id).count()

    return {
        "today": today,
        "month": month,
        "recentTransactions": recent_transactions,
        "totalCustomers": total_customers,
        "customerCount": total_customers,
    }


@router.post("/payment-links", response_model=dict)
async def create_payment_link(
    payment_link_data: dict,
    current_user: User = Depends(get_current_user),
):
    title = payment_link_data.get("title")
    amount = payment_link_data.get("amount")
    
    if not title or not amount:
        raise HTTPException(status_code=400, detail="title and amount are required")

    from app.config import get_settings
    settings = get_settings()
    import hashlib
    
    short_code = hashlib.sha256(
        f"{current_user.id}{title}{datetime.now().timestamp()}".encode()
    ).hexdigest()[:8]

    payment_link_url = f"{settings.frontend_url}/pay/{short_code}"
    expires_at = datetime.fromisoformat(payment_link_data.get("expiresAt")) if payment_link_data.get("expiresAt") else None

    new_link = PaymentLink.model_validate(
        {
            "ownerId": current_user.id,
            "title": title,
            "description": payment_link_data.get("description"),
            "amount": float(amount),
            "currency": payment_link_data.get("currency", "KES"),
            "status": "ACTIVE",
            "expiresAt": expires_at,
            "maxUses": payment_link_data.get("maxUses"),
            "customerPhone": payment_link_data.get("customerPhone"),
            "customerEmail": payment_link_data.get("customerEmail"),
            "redirectUrl": payment_link_data.get("redirectUrl"),
            "webhookUrl": payment_link_data.get("webhookUrl"),
            "paymentLink": payment_link_url,
        }
    )
    await new_link.create()

    logger.info(f"Payment link created: {new_link.id} - {title}")

    return {
        "_id": str(new_link.id),
        "id": str(new_link.id),
        "message": "Payment link created successfully",
        "paymentLink": payment_link_url,
        "title": new_link.title,
        "amount": new_link.amount,
    }


@router.get("/payment-links", response_model=dict)
async def get_payment_links(
    current_user: User = Depends(get_current_user),
    limit: int = 20,
    page: int = 1,
    status: Optional[str] = None,
):
    query = PaymentLink.owner_id == current_user.id
    if status:
        query &= PaymentLink.status == status

    skip = (page - 1) * limit
    links = await PaymentLink.find(query).sort([("createdAt", DESCENDING)]).skip(skip).limit(limit).to_list()

    result = [link.model_dump(by_alias=True) | {"id": str(link.id), "_id": str(link.id)} for link in links]
    total = await PaymentLink.find(PaymentLink.owner_id == current_user.id).count()

    return {
        "data": result,
        "page": page,
        "totalPages": (total + limit - 1) // limit if limit > 0 else 1,
        "total": total,
    }


@router.delete("/payment-links/{link_id}", response_model=dict)
async def delete_payment_link(
    link_id: str,
    current_user: User = Depends(get_current_user),
):
    link = await PaymentLink.get(link_id)
    if not link or str(link.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Payment link not found")

    await link.delete()
    return {"id": link_id, "message": "Payment link deleted successfully"}


@router.get("/webhooks", response_model=dict)
async def list_webhooks(
    current_user: User = Depends(get_current_user),
):
    webhooks = (
        await Webhook.find(Webhook.owner_id == current_user.id)
        .sort([("created_at", -1)])
        .to_list()
    )
    return {
        "data": [
            {
                "id": str(w.id),
                "_id": str(w.id),
                "name": w.name,
                "url": w.url,
                "events": w.events,
                "isActive": w.is_active,
                "secret": w.secret,
                "lastTriggeredAt": w.last_triggered_at.isoformat() if w.last_triggered_at else None,
                "failureCount": w.failure_count,
                "createdAt": w.created_at.isoformat(),
            }
            for w in webhooks
        ]
    }


@router.post("/webhooks", response_model=dict)
async def create_webhook(
    body: dict,
    current_user: User = Depends(get_current_user),
):
    url = body.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="Webhook URL is required")

    import uuid
    secret = uuid.uuid4().hex + uuid.uuid4().hex
    webhook = Webhook(
        owner_id=current_user.id,
        name=body.get("name"),
        url=url,
        secret=secret,
        events=body.get("events") or ["payment.success", "payment.failed"],
    )
    await webhook.create()

    return {
        "message": "Webhook created successfully",
        "data": {
            "id": str(webhook.id),
            "_id": str(webhook.id),
            "name": webhook.name,
            "url": webhook.url,
            "events": webhook.events,
            "isActive": webhook.is_active,
            "secret": webhook.secret,
        }
    }


@router.patch("/webhooks/{webhook_id}", response_model=dict)
async def update_webhook(
    webhook_id: str,
    body: dict,
    current_user: User = Depends(get_current_user),
):
    webhook = await Webhook.get(webhook_id)
    if not webhook or str(webhook.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Webhook not found")

    if "url" in body:
        webhook.url = body["url"]
    if "name" in body:
        webhook.name = body["name"]
    if "events" in body:
        webhook.events = body["events"]
    if "isActive" in body:
        webhook.is_active = body["isActive"]

    webhook.updated_at = datetime.now(timezone.utc)
    await webhook.save()

    return {
        "message": "Webhook updated successfully",
        "data": {
            "id": str(webhook.id),
            "url": webhook.url,
            "events": webhook.events,
            "isActive": webhook.is_active,
        }
    }


@router.delete("/webhooks/{webhook_id}", response_model=dict)
async def delete_webhook(
    webhook_id: str,
    current_user: User = Depends(get_current_user),
):
    webhook = await Webhook.get(webhook_id)
    if not webhook or str(webhook.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Webhook not found")

    await webhook.delete()
    return {"message": "Webhook deleted successfully", "data": {"id": webhook_id}}


@router.post("/webhooks/{webhook_id}/test", response_model=dict)
async def test_webhook(
    webhook_id: str,
    current_user: User = Depends(get_current_user),
):
    webhook = await Webhook.get(webhook_id)
    if not webhook or str(webhook.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Webhook not found")

    payload = {
        "event": "ping",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": {"message": "This is a test webhook from FluxPay"},
    }

    from app.services.webhook import sign_payload
    import json, httpx

    payload_string = json.dumps(payload)
    signature = sign_payload(payload_string, webhook.secret)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                webhook.url,
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "X-Webhook-Signature": signature,
                    "X-Webhook-Event": "ping",
                },
                timeout=30,
            )

        webhook.last_triggered_at = datetime.now(timezone.utc)
        webhook.failure_count = 0
        await webhook.save()

        return {
            "status": "delivered",
            "statusCode": response.status_code,
        }
    except Exception as e:
        webhook.failure_count = (webhook.failure_count or 0) + 1
        await webhook.save()

        return {
            "status": "failed",
            "error": str(e),
        }


@router.post("/webhooks/{webhook_id}/rotate-secret", response_model=dict)
async def rotate_webhook_secret(
    webhook_id: str,
    current_user: User = Depends(get_current_user),
):
    webhook = await Webhook.get(webhook_id)
    if not webhook or str(webhook.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Webhook not found")

    import uuid
    webhook.secret = uuid.uuid4().hex + uuid.uuid4().hex
    webhook.updated_at = datetime.now(timezone.utc)
    await webhook.save()

    return {
        "message": "Webhook secret rotated successfully",
        "data": {
            "id": str(webhook.id),
            "secret": webhook.secret,
        }
    }
