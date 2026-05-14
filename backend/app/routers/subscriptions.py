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
)
from app.schemas.common import StandardResponse

router = APIRouter()


@router.post("/", response_model=StandardResponse)
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
        Subscription.client_id == subscription.client_id,
        Subscription.plan_id == subscription.plan_id,
        Subscription.status == "ACTIVE",
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

    return StandardResponse(
        message="Subscription created successfully",
        data=new_subscription.to_dict()
    )


@router.get("/", response_model=StandardResponse[List[dict]])
async def get_subscriptions(
    current_user: User = Depends(get_current_user),
):
    subscriptions = await Subscription.find(Subscription.owner_id == current_user.id).to_list()

    result = []
    for sub in subscriptions:
        client = await Client.get(sub.client_id)
        plan = await ServicePlan.get(sub.plan_id)
        
        sub_dict = sub.to_dict()
        sub_dict["clientName"] = client.name if client else "Unknown"
        # Hydrate planId with full object for dashboard
        sub_dict["planId"] = plan.to_dict() if plan else None
        
        result.append(sub_dict)

    return StandardResponse(data=result)


@router.get("/{subscription_id}", response_model=StandardResponse)
async def get_subscription(
    subscription_id: str,
    current_user: User = Depends(get_current_user),
):
    subscription = await Subscription.get(subscription_id)
    if not subscription or str(subscription.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Subscription not found")

    client = await Client.get(subscription.client_id)
    plan = await ServicePlan.get(subscription.plan_id)

    data = subscription.to_dict()
    data["clientName"] = client.name if client else "Unknown"
    data["planName"] = plan.name if plan else "Unknown"
    data["plan"] = plan.to_dict() if plan else None

    return StandardResponse(data=data)


@router.put("/{subscription_id}", response_model=StandardResponse)
async def update_subscription(
    subscription_id: str,
    subscription_update: SubscriptionUpdate,
    current_user: User = Depends(get_current_user),
):
    subscription = await Subscription.get(subscription_id)
    if not subscription or str(subscription.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Subscription not found")

    update_data = subscription_update.model_dump(exclude_unset=True)

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

    return StandardResponse(
        message="Subscription updated successfully",
        data=subscription.to_dict()
    )


@router.get("/{subscription_id}/transactions", response_model=StandardResponse[List[dict]])
async def get_subscription_transactions(
    subscription_id: str,
    current_user: User = Depends(get_current_user),
):
    subscription = await Subscription.get(subscription_id)
    if not subscription or str(subscription.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Subscription not found")

    transactions = await Transaction.find(Transaction.subscription_id == subscription.id).to_list()
    
    return StandardResponse(
        data=[tx.to_dict() for tx in transactions]
    )


@router.delete("/{subscription_id}", response_model=StandardResponse)
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

    return StandardResponse(message="Subscription deleted successfully", data={"id": subscription_id})
