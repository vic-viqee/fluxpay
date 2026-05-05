from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timezone

from app.dependencies import get_current_user
from app.models.user import User
from app.models.subscription import Subscription
from app.models.client import Client
from app.models.service_plan import ServicePlan
from app.models.transaction import Transaction
from app.services.mpesa import initiate_stk_push
from app.utils.billing import calculate_next_billing_date
from app.utils.logger import logger
from app.schemas.gateway import (
    SubscriptionCreate,
    SubscriptionUpdate,
    ClientCreate,
    PlanCreate,
    PlanUpdate,
)

router = APIRouter()


@router.post("/", response_model=dict)
async def create_subscription(
    subscription: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
):
    # Verify client belongs to user
    client = await Client.get(subscription.client_id)
    if not client or str(client.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Client not found")

    # Verify plan belongs to user
    plan = await ServicePlan.get(subscription.plan_id)
    if not plan or str(plan.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Plan not found")

    # Check if client already has an active subscription for this plan
    existing = await Subscription.find_one(
        {
            "client_id": subscription.client_id,
            "plan_id": subscription.plan_id,
            "status": "ACTIVE",
        }
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Client already has an active subscription for this plan",
        )

    # Calculate next billing date
    next_billing_date = calculate_next_billing_date(
        datetime.now(timezone.utc), plan.frequency, plan.billing_day
    )

    # Create subscription
    new_subscription = Subscription(
        client_id=subscription.client_id,
        plan_id=subscription.plan_id,
        owner_id=current_user.id,
        status="PENDING_ACTIVATION",
        start_date=datetime.now(timezone.utc),
        next_billing_date=next_billing_date,
        notes=subscription.notes,
    )
    await new_subscription.create()

    logger.info(f"Subscription created: {new_subscription.id} for client {client.name}")

    return {
        "_id": str(new_subscription.id),
        "id": str(new_subscription.id),
        "message": "Subscription created successfully",
        "subscription": {
            "_id": str(new_subscription.id),
            "id": str(new_subscription.id),
            "clientId": str(new_subscription.client_id),
            "planId": str(new_subscription.plan_id),
            "status": new_subscription.status,
            "startDate": new_subscription.start_date,
            "nextBillingDate": new_subscription.next_billing_date,
        },
    }


@router.get("/", response_model=List[dict])
async def get_subscriptions(
    current_user: User = Depends(get_current_user),
):
    subscriptions = await Subscription.find({"owner_id": current_user.id}).to_list()

    result = []
    for sub in subscriptions:
        client = await Client.get(sub.client_id)
        plan = await ServicePlan.get(sub.plan_id)
        result.append(
            {
                "_id": str(sub.id),
                "id": str(sub.id),
                "clientId": str(sub.client_id),
                "clientName": client.name if client else "Unknown",
                "planId": str(sub.plan_id),
                "planName": plan.name if plan else "Unknown",
                "status": sub.status,
                "startDate": sub.start_date,
                "nextBillingDate": sub.next_billing_date,
                "notes": sub.notes,
                "paymentFailureCount": sub.payment_failure_count,
            }
        )

    return result


@router.get("/{subscription_id}", response_model=dict)
async def get_subscription(
    subscription_id: str,
    current_user: User = Depends(get_current_user),
):
    subscription = await Subscription.get(subscription_id)
    if not subscription or str(subscription.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Subscription not found")

    client = await Client.get(subscription.client_id)
    plan = await ServicePlan.get(subscription.plan_id)

    return {
        "_id": str(subscription.id),
        "id": str(subscription.id),
        "clientId": str(subscription.client_id),
        "clientName": client.name if client else "Unknown",
        "planId": str(subscription.plan_id),
        "planName": plan.name if plan else "Unknown",
        "status": subscription.status,
        "startDate": subscription.start_date,
        "nextBillingDate": subscription.next_billing_date,
        "notes": subscription.notes,
        "paymentFailureCount": subscription.payment_failure_count,
        "lastPaymentAttempt": subscription.last_payment_attempt,
    }


@router.put("/{subscription_id}", response_model=dict)
async def update_subscription(
    subscription_id: str,
    subscription_update: SubscriptionUpdate,
    current_user: User = Depends(get_current_user),
):
    subscription = await Subscription.get(subscription_id)
    if not subscription or str(subscription.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Subscription not found")

    update_data = subscription_update.dict(exclude_unset=True)

    # If changing client or plan, verify ownership
    if "client_id" in update_data or "plan_id" in update_data:
        if "client_id" in update_data:
            client = await Client.get(update_data["client_id"])
            if not client or str(client.owner_id) != str(current_user.id):
                raise HTTPException(status_code=404, detail="Client not found")

        if "plan_id" in update_data:
            plan = await ServicePlan.get(update_data["plan_id"])
            if not plan or str(plan.owner_id) != str(current_user.id):
                raise HTTPException(status_code=404, detail="Plan not found")

    # If changing plan, recalculate next billing date
    if "plan_id" in update_data:
        plan = await ServicePlan.get(update_data["plan_id"])
        update_data["next_billing_date"] = calculate_next_billing_date(
            datetime.now(timezone.utc), plan.frequency, plan.billing_day
        )

    for field, value in update_data.items():
        setattr(subscription, field, value)

    await subscription.save()

    logger.info(f"Subscription updated: {subscription.id}")

    return {
        "_id": str(subscription.id),
        "id": str(subscription.id),
        "message": "Subscription updated successfully",
        "subscription": {
            "_id": str(subscription.id),
            "id": str(subscription.id),
            "clientId": str(subscription.client_id),
            "planId": str(subscription.plan_id),
            "status": subscription.status,
            "startDate": subscription.start_date,
            "nextBillingDate": subscription.next_billing_date,
            "notes": subscription.notes,
        },
    }


@router.delete("/{subscription_id}", response_model=dict)
async def delete_subscription(
    subscription_id: str,
    current_user: User = Depends(get_current_user),
):
    subscription = await Subscription.get(subscription_id)
    if not subscription or str(subscription.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Subscription not found")

    # Only allow deletion of non-active subscriptions
    if subscription.status == "ACTIVE":
        raise HTTPException(
            status_code=400,
            detail="Cannot delete active subscription. Cancel it first.",
        )

    await subscription.delete()

    logger.info(f"Subscription deleted: {subscription_id}")

    return {"id": subscription_id, "message": "Subscription deleted successfully"}
