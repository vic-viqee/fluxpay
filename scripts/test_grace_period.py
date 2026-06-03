"""
Test the Grace Period + Dunning flow against a local FluxPay backend.

Prerequisites:
  - docker compose up mongo mailhog -d
  - uvicorn app.main:app --reload (in backend/)
  - MailHog at http://localhost:8025 (to see emailed notifications)

Usage:
  cd backend && python ../scripts/test_grace_period.py
"""

import asyncio
import httpx
from datetime import datetime, timezone, timedelta

BASE = "http://localhost:8000/api"
EMAIL = "test@example.com"
PASS = "Test1234!"
PHONE = "254708374149"


async def main():
    async with httpx.AsyncClient(base_url=BASE, timeout=30) as c:
        # 1. Signup a test user
        print("=== 1. Signup ===")
        r = await c.post("/auth/signup", json={
            "email": EMAIL, "password": PASS, "businessName": "Test Biz"
        })
        print(f"Signup: {r.status_code}")
        if r.status_code == 400 and "already" in r.text:
            print("User exists, logging in...")

        # 2. Login
        print("\n=== 2. Login ===")
        r = await c.post("/auth/login", json={
            "email": EMAIL, "password": PASS
        })
        assert r.status_code == 200, f"Login failed: {r.text}"
        token = r.json()["data"]["accessToken"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Logged in OK")

        # 3. Create a plan
        print("\n=== 3. Create Plan ===")
        r = await c.post("/plans", headers=headers, json={
            "name": "Test Monthly", "amountKes": 100, "frequency": "monthly",
            "billingDay": datetime.now(timezone.utc).day,
        })
        assert r.status_code == 200, f"Plan create failed: {r.text}"
        plan = r.json()["data"]
        plan_id = plan["_id"]
        print(f"Plan created: {plan_id}")

        # 4. Create a client
        print("\n=== 4. Create Client ===")
        r = await c.post("/clients", headers=headers, json={
            "name": "Test Client", "phoneNumber": PHONE, "email": "client@test.com",
        })
        assert r.status_code == 200, f"Client create failed: {r.text}"
        client = r.json()["data"]
        client_id = client["_id"]
        print(f"Client created: {client_id}")

        # 5. Create a subscription
        print("\n=== 5. Create Subscription ===")
        r = await c.post("/subscriptions", headers=headers, json={
            "clientId": client_id, "planId": plan_id,
        })
        assert r.status_code == 200, f"Sub create failed: {r.text}"
        sub = r.json()["data"]
        sub_id = sub["_id"]
        print(f"Subscription created: {sub_id} (status: {sub['status']})")

        # 6. Force 3 payment failures in DB
        print("\n=== 6. Simulate 3 payment failures ===")
        now = datetime.now(timezone.utc)
        from app.services.billing import GRACE_PERIOD_DAYS
        from app.models.subscription import Subscription
        from app.database import init_db, close_db

        await init_db()
        sub_doc = await Subscription.get(sub_id)
        assert sub_doc, "Subscription not found in DB"

        # Simulate the billing service setting SUSPENDED after 3 failures
        sub_doc.payment_failure_count = 3
        sub_doc.status = "SUSPENDED"
        sub_doc.suspended_at = now
        sub_doc.grace_period_ends_at = now + timedelta(days=GRACE_PERIOD_DAYS)
        sub_doc.dunning_reminders_sent = {}
        await sub_doc.save()
        print(f"Subscription now SUSPENDED (grace: {GRACE_PERIOD_DAYS} days)")

        # 7. Verify via API
        print("\n=== 7. Check via API ===")
        r = await c.get(f"/subscriptions/{sub_id}", headers=headers)
        sub = r.json()["data"]
        assert sub["status"] == "SUSPENDED", f"Expected SUSPENDED, got {sub['status']}"
        print(f"Status: {sub['status']}")
        print(f"suspendedAt: {sub.get('suspendedAt')}")
        print(f"gracePeriodEndsAt: {sub.get('gracePeriodEndsAt')}")

        # 8. Test dunning reminders
        print("\n=== 8. Test dunning (simulate day 1) ===")
        sub_doc.suspended_at = now - timedelta(days=1)
        sub_doc.dunning_reminders_sent = {}
        await sub_doc.save()

        from app.services.billing import process_grace_periods
        await process_grace_periods()
        await sub_doc.reload()
        print(f"Dunning day1 sent: {sub_doc.dunning_reminders_sent.get('day1')}")
        # Check MailHog at http://localhost:8025 for the email

        # Simulate day 3
        print("\n=== 9. Test dunning (simulate day 3) ===")
        sub_doc.suspended_at = now - timedelta(days=3)
        sub_doc.dunning_reminders_sent = {"day1": True}
        await sub_doc.save()

        await process_grace_periods()
        await sub_doc.reload()
        print(f"Dunning day3 sent: {sub_doc.dunning_reminders_sent.get('day3')}")

        # 10. Test reactivate
        print("\n=== 10. Test Reactivate ===")
        r = await c.put(f"/subscriptions/{sub_id}/reactivate", headers=headers)
        assert r.status_code == 200, f"Reactivate failed: {r.text}"
        sub = r.json()["data"]
        assert sub["status"] == "ACTIVE", f"Expected ACTIVE, got {sub['status']}"
        print(f"Reactivated! Status: {sub['status']}")
        print(f"Next billing: {sub.get('nextBillingDate')}")

        # 11. Cleanup
        print("\n=== 11. Cleanup ===")
        await close_db()
        print("DB connection closed")

        print("\n✅ ALL TESTS PASSED")
        print("\nCheck MailHog at http://localhost:8025 for dunning emails")


if __name__ == "__main__":
    asyncio.run(main())
