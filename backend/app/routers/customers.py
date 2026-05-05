from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from datetime import datetime, timezone

from app.dependencies import get_current_user
from app.models.user import User
from app.models.client import Client
from app.models.subscription import Subscription
from app.models.transaction import Transaction
from app.utils.logger import logger

router = APIRouter()


@router.get("/", response_model=dict)
async def get_customers(
    current_user: User = Depends(get_current_user),
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
):
    query = {"owner_id": current_user.id}

    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"phone_number": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]

    skip = (page - 1) * limit

    clients = (
        await Client.find(query)
        .sort([("created_at", -1)])
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    result = []
    total_revenue = 0
    active_subscriptions = 0

    for client in clients:
        client_subscriptions = await Subscription.find(
            {"clientId": client.id, "ownerId": current_user.id}
        ).to_list()

        active_subs = [s for s in client_subscriptions if s.status == "ACTIVE"]
        active_subscriptions += len(active_subs)

        subscription_ids = [sub.id for sub in client_subscriptions]
        all_transactions = await Transaction.find(
            {
                "owner_id": current_user.id,
                "subscription_id": {"$in": subscription_ids},
            }
            if subscription_ids
            else {"owner_id": current_user.id, "_id": {"$in": []}}
        ).to_list()
        client_transactions = [tx for tx in all_transactions if tx.status == "SUCCESS"]

        client_revenue = sum(float(tx.amount_kes) for tx in client_transactions)
        total_revenue += client_revenue

        result.append(
            {
                "_id": str(client.id),
                "id": str(client.id),
                "name": client.name,
                "email": client.email,
                "phoneNumber": client.phone_number,
                "totalSubscriptions": len(client_subscriptions),
                "activeSubscriptions": len(active_subs),
                "totalRevenue": client_revenue,
                "totalTransactions": len(all_transactions),
                "successfulTransactions": len(client_transactions),
                "createdAt": client.created_at.isoformat()
                if client.created_at
                else None,
            }
        )

    total = await Client.find({"owner_id": current_user.id}).count()

    return {
        "customers": result,
        "summary": {
            "totalCustomers": total,
            "totalRevenue": total_revenue,
            "activeSubscriptions": active_subscriptions,
        },
    }
