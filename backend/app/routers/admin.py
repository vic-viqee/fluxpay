from fastapi import APIRouter, Depends
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from collections import defaultdict

from app.dependencies import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.transaction import Transaction
from app.models.subscription import Subscription
from app.models.client import Client
from app.models.service_plan import ServicePlan
from app.models.api_key import ApiKey
from app.models.webhook import Webhook
from app.models.audit_log import AuditLog
from app.utils.logger import logger

router = APIRouter()


@router.get("/overview", response_model=dict)
async def get_admin_overview(
    current_user: User = Depends(get_current_admin_user),
):
    businesses = await User.find({"role": {"$ne": "admin"}}).to_list()
    transactions = await Transaction.find_all().to_list()
    subscriptions = await Subscription.find_all().to_list()
    api_keys = await ApiKey.find_all().to_list()
    webhooks = await Webhook.find_all().to_list()

    active_business_ids = {
        str(tx.owner_id)
        for tx in transactions
        if tx.status == "SUCCESS"
        and tx.updated_at >= datetime.now(timezone.utc) - timedelta(days=1)
    }
    total_revenue = sum(tx.amount_kes for tx in transactions if tx.status == "SUCCESS")
    monthly_map: dict[tuple[int, int], dict] = defaultdict(
        lambda: {"revenue": 0.0, "transactions": 0}
    )
    for tx in transactions:
        if tx.status != "SUCCESS":
            continue
        key = (tx.transaction_date.year, tx.transaction_date.month)
        monthly_map[key]["revenue"] += tx.amount_kes
        monthly_map[key]["transactions"] += 1

    transaction_counts = defaultdict(int)
    for tx in transactions:
        transaction_counts[tx.status] += 1

    subscription_counts = defaultdict(int)
    for sub in subscriptions:
        subscription_counts[sub.status] += 1

    return {
        "totalBusinesses": len(businesses),
        "activeBusinesses": len(active_business_ids),
        "totalRevenue": total_revenue,
        "monthlyRevenue": [
            {
                "month": f"{year}-{str(month).zfill(2)}",
                "revenue": data["revenue"],
                "transactions": data["transactions"],
            }
            for (year, month), data in sorted(monthly_map.items())
        ],
        "transactions": {
            "total": len(transactions),
            "success": transaction_counts["SUCCESS"],
            "pending": transaction_counts["PENDING"],
            "failed": transaction_counts["FAILED"],
        },
        "subscriptions": {
            "total": len(subscriptions),
            "active": subscription_counts["ACTIVE"],
            "failed": subscription_counts["FAILED"],
            "paused": subscription_counts["PAUSED"],
        },
        "apiKeys": {
            "total": len(api_keys),
            "active": len([key for key in api_keys if key.is_active]),
            "inactive": len([key for key in api_keys if not key.is_active]),
        },
        "webhooks": {
            "total": len(webhooks),
            "active": len([wh for wh in webhooks if wh.is_active]),
            "inactive": len([wh for wh in webhooks if not wh.is_active]),
        },
    }


@router.get("/businesses", response_model=dict)
async def get_all_businesses(
    current_user: User = Depends(get_current_admin_user),
    limit: int = 20,
    page: int = 1,
    search: Optional[str] = None,
):
    skip = (page - 1) * limit
    query = {"role": {"$ne": "admin"}}
    if search:
        query["$or"] = [
            {"business_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"business_phone_number": {"$regex": search, "$options": "i"}},
        ]
    businesses = (
        await User.find(query)
        .sort([("created_at", -1)])
        .skip(skip)
        .limit(limit)
        .to_list()
    )
    total = await User.find(query).count()
    data = []
    for business in businesses:
        business_transactions = await Transaction.find({"owner_id": business.id}).to_list()
        revenue = sum(
            tx.amount_kes for tx in business_transactions if tx.status == "SUCCESS"
        )
        successful_transactions = len(
            [tx for tx in business_transactions if tx.status == "SUCCESS"]
        )
        active_subscriptions = await Subscription.find(
            {"owner_id": business.id, "status": "ACTIVE"}
        ).count()
        active_api_keys = await ApiKey.find(
            {"owner_id": business.id, "is_active": True}
        ).count()
        data.append(
            {
                "_id": str(business.id),
                "businessName": business.business_name,
                "email": business.email,
                "phone": business.business_phone_number,
                "plan": business.plan or "Free",
                "createdAt": business.created_at,
                "totalRevenue": revenue,
                "successfulTransactions": successful_transactions,
                "activeSubscriptions": active_subscriptions,
                "activeApiKeys": active_api_keys,
            }
        )
    return {
        "data": data,
        "total": total,
        "page": page,
        "totalPages": (total + limit - 1) // limit,
    }


@router.get("/transactions", response_model=dict)
async def get_all_transactions(
    current_user: User = Depends(get_current_admin_user),
    limit: int = 20,
    page: int = 1,
    status: Optional[str] = None,
):
    skip = (page - 1) * limit
    query = {"status": status} if status else {}
    transactions = (
        await Transaction.find(query)
        .sort([("created_at", -1)])
        .skip(skip)
        .limit(limit)
        .to_list()
    )
    total = await Transaction.find(query).count()
    data = []
    for tx in transactions:
        owner = await User.get(tx.owner_id)
        data.append(
            {
                "_id": str(tx.id),
                "ownerId": {
                    "businessName": owner.business_name if owner else "Unknown",
                    "email": owner.email if owner else "",
                },
                "amountKes": tx.amount_kes,
                "status": tx.status,
                "mpesaReceiptNo": tx.mpesa_receipt_no,
                "darajaRequestId": tx.daraja_request_id,
                "transactionDate": tx.transaction_date,
            }
        )
    return {"data": data, "total": total, "page": page, "totalPages": (total + limit - 1) // limit}


@router.get("/subscriptions", response_model=dict)
async def get_all_subscriptions(
    current_user: User = Depends(get_current_admin_user),
    limit: int = 20,
    page: int = 1,
    status: Optional[str] = None,
):
    skip = (page - 1) * limit
    query = {"status": status} if status else {}
    subscriptions = (
        await Subscription.find(query)
        .sort([("created_at", -1)])
        .skip(skip)
        .limit(limit)
        .to_list()
    )
    total = await Subscription.find(query).count()
    data = []
    for sub in subscriptions:
        owner = await User.get(sub.owner_id)
        client = await Client.get(sub.client_id)
        plan = await ServicePlan.get(sub.plan_id)
        data.append(
            {
                "_id": str(sub.id),
                "ownerId": {
                    "businessName": owner.business_name if owner else "Unknown",
                    "email": owner.email if owner else "",
                },
                "clientId": {
                    "name": client.name if client else None,
                    "phoneNumber": client.phone_number if client else None,
                },
                "planId": {
                    "name": plan.name if plan else None,
                    "amountKes": plan.amount_kes if plan else None,
                },
                "status": sub.status,
                "nextBillingDate": sub.next_billing_date,
                "createdAt": sub.created_at,
            }
        )
    return {"data": data, "total": total, "page": page, "totalPages": (total + limit - 1) // limit}


@router.get("/apikeys", response_model=dict)
async def get_all_api_keys(
    current_user: User = Depends(get_current_admin_user), limit: int = 20, page: int = 1
):
    skip = (page - 1) * limit
    keys = (
        await ApiKey.find_all().sort([("created_at", -1)]).skip(skip).limit(limit).to_list()
    )
    total = await ApiKey.find_all().count()
    data = []
    for key in keys:
        owner = await User.get(key.owner_id)
        data.append(
            {
                "_id": str(key.id),
                "key": key.key,
                "name": key.name,
                "ownerId": {
                    "businessName": owner.business_name if owner else "Unknown",
                    "email": owner.email if owner else "",
                },
                "isActive": key.is_active,
                "lastUsedAt": key.last_used_at,
                "createdAt": key.created_at,
            }
        )
    return {"data": data, "total": total, "page": page, "totalPages": (total + limit - 1) // limit}


@router.get("/webhooks", response_model=dict)
async def get_all_webhooks(
    current_user: User = Depends(get_current_admin_user), limit: int = 20, page: int = 1
):
    skip = (page - 1) * limit
    hooks = (
        await Webhook.find_all().sort([("created_at", -1)]).skip(skip).limit(limit).to_list()
    )
    total = await Webhook.find_all().count()
    data = []
    for hook in hooks:
        owner = await User.get(hook.owner_id)
        data.append(
            {
                "_id": str(hook.id),
                "url": hook.url,
                "name": hook.name,
                "events": hook.events,
                "ownerId": {
                    "businessName": owner.business_name if owner else "Unknown",
                    "email": owner.email if owner else "",
                },
                "isActive": hook.is_active,
                "lastTriggeredAt": hook.last_triggered_at,
                "failureCount": hook.failure_count,
                "createdAt": hook.created_at,
            }
        )
    return {"data": data, "total": total, "page": page, "totalPages": (total + limit - 1) // limit}


@router.get("/plan-limits", response_model=dict)
async def get_plan_limits(
    current_user: User = Depends(get_current_admin_user),
):
    plans = {"free": 50, "starter": 50, "growth": 500, "enterprise": 5000}
    businesses = await User.find({"role": {"$ne": "admin"}}).to_list()
    data = []
    stats = defaultdict(lambda: {"businesses": 0, "totalTransactions": 0})
    for business in businesses:
        plan = (business.plan or "Free").lower()
        limit = plans.get(plan, business.transaction_limit or 50)
        used = business.current_month_transactions or 0
        percentage = 0 if limit == 0 else round((used / limit) * 100)
        stats[plan]["businesses"] += 1
        stats[plan]["totalTransactions"] += used
        data.append(
            {
                "_id": str(business.id),
                "businessName": business.business_name,
                "email": business.email,
                "plan": business.plan or "Free",
                "limit": limit,
                "used": used,
                "percentage": percentage,
                "remaining": max(0, limit - used),
                "resetAt": business.transaction_count_reset_at,
                "status": "blocked" if percentage >= 100 else "warning" if percentage >= 80 else "ok",
                "createdAt": business.created_at,
            }
        )
    return {
        "data": data,
        "total": len(data),
        "page": 1,
        "totalPages": 1,
        "planStats": [
            {"plan": plan, "businesses": item["businesses"], "totalTransactions": item["totalTransactions"]}
            for plan, item in stats.items()
        ],
        "availablePlans": plans,
    }


@router.get("/audit-logs", response_model=dict)
async def get_audit_logs(
    current_user: User = Depends(get_current_admin_user), limit: int = 20, page: int = 1
):
    skip = (page - 1) * limit
    logs = (
        await AuditLog.find_all().sort([("created_at", -1)]).skip(skip).limit(limit).to_list()
    )
    total = await AuditLog.find_all().count()
    data = []
    for log in logs:
        admin = await User.get(log.admin_id)
        data.append(
            {
                "_id": str(log.id),
                "adminId": {
                    "businessName": admin.business_name if admin else "Unknown",
                    "email": admin.email if admin else "",
                },
                "action": log.action,
                "resource": log.resource,
                "resourceId": log.resource_id,
                "ipAddress": log.ip_address,
                "createdAt": log.created_at,
            }
        )
    return {"data": data, "total": total, "page": page, "totalPages": (total + limit - 1) // limit}
