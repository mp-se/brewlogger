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
    def __init__(self, db_session: Session):
        super(SystemLogService, self).__init__(models.SystemLog, db_session)

    def list(self, limit: int = 100) -> List[models.SystemLog]:
        objs: List[models.SystemLog] = self.db_session.query(models.SystemLog).order_by(models.SystemLog.timestamp.desc()).limit(limit).all()
        return objs

    def deleteByTimestamp(self, days: int = 30):
        dt = datetime.now() - timedelta(days=days)
        statement = delete(models.SystemLog).where(models.SystemLog.timestamp <= dt)
        result = self.db_session.execute(statement)
        self.db_session.commit()
        return result.rowcount
