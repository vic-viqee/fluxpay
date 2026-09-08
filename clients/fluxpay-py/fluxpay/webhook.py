"""Webhook signature verification for FluxPay events.

Matching the gateway: payloads are signed with HMAC-SHA256 (hex) over the
**exact raw body bytes** that were POSTed. When verifying, always reconstruct
or capture the raw body — never re-serialize parsed JSON, since key order and
whitespace change the signature.
"""

import hashlib
import hmac
from typing import Any, Callable, cast


def _as_bytes(raw_body: str | bytes) -> bytes:
    return raw_body if isinstance(raw_body, bytes) else raw_body.encode()


def verify_webhook_signature(
    raw_body: str | bytes,
    signature: str,
    secret: str,
    *,
    digestmod: Callable[[], Any] = hashlib.sha256,
) -> bool:
    """Return True if ``signature`` matches HMAC(secret, raw_body).

    Constant-time comparison is used to avoid timing side channels.
    """
    expected = hmac.new(secret.encode(), _as_bytes(raw_body), digestmod).hexdigest()
    return hmac.compare_digest(expected, signature)


class FastAPIWebhook:
    """FastAPI dependency that validates the FluxPay webhook signature.

    Usage::

        app = FastAPI()

        @app.post("/fluxpay-webhook")
        async def on_webhook(
            event: dict = Depends(FastAPIWebhook.verify("whsec_...")),
        ):
            # event == {"event": "payment.success", "timestamp": "...", "data": {...}}
            await handler(event)

    The raw body is captured before JSON parsing and compared against the
    ``X-Webhook-Signature`` header; a 401 is raised when it does not match.
    """

    @staticmethod
    def verify(secret: str):
        from fastapi import HTTPException, Request

        async def dependency(request: Request) -> dict[str, Any]:
            raw = await request.body()
            signature = request.headers.get("x-webhook-signature", "")
            if not signature or not verify_webhook_signature(raw, signature, secret):
                raise HTTPException(status_code=401, detail="Invalid webhook signature")
            return cast(dict[str, Any], await request.json())

        return dependency


def webhook_events() -> tuple[str, ...]:
    """The event names the gateway may deliver."""
    return ("payment.success", "payment.failed", "subscription.created")