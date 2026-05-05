from datetime import datetime, timezone, timedelta
from bson import ObjectId
from beanie import PydanticObjectId

from app.models.subscription import Subscription
from app.models.transaction import Transaction
from app.models.service_plan import ServicePlan
from app.models.client import Client
from app.models.user import User
from app.services.mpesa import initiate_stk_push
from app.services.email import (
    send_payment_failure_email,
    send_subscription_suspended_email,
)
from app.utils.billing import calculate_next_billing_date
from app.utils.logger import logger


async def process_due_payments():
    logger.info("Running process_due_payments...")
    today = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )

    try:
        due_subscriptions = await Subscription.find(
            {"status": "ACTIVE", "next_billing_date": {"$lte": today}}
        ).to_list()

        for subscription in due_subscriptions:
            client = await Client.get(subscription.client_id)
            plan = await ServicePlan.get(subscription.plan_id)
            owner = await User.get(subscription.owner_id)

            if not client or not plan:
                logger.error(
                    f"Skipping subscription {subscription.id}: Missing client or plan"
                )
                continue

            if not client.phone_number or not plan.amount_kes:
                logger.error(
                    f"Skipping subscription {subscription.id}: Missing phone or amount"
                )
                continue

            try:
                stk_response = await initiate_stk_push(
                    client.phone_number,
                    plan.amount_kes,
                    owner.business_name if owner else "FluxPay",
                )

                new_transaction = Transaction(
                    subscription_id=PydanticObjectId(str(subscription.id)),
                    owner_id=PydanticObjectId(str(subscription.owner_id)),
                    amount_kes=plan.amount_kes,
                    status="PENDING",
                    retry_count=0,
                    daraja_request_id=stk_response.get("CheckoutRequestID", ""),
                )
                await new_transaction.create()

                subscription.last_payment_attempt = datetime.now(timezone.utc)
                subscription.payment_failure_count = 0
                await subscription.save()

                logger.info(f"STK Push initiated for subscription {subscription.id}")
            except Exception as e:
                logger.error(f"Failed STK Push for subscription {subscription.id}: {e}")
                failure_count = (subscription.payment_failure_count or 0) + 1
                subscription.payment_failure_count = failure_count

                if failure_count >= 3:
                    subscription.status = "FAILED"
                    logger.warning(f"Subscription {subscription.id} marked as FAILED")
                    if owner:
                        await send_subscription_suspended_email(
                            owner_email=owner.email,
                            business_name=owner.business_name or "FluxPay",
                            client_name=client.name or "Unknown",
                            phone_number=client.phone_number or "Unknown",
                            plan_name=plan.name or "Unknown",
                            amount=plan.amount_kes or 0,
                        )
                elif owner:
                    await send_payment_failure_email(
                        owner_email=owner.email,
                        business_name=owner.business_name or "FluxPay",
                        client_name=client.name or "Unknown",
                        phone_number=client.phone_number or "Unknown",
                        plan_name=plan.name or "Unknown",
                        amount=plan.amount_kes or 0,
                        failure_count=failure_count,
                    )

                await subscription.save()
    except Exception as e:
        logger.error(f"Error processing due payments: {e}")


async def process_failed_transactions():
    logger.info("Running process_failed_transactions...")
    twenty_four_hours_ago = datetime.now(timezone.utc) - timedelta(hours=24)

    try:
        failed_transactions = await Transaction.find(
            {
                "status": "FAILED",
                "retry_count": {"$lt": 3},
                "updated_at": {"$lte": twenty_four_hours_ago},
            }
        ).to_list()

        for transaction in failed_transactions:
            subscription = (
                await Subscription.get(transaction.subscription_id)
                if transaction.subscription_id
                else None
            )
            if not subscription:
                continue

            client = await Client.get(subscription.client_id)
            plan = await ServicePlan.get(subscription.plan_id)
            owner = await User.get(subscription.owner_id)

            if not client or not plan or not client.phone_number or not plan.amount_kes:
                logger.error(
                    f"Skipping failed transaction {transaction.id}: Missing details"
                )
                continue

            try:
                stk_response = await initiate_stk_push(
                    client.phone_number,
                    plan.amount_kes,
                    owner.business_name if owner else "FluxPay",
                )

                retried_transaction = Transaction(
                    subscription_id=PydanticObjectId(str(subscription.id)),
                    owner_id=PydanticObjectId(str(subscription.owner_id)),
                    amount_kes=plan.amount_kes,
                    status="PENDING",
                    daraja_request_id=stk_response.get("CheckoutRequestID", ""),
                    retry_count=(transaction.retry_count or 0) + 1,
                )
                await retried_transaction.create()

                logger.info(f"Retry STK Push for transaction {transaction.id}")
            except Exception as e:
                logger.error(
                    f"Failed retry STK Push for transaction {transaction.id}: {e}"
                )
                transaction.retry_count = (transaction.retry_count or 0) + 1
                await transaction.save()
    except Exception as e:
        logger.error(f"Error processing failed transactions: {e}")
