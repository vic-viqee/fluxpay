from typing import Optional
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from jinja2 import Environment, FileSystemLoader
from pathlib import Path

from app.config import get_settings
from app.utils.logger import logger

env = Environment(
    loader=FileSystemLoader(Path(__file__).parent.parent / "emails"),
    autoescape=True,
)


def get_mail_config() -> ConnectionConfig:
    settings = get_settings()
    return ConnectionConfig(
        MAIL_USERNAME=settings.email_user or "",
        MAIL_PASSWORD=settings.email_pass or "",
        MAIL_FROM=settings.email_from,
        MAIL_PORT=settings.email_port,
        MAIL_SERVER=settings.email_host,
        MAIL_FROM_NAME="FluxPay",
        MAIL_STARTTLS=not settings.email_secure,
        MAIL_SSL_TLS=settings.email_secure,
        USE_CREDENTIALS=bool(settings.email_user and settings.email_pass),
        TEMPLATE_FOLDER=Path(__file__).parent.parent / "emails",
    )


async def send_reset_password_email(to: str, token: str):
    settings = get_settings()
    reset_url = f"{settings.frontend_url}/reset-password/{token}"
    template = env.get_template("password_reset.html")
    html = template.render(reset_url=reset_url)

    message = MessageSchema(
        subject="Password Reset Request for FluxPay",
        recipients=[to],
        body=html,
        subtype="html",
    )
    fm = FastMail(get_mail_config())
    await fm.send_message(message)
    logger.info(f"Password reset email sent to {to}")


async def send_payment_failure_email(
    owner_email: str,
    business_name: str,
    client_name: str,
    phone_number: str,
    plan_name: str,
    amount: float,
    failure_count: int = 1,
):
    template = env.get_template("payment_failure.html")
    html = template.render(
        business_name=business_name,
        client_name=client_name,
        phone_number=phone_number,
        plan_name=plan_name,
        amount=f"{amount:,.0f}",
        failure_count=failure_count,
    )

    message = MessageSchema(
        subject=f"Payment Failed - {business_name} - {client_name}",
        recipients=[owner_email],
        body=html,
        subtype="html",
    )
    fm = FastMail(get_mail_config())
    await fm.send_message(message)
    logger.info(f"Payment failure email sent to {owner_email}")


async def send_subscription_suspended_email(
    owner_email: str,
    business_name: str,
    client_name: str,
    phone_number: str,
    plan_name: str,
    amount: float,
):
    template = env.get_template("subscription_suspended.html")
    html = template.render(
        business_name=business_name,
        client_name=client_name,
        phone_number=phone_number,
        plan_name=plan_name,
        amount=f"{amount:,.0f}",
    )

    message = MessageSchema(
        subject=f"Subscription Suspended - {business_name} - {client_name}",
        recipients=[owner_email],
        body=html,
        subtype="html",
    )
    fm = FastMail(get_mail_config())
    await fm.send_message(message)
    logger.info(f"Subscription suspended email sent to {owner_email}")


async def send_payment_success_email(
    owner_email: str,
    business_name: str,
    client_name: str,
    amount: float,
    mpesa_receipt_no: str,
):
    template = env.get_template("payment_success.html")
    html = template.render(
        business_name=business_name,
        client_name=client_name,
        amount=f"{amount:,.0f}",
        mpesa_receipt_no=mpesa_receipt_no,
    )

    message = MessageSchema(
        subject=f"Payment Received - {business_name} - KES {amount:,.0f}",
        recipients=[owner_email],
        body=html,
        subtype="html",
    )
    fm = FastMail(get_mail_config())
    await fm.send_message(message)
    logger.info(f"Payment success email sent to {owner_email}")
