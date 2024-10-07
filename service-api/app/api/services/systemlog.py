import logging
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session
from api.db import schemas, models
from .base import BaseService

logger = logging.getLogger(__name__)


class SystemLogService(
    BaseService[models.SystemLog, schemas.SystemLogCreate, schemas.SystemLogUpdate]
):
    def __init__(self, db_session: Session):
        super(SystemLogService, self).__init__(models.SystemLog, db_session)

    def list(self, limit: int) -> List[models.SystemLog]:
        objs: List[models.SystemLog] = self.db_session.query(models.SystemLog).order_by(models.SystemLog.timestamp.desc()).limit(limit).all()
        return objs
