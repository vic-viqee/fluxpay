from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.utils.logger import logger

scheduler = AsyncIOScheduler()


def start_scheduler():
    from app.services.billing import process_due_payments, process_failed_transactions, process_grace_periods

    scheduler.add_job(
        process_due_payments,
        "cron",
        hour=0,
        minute=0,
        id="process_due_payments",
        replace_existing=True,
    )
    scheduler.add_job(
        process_failed_transactions,
        "cron",
        hour=0,
        minute=0,
        id="process_failed_transactions",
        replace_existing=True,
    )
    scheduler.add_job(
        process_grace_periods,
        "cron",
        hour=0,
        minute=30,
        id="process_grace_periods",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduler started")


def stop_scheduler():
    scheduler.shutdown()
    logger.info("Scheduler stopped")
