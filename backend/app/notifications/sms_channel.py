from typing import Any

from app.utils.logger import logger
from app.notifications.base import NotificationChannel


class SmsChannel(NotificationChannel):
    async def send(self, recipient: str, template_name: str, context: dict[str, Any]) -> bool:
        logger.info(f"[SMS STUB] Would send SMS to {recipient} using template {template_name}")
        return True
