from datetime import datetime, timezone
from beanie import PydanticObjectId

from app.models.user import User
from app.utils.logger import logger


async def check_and_update_transaction_limit(owner_id: str) -> dict:
    user = await User.get(owner_id)
    if not user:
        return {"allowed": False, "reason": "User not found"}

    now = datetime.now(timezone.utc)
    if user.transaction_count_reset_at and user.transaction_count_reset_at < now:
        user.current_month_transactions = 0
        if now.month == 12:
            user.transaction_count_reset_at = datetime(
                now.year + 1, 1, 1, tzinfo=timezone.utc
            )
        else:
            user.transaction_count_reset_at = datetime(
                now.year, now.month + 1, 1, tzinfo=timezone.utc
            )
        await user.save()

    if user.current_month_transactions >= user.transaction_limit:
        upgrade_plan = "growth" if user.plan == "starter" else None
        return {
            "allowed": False,
            "reason": "limit_reached",
            "limit": user.transaction_limit,
            "used": user.current_month_transactions,
            "upgradePlan": upgrade_plan,
            "upgradeUrl": "/plans",
        }

    percentage = (user.current_month_transactions / user.transaction_limit) * 100
    warning = None
    if percentage >= 80:
        warning = {
            "used": user.current_month_transactions,
            "limit": user.transaction_limit,
            "percentage": round(percentage, 1),
            "remaining": user.transaction_limit - user.current_month_transactions,
        }

    return {
        "allowed": True,
        "warning": warning,
        "limit": user.transaction_limit,
        "used": user.current_month_transactions,
        "percentage": round(percentage, 1),
        "remaining": user.transaction_limit - user.current_month_transactions,
    }


async def increment_transaction_count(owner_id: str):
    user = await User.get(owner_id)
    if user:
        user.current_month_transactions += 1
        await user.save()
