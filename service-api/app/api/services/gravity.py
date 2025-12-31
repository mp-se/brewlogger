from typing import List
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
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

    def get_latest(self, limit: int = 10) -> List[dict]:
        objs = self.db_session.query(
            models.Gravity.id,
            models.Gravity.temperature,
            models.Gravity.gravity,
            models.Gravity.velocity,
            models.Gravity.angle,
            models.Gravity.battery,
            models.Gravity.rssi,
            models.Gravity.corr_gravity,
            models.Gravity.run_time,
            models.Gravity.created,
            models.Gravity.active,
            models.Gravity.chamber_temperature,
            models.Gravity.beer_temperature,
            models.Gravity.batch_id,
            models.Batch.name.label('batch_name'),
            models.Batch.chip_id_gravity
        ).join(models.Batch).order_by(models.Gravity.created.desc()).limit(limit).all()
        
        logger.info("Fetched latest %d gravity records", len(objs))
        # Convert rows to dictionaries
        result = []
        for row in objs:
            result.append({
                'id': row.id,
                'temperature': row.temperature,
                'gravity': row.gravity,
                'velocity': row.velocity,
                'angle': row.angle,
                'battery': row.battery,
                'rssi': row.rssi,
                'corrGravity': row.corr_gravity,
                'runTime': row.run_time,
                'created': row.created,
                'active': row.active,
                'chamberTemperature': row.chamber_temperature,
                'beerTemperature': row.beer_temperature,
                'batchId': row.batch_id,
                'batchName': row.batch_name,
                'chipIdGravity': row.chip_id_gravity
            })
        return result
