# FluxPay

## Tech Stack
- Backend: FastAPI (Python 3.12+), MongoDB via Beanie ODM with Motor async driver
- Frontend: React (TypeScript) with Vite build
- Auth: JWT (python-jose), token in `Authorization` header + `accessToken` cookie
- M-Pesa: Safaricom Daraja sandbox (shortcode 174379, test phone 254708374149)
- Deploy: Render free tier (auto-deploys from GitHub main branch push)
- Scheduler: APScheduler (runs in-process with the FastAPI app)
- Email: FastMail with Jinja2 HTML templates

## Key Architecture Decisions
- Beanie `Field(alias="...")` means raw dict queries must use MongoDB field names (e.g. `ownerId`), not Python attribute names (`owner_id`). Use Beanie expression syntax (e.g. `Model.owner_id == x`) for automatic alias conversion.
- Notification system uses a channel abstraction: `EmailChannel` (real), `SmsChannel`/`WhatsappChannel` (stubs for future). Templates live in `backend/app/notifications/templates/`.
- Grace Period: After 3 failed payments, subscription → `SUSPENDED` with 7-day grace. Auto-cancels after grace expires. Dunning reminders sent on days 1, 3, 5.
- Customer Self-Service Portal: Separate auth from merchant auth. Uses `PortalUser` model (email + password) with JWT using `sub: "portal_{id}"`. API at `/api/portal/*`, frontend at `/portal/*`. Data linked by matching customer email across `Client`, `GatewayCustomer`, `Subscription`, `GatewayTransaction`, and `Invoice` models.
- Transaction Model: `Transaction` has optional `phone_number`, `account_reference`, `checkout_request_id` fields. Populated by `thirdparty.py` on API-created transactions.
- Webhook Pipeline: M-Pesa callback always fires webhooks (`trigger_payment_success` / `trigger_payment_failed`) via `mpesa.py` — not just for subscription transactions. Callback no longer overwrites `daraja_request_id`.
- Webhook Management: JWT-authenticated endpoints at `/api/gateway/webhooks` for CRUD, test ping, and secret rotation. Frontend at `/gateway/webhooks` uses `api` service (JWT auth).
- Third-Party API: `/api/v1/webhooks` endpoints use API key auth (for external clients). Gateway webhooks use JWT auth (for merchant dashboard).
- Consumer Gateway `/api/v1` (router `app/routers/thirdparty.py`): API-key auth, STK push with `X-Idempotency-Key` (util `app/utils/idempotency.py`), status, reversal (guarded to `SUCCESS` + `mpesa_receipt_no`), webhooks CRUD/test-ping/deliveries/replay. Webhook payloads are HMAC-SHA256 signed over the raw body (`app/services/webhook.py` `sign_payload`); raw body must be captured before JSON parsing.
- SDKs: `clients/fluxpay-js` (TS, zero-dep, Web Crypto) and `clients/fluxpay-py` (async httpx; FastAPI webhook dependency in `fluxpay/webhook.py`). Same patterns as the gateway — idempotency keys, reference-prefix convention (e.g. `EDU-`), server-side-only secrets. Consumer guide: `docs/integration/README.md`.
- Keep-alive: `scripts/keepalive.py` pings `/health` every 8 min (stdlib urllib; `FLUXPAY_HEALTH_URL` env, default `https://fluxpay-backend.onrender.com/health`) to avoid Render cold starts.
- FastAPI gotcha: `from __future__ import annotations` stringifies type hints and breaks `Request`-parameter dependencies (treated as query field → 422). Keep eager annotations for dependency params.
- CORS: Marketplace origin (`https://anything-marketplace-web.onrender.com`) included in `allowed_origins` default list.

## Build & Test
- Frontend: `tsc && vite build`
- Backend: `uvicorn app.main:app --reload`
- Backend tests: `backend/venv/bin/python -m pytest tests/ -q` (HTTP-driven via `TestClient`; `pytest-asyncio` is NOT installed — no async fixtures)
- Python SDK: build via `pip install -e .[fastapi]`; verify webhook dep with starlette `TestClient`
- JS SDK: `npx tsc -p tsconfig.json` (out → `dist/index.js` + `dist/index.d.ts`)
- Backend py checks: `backend/venv/bin/python -m ruff check app` (if ruff present in venv) / `backend/venv/bin/python -m py_compile` on scripts

## Deployment
- Push to `main` branch → auto-deploys on Render
- `.env` is gitignored — config changes must be applied manually via Render dashboard
