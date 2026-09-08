import hashlib
import hmac
import json
from typing import Any
from bson import ObjectId
import httpx

from app.models.webhook import Webhook
from app.models.webhook_delivery import WebhookDelivery
from app.models.api_key import ApiKey
from app.utils.password import verify_password
from app.utils.logger import logger

WEBHOOK_RETRY_DELAYS = [60000, 300000, 86400000]


def sign_payload(payload: str, secret: str) -> str:
    return hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()


def build_webhook_payload(event: str, data: dict[str, Any]) -> dict[str, Any]:
    import datetime

    return {
        "event": event,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "data": data,
    }


async def find_api_key(key: str) -> dict | None:
    api_key = await ApiKey.find_one(ApiKey.key == key, ApiKey.is_active == True)
    if not api_key:
        return None
    return {"api_key": api_key, "owner_id": api_key.owner_id}


async def _send_webhook(
    webhook: Webhook,
    payload: dict[str, Any],
    payload_string: str,
    event: str,
) -> dict[str, Any]:
    """POST a signed webhook payload to a webhook URL. Never raises."""
    result: dict[str, Any] = {
        "success": False,
        "status_code": None,
        "response_body": None,
        "error": None,
    }
    try:
        signature = sign_payload(payload_string, webhook.secret)
        async with httpx.AsyncClient() as client:
            response = await client.post(
                webhook.url,
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "X-Webhook-Signature": signature,
                    "X-Webhook-Event": event,
                },
                timeout=30,
            )
        result["success"] = True
        result["status_code"] = response.status_code
        result["response_body"] = (response.text or "")[:5000]
    except Exception as e:
        result["error"] = str(e)
        logger.info(f"Webhook delivery failed for {webhook.url}: {e}")
    return result


async def _record_delivery(
    webhook: Webhook,
    event: str,
    payload: dict[str, Any],
    result: dict[str, Any],
) -> WebhookDelivery:
    delivery = WebhookDelivery(
        webhook_id=webhook.id,
        owner_id=webhook.owner_id,
        event=event,
        payload=payload,
        payload_signature=sign_payload(json.dumps(payload), webhook.secret),
        success=result["success"],
        response_status=result.get("status_code"),
        response_body=result.get("response_body"),
        error=result.get("error"),
    )
    await delivery.create()
    return delivery


async def deliver_webhook(
    webhook: Webhook,
    event: str,
    data: dict[str, Any],
) -> WebhookDelivery:
    """Deliver one event to one webhook, record the delivery, update failure state."""
    import datetime

    payload = build_webhook_payload(event, data)
    payload_string = json.dumps(payload)
    result = await _send_webhook(webhook, payload, payload_string, event)
    delivery = await _record_delivery(webhook, event, payload, result)

    if result["success"]:
        webhook.last_triggered_at = datetime.datetime.now(datetime.timezone.utc)
        webhook.failure_count = 0
        await webhook.save()
        logger.info(f"Webhook delivered successfully for event: {event}")
    else:
        webhook.failure_count = (webhook.failure_count or 0) + 1
        await webhook.save()

        if webhook.failure_count >= 3:
            webhook.is_active = False
            await webhook.save()
            logger.warning(f"Webhook {webhook.url} disabled after 3 consecutive failures")

    return delivery


async def forward_webhook(owner_id: Any, event: str, data: dict[str, Any]):
    webhooks = await Webhook.find(
        Webhook.owner_id == owner_id,
        Webhook.is_active == True,
        Webhook.events == event,
    ).to_list()

    if not webhooks:
        logger.info(f"No webhooks configured for event: {event}")
        return

    for webhook in webhooks:
        await deliver_webhook(webhook, event, data)


async def trigger_payment_success(owner_id: Any, transaction_data: dict[str, Any]):
    await forward_webhook(owner_id, "payment.success", transaction_data)


async def trigger_payment_failed(owner_id: Any, transaction_data: dict[str, Any]):
    await forward_webhook(owner_id, "payment.failed", transaction_data)


async def trigger_subscription_created(
    owner_id: Any, subscription_data: dict[str, Any]
):
    await forward_webhook(owner_id, "subscription.created", subscription_data)


async def verify_api_key(key: str, secret: str) -> bool:
    api_key = await ApiKey.find_one(ApiKey.key == key, ApiKey.is_active == True)
    if not api_key:
        return False
    return verify_password(secret, api_key.secret)