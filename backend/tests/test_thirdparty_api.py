import uuid
from types import SimpleNamespace

import pytest

from app.models.webhook_delivery import WebhookDelivery

EMAIL_TEMPLATE = "test-{}-{}@example.com"
PASSWORD = "Str0ng!Pass123"
INITIATE_COUNTER = {"calls": 0}
REVERSE_COUNTER = {"calls": 0}


def _unique(prefix):
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


def register_business(client, seed=""):
    email = EMAIL_TEMPLATE.format(seed, uuid.uuid4().hex[:8])
    resp = client.post(
        "/api/auth/signup",
        data={
            "email": email,
            "password": PASSWORD,
            "businessName": f"Biz {seed}",
            "businessPhoneNumber": "254700000001",
        },
    )
    assert resp.status_code == 201, resp.text
    return email, resp.json()["token"]


def create_api_key(client, token):
    resp = client.post(
        "/api/apikeys/",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "test-key"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()["data"]
    return data["key"], data["secret"]


def api_headers(api_key, api_secret, idempotency=None):
    headers = {"X-API-Key": api_key, "X-API-Secret": api_secret}
    if idempotency:
        headers["X-Idempotency-Key"] = idempotency
    return headers


@pytest.fixture(autouse=True)
def reset_counters():
    INITIATE_COUNTER["calls"] = 0
    REVERSE_COUNTER["calls"] = 0
    yield


# ---------- Auth ----------

def test_payments_require_api_key(client):
    resp = client.post("/api/v1/payments", json={"amount": 100, "phoneNumber": "254708374149"})
    assert resp.status_code == 401


def test_payments_reject_bad_secret(client):
    email, token = register_business(client, "badauth")
    api_key, _ = create_api_key(client, token)
    resp = client.post(
        "/api/v1/payments",
        headers={"X-API-Key": api_key, "X-API-Secret": "wrong-secret"},
        json={"amount": 100, "phoneNumber": "254708374149"},
    )
    assert resp.status_code == 401


# ---------- Payments + idempotency ----------

def test_payment_initiation_and_idempotency(client, monkeypatch):
    async def fake_initiate_stk_push(phone, amount, account_ref, desc):
        INITIATE_COUNTER["calls"] += 1
        return {"CheckoutRequestID": f"ws_CO_{uuid.uuid4().hex[:12]}", "ResponseCode": "0"}

    monkeypatch.setattr(
        "app.routers.thirdparty.initiate_stk_push", fake_initiate_stk_push
    )

    email, token = register_business(client, "idem")
    api_key, api_secret = create_api_key(client, token)
    idem_key = _unique("idem")

    body = {"amount": 150, "phoneNumber": "254708374149", "reference": "EDU-DEMO"}
    headers = api_headers(api_key, api_secret, idempotency=idem_key)

    first = client.post("/api/v1/payments", headers=headers, json=body)
    assert first.status_code == 200, first.text
    first_data = first.json()
    assert first_data["data"]["reference"] == "EDU-DEMO"
    assert first_data["data"]["phoneNumber"] == "254708374149"
    assert first_data["data"]["status"] == "PENDING"

    second = client.post("/api/v1/payments", headers=headers, json=body)
    assert second.status_code == 200, second.text
    assert second.json() == first_data
    assert INITIATE_COUNTER["calls"] == 1, "idempotency key must prevent duplicate STK push"

    tx_id = first_data["data"]["checkoutRequestId"]
    status = client.get(f"/api/v1/payments/{tx_id}", headers=api_headers(api_key, api_secret))
    assert status.status_code == 200
    assert status.json()["data"]["amountKes"] == 150.0


def test_payment_rejects_invalid_phone(client, monkeypatch):
    async def fake_initiate_stk_push(phone, amount, account_ref, desc):
        INITIATE_COUNTER["calls"] += 1
        return {"CheckoutRequestID": "ws_CO_x", "ResponseCode": "0"}

    monkeypatch.setattr(
        "app.routers.thirdparty.initiate_stk_push", fake_initiate_stk_push
    )

    email, token = register_business(client, "badphone")
    api_key, api_secret = create_api_key(client, token)
    resp = client.post(
        "/api/v1/payments",
        headers=api_headers(api_key, api_secret),
        json={"amount": 100, "phoneNumber": "12345"},
    )
    assert resp.status_code == 400, resp.text
    assert INITIATE_COUNTER["calls"] == 0


def test_raises_400_when_fields_missing(client, monkeypatch):
    email, token = register_business(client, "missing")
    api_key, api_secret = create_api_key(client, token)
    resp = client.post(
        "/api/v1/payments",
        headers=api_headers(api_key, api_secret),
        json={"amount": 100},
    )
    assert resp.status_code == 400, resp.text


# ---------- Reversals ----------

def test_reverse_requires_success_transaction(client, monkeypatch):
    async def fake_initiate_stk_push(phone, amount, account_ref, desc):
        return {"CheckoutRequestID": "ws_CO_rev_1", "ResponseCode": "0"}

    monkeypatch.setattr(
        "app.routers.thirdparty.initiate_stk_push", fake_initiate_stk_push
    )

    async def fake_success_find_one(cls, *args, **kwargs):
        return SimpleNamespace(
            status="SUCCESS",
            mpesa_receipt_no="RCP12345",
            amount_kes=150.0,
            daraja_request_id="ws_CO_rev_1",
        )

    async def fake_reverse(txn_id, amount, receiver_party, **kwargs):
        REVERSE_COUNTER["calls"] += 1
        assert txn_id == "RCP12345"
        assert amount == 150.0
        assert receiver_party
        return {
            "conversationId": "conv-1",
            "originatorConversationId": "orig-1",
            "responseCode": "0",
            "responseDescription": "Reversal accepted",
        }

    monkeypatch.setattr(
        "app.models.transaction.Transaction.find_one",
        staticmethod(fake_success_find_one),
    )
    monkeypatch.setattr("app.routers.thirdparty.reverse_transaction", fake_reverse)

    email, token = register_business(client, "rev")
    api_key, api_secret = create_api_key(client, token)

    resp = client.post(
        "/api/v1/payments/ws_CO_rev_1/reverse",
        headers=api_headers(api_key, api_secret),
        json={"initiatorName": "test"},
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["data"]["responseCode"] == "0"
    assert REVERSE_COUNTER["calls"] == 1


def test_reverse_blocked_for_pending(client, monkeypatch):
    async def fake_initiate_stk_push(phone, amount, account_ref, desc):
        return {"CheckoutRequestID": "ws_CO_pending_1", "ResponseCode": "0"}

    monkeypatch.setattr(
        "app.routers.thirdparty.initiate_stk_push", fake_initiate_stk_push
    )
    async def fake_reverse(*args, **kwargs):
        REVERSE_COUNTER["calls"] += 1

    monkeypatch.setattr("app.routers.thirdparty.reverse_transaction", fake_reverse)

    email, token = register_business(client, "revpending")
    api_key, api_secret = create_api_key(client, token)

    created = client.post(
        "/api/v1/payments",
        headers=api_headers(api_key, api_secret),
        json={"amount": 100, "phoneNumber": "254708374149"},
    )
    assert created.status_code == 200

    tx_id = created.json()["data"]["checkoutRequestId"]
    resp = client.post(
        f"/api/v1/payments/{tx_id}/reverse",
        headers=api_headers(api_key, api_secret),
        json={},
    )
    assert resp.status_code == 400, resp.text
    assert REVERSE_COUNTER["calls"] == 0


def test_reverse_scoped_to_owner(client):
    owner_a_key, owner_a_secret = None, None
    tx_id = None

    try:
        email_a, token_a = register_business(client, "ownerA")
        owner_a_key, owner_a_secret = create_api_key(client, token_a)

        created = client.post(
            "/api/v1/payments",
            headers=api_headers(owner_a_key, owner_a_secret),
            json={"amount": 100, "phoneNumber": "254708374149"},
        )
        assert created.status_code == 200
        tx_id = created.json()["data"]["checkoutRequestId"]

        # register owner B and confirm they cannot see or reverse A's txn
        email_b, token_b = register_business(client, "ownerB")
        key_b, secret_b = create_api_key(client, token_b)

        status_b = client.get(f"/api/v1/payments/{tx_id}", headers=api_headers(key_b, secret_b))
        assert status_b.status_code == 404

        reverse_b = client.post(
            f"/api/v1/payments/{tx_id}/reverse",
            headers=api_headers(key_b, secret_b),
            json={},
        )
        assert reverse_b.status_code == 404, reverse_b.text
    finally:
        pass


def test_reverse_unknown_txn_404(client):
    email, token = register_business(client, "unknownrev")
    api_key, api_secret = create_api_key(client, token)
    resp = client.post(
        "/api/v1/payments/ws_CO_nonexistent/reverse",
        headers=api_headers(api_key, api_secret),
        json={},
    )
    assert resp.status_code == 404, resp.text


# ---------- Webhooks ----------

@pytest.fixture
def webhook_client(client, monkeypatch):
    email, token = register_business(client, "wh")
    api_key, api_secret = create_api_key(client, token)
    headers = api_headers(api_key, api_secret)

    created = client.post(
        "/api/v1/webhooks",
        headers=headers,
        json={"url": "https://unreachable.invalid/hook", "name": "Test Hook"},
    )
    assert created.status_code == 200, created.text
    webhook_id = created.json()["data"]["id"]

    deliveries_calls = {"count": 0}

    async def fake_deliver_webhook(webhook, event, data):
        deliveries_calls["count"] += 1
        delivery = WebhookDelivery(
            webhook_id=webhook.id,
            owner_id=webhook.owner_id,
            event=event,
            payload=data,
            success=True,
            response_status=200,
            response_body="{\"ok\": true}",
            error=None,
        )
        await delivery.create()
        return delivery

    monkeypatch.setattr(
        "app.routers.thirdparty.deliver_webhook", fake_deliver_webhook
    )

    return SimpleNamespace(
        client=client,
        headers=headers,
        webhook_id=webhook_id,
        deliveries_calls=deliveries_calls,
    )


def test_webhook_test_ping(webhook_client):
    resp = webhook_client.client.post(
        f"/api/v1/webhooks/{webhook_client.webhook_id}/test",
        headers=webhook_client.headers,
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()["data"]
    assert data["success"] is True
    assert data["statusCode"] == 200
    assert data["deliveryId"]
    assert webhook_client.deliveries_calls["count"] == 1


def test_webhook_deliveries_listed(webhook_client):
    ping = webhook_client.client.post(
        f"/api/v1/webhooks/{webhook_client.webhook_id}/test",
        headers=webhook_client.headers,
    )
    assert ping.status_code == 200
    delivery_id = ping.json()["data"]["deliveryId"]

    resp = webhook_client.client.get(
        f"/api/v1/webhooks/{webhook_client.webhook_id}/deliveries",
        headers=webhook_client.headers,
    )
    assert resp.status_code == 200
    ids = [d["id"] for d in resp.json()["data"]]
    assert delivery_id in ids


def test_webhook_replay_with_delivery_id(webhook_client):
    ping = webhook_client.client.post(
        f"/api/v1/webhooks/{webhook_client.webhook_id}/test",
        headers=webhook_client.headers,
    )
    delivery_id = ping.json()["data"]["deliveryId"]
    before = webhook_client.deliveries_calls["count"]

    repl = webhook_client.client.post(
        f"/api/v1/webhooks/{webhook_client.webhook_id}/replay",
        headers=webhook_client.headers,
        json={"deliveryId": delivery_id},
    )
    assert repl.status_code == 200, repl.text
    data = repl.json()["data"]
    assert data["event"] == "ping"
    assert data["success"] is True
    assert webhook_client.deliveries_calls["count"] == before + 1


def test_webhook_replay_requires_prior_delivery(client):
    email, token = register_business(client, "wh_empty")
    api_key, api_secret = create_api_key(client, token)
    headers = api_headers(api_key, api_secret)

    created = client.post(
        "/api/v1/webhooks",
        headers=headers,
        json={"url": "https://unreachable.invalid/hook"},
    )
    webhook_id = created.json()["data"]["id"]

    resp = client.post(
        f"/api/v1/webhooks/{webhook_id}/replay",
        headers=headers,
        json={},
    )
    assert resp.status_code == 400, resp.text


def test_webhook_scoped_to_owner(client):
    email_a, token_a = register_business(client, "wh_owner_a")
    key_a, secret_a = create_api_key(client, token_a)
    headers_a = api_headers(key_a, secret_a)

    created = client.post(
        "/api/v1/webhooks",
        headers=headers_a,
        json={"url": "https://unreachable.invalid/hook"},
    )
    webhook_id = created.json()["data"]["id"]

    email_b, token_b = register_business(client, "wh_owner_b")
    key_b, secret_b = create_api_key(client, token_b)
    headers_b = api_headers(key_b, secret_b)

    resp = client.post(
        f"/api/v1/webhooks/{webhook_id}/test",
        headers=headers_b,
    )
    assert resp.status_code == 404, resp.text


def test_webhook_delete(client):
    email, token = register_business(client, "wh_del")
    api_key, api_secret = create_api_key(client, token)
    headers = api_headers(api_key, api_secret)

    created = client.post(
        "/api/v1/webhooks",
        headers=headers,
        json={"url": "https://unreachable.invalid/hook"},
    )
    webhook_id = created.json()["data"]["id"]

    deleted = client.delete(
        f"/api/v1/webhooks/{webhook_id}", headers=headers
    )
    assert deleted.status_code == 200

    after = client.delete(
        f"/api/v1/webhooks/{webhook_id}", headers=headers
    )
    assert after.status_code == 404


# ---------- Business info ----------

def test_business_info(client):
    email, token = register_business(client, "bizinfo")
    api_key, api_secret = create_api_key(client, token)
    resp = client.get("/api/v1/business", headers=api_headers(api_key, api_secret))
    assert resp.status_code == 200
    assert resp.json()["data"]["businessName"].startswith("Biz ")