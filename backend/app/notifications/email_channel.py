from pathlib import Path
from typing import Any

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from jinja2 import Environment, FileSystemLoader

from app.config import get_settings
from app.utils.logger import logger
from app.notifications.base import NotificationChannel

env = Environment(
    loader=FileSystemLoader(Path(__file__).parent / "templates"),
    autoescape=True,
)


def _get_mail_config() -> ConnectionConfig:
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
        TEMPLATE_FOLDER=Path(__file__).parent / "templates",
    )


class EmailChannel(NotificationChannel):
    def __init__(self) -> None:
        self._config = _get_mail_config()

    async def send(self, recipient: str, template_name: str, context: dict[str, Any]) -> bool:
        try:
            template = env.get_template(f"{template_name}.html")
            html = template.render(**context)
            message = MessageSchema(
                subject=context.get("subject", "FluxPay Notification"),
                recipients=[recipient],
                body=html,
                subtype="html",
            )
            fm = FastMail(self._config)
            await fm.send_message(message)
            logger.info(f"Email sent to {recipient} via {template_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {recipient}: {e}")
            return False
