from app.notifications.service import get_notification_service
from app.config import get_settings


async def send_reset_password_email(to: str, token: str):
    settings = get_settings()
    reset_url = f"{settings.frontend_url}/reset-password/{token}"
    svc = get_notification_service()
    await svc.notify(
        "PASSWORD_RESET",
        to,
        {
            "subject": "Password Reset Request for FluxPay",
            "reset_url": reset_url,
        },
    )


async def send_payment_failure_email(
    owner_email: str,
    business_name: str,
    client_name: str,
    phone_number: str,
    plan_name: str,
    amount: float,
    failure_count: int = 1,
):
    svc = get_notification_service()
    await svc.notify(
        "PAYMENT_FAILURE",
        owner_email,
        {
            "subject": f"Payment Failed - {business_name} - {client_name}",
            "business_name": business_name,
            "client_name": client_name,
            "phone_number": phone_number,
            "plan_name": plan_name,
            "amount": f"{amount:,.0f}",
            "failure_count": failure_count,
        },
    )


async def send_subscription_suspended_email(
    owner_email: str,
    business_name: str,
    client_name: str,
    phone_number: str,
    plan_name: str,
    amount: float,
):
    svc = get_notification_service()
    await svc.notify(
        "SUBSCRIPTION_SUSPENDED",
        owner_email,
        {
            "subject": f"Subscription Suspended - {business_name} - {client_name}",
            "business_name": business_name,
            "client_name": client_name,
            "phone_number": phone_number,
            "plan_name": plan_name,
            "amount": f"{amount:,.0f}",
            "grace_period_ends_at": "7 days",
        },
    )


async def send_payment_success_email(
    owner_email: str,
    business_name: str,
    client_name: str,
    amount: float,
    mpesa_receipt_no: str,
):
    svc = get_notification_service()
    await svc.notify(
        "PAYMENT_SUCCESS",
        owner_email,
        {
            "subject": f"Payment Received - {business_name} - KES {amount:,.0f}",
            "business_name": business_name,
            "client_name": client_name,
            "amount": f"{amount:,.0f}",
            "mpesa_receipt_no": mpesa_receipt_no,
        },
    )
