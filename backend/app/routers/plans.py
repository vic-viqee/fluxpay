from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from app.dependencies import get_current_user
from app.models.service_plan import ServicePlan
from app.models.user import User
from app.schemas.gateway import PlanCreate, PlanUpdate
from app.utils.logger import logger

router = APIRouter()


def serialize_plan(plan: ServicePlan):
    data = plan.model_dump(by_alias=True)
    data["id"] = str(plan.id)
    data["_id"] = str(plan.id)
    return data


@router.post("/")
async def create_plan(
    plan: PlanCreate,
    current_user: User = Depends(get_current_user),
):
    data = plan.model_dump()
    data["owner_id"] = current_user.id
    new_plan = ServicePlan(**data)
    await new_plan.create()
    return {
        "id": str(new_plan.id),
        "message": "Plan created successfully",
        "plan": serialize_plan(new_plan),
    }


@router.get("/")
async def get_plans(
    current_user: User = Depends(get_current_user),
):
    logger.info(f"Fetching plans for user: {current_user.id} ({current_user.email})")
    # Use explicit database alias for maximum reliability
    plans = await ServicePlan.find({"ownerId": current_user.id}).to_list()
    logger.info(f"Found {len(plans)} plans in database")
    return [serialize_plan(p) for p in plans]


@router.get("/{plan_id}")
async def get_plan(
    plan_id: str,
    current_user: User = Depends(get_current_user),
):
    plan = await ServicePlan.get(plan_id)
    if not plan or str(plan.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Plan not found")
    return serialize_plan(plan)


@router.put("/{plan_id}")
async def update_plan(
    plan_id: str,
    plan_update: PlanUpdate,
    current_user: User = Depends(get_current_user),
):
    plan = await ServicePlan.get(plan_id)
    if not plan or str(plan.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Plan not found")

    update_data = plan_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(plan, field, value)
    await plan.save()

    return {
        "id": str(plan.id),
        "message": "Plan updated successfully",
        "plan": serialize_plan(plan),
    }


@router.delete("/{plan_id}")
async def delete_plan(
    plan_id: str,
    current_user: User = Depends(get_current_user),
):
    plan = await ServicePlan.get(plan_id)
    if not plan or str(plan.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Plan not found")

    await plan.delete()
    return {"id": plan_id, "message": "Plan deleted successfully"}
