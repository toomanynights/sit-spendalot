import logging

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)

_scheduler = BackgroundScheduler()


def _daily_generate_job() -> None:
    """Run by APScheduler at 00:05 every day in its own thread."""
    from app.database import SessionLocal
    from app.services.prediction_instance_service import generate_all_instances

    db = SessionLocal()
    try:
        logger.info("Scheduler: generating prediction instances for all active templates")
        generate_all_instances(db)
        logger.info("Scheduler: instance generation complete")
    except Exception:
        logger.exception("Scheduler: error during daily instance generation")
    finally:
        db.close()


def start_scheduler() -> None:
    _scheduler.add_job(
        _daily_generate_job,
        trigger=CronTrigger(hour=0, minute=5),
        id="daily_generate_instances",
        replace_existing=True,
    )
    _scheduler.start()
    logger.info("APScheduler started — daily instance generation scheduled at 00:05")


def stop_scheduler() -> None:
    if _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("APScheduler stopped")
