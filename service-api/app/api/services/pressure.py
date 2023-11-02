from typing import List
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from api.db import models, schemas
from .base import BaseService
import logging

logger = logging.getLogger(__name__)

class PressureService(BaseService[models.Pressure, schemas.PressureCreate, schemas.PressureUpdate]):
    def __init__(self, db_session: Session):
        super(PressureService, self).__init__(models.Pressure, db_session)

    def create(self, obj: schemas.PressureCreate) -> models.Pressure:
        batch = self.db_session.get(models.Batch, obj.batch_id)
        logging.info("Searching for batch with id=%s %s", obj.batch_id, batch)
        if batch is None:
            raise HTTPException(
                status_code=400,
                detail=f"Batch with id = {obj.batch_id} not found.",
            )
        return super(PressureService, self).create(obj)

    def search(self, chipId: str) -> List[models.Pressure]:
        filters = { "chip_id": chipId }
        objs: List[self.model] = self.db_session.scalars(select(self.model).filter_by(**filters)).all()
        logging.info("Fetched pressure based on chipId=%s, records found %d", chipId, len(objs))
        return objs
