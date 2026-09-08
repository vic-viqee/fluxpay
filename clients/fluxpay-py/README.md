# fluxpay-py

Python client + webhook verification for the [FluxPay gateway](../../docs/integration/README.md).
Async (httpx), FastAPI-friendly.

## Install

From the repo, with your local backend/env in mind:

```bash
pip install -e ./clients/fluxpay-py          # base
pip install -e ./clients/fluxpay-py[fastapi] # + FastAPI webhook dependency
```

## Quick start

```python
from fluxpay import FluxClient, FluxConfig

config = FluxConfig(api_key="fpk_...", api_secret="...")  # base_url defaults to deployed sandbox

async with FluxClient(config) as fp:
    result = await fp.initiate_payment(
        amount=150,
        phone_number="254708374149",
        reference="EDU-ORD-123",
        idempotency_key="order-123-initiate",  # dedupes retries
    )
    checkout_id = result["data"]["checkoutRequestId"]

    # later
    txn = await fp.get_payment_status(checkout_id)
    print(txn["data"]["status"])  # PENDING | SUCCESS | FAILED
```

For a long-lived usage (e.g. FastAPI app), pass your own httpx client:

```python
import httpx
from fluxpay import FluxClient, FluxConfig

async with httpx.AsyncClient(timeout=30) as http:
    fp = FluxClient(FluxConfig(api_key=..., api_secret=...), client=http)
    status = await fp.get_payment_status(checkout_id)
```

## Webhook verification

FluxPay signs each delivery with HMAC-SHA256 over the **exact raw body**
(`X-Webhook-Signature` header). Verify against the raw bytes, never a
re-serialized copy.

```python
from fluxpay import verify_webhook_signature, FastAPIWebhook
from fastapi import Depends, FastAPI

app = FastAPI()

# Dependency-based: auto-captures raw body, 401s on mismatch
@app.post("/fluxpay-webhook")
async def on_webhook(event: dict = Depends(FastAPIWebhook.verify("whsec_..."))):
    print(event["event"], event["data"])
```

Or manually with Starlette/any framework:

```python
from fluxpay import verify_webhook_signature

async def verify(request):
    raw = await request.body()
    if not verify_webhook_signature(raw, request.headers["x-webhook-signature"], "whsec_..."):
        return 401
```

## API

| Method | Endpoint |
|--------|----------|
| `initiate_payment(amount, phone_number, reference?, description?, idempotency_key?)` | `POST /api/v1/payments` |
| `get_payment_status(checkout_request_id)` | `GET /api/v1/payments/:id` |
| `reverse_payment(checkout_request_id, initiator_name?)` | `POST /api/v1/payments/:id/reverse` |
| `register_webhook(url, name?, events?)` | `POST /api/v1/webhooks` (secret returned once) |
| `list_webhooks()` | `GET /api/v1/webhooks` |
| `delete_webhook(webhook_id)` | `DELETE /api/v1/webhooks/:id` |
| `test_webhook(webhook_id)` | `POST /api/v1/webhooks/:id/test` |
| `list_webhook_deliveries(webhook_id, limit?)` | `GET /api/v1/webhooks/:id/deliveries` |
| `replay_webhook(webhook_id, delivery_id?)` | `POST /api/v1/webhooks/:id/replay` |
| `get_business()` | `GET /api/v1/business` |
| `ping()` | `GET /health` (keep-alive) |

Every method returns the `{success, message, data}` envelope and raises
`FluxPayError(status_code, detail)` on non-2xx.

## Security

Keep `api_secret` and webhook secrets in environment variables / secret
management — never ship them client-side.