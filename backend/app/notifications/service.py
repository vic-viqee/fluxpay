from typing import Any

from app.utils.logger import logger
from app.notifications.base import NotificationChannel
from app.notifications.email_channel import EmailChannel
from app.notifications.sms_channel import SmsChannel
from app.notifications.whatsapp_channel import WhatsappChannel


NOTIFICATION_EVENTS = {
    "PAYMENT_SUCCESS": {
        "email": "payment_success",
    },
    "PAYMENT_FAILURE": {
        "email": "payment_failure",
    },
    "SUBSCRIPTION_SUSPENDED": {
        "email": "subscription_suspended",
    },
    "REMINDER_DAY1": {
        "email": "payment_reminder_day1",
        "sms": "payment_reminder_day1",
        "whatsapp": "payment_reminder_day1",
    },
    "REMINDER_DAY3": {
        "email": "payment_reminder_day3",
        "sms": "payment_reminder_day3",
        "whatsapp": "payment_reminder_day3",
    },
    "REMINDER_DAY5": {
        "email": "payment_reminder_day5",
        "sms": "payment_reminder_day5",
        "whatsapp": "payment_reminder_day5",
    },
    "PASSWORD_RESET": {
        "email": "password_reset",
    },
}


class NotificationService:
    def __init__(self) -> None:
        self.channels: dict[str, NotificationChannel] = {
            "email": EmailChannel(),
            "sms": SmsChannel(),
            "whatsapp": WhatsappChannel(),
        }

    async def notify(self, event: str, recipient: str, context: dict[str, Any]) -> None:
        templates = NOTIFICATION_EVENTS.get(event)
        if not templates:
            logger.warning(f"Unknown notification event: {event}")
            return

        for channel_name, template_name in templates.items():
            channel = self.channels.get(channel_name)
            if channel:
                success = await channel.send(recipient, template_name, context)
                if not success:
                    logger.error(f"{channel_name} notification failed for event {event} to {recipient}")
            else:
                logger.warning(f"Channel {channel_name} not configured for event {event}")


_service: NotificationService | None = None


def get_notification_service() -> NotificationService:
    global _service
    if _service is None:
        _service = NotificationService()
    return _service
