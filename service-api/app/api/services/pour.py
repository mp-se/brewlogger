from typing import List
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from api.db import models, schemas
from .base import BaseService
import logging

logger = logging.getLogger(__name__)


class PourService(BaseService[models.Pour, schemas.PourCreate, schemas.PourUpdate]):
    def __init__(self, db_session: Session):
        super(PourService, self).__init__(models.Pour, db_session)

    def create(self, obj: schemas.PourCreate) -> models.Pour:
        batch = self.db_session.get(models.Batch, obj.batch_id)
        if batch is None:
            raise HTTPException(
                status_code=400,
                detail=f"Batch with id = {obj.batch_id} not found.",
            )
        return super(PourService, self).create(obj)

    def createList(self, lst: List[schemas.PourCreate]) -> List[models.Pour]:
        logger.info("Adding %d pour records for batch", len(lst))
        if len(lst) == 0:
            raise HTTPException(
                status_code=400,
                detail="No pour readings in request.",
            )

        batch = self.db_session.get(models.Batch, lst[0].batch_id)
        logger.info("Searching for batch with id=%s %s", lst[0].batch_id, batch)
        if batch is None:
            raise HTTPException(
                status_code=400,
                detail=f"Batch with id = {lst[0].batch_id} not found.",
            )
        return super(PourService, self).createList(lst)

    def search_by_batchId(self, batchId: int) -> List[models.Pour]:
        filters = {"batch_id": batchId}
        objs: List[self.model] = self.db_session.scalars(
            select(self.model).filter_by(**filters)
        ).all()
        logger.info(
            "Fetched pour based on batchId=%d, records found %d", batchId, len(objs)
        )
        return objs

    def get_latest(self, limit: int = 10) -> List[dict]:
        objs = self.db_session.query(
            models.Pour.id,
            models.Pour.pour,
            models.Pour.volume,
            models.Pour.max_volume,
            models.Pour.created,
            models.Pour.active,
            models.Pour.batch_id,
            models.Batch.name.label('batch_name')
        ).join(models.Batch).order_by(models.Pour.created.desc()).limit(limit).all()
        
        logger.info("Fetched latest %d pour records", len(objs))
        # Convert rows to dictionaries
        result = []
        for row in objs:
            result.append({
                'id': row.id,
                'pour': row.pour,
                'volume': row.volume,
                'maxVolume': row.max_volume,
                'created': row.created,
                'active': row.active,
                'batchId': row.batch_id,
                'batchName': row.batch_name
            })
        return result
