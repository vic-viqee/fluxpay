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

## Build & Test
- Frontend: `tsc && vite build`
- Backend: `uvicorn app.main:app --reload`

## Deployment
- Push to `main` branch → auto-deploys on Render
- `.env` is gitignored — config changes must be applied manually via Render dashboard
