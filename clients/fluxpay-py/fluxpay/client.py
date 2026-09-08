"""Async FluxPay API client."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import httpx

DEFAULT_BASE_URL = "https://fluxpay-backend.onrender.com"
API_PREFIX = "/api/v1"


class FluxPayError(Exception):
    """Raised for non-2xx responses, carrying the API detail message."""

    def __init__(self, status_code: int, detail: str | None):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail or f"FluxPay request failed: HTTP {status_code}")


@dataclass
class FluxConfig:
    api_key: str
    api_secret: str
    base_url: str = DEFAULT_BASE_URL

    def __post_init__(self) -> None:
        self.base_url = self.base_url.rstrip("/")


class FluxClient:
    """Small async client for the FluxPay gateway.

    Use as a context manager so the underlying httpx client is closed::

        async with FluxClient(config) as fp:
            res = await fp.initiate_payment(amount=150, phone_number="254708374149")
    """

    def __init__(self, config: FluxConfig | None = None, *, client: httpx.AsyncClient | None = None):
        self._config = config
        self._owned = client is None
        self._client = client or httpx.AsyncClient(timeout=30)

    async def __aenter__(self) -> "FluxClient":
        return self

    async def __aexit__(self, *exc: Any) -> None:
        if self._owned:
            await self._client.aclose()

    # -- low level ---------------------------------------------------------

    async def _request(
        self,
        method: str,
        path: str,
        json: dict[str, Any] | None = None,
        *,
        idempotency_key: str | None = None,
    ) -> dict[str, Any]:
        if not self._config:
            raise RuntimeError("FluxClient requires a FluxConfig when created without a client")
        headers: dict[str, str] = {
            "X-API-Key": self._config.api_key,
            "X-API-Secret": self._config.api_secret,
            "Accept": "application/json",
        }
        if idempotency_key:
            headers["X-Idempotency-Key"] = idempotency_key

        response = await self._client.request(
            method,
            f"{self._config.base_url}{API_PREFIX}{path}",
            json=json,
            headers=headers,
        )
        if response.status_code >= 400:
            detail: str | None = None
            try:
                body = response.json()
                detail = body.get("detail") or body.get("message")
            except Exception:
                pass
            raise FluxPayError(response.status_code, detail)
        return response.json()

    # -- payments ----------------------------------------------------------

    async def initiate_payment(
        self,
        amount: float | int,
        phone_number: str,
        reference: str | None = None,
        description: str | None = None,
        idempotency_key: str | None = None,
    ) -> dict[str, Any]:
        """POST /api/v1/payments — initiate an STK push.

        ``idempotency_key`` dedupes retries: replaying the same key returns the
        original response instead of charging twice.
        """
        return await self._request(
            "POST",
            "/payments",
            {
                "amount": amount,
                "phoneNumber": phone_number,
                "reference": reference,
                "description": description,
            },
            idempotency_key=idempotency_key,
        )

    async def get_payment_status(self, checkout_request_id: str) -> dict[str, Any]:
        """GET /api/v1/payments/{id} — current transaction record."""
        return await self._request("GET", f"/payments/{checkout_request_id}")

    async def reverse_payment(
        self, checkout_request_id: str, initiator_name: str | None = None
    ) -> dict[str, Any]:
        """POST /api/v1/payments/{id}/reverse — refund a SUCCESS payment."""
        return await self._request(
            "POST",
            f"/payments/{checkout_request_id}/reverse",
            {"initiatorName": initiator_name},
        )

    # -- webhooks ----------------------------------------------------------

    async def register_webhook(
        self,
        url: str,
        *,
        name: str | None = None,
        events: list[str] | None = None,
    ) -> dict[str, Any]:
        """POST /api/v1/webhooks — secret returned once in response."""
        return await self._request(
            "POST",
            "/webhooks",
            {"url": url, "name": name, "events": events or ["payment.success", "payment.failed"]},
        )

    async def list_webhooks(self) -> dict[str, Any]:
        return await self._request("GET", "/webhooks")

    async def delete_webhook(self, webhook_id: str) -> dict[str, Any]:
        return await self._request("DELETE", f"/webhooks/{webhook_id}")

    async def test_webhook(self, webhook_id: str) -> dict[str, Any]:
        """POST /api/v1/webhooks/{id}/test — send a one-off 'ping' event."""
        return await self._request("POST", f"/webhooks/{webhook_id}/test", {})

    async def list_webhook_deliveries(
        self, webhook_id: str, limit: int = 20
    ) -> dict[str, Any]:
        limit = max(1, min(int(limit), 100))
        return await self._request(
            "GET", f"/webhooks/{webhook_id}/deliveries?limit={limit}"
        )

    async def replay_webhook(
        self, webhook_id: str, delivery_id: str | None = None
    ) -> dict[str, Any]:
        body = {"deliveryId": delivery_id} if delivery_id else {}
        return await self._request("POST", f"/webhooks/{webhook_id}/replay", body)

    async def get_business(self) -> dict[str, Any]:
        return await self._request("GET", "/business")

    async def ping(self) -> httpx.Response:
        """GET /health — liveness/keep-alive probe (no auth)."""
        return await self._client.get(f"{self._config.base_url}/health", timeout=20)  # type: ignore[union-attr]