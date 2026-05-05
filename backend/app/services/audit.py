from typing import Any
from beanie import PydanticObjectId

from app.models.audit_log import AuditLog
from app.utils.logger import logger


async def log_audit_event(
    admin_id: str,
    action: str,
    resource: str,
    resource_id: str | None = None,
    details: dict[str, Any] | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
):
    audit_log = AuditLog(
        admin_id=PydanticObjectId(admin_id),
        action=action,
        resource=resource,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    await audit_log.create()
    logger.info(f"Audit: {action} on {resource} by {admin_id}")
