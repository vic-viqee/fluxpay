# FluxPay Gateway Integration

Connect any project to M-Pesa through FluxPay. One API key gives you STK push
payments, idempotent initiation, reversals, and signed webhooks — no need to
talk to Daraja directly.

## Base URLs

| Environment | Base URL |
|-------------|----------|
| Sandbox (deployed) | `https://fluxpay-backend.onrender.com/api/v1` |
| Local | `http://localhost:8000/api/v1` |

> **Render free tier cold start**: the deployed instance sleeps after ~15 min of
> inactivity. First request may take 30-60 s while it wakes up. Ship the
> keep-alive pinger (`scripts/keepalive`) to keep it warm.

## Authentication

Every `/api/v1` request authenticates with two headers — the API key and its
secret:

```
X-API-Key:    fpk_<16 hex chars>
X-API-Secret: <64 hex chars>
```

The secret is only shown **once** at creation. Store it in your environment
variables, never in client-side code.

## 1. Create a merchant and API key (one-time bootstrap)

Signup is form-encoded (dashboard-equivalent):

```bash
curl -X POST https://fluxpay-backend.onrender.com/api/auth/signup \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=you@yourproject.com&password=YourPass123&businessName=Your Project&businessPhoneNumber=254712345678"
```

Login to get a merchant JWT (cookies are returned; use `-c/-b` jar or read the
`token` field):

```bash
curl -X POST https://fluxpay-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@yourproject.com","password":"YourPass123"}'
```

Create an API key (JWT `Authorization: Bearer <token>` required):

```bash
curl -X POST https://fluxpay-backend.onrender.com/api/apikeys/ \
  -H "Authorization: Bearer <merchant_jwt>" \
  -H "Content-Type: application/json" \
  -d '{"name":"production"}'
```

Response contains `"apiKey": "fpk_..."` and `"apiSecret": "..."` **once** —
save both now.

Check your key works:

```bash
curl -s https://fluxpay-backend.onrender.com/api/v1/business \
  -H "X-API-Key: fpk_..." -H "X-API-Secret: ..."
```

## 2. Initiate a payment (STK push)

```bash
curl -X POST https://fluxpay-backend.onrender.com/api/v1/payments \
  -H "X-API-Key: fpk_..." -H "X-API-Secret: ..." \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: order-123-retry-1" \
  -d '{
    "amount": 150,
    "phoneNumber": "254708374149",
    "reference": "EDU-ORD-123",
    "description": "Term 1 fees"
  }'
```

Request body:

| Field | Type | Notes |
|-------|------|-------|
| `amount` | number | KES, required |
| `phoneNumber` | string | `2547...` or `07...` formats accepted, required |
| `reference` | string | Optional. Defaults to `TXN-<unix>`. Use your project prefix (see #6) |
| `description` | string | Optional. Shown in the STK push |

Success response:

```json
{
  "success": true,
  "message": "STK push initiated",
  "data": {
    "checkoutRequestId": "ws_CO_...",
    "amount": 150.0,
    "phoneNumber": "254708374149",
    "reference": "EDU-ORD-123",
    "status": "PENDING"
  }
}
```

The payer approves the push on their phone; the result arrives via webhook.

### Idempotency

Send `X-Idempotency-Key: <your-value>` with the payment request. If you retry
with the same key (same merchant, same endpoint), FluxPay returns the **original
response** instead of creating a duplicate charge. Use one key per logical
operation (e.g. `order-<id>-initiate`), stable across network retries.

## 3. Check payment status

```bash
curl -s https://fluxpay-backend.onrender.com/api/v1/payments/ws_CO_... \
  -H "X-API-Key: fpk_..." -H "X-API-Secret: ..."
```

Returns the full transaction record (`status` in `PENDING`, `SUCCESS`,
`FAILED`), plus `amountKes`, `phoneNumber` (formatted `2547...`), `reference`,
`mpesaReceiptNo`, timestamps.

## 4. Reverse a payment

```bash
curl -X POST https://fluxpay-backend.onrender.com/api/v1/payments/ws_CO_.../reverse \
  -H "X-API-Key: fpk_..." -H "X-API-Secret: ..." \
  -H "Content-Type: application/json" \
  -d '{"initiatorName":"YourProject"}'
```

Constraints:

- Only `SUCCESS` transactions with an M-Pesa receipt can be reversed.
- Returns 503 if M-Pesa reversal is not configured on the account.
- `M-Pesa reversal is not supported in sandbox` in some cases — see #7.

## 5. Webhooks

Webhooks are the primary way to learn a payment completed or failed — don't
rely on polling.

### Register a webhook

```bash
curl -X POST https://fluxpay-backend.onrender.com/api/v1/webhooks \
  -H "X-API-Key: fpk_..." -H "X-API-Secret: ..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "production endpoint",
    "url": "https://yourproject.com/webhooks/fluxpay",
    "events": ["payment.success", "payment.failed"]
  }'
```

Events: `payment.success`, `payment.failed`, `subscription.created`. Defaults
to `["payment.success", "payment.failed"]`.

The response includes the webhook `secret` — **shown only once**. It signs
every delivery.

### Delivery payload

```json
{
  "event": "payment.success",
  "timestamp": "2026-09-08T12:00:00+00:00",
  "data": { "...": "..." }
}
```

Headers on every delivery:

```
Content-Type:        application/json
X-Webhook-Signature: <hex sha256 hmac>
X-Webhook-Event:     payment.success
```

### Verify the signature

Compute HMAC-SHA256 over the **exact raw request body** (the bytes you
received, not a re-serialized object) using the webhook secret, hex-encoded,
and compare to `X-Webhook-Signature`. Timing-safe comparison recommended.

```js
// Node.js (with a raw-body parser; raw = Buffer of the request body)
const crypto = require("crypto");
const expected = crypto
  .createHmac("sha256", process.env.FLUXPAY_WEBHOOK_SECRET)
  .update(raw)
  .digest("hex");
const ok = crypto.timingSafeEqual(
  Buffer.from(expected, "hex"),
  Buffer.from(req.headers["x-webhook-signature"], "hex")
);
```

```python
# FastAPI/Flask — use request.body() / request.get_data() BEFORE parsing
import hashlib, hmac

def verify(raw_body: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)

# in FastAPI: raw = await request.body()  # not request.json()
```

Always respond `2xx` quickly; return non-2xx if you want to view it as failed
in deliveries and replay it later.

### Test ping and delivery log

```bash
# Send a test event ("ping") to the webhook now
curl -X POST https://fluxpay-backend.onrender.com/api/v1/webhooks/<webhook_id>/test \
  -H "X-API-Key: fpk_..." -H "X-API-Secret: ..."

# Delivery history (latest first, up to 100)
curl -s "https://fluxpay-backend.onrender.com/api/v1/webhooks/<webhook_id>/deliveries?limit=20" \
  -H "X-API-Key: fpk_..." -H "X-API-Secret: ..."

# Replay the most recent delivery (or pass {"deliveryId": "..."} for a specific one)
curl -X POST https://fluxpay-backend.onrender.com/api/v1/webhooks/<webhook_id>/replay \
  -H "X-API-Key: fpk_..." -H "X-API-Secret: ..." \
  -H "Content-Type: application/json" \
  -d '{}'

# List webhooks
curl -s https://fluxpay-backend.onrender.com/api/v1/webhooks \
  -H "X-API-Key: fpk_..." -H "X-API-Secret: ..."

# Delete a webhook
curl -X DELETE https://fluxpay-backend.onrender.com/api/v1/webhooks/<webhook_id> \
  -H "X-API-Key: fpk_..." -H "X-API-Secret: ..."
```

### Delivery behavior

- Each event delivers **once**, to every webhook matching the event.
- A delivery is `success` only if the endpoint returned 2xx within 30 s.
- After **3 consecutive failures**, the webhook is auto-disabled (`isActive:
  false`) and stops receiving events. Re-enable by deleting and re-creating it,
  or ping a successful test first.
- Never treat the disabled state as silent data loss — every attempt is stored
  in the delivery log and can be replayed with `/replay`.

## 6. Reference prefixes (reconciliation)

Prefix `reference` with a project code so multi-project accounts can reconcile
M-Pesa statement entries to the right system:

| Project | Reference example |
|---------|-------------------|
| School portal | `EDU-ORD-123` |
| Gym | `GYM-M1-88` |
| Café | `CAFE-TBL-9` |

## 7. Sandbox vs live notes

- Sandbox uses shortcode `174379` and test phone `254708374149` (the M-Pesa
  sandbox phone — approve pushes in the Daraja test app).
- Reversals may not be supported on the sandbox shortcode; rejections surface
  as a 502 with the Daraja error.
- For live, FluxPay requires your real Paybill/Till configured, production
  keys, and a valid HTTP(S) endpoint. Sandbox webhooks still need a public URL
  (e.g. `ngrok`, webhook.site, or your deployed project).

## SDKs

- **JavaScript/TypeScript**: `clients/fluxpay-js` (browser/Node — use server-side
  keys only on Node).
- **Python**: `clients/fluxpay-py` (async client + FastAPI webhook verification
  dependency).

Consume them from git/path — they are not published to npm or PyPI. Usage and
examples live in each package's README.