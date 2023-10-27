from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session
from api.db import models, schemas
from .base import BaseService
import logging

logger = logging.getLogger(__name__)

class BatchService(BaseService[models.Batch, schemas.BatchCreate, schemas.BatchUpdate]):
    def __init__(self, db_session: Session):
        super(BatchService, self).__init__(models.Batch, db_session)

    def search_chipId(self, chipId: str) -> List[models.Batch]:
        filters = { "chip_id": chipId }
        objs: List[self.model] = self.db_session.scalars(select(self.model).filter_by(**filters)).all()
        logging.info("Fetched batches based on chipId=%s, records found %d", chipId, len(objs))
        return objs

    def search_active(self, active: bool) -> List[models.Batch]:
        filters = { "active": active }
        objs: List[self.model] = self.db_session.scalars(select(self.model).filter_by(**filters)).all()
        logging.info("Fetched batches based on active=%s, records found %d", active, len(objs))
        return objs

    def search_chipId_active(self, chipId: str, active: bool) -> List[models.Batch]:
        filters = { "chip_id": chipId, "active": active }
        objs: List[self.model] = self.db_session.scalars(select(self.model).filter_by(**filters)).all()
        logging.info("Fetched batches based on active=%s + chipId=%s, records found %d", active, chipId, len(objs))
        return objs
