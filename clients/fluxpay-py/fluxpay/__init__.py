"""FluxPay Python client and webhook verification.

The client mirrors the /api/v1 gateway endpoints and ships with:

- ``FluxClient``: async HTTP client (httpx) for payments, reversals,
  and webhook management.
- ``verify_webhook_signature``: HMAC-SHA256 verification against the
  **exact raw body** received (see ``fastapi_webhook`` for FastAPI).
"""

from .client import FluxClient, FluxConfig, FluxPayError
from .webhook import FastAPIWebhook, verify_webhook_signature

__all__ = [
    "FluxClient",
    "FluxConfig",
    "FluxPayError",
    "verify_webhook_signature",
    "FastAPIWebhook",
]

__version__ = "0.1.0"