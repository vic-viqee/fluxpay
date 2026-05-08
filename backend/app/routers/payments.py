from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional

from app.dependencies import get_current_user
from app.config import get_settings
from app.models.user import User
from app.utils.logger import logger
from app.services.mpesa import initiate_stk_push
from app.schemas.payments import (
    PaymentRequest,
    SimulateStkPushRequest,
    PricingStkPushRequest,
)

router = APIRouter()


@router.post("/stk-push")
async def initiate_payment_stk_push(
    request: PaymentRequest,
    current_user: User = Depends(get_current_user),
):
    settings = get_settings()
    try:
        phone_number = request.phone or request.phone_number
        if not phone_number:
            raise HTTPException(status_code=400, detail="Phone number is required")

        stk_response = await initiate_stk_push(
            phone_number=phone_number,
            amount=request.amount,
            account_reference=request.account_reference
            or current_user.business_name
            or "FluxPay",
            transaction_desc=request.transaction_desc or "FluxPay Payment",
        )

        return {
            "message": "Payment initiated",
            "transactionId": None,  # Would be created in real implementation
            "checkoutRequestId": stk_response.get("CheckoutRequestID"),
            "status": "PENDING",
        }
    except Exception as e:
        logger.error(f"STK push failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to initiate payment")


@router.post("/simulate-stk-push")
async def simulate_stk_push(
    request: SimulateStkPushRequest,
    current_user: User = Depends(get_current_user),
):
    settings = get_settings()
    try:
        stk_response = await initiate_stk_push(
            phone_number=request.phone_number,
            amount=request.amount,
            account_reference=current_user.business_name or "FluxPay",
            transaction_desc=f"Test: {current_user.business_name}"
            if current_user.business_name
            else "FluxPay Simulation",
        )

        return {
            "message": "STK push simulated",
            "checkoutRequestId": stk_response.get("CheckoutRequestID"),
            "status": "PENDING",
        }
    except Exception as e:
        logger.error(f"STK push simulation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to simulate STK push")


@router.post("/pricing-stk-push")
async def pricing_stk_push(
    request: PricingStkPushRequest,
    current_user: User = Depends(get_current_user),
):
    settings = get_settings()
    try:
        # Determine amount based on plan
        amount = 0
        if request.plan.lower() == "starter":
            amount = 499  # Example starter plan price
        elif request.plan.lower() == "growth":
            amount = 999  # Example growth plan price
        else:
            raise HTTPException(status_code=400, detail="Invalid plan")

        stk_response = await initiate_stk_push(
            phone_number=request.phone_number,
            amount=amount,
            account_reference=current_user.business_name or "FluxPay",
            transaction_desc=f"FluxPay {request.plan.capitalize()} Plan",
        )

        return {
            "message": "Payment initiated",
            "checkoutRequestId": stk_response.get("CheckoutRequestID"),
            "status": "PENDING",
            "amount": amount,
        }
    except Exception as e:
        logger.error(f"Pricing STK push failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to initiate payment")
