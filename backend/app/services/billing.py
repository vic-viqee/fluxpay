from datetime import datetime, timezone, timedelta
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
from app.notifications.service import get_notification_service

GRACE_PERIOD_DAYS = 7


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
                    subscription.status = "SUSPENDED"
                    now = datetime.now(timezone.utc)
                    subscription.suspended_at = now
                    subscription.grace_period_ends_at = now + timedelta(days=GRACE_PERIOD_DAYS)

                    logger.warning(f"Subscription {subscription.id} suspended with grace period until {subscription.grace_period_ends_at}")

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


async def process_grace_periods():
    logger.info("Running process_grace_periods...")
    now = datetime.now(timezone.utc)

    try:
        suspended_subs = await Subscription.find(
            {"status": "SUSPENDED"}
        ).to_list()

        for sub in suspended_subs:
            if not sub.suspended_at:
                continue

            days_in_grace = (now - sub.suspended_at).days
            client = await Client.get(sub.client_id)
            plan = await ServicePlan.get(sub.plan_id)
            owner = await User.get(sub.owner_id)

            if not client or not plan or not owner:
                continue

            if sub.grace_period_ends_at and now >= sub.grace_period_ends_at:
                sub.status = "CANCELLED"
                logger.info(f"Subscription {sub.id} cancelled after grace period")
                await sub.save()
                continue

            if not sub.dunning_reminders_sent:
                sub.dunning_reminders_sent = {}

            context = {
                "customer_name": client.name or "Valued Customer",
                "plan_name": plan.name or "Subscription",
                "amount": f"{plan.amount_kes:,.0f}",
                "grace_period_days": str(GRACE_PERIOD_DAYS),
            }

            svc = get_notification_service()

            if days_in_grace >= 1 and not sub.dunning_reminders_sent.get("day1"):
                await svc.notify(
                    "REMINDER_DAY1",
                    owner.email,
                    {"subject": "Payment Failed - Please Update Payment Method", **context},
                )
                if client.phone_number:
                    await svc.notify("REMINDER_DAY1", client.phone_number, context)
                sub.dunning_reminders_sent["day1"] = True
                await sub.save()

            if days_in_grace >= 3 and not sub.dunning_reminders_sent.get("day3"):
                await svc.notify(
                    "REMINDER_DAY3",
                    owner.email,
                    {"subject": "Last Chance - Update Payment Method", **context},
                )
                if client.phone_number:
                    await svc.notify("REMINDER_DAY3", client.phone_number, context)
                sub.dunning_reminders_sent["day3"] = True
                await sub.save()

            if days_in_grace >= 5 and not sub.dunning_reminders_sent.get("day5"):
                await svc.notify(
                    "REMINDER_DAY5",
                    owner.email,
                    {"subject": "Subscription Will Be Cancelled Soon", **context},
                )
                if client.phone_number:
                    await svc.notify("REMINDER_DAY5", client.phone_number, context)
                sub.dunning_reminders_sent["day5"] = True
                await sub.save()

    except Exception as e:
        logger.error(f"Error processing grace periods: {e}")
