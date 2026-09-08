# fluxpay-js

TypeScript / JavaScript client for the [FluxPay gateway](../../docs/integration/README.md).
Zero runtime dependencies (uses global `fetch` + Web Crypto, so it runs in
Node >= 18 and browsers).

## Install

From the repo:

```json
{
  "dependencies": {
    "fluxpay-js": "git+https://github.com/<owner>/fluxpay.git#main"
  }
}
```

Or locally:

```bash
cd clients/fluxpay-js
npm install
npm run build   # dist/
# then reference: "fluxpay-js": "file:clients/fluxpay-js"
```

## Quick start

```ts
import {
  initiatePayment,
  getPaymentStatus,
  verifyWebhookSignature,
} from "fluxpay-js";

const fluxpay = {
  apiKey: process.env.FLUXPAY_API_KEY!,
  apiSecret: process.env.FLUXPAY_API_SECRET!,
  // baseURL defaults to the deployed sandbox
};

// STK push — idempotent via idempotencyKey
const { data } = await initiatePayment(fluxpay, {
  amount: 150,
  phoneNumber: "254708374149",
  reference: "EDU-ORD-123",
  idempotencyKey: "order-123-initiate",
});
console.log(data.checkoutRequestId);

// Later, check status
const { data: txn } = await getPaymentStatus(fluxpay, data.checkoutRequestId);
console.log(txn.status); // PENDING | SUCCESS | FAILED
```

## Webhook verification (server-side)

Compute HMAC-SHA256 over the **exact raw request body** with the webhook
secret. Do not re-serialize parsed JSON.

```ts
import { verifyWebhookSignature } from "fluxpay-js";

// Express / raw-body example
const raw = req.rawBody; // Buffer
const ok = await verifyWebhookSignature({
  rawBody: raw,
  signature: req.headers["x-webhook-signature"] as string,
  secret: process.env.FLUXPAY_WEBHOOK_SECRET!,
});
if (!ok) return res.status(401).end();
```

On the FluxPay side every delivery body is signed with `sign_payload(payload_string, secret)`
where payload_string is the exact bytes POSTed, and the recorded
`payload_signature` uses the same canonical JSON — so verifying against the raw
body always matches.

## API

| Method | Endpoint |
|--------|----------|
| `initiatePayment(cfg, {amount, phoneNumber, reference?, description?, idempotencyKey?})` | `POST /api/v1/payments` |
| `getPaymentStatus(cfg, checkoutRequestId)` | `GET /api/v1/payments/:id` |
| `reversePayment(cfg, checkoutRequestId, initiatorName?)` | `POST /api/v1/payments/:id/reverse` |
| `registerWebhook(cfg, {url, name?, events?})` | `POST /api/v1/webhooks` (secret returned once) |
| `listWebhooks(cfg)` | `GET /api/v1/webhooks` |
| `deleteWebhook(cfg, webhookId)` | `DELETE /api/v1/webhooks/:id` |
| `testWebhook(cfg, webhookId)` | `POST /api/v1/webhooks/:id/test` |
| `listWebhookDeliveries(cfg, webhookId, limit?)` | `GET /api/v1/webhooks/:id/deliveries` |
| `replayWebhook(cfg, webhookId, deliveryId?)` | `POST /api/v1/webhooks/:id/replay` |
| `getBusiness(cfg)` | `GET /api/v1/business` |
| `ping(cfg)` | `GET /health` (keep-alive) |

## Security

Keep `apiSecret` and webhook secrets server-side only. Never embed them in a
browser bundle.