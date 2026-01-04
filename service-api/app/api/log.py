"""Custom logging configuration and handlers for application event logging."""
import logging
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError
from api.services import SystemLogService
from api.db import schemas, models
from api.db.session import create_session

logger = logging.getLogger(__name__)


def system_log(module, message, error_code):
    """Log a system event to the database."""
    entry = schemas.SystemLogCreate(
        timestamp=datetime.now().isoformat(),
        module=module,
        log_level=0,
        message=message,
        error_code=error_code,
    )

    systemlog_service = SystemLogService(create_session())
    systemlog_service.create(entry)


def system_log_purge(days: int = 60):
    """Purge system log entries older than 60 days."""
    logger.info("Purging order system log from records older than 60 days")
    systemlog_service = SystemLogService(create_session())
    count = systemlog_service.delete_by_timestamp(days)
    logger.info("Deleted %s records from system log", count)


def system_log_scheduler(message, error_code):
    """Log a scheduler-related system event."""
    system_log("scheduler", message=message, error_code=error_code)


def system_log_fermentationcontrol(message, error_code):
    """Log a fermentation control-related system event."""
    system_log("fermentation_control", message=message, error_code=error_code)


def system_log_security(message, error_code):
    """Log a security-related system event."""
    system_log("security", message=message, error_code=error_code)


def receive_log_purge(days: int = 90) -> None:
    """Delete receive log entries older than specified days.

    Args:
        days: Number of days to retain (default: 90). Older records deleted.
    """
    try:
        session = create_session()
        cutoff_date = datetime.now() - timedelta(days=days)

        deleted_count = session.query(models.ReceiveLog).filter(
            models.ReceiveLog.created < cutoff_date
        ).delete()

        session.commit()
        session.close()

        if deleted_count > 0:
            logger.info(
                "Purged %d old receive log records (older than %d days)",
                deleted_count, days
            )
    except SQLAlchemyError as e:
        logger.error("Failed to purge old receive logs: %s", e)
