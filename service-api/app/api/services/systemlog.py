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

"""System log service for managing application event logging and retention."""
import logging
from datetime import datetime, timedelta
from typing import List
from sqlalchemy import delete
from sqlalchemy.orm import Session
from api.db import schemas, models
from .base import BaseService

logger = logging.getLogger(__name__)


class SystemLogService(
    BaseService[models.SystemLog, schemas.SystemLogCreate, schemas.SystemLogUpdate]
):
    """Service for managing system log entries and event tracking."""
    def __init__(self, db_session: Session):
        super().__init__(models.SystemLog, db_session)

    def list(self, limit: int = 100) -> List[models.SystemLog]:
        objs: List[models.SystemLog] = (
            self.db_session.query(models.SystemLog)
            .order_by(models.SystemLog.timestamp.desc())
            .limit(limit)
            .all()
        )
        return objs

    def delete_by_timestamp(self, days: int = 30):
        """Delete system log entries older than the specified number of days."""
        dt = datetime.now() - timedelta(days=days)
        statement = delete(models.SystemLog).where(models.SystemLog.timestamp <= dt)
        result = self.db_session.execute(statement)
        self.db_session.commit()
        return result.rowcount
