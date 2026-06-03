from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import Optional
from datetime import datetime, timezone, timedelta
from jose import jwt
from pydantic import BaseModel, EmailStr
from pymongo import DESCENDING

from app.dependencies import get_current_portal_user
from app.config import get_settings
from app.models.portal_user import PortalUser
from app.models.client import Client
from app.models.subscription import Subscription
from app.models.gateway_customer import GatewayCustomer
from app.models.gateway_transaction import GatewayTransaction
from app.models.invoice import Invoice
from app.utils.password import hash_password, verify_password, is_strong_password
from app.utils.logger import logger

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    name: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    phoneNumber: Optional[str] = None


def generate_portal_token(portal_user_id: str, email: str) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(days=30)
    payload = {
        "sub": f"portal_{portal_user_id}",
        "email": email,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


@router.post("/register", response_model=dict)
async def register(body: RegisterRequest):
    existing = await PortalUser.find_one(PortalUser.email == body.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    if not is_strong_password(body.password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
        )

    portal_user = PortalUser(
        email=body.email,
        name=body.name,
        password_hash=hash_password(body.password),
    )
    await portal_user.create()

    token = generate_portal_token(str(portal_user.id), portal_user.email)

    logger.info(f"Portal user registered: {portal_user.email}")

    return {
        "message": "Registration successful",
        "token": token,
        "user": {
            "id": str(portal_user.id),
            "email": portal_user.email,
            "name": portal_user.name,
        },
    }


@router.post("/login", response_model=dict)
async def login(body: LoginRequest):
    portal_user = await PortalUser.find_one(PortalUser.email == body.email)
    if not portal_user or not portal_user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(body.password, portal_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = generate_portal_token(str(portal_user.id), portal_user.email)

    logger.info(f"Portal user logged in: {portal_user.email}")

    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": str(portal_user.id),
            "email": portal_user.email,
            "name": portal_user.name,
            "phoneNumber": portal_user.phone_number,
        },
    }


@router.get("/me", response_model=dict)
async def get_profile(
    current_user: PortalUser = Depends(get_current_portal_user),
):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
        "phoneNumber": current_user.phone_number,
        "createdAt": current_user.created_at.isoformat() if current_user.created_at else None,
    }


@router.put("/me", response_model=dict)
async def update_profile(
    body: UpdateProfileRequest,
    current_user: PortalUser = Depends(get_current_portal_user),
):
    if body.name is not None:
        current_user.name = body.name
    if body.phoneNumber is not None:
        current_user.phone_number = body.phoneNumber
    current_user.updated_at = datetime.now(timezone.utc)
    await current_user.save()

    return {
        "message": "Profile updated",
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "name": current_user.name,
            "phoneNumber": current_user.phone_number,
        },
    }


async def _find_clients_by_email(email: str) -> list:
    return await Client.find(Client.email == email).to_list()


async def _find_gateway_customers_by_email(email: str) -> list:
    return await GatewayCustomer.find(GatewayCustomer.email == email).to_list()


@router.get("/dashboard", response_model=dict)
async def get_dashboard(
    current_user: PortalUser = Depends(get_current_portal_user),
):
    clients = await _find_clients_by_email(current_user.email)

    client_ids = [c.id for c in clients]
    subscriptions = []
    if client_ids:
        subscriptions = await Subscription.find(
            {"clientId": {"$in": client_ids}}
        ).to_list()

    active_count = sum(1 for s in subscriptions if s.status == "ACTIVE")
    pending_count = sum(1 for s in subscriptions if s.status == "PENDING_ACTIVATION")
    suspended_count = sum(1 for s in subscriptions if s.status == "SUSPENDED")

    invoices = []
    if client_ids:
        invoices = await Invoice.find(
            {"clientId": {"$in": client_ids}}
        ).sort([("createdAt", DESCENDING)]).limit(5).to_list()

    gateway_customers = await _find_gateway_customers_by_email(current_user.email)
    gateway_customer_ids = [gc.id for gc in gateway_customers]

    recent_transactions = []
    if gateway_customer_ids:
        recent_transactions = await GatewayTransaction.find(
            {"customerId": {"$in": gateway_customer_ids}}
        ).sort([("transactionDate", DESCENDING)]).limit(5).to_list()

    tx_result = []
    for tx in recent_transactions:
        tx_result.append({
            "id": str(tx.id),
            "amount": tx.amount_kes,
            "status": tx.status,
            "date": tx.transaction_date.isoformat() if tx.transaction_date else None,
            "accountReference": tx.account_reference,
            "mpesaReceiptNo": tx.mpesa_receipt_no,
        })

    return {
        "subscriptions": {
            "total": len(subscriptions),
            "active": active_count,
            "pending": pending_count,
            "suspended": suspended_count,
        },
        "transactions": {
            "recent": tx_result,
        },
        "invoices": [
            {
                "id": str(inv.id),
                "invoiceNumber": inv.invoice_number,
                "amount": inv.total_amount,
                "status": inv.status,
                "dueDate": inv.due_date.isoformat() if inv.due_date else None,
                "createdAt": inv.created_at.isoformat() if inv.created_at else None,
            }
            for inv in invoices
        ],
    }


@router.get("/subscriptions", response_model=dict)
async def get_subscriptions(
    current_user: PortalUser = Depends(get_current_portal_user),
    page: int = 1,
    limit: int = 20,
):
    clients = await _find_clients_by_email(current_user.email)
    client_ids = [c.id for c in clients]

    if not client_ids:
        return {"data": [], "page": page, "totalPages": 0, "total": 0}

    skip = (page - 1) * limit
    subscriptions = (
        await Subscription.find({"clientId": {"$in": client_ids}})
        .sort([("created_at", DESCENDING)])
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    total = await Subscription.find({"clientId": {"$in": client_ids}}).count()

    result = []
    for sub in subscriptions:
        client = await Client.get(sub.client_id)
        result.append({
            "id": str(sub.id),
            "status": sub.status,
            "startDate": sub.start_date.isoformat() if sub.start_date else None,
            "nextBillingDate": sub.next_billing_date.isoformat() if sub.next_billing_date else None,
            "paymentFailureCount": sub.payment_failure_count,
            "gracePeriodEndsAt": sub.grace_period_ends_at.isoformat() if sub.grace_period_ends_at else None,
            "merchantName": client.name if client else "Unknown",
        })

    return {"data": result, "page": page, "totalPages": (total + limit - 1) // limit if limit > 0 else 1, "total": total}


@router.get("/subscriptions/{subscription_id}", response_model=dict)
async def get_subscription_detail(
    subscription_id: str,
    current_user: PortalUser = Depends(get_current_portal_user),
):
    clients = await _find_clients_by_email(current_user.email)
    client_ids = [c.id for c in clients]

    sub = await Subscription.get(subscription_id)
    if not sub or sub.client_id not in client_ids:
        raise HTTPException(status_code=404, detail="Subscription not found")

    client = await Client.get(sub.client_id)

    invoices = await Invoice.find(
        {"subscriptionId": sub.id}
    ).sort([("createdAt", DESCENDING)]).to_list()

    return {
        "id": str(sub.id),
        "status": sub.status,
        "startDate": sub.start_date.isoformat() if sub.start_date else None,
        "nextBillingDate": sub.next_billing_date.isoformat() if sub.next_billing_date else None,
        "paymentFailureCount": sub.payment_failure_count,
        "lastPaymentAttempt": sub.last_payment_attempt.isoformat() if sub.last_payment_attempt else None,
        "suspendedAt": sub.suspended_at.isoformat() if sub.suspended_at else None,
        "gracePeriodEndsAt": sub.grace_period_ends_at.isoformat() if sub.grace_period_ends_at else None,
        "merchantName": client.name if client else "Unknown",
        "invoices": [
            {
                "id": str(inv.id),
                "invoiceNumber": inv.invoice_number,
                "amount": inv.total_amount,
                "status": inv.status,
                "dueDate": inv.due_date.isoformat() if inv.due_date else None,
            }
            for inv in invoices
        ],
    }


@router.post("/subscriptions/{subscription_id}/cancel", response_model=dict)
async def cancel_subscription(
    subscription_id: str,
    current_user: PortalUser = Depends(get_current_portal_user),
):
    clients = await _find_clients_by_email(current_user.email)
    client_ids = [c.id for c in clients]

    sub = await Subscription.get(subscription_id)
    if not sub or sub.client_id not in client_ids:
        raise HTTPException(status_code=404, detail="Subscription not found")

    if sub.status not in ("ACTIVE", "SUSPENDED"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel subscription in {sub.status} state",
        )

    sub.status = "CANCELLED"
    sub.updated_at = datetime.now(timezone.utc)
    await sub.save()

    logger.info(f"Portal user {current_user.email} cancelled subscription {subscription_id}")

    return {"message": "Subscription cancelled successfully", "id": subscription_id}


@router.get("/transactions", response_model=dict)
async def get_transactions(
    current_user: PortalUser = Depends(get_current_portal_user),
    page: int = 1,
    limit: int = 20,
    status_filter: Optional[str] = None,
):
    gateway_customers = await _find_gateway_customers_by_email(current_user.email)
    customer_ids = [gc.id for gc in gateway_customers]

    if not customer_ids:
        return {"data": [], "page": page, "totalPages": 0, "total": 0}

    query = {"customerId": {"$in": customer_ids}}
    if status_filter:
        query["status"] = status_filter

    skip = (page - 1) * limit
    transactions = (
        await GatewayTransaction.find(query)
        .sort([("transactionDate", DESCENDING)])
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    total = await GatewayTransaction.find(query).count()

    result = []
    for tx in transactions:
        result.append({
            "id": str(tx.id),
            "amount": tx.amount_kes,
            "status": tx.status,
            "date": tx.transaction_date.isoformat() if tx.transaction_date else None,
            "phoneNumber": tx.phone_number,
            "accountReference": tx.account_reference,
            "mpesaReceiptNo": tx.mpesa_receipt_no,
            "paymentMethod": tx.payment_method,
        })

    return {
        "data": result,
        "page": page,
        "totalPages": (total + limit - 1) // limit if limit > 0 else 1,
        "total": total,
    }


@router.get("/invoices", response_model=dict)
async def get_invoices(
    current_user: PortalUser = Depends(get_current_portal_user),
    page: int = 1,
    limit: int = 20,
    status_filter: Optional[str] = None,
):
    clients = await _find_clients_by_email(current_user.email)
    client_ids = [c.id for c in clients]

    if not client_ids:
        return {"data": [], "page": page, "totalPages": 0, "total": 0}

    query = {"clientId": {"$in": client_ids}}
    if status_filter:
        query["status"] = status_filter

    skip = (page - 1) * limit
    invoices = (
        await Invoice.find(query)
        .sort([("createdAt", DESCENDING)])
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    total = await Invoice.find(query).count()

    result = []
    for inv in invoices:
        result.append({
            "id": str(inv.id),
            "invoiceNumber": inv.invoice_number,
            "amount": inv.total_amount,
            "amountKes": inv.amount_kes,
            "vatAmount": inv.vat_amount,
            "status": inv.status,
            "dueDate": inv.due_date.isoformat() if inv.due_date else None,
            "billingPeriod": inv.billing_period,
            "paidDate": inv.paid_date.isoformat() if inv.paid_date else None,
            "mpesaReceiptNo": inv.mpesa_receipt_no,
        })

    return {
        "data": result,
        "page": page,
        "totalPages": (total + limit - 1) // limit if limit > 0 else 1,
        "total": total,
    }
