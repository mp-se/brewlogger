from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session
from api.db import schemas, models
from .base import BaseService
import logging

logger = logging.getLogger(__name__)

class DeviceService(BaseService[models.Device, schemas.DeviceCreate, schemas.DeviceUpdate]):
    def __init__(self, db_session: Session):
        super(DeviceService, self).__init__(models.Device, db_session)

    def search_chipId(self, chipId: str) -> List[models.Device]:
        filters = { "chip_id": chipId }
        objs: List[self.model] = self.db_session.scalars(select(self.model).filter_by(**filters)).all()
        logger.info("Fetched device based on chipId=%s, records found %d", chipId, len(objs))
        return objs
