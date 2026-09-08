import hashlib
import hmac

from app.services.webhook import build_webhook_payload, sign_payload


def test_sign_payload_deterministic():
    payload = '{"event":"payment.success"}'
    secret = "testsecret123"

    sig1 = sign_payload(payload, secret)
    sig2 = sign_payload(payload, secret)

    expected = hmac.new(
        secret.encode(), payload.encode(), hashlib.sha256
    ).hexdigest()

    assert sig1 == sig2 == expected
    assert len(sig1) == 64


def test_sign_payload_different_secret_differs():
    payload = '{"event":"payment.success"}'
    assert sign_payload(payload, "secret-a") != sign_payload(payload, "secret-b")


def test_build_webhook_payload_shape():
    data = {"checkoutRequestId": "ws_CO_123", "status": "SUCCESS"}
    payload = build_webhook_payload("payment.success", data)

    assert payload["event"] == "payment.success"
    assert "timestamp" in payload
    assert payload["data"] == data