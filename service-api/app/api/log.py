# BrewLogger
# Copyright (c) 2021-2026 Magnus
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Alternatively, this software may be used under the terms of a
# commercial license. See LICENSE_COMMERCIAL for details.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
#

"""Custom logging configuration and handlers for application event logging."""
import logging
from datetime import datetime, timedelta
from enum import IntEnum
from sqlalchemy.exc import SQLAlchemyError
from api.services import SystemLogService
from api.db import schemas, models
from api.db.session import create_session

logger = logging.getLogger(__name__)

# Log level constants matching Python logging
class LogLevel(IntEnum):
    """System log level enumeration."""
    DEBUG = 0
    INFO = 1
    WARNING = 2
    ERROR = 3


def _truncate_message(message: str, max_length: int = 300) -> str:
    """Truncate message to fit database field limit.
    
    Args:
        message: Message to truncate
        max_length: Maximum length (default: 300 chars for DB field)
    
    Returns:
        Truncated message
    """
    if len(message) <= max_length:
        return message
    return message[:max_length - 3] + "..."


def system_log(module: str, message: str, error_code: int = 0, log_level: int = LogLevel.INFO) -> None:
    """Log a system event to the database.
    
    Args:
        module: Module name (e.g., 'scheduler', 'device')
        message: Log message (will be truncated to 300 chars)
        error_code: Error/status code (default: 0 for success)
        log_level: Log level from LogLevel enum (default: INFO)
    """
    try:
        entry = schemas.SystemLogCreate(
            timestamp=datetime.now().isoformat(),
            module=module,
            log_level=log_level,
            message=_truncate_message(message),
            error_code=error_code,
        )

        systemlog_service = SystemLogService(create_session())
        systemlog_service.create(entry)
    except (SQLAlchemyError, Exception) as e:
        logger.error("Failed to write system log: %s", e)


def system_log_purge(days: int = 60):
    """Purge system log entries older than 60 days."""
    logger.info("Purging order system log from records older than 60 days")
    systemlog_service = SystemLogService(create_session())
    count = systemlog_service.delete_by_timestamp(days)
    logger.info("Deleted %s records from system log", count)


def system_log_scheduler(message: str, error_code: int = 0, log_level: int = LogLevel.INFO) -> None:
    """Log a scheduler-related system event."""
    system_log("scheduler", message=message, error_code=error_code, log_level=log_level)


def system_log_fermentationcontrol(message: str, error_code: int = 0, log_level: int = LogLevel.INFO) -> None:
    """Log a fermentation control-related system event."""
    system_log("fermentation_control", message=message, error_code=error_code, log_level=log_level)


def system_log_security(message: str, error_code: int = 0, log_level: int = LogLevel.INFO) -> None:
    """Log a security-related system event."""
    system_log("security", message=message, error_code=error_code, log_level=log_level)


def receive_log_purge(days: int = 90) -> None:
    """Delete receive log entries older than specified days.

    Args:
        days: Number of days to retain (default: 90). Older records deleted.
    """
    try:
        session = create_session()
        cutoff_date = datetime.now() - timedelta(days=days)

        deleted_count = session.query(models.ReceiveLog).filter(
            models.ReceiveLog.timestamp < cutoff_date
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
