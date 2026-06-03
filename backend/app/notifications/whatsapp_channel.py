from typing import Any

from app.utils.logger import logger
from app.notifications.base import NotificationChannel


class WhatsappChannel(NotificationChannel):
    async def send(self, recipient: str, template_name: str, context: dict[str, Any]) -> bool:
        logger.info(f"[WHATSAPP STUB] Would send WhatsApp to {recipient} using template {template_name}")
        return True
