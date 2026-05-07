import hashlib
import hmac
import json
from typing import Any
from bson import ObjectId
import httpx

from app.models.webhook import Webhook
from app.models.api_key import ApiKey
from app.utils.password import verify_password
from app.utils.logger import logger

WEBHOOK_RETRY_DELAYS = [60000, 300000, 86400000]


def sign_payload(payload: str, secret: str) -> str:
    return hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()


async def find_api_key(key: str) -> dict | None:
    api_key = await ApiKey.find_one({"key": key, "is_active": True})
    if not api_key:
        return None
    return {"api_key": api_key, "owner_id": api_key.owner_id}


async def forward_webhook(owner_id: Any, event: str, data: dict[str, Any]):
    webhooks = await Webhook.find(
        {"owner_id": owner_id, "is_active": True, "events": event}
    ).to_list()

    if not webhooks:
        logger.info(f"No webhooks configured for event: {event}")
        return

    import datetime

    payload = {
        "event": event,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "data": data,
    }
    payload_string = json.dumps(payload)

    for webhook in webhooks:
        try:
            signature = sign_payload(payload_string, webhook.secret)
            async with httpx.AsyncClient() as client:
                await client.post(
                    webhook.url,
                    json=payload,
                    headers={
                        "Content-Type": "application/json",
                        "X-Webhook-Signature": signature,
                        "X-Webhook-Event": event,
                    },
                    timeout=30,
                )

            webhook.last_triggered_at = datetime.datetime.now(datetime.timezone.utc)
            webhook.failure_count = 0
            await webhook.save()
            logger.info(f"Webhook delivered successfully for event: {event}")
        except Exception as e:
            logger.error(f"Webhook delivery failed for {webhook.url}: {e}")
            webhook.failure_count = (webhook.failure_count or 0) + 1
            await webhook.save()

            if webhook.failure_count >= 3:
                webhook.is_active = False
                await webhook.save()
                logger.warning(
                    f"Webhook {webhook.url} disabled after 3 consecutive failures"
                )


async def trigger_payment_success(owner_id: Any, transaction_data: dict[str, Any]):
    await forward_webhook(owner_id, "payment.success", transaction_data)


async def trigger_payment_failed(owner_id: Any, transaction_data: dict[str, Any]):
    await forward_webhook(owner_id, "payment.failed", transaction_data)


async def trigger_subscription_created(
    owner_id: Any, subscription_data: dict[str, Any]
):
    await forward_webhook(owner_id, "subscription.created", subscription_data)


async def verify_api_key(key: str, secret: str) -> bool:
    api_key = await ApiKey.find_one({"key": key, "is_active": True})
    if not api_key:
        return False
    return verify_password(secret, api_key.secret)
