from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import time
from datetime import datetime, timezone
from pymongo import DESCENDING

from app.dependencies import get_current_user
from app.models.user import User
from app.models.public_checkout_button import PublicCheckoutButton
from app.models.gateway_transaction import GatewayTransaction
from app.models.gateway_customer import GatewayCustomer
from app.config import get_settings
from app.utils.logger import logger
from app.services.mpesa import initiate_stk_push

router = APIRouter()


@router.get("/buttons/{button_id}", response_model=dict)
async def get_button_by_id(
    button_id: str,
):
    # Public endpoint - no authentication required
    button = await PublicCheckoutButton.find_one(
        PublicCheckoutButton.button_id == button_id,
        PublicCheckoutButton.is_active == True,
    )
    if not button:
        raise HTTPException(status_code=404, detail="Payment button not found")

    # Get owner data
    owner = await User.get(button.owner_id)

    return {
        "_id": str(button.id),
        "id": str(button.id),
        "buttonId": button.button_id,
        "title": button.title,
        "description": button.description,
        "defaultAmount": button.default_amount,
        "allowCustomAmount": button.allow_custom_amount,
        "redirectUrl": button.redirect_url,
        "buttonText": button.button_text,
        "buttonColor": button.button_color,
        "ownerName": owner.business_name if owner else "FluxPay Merchant",
        "ownerLogo": owner.logo_url if owner else None,
        "ownerPhone": owner.business_phone_number if owner else None,
    }


@router.post("/buttons/{button_id}/click", response_model=dict)
async def track_button_click(
    button_id: str,
):
    # Public endpoint - no authentication required
    button = await PublicCheckoutButton.find_one({"button_id": button_id})
    if not button:
        raise HTTPException(status_code=404, detail="Payment button not found")

    button.total_clicks += 1
    await button.save()

    return {"success": True}


@router.post("/buttons/{button_id}/pay", response_model=dict)
async def initiate_button_payment(
    button_id: str,
    payment_data: dict,
):
    # Public endpoint - no authentication required
    button = await PublicCheckoutButton.find_one(
        PublicCheckoutButton.button_id == button_id,
        PublicCheckoutButton.is_active == True,
    )
    if not button:
        raise HTTPException(status_code=404, detail="Payment button not found")

    phone_number = payment_data.get("phoneNumber")
    if not phone_number:
        raise HTTPException(status_code=400, detail="Phone number is required")

    amount = payment_data.get("amount") or button.default_amount
    if not amount:
        raise HTTPException(
            status_code=400,
            detail="Amount is required when button does not have a default amount",
        )

    customer_name = payment_data.get("customerName")
    customer_email = payment_data.get("customerEmail")

    # Find or create customer
    customer = None
    if customer_email or phone_number:
        query = {"owner_id": button.owner_id}
        if customer_email:
            query["email"] = customer_email
        else:
            query["phone_number"] = phone_number

        customer = await GatewayCustomer.find_one(query)

        if not customer:
            customer = GatewayCustomer.model_validate(
                {
                    "ownerId": button.owner_id,
                    "name": customer_name or customer_email.split("@")[0]
                    if customer_email
                    else "Guest",
                    "email": customer_email,
                    "phoneNumber": phone_number,
                }
            )
            await customer.create()

    try:
        account_ref = f"BTN-{button.button_id[:8]}"
        desc = button.title

        stk_response = await initiate_stk_push(
            phone_number=phone_number,
            amount=float(amount),
            account_reference=account_ref,
            transaction_desc=desc,
        )

        transaction = GatewayTransaction.model_validate(
            {
                "ownerId": button.owner_id,
                "customerId": customer.id if customer else None,
                "paymentLinkId": None,
                "amountKes": float(amount),
                "status": "PENDING",
                "phoneNumber": phone_number,
                "accountReference": account_ref,
                "transactionDesc": desc,
                "paymentMethod": "STK_PUSH",
                "paymentSource": "payment_link",
                "darajaRequestId": stk_response.get("CheckoutRequestID", ""),
                "checkoutRequestId": stk_response.get("CheckoutRequestID", ""),
            }
        )
        await transaction.create()

        # Update button stats
        button.total_payments = (button.total_payments or 0) + 1
        await button.save()

        # Update customer stats
        if customer:
            customer.total_transactions = (customer.total_transactions or 0) + 1
            customer.total_amount = (customer.total_amount or 0) + float(amount)
            customer.last_transaction_date = datetime.now(timezone.utc)
            await customer.save()

        logger.info(
            f"Button payment initiated: {transaction.id} for button {button_id}"
        )

        response = {
            "message": "Payment initiated",
            "transactionId": str(transaction.id),
            "checkoutRequestId": stk_response.get("CheckoutRequestID"),
            "status": transaction.status,
        }

        if button.redirect_url:
            response["redirectUrl"] = (
                f"{button.redirect_url}?transactionId={str(transaction.id)}&status=pending"
            )

        return response
    except Exception as e:
        logger.error(f"Button payment failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to initiate payment")


@router.get("/buttons", response_model=dict)
async def get_button_stats(
    current_user: User = Depends(get_current_user),
):
    # Protected endpoint - requires authentication
    buttons = (
        await PublicCheckoutButton.find({"owner_id": current_user.id})
        .sort([("created_at", DESCENDING)])
        .to_list()
    )

    result = []
    for button in buttons:
        # Calculate total amount from transactions
        pipeline = [
            {
                "$match": {
                    "ownerId": current_user.id,
                    "paymentSource": "payment_link",
                    "accountReference": f"BTN-{button.button_id[:8]}",
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": "$amountKes"},
                }
            },
        ]
        agg_result = await GatewayTransaction.aggregate(pipeline).to_list()
        total_amount = agg_result[0]["total"] if agg_result else 0

        result.append(
            {
                "_id": str(button.id),
                "id": str(button.id),
                "buttonId": button.button_id,
                "title": button.title,
                "description": button.description,
                "defaultAmount": button.default_amount,
                "allowCustomAmount": button.allow_custom_amount,
                "redirectUrl": button.redirect_url,
                "buttonText": button.button_text,
                "buttonColor": button.button_color,
                "isActive": button.is_active,
                "totalClicks": button.total_clicks,
                "totalPayments": button.total_payments,
                "createdAt": button.created_at,
                "updatedAt": button.updated_at,
                "totalAmount": total_amount,
            }
        )

    return {"data": result}


@router.post("/buttons", response_model=dict)
async def create_button(
    button_data: dict,
    current_user: User = Depends(get_current_user),
):
    # Protected endpoint - requires authentication
    import uuid

    button_id = str(uuid.uuid4())[:16]  # Generate a shorter ID for buttons

    new_button = PublicCheckoutButton.model_validate(
        {
            "buttonId": button_id,
            "ownerId": current_user.id,
            "title": button_data.get("title", ""),
            "description": button_data.get("description"),
            "defaultAmount": button_data.get("defaultAmount"),
            "allowCustomAmount": button_data.get("allowCustomAmount", True),
            "redirectUrl": button_data.get("redirectUrl"),
            "buttonText": button_data.get("buttonText", "Pay with M-Pesa"),
            "buttonColor": button_data.get("buttonColor", "#25D366"),
            "isActive": True,
        }
    )
    await new_button.create()

    return {
        "_id": str(new_button.id),
        "id": str(new_button.id),
        "message": "Button created successfully",
        "button": {
            "_id": str(new_button.id),
            "id": str(new_button.id),
            "buttonId": new_button.button_id,
            "title": new_button.title,
            "description": new_button.description,
            "defaultAmount": new_button.default_amount,
            "allowCustomAmount": new_button.allow_custom_amount,
            "redirectUrl": new_button.redirect_url,
            "buttonText": new_button.button_text,
            "buttonColor": new_button.button_color,
            "isActive": new_button.is_active,
            "totalClicks": new_button.total_clicks,
            "totalPayments": new_button.total_payments,
            "createdAt": new_button.created_at,
            "updatedAt": new_button.updated_at,
        },
    }


@router.patch("/buttons/{button_id}", response_model=dict)
async def update_button(
    button_id: str,
    button_data: dict,
    current_user: User = Depends(get_current_user),
):
    # Protected endpoint - requires authentication
    button = await PublicCheckoutButton.find_one(
        {"button_id": button_id, "owner_id": current_user.id}
    )
    if not button:
        raise HTTPException(status_code=404, detail="Button not found")

    # Update allowed fields
    update_data = {
        k: v
        for k, v in button_data.items()
        if k
        in [
            "title",
            "description",
            "defaultAmount",
            "allowCustomAmount",
            "redirectUrl",
            "buttonText",
            "buttonColor",
        ]
    }

    for field, value in update_data.items():
        setattr(button, field, value)

    await button.save()

    return {
        "_id": str(button.id),
        "id": str(button.id),
        "message": "Button updated successfully",
        "button": {
            "_id": str(button.id),
            "id": str(button.id),
            "buttonId": button.button_id,
            "title": button.title,
            "description": button.description,
            "defaultAmount": button.default_amount,
            "allowCustomAmount": button.allow_custom_amount,
            "redirectUrl": button.redirect_url,
            "buttonText": button.button_text,
            "buttonColor": button.button_color,
            "isActive": button.is_active,
            "totalClicks": button.total_clicks,
            "totalPayments": button.total_payments,
            "createdAt": button.created_at,
            "updatedAt": button.updated_at,
        },
    }


@router.delete("/buttons/{button_id}", response_model=dict)
async def delete_button(
    button_id: str,
    current_user: User = Depends(get_current_user),
):
    # Protected endpoint - requires authentication
    button = await PublicCheckoutButton.find_one(
        {"button_id": button_id, "owner_id": current_user.id}
    )
    if not button:
        raise HTTPException(status_code=404, detail="Button not found")

    await button.delete()

    return {"id": button_id, "message": "Button deleted successfully"}
