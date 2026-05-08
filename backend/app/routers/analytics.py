from fastapi import APIRouter, Depends
from datetime import datetime, timedelta, timezone
from collections import defaultdict

from app.dependencies import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.models.subscription import Subscription
from app.models.client import Client
from app.models.service_plan import ServicePlan
from app.utils.logger import logger

router = APIRouter()


@router.get("/", response_model=dict)
async def get_analytics(
    current_user: User = Depends(get_current_user),
):
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    sixty_days_ago = now - timedelta(days=60)

    transactions = await Transaction.find({"owner_id": current_user.id}).to_list()
    subscriptions = await Subscription.find({"owner_id": current_user.id}).to_list()
    clients = await Client.find({"owner_id": current_user.id}).to_list()
    total_plans = await ServicePlan.find({"owner_id": current_user.id}).count()

    successful_transactions = [tx for tx in transactions if tx.status == "SUCCESS"]
    pending_transactions = [tx for tx in transactions if tx.status == "PENDING"]
    failed_transactions = [tx for tx in transactions if tx.status == "FAILED"]
    total_revenue = sum(tx.amount_kes for tx in successful_transactions)
    success_rate = (
        (len(successful_transactions) / len(transactions)) * 100 if transactions else 0
    )

    recent_revenue = sum(
        tx.amount_kes
        for tx in successful_transactions
        if tx.transaction_date >= thirty_days_ago
    )
    previous_revenue = sum(
        tx.amount_kes
        for tx in successful_transactions
        if sixty_days_ago <= tx.transaction_date < thirty_days_ago
    )
    revenue_trend = (
        ((recent_revenue - previous_revenue) / previous_revenue) * 100
        if previous_revenue > 0
        else (100 if recent_revenue > 0 else 0)
    )

    recent_subscriptions = len(
        [sub for sub in subscriptions if sub.created_at >= thirty_days_ago]
    )
    previous_subscriptions = len(
        [
            sub
            for sub in subscriptions
            if sixty_days_ago <= sub.created_at < thirty_days_ago
        ]
    )
    subscriptions_trend = (
        ((recent_subscriptions - previous_subscriptions) / previous_subscriptions) * 100
        if previous_subscriptions > 0
        else (100 if recent_subscriptions > 0 else 0)
    )

    recent_customers = len(
        [client for client in clients if client.created_at >= thirty_days_ago]
    )
    previous_customers = len(
        [
            client
            for client in clients
            if sixty_days_ago <= client.created_at < thirty_days_ago
        ]
    )
    customers_trend = (
        ((recent_customers - previous_customers) / previous_customers) * 100
        if previous_customers > 0
        else (100 if recent_customers > 0 else 0)
    )

    monthly_map: dict[tuple[int, int], dict] = defaultdict(
        lambda: {"revenue": 0.0, "transactions": 0}
    )
    for tx in successful_transactions:
        key = (tx.transaction_date.year, tx.transaction_date.month)
        monthly_map[key]["revenue"] += tx.amount_kes
        monthly_map[key]["transactions"] += 1

    monthly_revenue = [
        {
            "_id": {"year": year, "month": month},
            "revenue": data["revenue"],
            "transactions": data["transactions"],
        }
        for (year, month), data in sorted(monthly_map.items())
    ]

    transaction_status_breakdown = [
        {"_id": "SUCCESS", "count": len(successful_transactions)},
        {"_id": "PENDING", "count": len(pending_transactions)},
        {"_id": "FAILED", "count": len(failed_transactions)},
    ]
    subscription_counts: dict[str, int] = defaultdict(int)
    for sub in subscriptions:
        subscription_counts[sub.status] += 1
    subscription_status_breakdown = [
        {"_id": status, "count": count} for status, count in subscription_counts.items()
    ]

    return {
        "totals": {
            "totalTransactions": len(transactions),
            "totalRevenue": total_revenue,
            "successfulTransactions": len(successful_transactions),
            "pendingTransactions": len(pending_transactions),
            "failedTransactions": len(failed_transactions),
            "successRate": success_rate,
            "totalCustomers": len(clients),
            "totalPlans": total_plans,
            "totalSubscriptions": len(subscriptions),
        },
        "trends": {
            "revenue": revenue_trend,
            "subscriptions": subscriptions_trend,
            "customers": customers_trend,
        },
        "transactionStatusBreakdown": transaction_status_breakdown,
        "subscriptionStatusBreakdown": subscription_status_breakdown,
        "monthlyRevenue": monthly_revenue,
    }
