from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timezone
from pymongo import DESCENDING

from app.dependencies import get_current_user
from app.models.user import User
from app.models.gateway_transaction import GatewayTransaction
from app.models.gateway_customer import GatewayCustomer
from app.models.payment_link import PaymentLink
from app.models.c2b_transaction import C2BTransaction
from app.models.reversal import Reversal
from app.services.mpesa import (
    initiate_stk_push,
    register_c2b_urls,
    reverse_transaction,
)
from app.utils.logger import logger
from app.utils.phone import format_kenyan_phone

router = APIRouter()


@router.post("/initiate", response_model=dict)
async def initiate_payment(
    payment_data: dict,
    current_user: User = Depends(get_current_user),
    request: Request, # Inject request to get headers
):
    # Check for idempotency key first
    idempotency_response = await check_idempotency(request, current_user)
    if idempotency_response:
        logger.info(f"Returning cached response for idempotency key: {request.headers.get('X-Idempotency-Key')}")
        return idempotency_response
    
    phone_number = payment_data.get("phoneNumber")
    amount = payment_data.get("amount")
    account_reference = payment_data.get("accountReference")
    transaction_desc = payment_data.get("transactionDesc", "")
    customer_name = payment_data.get("customerName")
    customer_email = payment_data.get("customerEmail")

    if not phone_number or not amount or not account_reference:
        raise HTTPException(
            status_code=400,
            detail="phoneNumber, amount, and accountReference are required",
        )

    formatted_phone = format_kenyan_phone(phone_number)

    # Find or create customer
    customer = None
    if customer_email or formatted_phone:
        if customer_email:
            customer = await GatewayCustomer.find_one(
                (GatewayCustomer.owner_id == current_user.id)
                & (GatewayCustomer.email == customer_email)
            )
        else:
            customer = await GatewayCustomer.find_one(
                (GatewayCustomer.owner_id == current_user.id)
                & (GatewayCustomer.phone_number == formatted_phone)
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
            account_reference=account_reference,
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

        # Update customer stats
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
        
        # Save idempotency response
        idempotency_key = request.headers.get("X-Idempotency-Key")
        if idempotency_key:
            await save_idempotency(
                key=idempotency_key,
                user_id=str(current_user.id),
                path=request.url.path,
                response_code=200, # Assuming 200 OK for successful initiation
                response_body=response_data
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
    query = {"owner_id": current_user.id}

    if status:
        query["status"] = status

    if start_date or end_date:
        query["transaction_date"] = {}
        if start_date:
            query["transaction_date"]["$gte"] = datetime.fromisoformat(start_date)
        if end_date:
            query["transaction_date"]["$lte"] = datetime.fromisoformat(end_date)

    if search:
        query["$or"] = [
            {"phone_number": {"$regex": search, "$options": "i"}},
            {"account_reference": {"$regex": search, "$options": "i"}},
            {"mpesa_receipt_no": {"$regex": search, "$options": "i"}},
        ]

    skip = (page - 1) * limit

    transactions = (
        await GatewayTransaction.find(query)
        .sort([("transaction_date", DESCENDING)])
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    # Populate customer data
    result = []
    for tx in transactions:
        tx_dict = {
            "_id": str(tx.id),
            "id": str(tx.id),
            "amountKes": tx.amount_kes,
            "status": tx.status,
            "phoneNumber": tx.phone_number,
            "accountReference": tx.account_reference,
            "mpesaReceiptNo": tx.mpesa_receipt_no,
            "transactionDate": tx.transaction_date,
            "paymentMethod": tx.payment_method,
            "customerId": None,
        }
        if tx.customer_id:
            customer = await GatewayCustomer.get(tx.customer_id)
            if customer:
                tx_dict["customerId"] = {
                    "id": str(customer.id),
                    "name": customer.name,
                    "phoneNumber": customer.phone_number,
                }
        result.append(tx_dict)

    # Get stats
    pipeline = [
        {"$match": {"owner_id": current_user.id}},
        {
            "$group": {
                "_id": "$status",
                "count": {"$sum": 1},
                "total": {"$sum": "$amount_kes"},
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

    total = await GatewayTransaction.find({"owner_id": current_user.id}).count()

    return {
        "data": result,
        "page": page,
        "totalPages": (total + limit - 1) // limit,
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

    result = {
        "_id": str(transaction.id),
        "id": str(transaction.id),
        "amountKes": transaction.amount_kes,
        "status": transaction.status,
        "phoneNumber": transaction.phone_number,
        "accountReference": transaction.account_reference,
        "mpesaReceiptNo": transaction.mpesa_receipt_no,
        "transactionDate": transaction.transaction_date,
        "failureReason": transaction.failure_reason,
    }

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

    # Today's stats
    today_pipeline = [
        {
            "$match": {
                "owner_id": current_user.id,
                "transaction_date": {"$gte": today_start},
            }
        },
        {
            "$group": {
                "_id": "$status",
                "count": {"$sum": 1},
                "total": {"$sum": "$amount_kes"},
            }
        },
    ]
    today_raw = await GatewayTransaction.aggregate(today_pipeline).to_list()

    today = {
        "success": {"count": 0, "total": 0},
        "pending": {"count": 0, "total": 0},
        "failed": {"count": 0, "total": 0},
    }
    for s in today_raw:
        status_key = s["_id"].lower()
        if status_key in today:
            today[status_key] = {"count": s["count"], "total": s["total"]}

    # This month's stats
    month_start = datetime.now(timezone.utc).replace(
        day=1, hour=0, minute=0, second=0, microsecond=0
    )
    month_pipeline = [
        {
            "$match": {
                "owner_id": current_user.id,
                "transaction_date": {"$gte": month_start},
            }
        },
        {
            "$group": {
                "_id": "$status",
                "count": {"$sum": 1},
                "total": {"$sum": "$amount_kes"},
            }
        },
    ]
    month_raw = await GatewayTransaction.aggregate(month_pipeline).to_list()

    month = {
        "success": {"count": 0, "total": 0},
        "pending": {"count": 0, "total": 0},
        "failed": {"count": 0, "total": 0},
    }
    for s in month_raw:
        status_key = s["_id"].lower()
        if status_key in month:
            month[status_key] = {"count": s["count"], "total": s["total"]}

    # Recent transactions
    recent = (
        await GatewayTransaction.find({"owner_id": current_user.id})
        .sort([("transaction_date", -1)])
        .limit(5)
        .to_list()
    )

    recent_transactions = []
    for tx in recent:
        tx_dict = {
            "_id": str(tx.id),
            "id": str(tx.id),
            "amountKes": tx.amount_kes,
            "status": tx.status,
            "accountReference": tx.account_reference,
            "transactionDate": tx.transaction_date,
            "phoneNumber": tx.phone_number,
            "customerId": None,
        }
        if tx.customer_id:
            customer = await GatewayCustomer.get(tx.customer_id)
            if customer:
                tx_dict["customerId"] = {
                    "name": customer.name,
                    "phoneNumber": customer.phone_number,
                }
        recent_transactions.append(tx_dict)

    # Total customers
    total_customers = await GatewayCustomer.find({"owner_id": current_user.id}).count()

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
    description = payment_link_data.get("description")
    expires_at_str = payment_link_data.get("expiresAt")
    max_uses = payment_link_data.get("maxUses")
    customer_phone = payment_link_data.get("customerPhone")
    customer_email = payment_link_data.get("customerEmail")
    redirect_url = payment_link_data.get("redirectUrl")
    webhook_url = payment_link_data.get("webhookUrl")

    if not title or not amount:
        raise HTTPException(status_code=400, detail="title and amount are required")

    from app.config import get_settings

    settings = get_settings()

    import hashlib

    short_code = hashlib.sha256(
        f"{current_user.id}{title}{datetime.now().timestamp()}".encode()
    ).hexdigest()[:8]

    payment_link_url = f"{settings.frontend_url}/pay/{short_code}"

    expires_at = datetime.fromisoformat(expires_at_str) if expires_at_str else None

    new_link = PaymentLink.model_validate(
        {
            "ownerId": current_user.id,
            "title": title,
            "description": description,
            "amount": float(amount),
            "currency": payment_link_data.get("currency", "KES"),
            "status": "ACTIVE",
            "expiresAt": expires_at,
            "maxUses": max_uses,
            "customerPhone": customer_phone,
            "customerEmail": customer_email,
            "redirectUrl": redirect_url,
            "webhookUrl": webhook_url,
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
    query = {"owner_id": current_user.id}
    if status:
        query["status"] = status

    skip = (page - 1) * limit

    links = (
        await PaymentLink.find(query)
        .sort([("created_at", DESCENDING)])
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    result = []
    for link in links:
        result.append(
            {
                "_id": str(link.id),
                "id": str(link.id),
                "title": link.title,
                "description": link.description,
                "amount": link.amount,
                "currency": link.currency,
                "status": link.status,
                "paymentLink": link.payment_link,
                "currentUses": link.current_uses,
                "maxUses": link.max_uses,
                "expiresAt": link.expires_at,
                "createdAt": link.created_at,
            }
        )

    total = await PaymentLink.find({"owner_id": current_user.id}).count()

    return {
        "data": result,
        "page": page,
        "totalPages": (total + limit - 1) // limit,
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

    logger.info(f"Payment link deleted: {link_id}")

    return {"id": link_id, "message": "Payment link deleted successfully"}


@router.get("/pay/{code}", response_model=dict)
async def get_payment_link_by_code(
    code: str,
):
    # Public endpoint - no authentication required
    link = await PaymentLink.find_one({"payment_link": {"$regex": code}})
    if not link:
        raise HTTPException(status_code=404, detail="Payment link not found")

    if link.status == "EXPIRED" or (
        link.expires_at and link.expires_at < datetime.now(timezone.utc)
    ):
        raise HTTPException(status_code=410, detail="Payment link has expired")

    if link.status == "USED" or (link.max_uses and link.current_uses >= link.max_uses):
        raise HTTPException(
            status_code=410, detail="Payment link has reached maximum uses"
        )

    # Get owner info
    owner = await User.get(link.owner_id)

    return {
        "_id": str(link.id),
        "id": str(link.id),
        "title": link.title,
        "description": link.description,
        "amount": link.amount,
        "currency": link.currency,
        "ownerName": owner.business_name if owner else "FluxPay Merchant",
        "ownerLogo": owner.logo_url if owner else None,
        "paymentLink": link.payment_link,
    }


@router.post("/pay/{code}", response_model=dict)
async def pay_payment_link(
    code: str,
    payment_data: dict,
):
    # Public endpoint - no authentication required
    link = await PaymentLink.find_one({"payment_link": {"$regex": code}})
    if not link:
        raise HTTPException(status_code=404, detail="Payment link not found")

    if link.status == "EXPIRED" or (
        link.expires_at and link.expires_at < datetime.now(timezone.utc)
    ):
        raise HTTPException(status_code=410, detail="Payment link has expired")

    if link.max_uses and link.current_uses >= link.max_uses:
        raise HTTPException(
            status_code=410, detail="Payment link has reached maximum uses"
        )

    phone_number = payment_data.get("phoneNumber")
    if not phone_number:
        raise HTTPException(status_code=400, detail="phoneNumber is required")

    formatted_phone = format_kenyan_phone(phone_number)
    customer_name = payment_data.get("customerName")
    customer_email = payment_data.get("customerEmail")

    # Find or create customer
    customer = None
    if customer_email or formatted_phone:
        if customer_email:
            customer = await GatewayCustomer.find_one(
                (GatewayCustomer.owner_id == link.owner_id)
                & (GatewayCustomer.email == customer_email)
            )
        else:
            customer = await GatewayCustomer.find_one(
                (GatewayCustomer.owner_id == link.owner_id)
                & (GatewayCustomer.phone_number == formatted_phone)
            )

        if not customer:
            customer = GatewayCustomer.model_validate(
                {
                    "ownerId": link.owner_id,
                    "name": customer_name or customer_email.split("@")[0]
                    if customer_email
                    else "Guest",
                    "email": customer_email,
                    "phoneNumber": formatted_phone,
                }
            )
            await customer.create()

    try:
        stk_response = await initiate_stk_push(
            phone_number=formatted_phone,
            amount=link.amount,
            account_reference=code,
            transaction_desc=link.title,
        )

        transaction = GatewayTransaction.model_validate(
            {
                "ownerId": link.owner_id,
                "customerId": customer.id if customer else None,
                "paymentLinkId": link.id,
                "amountKes": link.amount,
                "status": "PENDING",
                "phoneNumber": formatted_phone,
                "accountReference": code,
                "transactionDesc": link.title,
                "paymentMethod": "STK_PUSH",
                "paymentSource": "payment_link",
                "darajaRequestId": stk_response.get("CheckoutRequestID", ""),
                "checkoutRequestId": stk_response.get("CheckoutRequestID", ""),
            }
        )
        await transaction.create()

        # Update link usage
        link.current_uses = (link.current_uses or 0) + 1
        await link.save()

        return {
            "message": "Payment initiated",
            "transactionId": str(transaction.id),
            "checkoutRequestId": stk_response.get("CheckoutRequestID"),
            "status": transaction.status,
        }
    except Exception as e:
        logger.error(f"Payment link payment failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to initiate payment")


@router.get("/customers", response_model=dict)
async def get_customers(
    current_user: User = Depends(get_current_user),
    limit: int = 20,
    page: int = 1,
    search: Optional[str] = None,
):
    query = {"ownerId": current_user.id}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"phoneNumber": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]

    skip = (page - 1) * limit

    customers = (
        await GatewayCustomer.find(query)
        .sort([("lastTransactionDate", -1)])
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    result = []
    for customer in customers:
        result.append(
            {
                "_id": str(customer.id),
                "id": str(customer.id),
                "name": customer.name,
                "email": customer.email,
                "phoneNumber": customer.phone_number,
                "totalTransactions": customer.total_transactions,
                "totalAmount": customer.total_amount,
                "lastTransactionDate": customer.last_transaction_date,
                "notes": customer.notes,
                "tags": customer.tags,
            }
        )

    total = await GatewayCustomer.find({"ownerId": current_user.id}).count()

    return {
        "data": result,
        "page": page,
        "totalPages": (total + limit - 1) // limit if limit > 0 else 1,
        "total": total,
    }


@router.post("/customers", response_model=dict)
async def create_customer(
    customer_data: dict,
    current_user: User = Depends(get_current_user),
):
    name = customer_data.get("name")
    phone_number = customer_data.get("phoneNumber")
    email = customer_data.get("email")

    if not name or not phone_number:
        raise HTTPException(status_code=400, detail="name and phoneNumber are required")

    # Check for existing customer
    existing = await GatewayCustomer.find_one(
        {
            "owner_id": current_user.id,
            "phone_number": phone_number,
        }
    )
    if existing:
        raise HTTPException(
            status_code=409, detail="Customer with this phone number already exists"
        )

    new_customer = GatewayCustomer(
        owner_id=current_user.id,
        name=name,
        email=email,
        phone_number=phone_number,
        notes=customer_data.get("notes"),
        tags=customer_data.get("tags", []),
    )
    await new_customer.create()

    logger.info(f"Customer created: {new_customer.id} - {name}")

    return {
        "_id": str(new_customer.id),
        "id": str(new_customer.id),
        "message": "Customer created successfully",
        "name": new_customer.name,
        "phoneNumber": new_customer.phone_number,
        "email": new_customer.email,
    }


@router.put("/customers/{customer_id}", response_model=dict)
async def update_customer(
    customer_id: str,
    customer_data: dict,
    current_user: User = Depends(get_current_user),
):
    customer = await GatewayCustomer.get(customer_id)
    if not customer or str(customer.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Customer not found")

    update_fields = ["name", "email", "notes", "tags"]
    for field in update_fields:
        if field in customer_data:
            setattr(customer, field, customer_data[field])

    await customer.save()

    logger.info(f"Customer updated: {customer_id}")

    return {
        "id": customer_id,
        "message": "Customer updated successfully",
    }


@router.delete("/customers/{customer_id}", response_model=dict)
async def delete_customer(
    customer_id: str,
    current_user: User = Depends(get_current_user),
):
    customer = await GatewayCustomer.get(customer_id)
    if not customer or str(customer.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Customer not found")

    await customer.delete()

    logger.info(f"Customer deleted: {customer_id}")

    return {"id": customer_id, "message": "Customer deleted successfully"}


@router.post("/callback", response_model=dict)
async def handle_mpesa_callback(
    callback_data: dict,
):
    # Public endpoint for M-Pesa callbacks
    try:
        body = callback_data.get("Body", {})
        stk_callback = body.get("stkCallback", {})

        if not stk_callback:
            return {"ResultCode": 0, "ResultDesc": "Received"}

        checkout_request_id = stk_callback.get("CheckoutRequestID")
        result_code = stk_callback.get("ResultCode")
        result_desc = stk_callback.get("ResultDesc")

        transaction = await GatewayTransaction.find_one(
            {"checkout_request_id": checkout_request_id}
        )

        if not transaction:
            return {"ResultCode": 0, "ResultDesc": "Received"}

        if result_code == 0:
            metadata = stk_callback.get("CallbackMetadata", {}).get("Item", [])
            get_item = lambda name: next(
                (i for i in metadata if i.get("Name") == name), {}
            ).get("Value")

            transaction.status = "SUCCESS"
            transaction.mpesa_receipt_no = get_item("MpesaReceiptNumber")
            transaction.transaction_id = get_item("TransactionId")
            transaction.callback_data = callback_data
        else:
            transaction.status = "FAILED"
            transaction.failure_reason = result_desc
            transaction.callback_data = callback_data

        await transaction.save()

        # Trigger webhook if configured
        if result_code == 0:
            from app.services.webhook import trigger_payment_success

            await trigger_payment_success(
                transaction.owner_id,
                {
                    "transactionId": str(transaction.id),
                    "amount": transaction.amount_kes,
                    "phoneNumber": transaction.phone_number,
                    "status": transaction.status,
                    "mpesaReceiptNo": transaction.mpesa_receipt_no,
                    "timestamp": datetime.now(timezone.utc),
                },
            )

            # Update payment link usage if applicable
            if transaction.payment_link_id:
                link = await PaymentLink.get(transaction.payment_link_id)
                if link:
                    link.current_uses = (link.current_uses or 0) + 1
                    await link.save()

        logger.info(f"M-Pesa callback processed for: {checkout_request_id}")

        return {"ResultCode": 0, "ResultDesc": "Received"}
    except Exception as e:
        logger.error(f"M-Pesa callback error: {e}")
        return {"ResultCode": 0, "ResultDesc": "Received"}


@router.post("/c2b/register", response_model=dict)
async def register_c2b(
    registration_data: dict,
    current_user: User = Depends(get_current_user),
):
    confirmation_url = registration_data.get("confirmationUrl")
    if not confirmation_url:
        raise HTTPException(status_code=400, detail="confirmationUrl is required")

    from app.config import get_settings

    settings = get_settings()

    try:
        result = await register_c2b_urls(
            short_code=settings.mpesa_shortcode,
            callback_url=settings.backend_url,
            confirmation_url=confirmation_url,
        )

        logger.info(f"C2B URLs registered for user: {current_user.email}")

        return {
            "message": "C2B URLs registered successfully",
            "data": result,
        }
    except Exception as e:
        logger.error(f"C2B registration failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to register C2B URLs")


@router.post("/c2b/validate", response_model=dict)
async def handle_c2b_validation(
    validation_data: dict,
):
    # Public endpoint for M-Pesa C2B validation
    try:
        bill_ref_number = validation_data.get("BillRefNumber")
        trans_amount = validation_data.get("TransAmount")

        if not bill_ref_number or not trans_amount:
            return {"ResultCode": 1, "ResultDesc": "Rejected"}

        return {"ResultCode": 0, "ResultDesc": "Accepted"}
    except Exception as e:
        logger.error(f"C2B validation error: {e}")
        return {"ResultCode": 1, "ResultDesc": "Rejected"}


@router.post("/c2b/confirm", response_model=dict)
async def handle_c2b_confirmation(
    confirmation_data: dict,
):
    # Public endpoint for M-Pesa C2B confirmation
    try:
        trans_id = confirmation_data.get("TransID")
        trans_time = confirmation_data.get("TransTime")
        trans_amount = confirmation_data.get("TransAmount")
        business_short_code = confirmation_data.get("BusinessShortCode")
        bill_ref_number = confirmation_data.get("BillRefNumber")
        phone_number = confirmation_data.get("MSISDN")
        first_name = confirmation_data.get("FirstName")
        middle_name = confirmation_data.get("MiddleName")
        last_name = confirmation_data.get("LastName")

        if not trans_id:
            return {"ResultCode": 1, "ResultDesc": "Rejected"}

        # Check if already processed
        existing = await C2BTransaction.find_one({"trans_id": trans_id})
        if existing:
            return {"ResultCode": 0, "ResultDesc": "Already processed"}

        new_transaction = C2BTransaction(
            owner_id=None,  # Would need to map from business_short_code
            transaction_id=f"C2B-{datetime.now().timestamp()}",
            trans_id=trans_id,
            trans_time=trans_time,
            trans_amount=str(trans_amount),
            business_short_code=business_short_code,
            bill_ref_number=bill_ref_number,
            phone_number=phone_number,
            first_name=first_name,
            middle_name=middle_name,
            last_name=last_name,
            status="SUCCESS",
        )
        await new_transaction.create()

        logger.info(f"C2B transaction confirmed: {trans_id}")

        return {"ResultCode": 0, "ResultDesc": "Accepted"}
    except Exception as e:
        logger.error(f"C2B confirmation error: {e}")
        return {"ResultCode": 1, "ResultDesc": "Rejected"}


@router.get("/c2b/transactions", response_model=dict)
async def get_c2b_transactions(
    current_user: User = Depends(get_current_user),
    limit: int = 20,
    page: int = 1,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    reconciled: Optional[str] = None,
):
    query = {"owner_id": current_user.id}

    if reconciled is not None:
        query["is_reconciled"] = reconciled == "true"

    if start_date or end_date:
        query["created_at"] = {}
        if start_date:
            query["created_at"]["$gte"] = datetime.fromisoformat(start_date)
        if end_date:
            query["created_at"]["$lte"] = datetime.fromisoformat(end_date)

    skip = (page - 1) * limit

    transactions = (
        await C2BTransaction.find(query)
        .sort([("created_at", -1)])
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    result = []
    for tx in transactions:
        result.append(
            {
                "_id": str(tx.id),
                "id": str(tx.id),
                "transactionId": tx.transaction_id,
                "transID": tx.trans_id,
                "transTime": tx.trans_time,
                "transAmount": tx.trans_amount,
                "phoneNumber": tx.phone_number,
                "billRefNumber": tx.bill_ref_number,
                "isReconciled": tx.is_reconciled,
                "createdAt": tx.created_at,
            }
        )

    total = await C2BTransaction.find(query).count()

    return {
        "data": result,
        "page": page,
        "totalPages": (total + limit - 1) // limit,
        "total": total,
    }


@router.post("/c2b/transactions/{transaction_id}/reconcile", response_model=dict)
async def reconcile_c2b_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
):
    transaction = await C2BTransaction.get(transaction_id)
    if not transaction or str(transaction.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Transaction not found")

    transaction.is_reconciled = True
    transaction.reconciled_at = datetime.now(timezone.utc)
    await transaction.save()

    logger.info(f"C2B transaction reconciled: {transaction_id}")

    return {"id": transaction_id, "message": "Transaction reconciled successfully"}


@router.post("/reversal", response_model=dict)
async def initiate_reversal(
    reversal_data: dict,
    current_user: User = Depends(get_current_user),
):
    transaction_id = reversal_data.get("transactionId")
    reason = reversal_data.get("reason")

    if not transaction_id or not reason:
        raise HTTPException(
            status_code=400, detail="transactionId and reason are required"
        )

    original_tx = await GatewayTransaction.find_one(
        {
            "_id": transaction_id,
            "owner_id": current_user.id,
        }
    )

    if not original_tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if original_tx.status != "SUCCESS":
        raise HTTPException(
            status_code=400, detail="Can only reverse successful transactions"
        )

    # Check for existing reversal
    existing_reversal = await Reversal.find_one(
        {
            "original_transaction_id": original_tx.id,
            "status": {"$in": ["PENDING", "SUCCESS"]},
        }
    )

    if existing_reversal:
        raise HTTPException(
            status_code=400,
            detail="This transaction already has an active or completed reversal",
        )

    try:
        reversal_result = await reverse_transaction(
            transaction_id=original_tx.mpesa_receipt_no
            or original_tx.daraja_request_id,
            amount=original_tx.amount_kes,
            receiver_party=original_tx.phone_number,
        )

        new_reversal = Reversal(
            owner_id=current_user.id,
            original_transaction_id=original_tx.id,
            reversal_transaction_id=reversal_result.get("conversationId"),
            conversation_id=reversal_result.get("conversationId"),
            amount=original_tx.amount_kes,
            phone_number=original_tx.phone_number,
            mpesa_receipt_no=original_tx.mpesa_receipt_no,
            reason=reason,
            response_code=reversal_result.get("responseCode"),
            response_description=reversal_result.get("responseDescription"),
            status="SUCCESS"
            if reversal_result.get("responseCode") == "0"
            else "FAILED",
        )
        await new_reversal.create()

        logger.info(
            f"Reversal initiated: {new_reversal.id} for transaction: {transaction_id}"
        )

        return {
            "message": "Reversal initiated successfully"
            if new_reversal.status == "SUCCESS"
            else "Reversal request failed",
            "reversal": {
                "id": str(new_reversal.id),
                "status": new_reversal.status,
                "amount": new_reversal.amount,
                "reason": new_reversal.reason,
                "responseDescription": new_reversal.response_description,
            },
        }
    except Exception as e:
        logger.error(f"Reversal failed: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to initiate transaction reversal"
        )


@router.get("/reversal", response_model=dict)
async def get_reversals(
    current_user: User = Depends(get_current_user),
    limit: int = 20,
    page: int = 1,
):
    skip = (page - 1) * limit

    reversals = (
        await Reversal.find({"owner_id": current_user.id})
        .sort([("created_at", -1)])
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    result = []
    for rev in reversals:
        rev_dict = {
            "_id": str(rev.id),
            "id": str(rev.id),
            "status": rev.status,
            "amount": rev.amount,
            "reason": rev.reason,
            "createdAt": rev.created_at,
            "originalTransactionId": str(rev.original_transaction_id),
        }

        # Populate original transaction
        if rev.original_transaction_id:
            tx = await GatewayTransaction.get(rev.original_transaction_id)
            if tx:
                rev_dict["originalTransaction"] = {
                    "id": str(tx.id),
                    "amountKes": tx.amount_kes,
                    "mpesaReceiptNo": tx.mpesa_receipt_no,
                    "phoneNumber": tx.phone_number,
                    "transactionDate": tx.transaction_date,
                }

        result.append(rev_dict)

    total = await Reversal.find({"owner_id": current_user.id}).count()

    return {
        "data": result,
        "page": page,
        "totalPages": (total + limit - 1) // limit,
        "total": total,
    }
