from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from datetime import datetime, timezone

from app.dependencies import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.models.subscription import Subscription
from app.models.client import Client
from app.models.service_plan import ServicePlan
from app.services.mpesa import get_auth_token
from app.services.webhook import trigger_payment_success, trigger_payment_failed
from app.utils.logger import logger

router = APIRouter()


@router.post("/stk-push")
async def initiate_stk_push(
    phone_number: str,
    amount: float,
    account_reference: str = "FluxPay",
    transaction_desc: str = "FluxPay Payment",
    current_user: User = Depends(get_current_user),
):
    from app.services.mpesa import initiate_stk_push as mpesa_stk_push

    try:
        stk_response = await mpesa_stk_push(
            phone_number=phone_number,
            amount=amount,
            account_reference=account_reference,
            transaction_desc=transaction_desc,
        )
        return {
            "message": "STK push initiated",
            "checkoutRequestId": stk_response.get("CheckoutRequestID"),
            "customerMessage": "Success. Request accepted for processing",
            "responseCode": "0",
        }
    except Exception as e:
        logger.error(f"STK push failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to initiate STK push")


@router.get("/balance")
async def get_account_balance(
    current_user: User = Depends(get_current_user),
):
    from app.services.mpesa import get_account_balance as mpesa_get_balance

    try:
        balance = await mpesa_get_balance()
        return balance
    except Exception as e:
        logger.error(f"Failed to get balance: {e}")
        raise HTTPException(status_code=500, detail="Failed to query account balance")


@router.get("/status/{checkout_request_id}")
async def get_transaction_status(
    checkout_request_id: str,
    current_user: User = Depends(get_current_user),
):
    from app.services.mpesa import get_transaction_status as mpesa_get_status

    try:
        status_result = await mpesa_get_status(checkout_request_id)
        return status_result
    except Exception as e:
        logger.error(f"Failed to get transaction status: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to query transaction status"
        )


@router.post("/callback", response_model=dict)
async def handle_mpesa_callback(
    callback_data: dict,
):
    """Handle M-Pesa callbacks for subscription payments"""
    try:
        body = callback_data.get("Body", {})
        stk_callback = body.get("stkCallback", {})

        if not stk_callback:
            return {"ResultCode": 0, "ResultDesc": "Received"}

        checkout_request_id = stk_callback.get("CheckoutRequestID")
        result_code = stk_callback.get("ResultCode")
        result_desc = stk_callback.get("ResultDesc")

        # Find the transaction by checkoutRequestId (subscription transactions)
        transaction = await Transaction.find_one(
            {"daraja_request_id": checkout_request_id}
        )

        if not transaction:
            logger.warning(f"Transaction not found for checkout: {checkout_request_id}")
            return {"ResultCode": 0, "ResultDesc": "Received"}

        if result_code == 0:
            metadata = stk_callback.get("CallbackMetadata", {}).get("Item", [])
            get_item = lambda name: next(
                (i for i in metadata if i.get("Name") == name), {}
            ).get("Value")

            transaction.status = "SUCCESS"
            transaction.mpesa_receipt_no = get_item("MpesaReceiptNumber")
            transaction.daraja_request_id = get_item("TransactionId")
            transaction.callback_data = callback_data
        else:
            transaction.status = "FAILED"
            transaction.failure_reason = result_desc
            transaction.callback_data = callback_data

        await transaction.save()

        # If subscription transaction, update subscription
        if transaction.subscription_id:
            subscription = await Subscription.get(transaction.subscription_id)
            if subscription:
                if result_code == 0:
                    subscription.status = "ACTIVE"
                    subscription.last_payment_attempt = datetime.now(timezone.utc)
                    subscription.payment_failure_count = 0

                    # Calculate next billing date
                    from app.utils.billing import calculate_next_billing_date

                    plan = await ServicePlan.get(subscription.plan_id)
                    if plan:
                        subscription.next_billing_date = calculate_next_billing_date(
                            datetime.now(timezone.utc), plan.frequency, plan.billing_day
                        )
                    await subscription.save()

                    # Trigger webhook
                    await trigger_payment_success(
                        subscription.owner_id,
                        {
                            "event": "subscription.created",
                            "subscriptionId": str(subscription.id),
                            "amount": transaction.amount_kes,
                            "status": "ACTIVE",
                        },
                    )
                else:
                    subscription.payment_failure_count = (
                        subscription.payment_failure_count or 0
                    ) + 1
                    await subscription.save()

        logger.info(f"M-Pesa callback processed for: {checkout_request_id}")
        return {"ResultCode": 0, "ResultDesc": "Received"}
    except Exception as e:
        logger.error(f"M-Pesa callback error: {e}")
        return {"ResultCode": 0, "ResultDesc": "Received"}
