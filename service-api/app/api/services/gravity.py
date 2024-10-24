from typing import List
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from api.db import models, schemas
from .base import BaseService
import logging

logger = logging.getLogger(__name__)


class GravityService(
    BaseService[models.Gravity, schemas.GravityCreate, schemas.GravityUpdate]
):
    def __init__(self, db_session: Session):
        super(GravityService, self).__init__(models.Gravity, db_session)

    def create(self, obj: schemas.GravityCreate) -> models.Gravity:
        batch = self.db_session.get(models.Batch, obj.batch_id)
        logger.info("Searching for batch with id=%s %s", obj.batch_id, batch)
        if batch is None:
            raise HTTPException(
                status_code=400,
                detail=f"Batch with id = {obj.batch_id} not found.",
            )
        return super(GravityService, self).create(obj)

    def createList(self, lst: List[schemas.GravityCreate]) -> List[models.Gravity]:
        logger.info("Adding %d gravity records for batch", len(lst))
        if len(lst) == 0:
            raise HTTPException(
                status_code=400,
                detail="No gravity readings in request.",
            )

        batch = self.db_session.get(models.Batch, lst[0].batch_id)
        logger.info("Searching for batch with id=%s %s", lst[0].batch_id, batch)
        if batch is None:
            raise HTTPException(
                status_code=400,
                detail=f"Batch with id = {lst[0].batch_id} not found.",
            )
        return super(GravityService, self).createList(lst)

    def search_by_batchId(self, batchId: int) -> List[models.Gravity]:
        filters = {"batch_id": batchId}
        objs: List[self.model] = self.db_session.scalars(
            select(self.model).filter_by(**filters)
        ).all()
        logger.info(
            "Fetched gravity based on batchId=%d, records found %d", batchId, len(objs)
        )
        return objs
