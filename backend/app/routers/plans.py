from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from app.dependencies import get_current_user
from app.models.service_plan import ServicePlan
from app.models.user import User
from app.schemas.gateway import PlanCreate, PlanUpdate
from app.schemas.common import StandardResponse
from app.utils.logger import logger

router = APIRouter()


@router.post("/", response_model=StandardResponse)
async def create_plan(
    plan: PlanCreate,
    current_user: User = Depends(get_current_user),
):
    data = plan.model_dump()
    data["owner_id"] = current_user.id
    new_plan = ServicePlan(**data)
    await new_plan.create()
    
    return StandardResponse(
        message="Plan created successfully",
        data=new_plan.to_dict()
    )


@router.get("/", response_model=StandardResponse[List[dict]])
async def get_plans(
    current_user: User = Depends(get_current_user),
):
    logger.info(f"Fetching plans for user: {current_user.id} ({current_user.email})")
    plans = await ServicePlan.find(ServicePlan.owner_id == current_user.id).to_list()
    logger.info(f"Found {len(plans)} plans in database")
    
    return StandardResponse(
        data=[p.to_dict() for p in plans]
    )


@router.get("/{plan_id}", response_model=StandardResponse)
async def get_plan(
    plan_id: str,
    current_user: User = Depends(get_current_user),
):
    plan = await ServicePlan.get(plan_id)
    if not plan or str(plan.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return StandardResponse(data=plan.to_dict())


@router.put("/{plan_id}", response_model=StandardResponse)
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

    return StandardResponse(
        message="Plan updated successfully",
        data=plan.to_dict()
    )


@router.delete("/{plan_id}", response_model=StandardResponse)
async def delete_plan(
    plan_id: str,
    current_user: User = Depends(get_current_user),
):
    plan = await ServicePlan.get(plan_id)
    if not plan or str(plan.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Plan not found")

    await plan.delete()
    return StandardResponse(message="Plan deleted successfully", data={"id": plan_id})
