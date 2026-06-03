from abc import ABC, abstractmethod
from typing import Any


class NotificationChannel(ABC):
    @abstractmethod
    async def send(self, recipient: str, template_name: str, context: dict[str, Any]) -> bool:
        ...
