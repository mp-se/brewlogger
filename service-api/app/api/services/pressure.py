from typing import List
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from api.db import models, schemas
from .base import BaseService
import logging

logger = logging.getLogger(__name__)


class PressureService(
    BaseService[models.Pressure, schemas.PressureCreate, schemas.PressureUpdate]
):
    def __init__(self, db_session: Session):
        super(PressureService, self).__init__(models.Pressure, db_session)

    def create(self, obj: schemas.PressureCreate) -> models.Pressure:
        batch = self.db_session.get(models.Batch, obj.batch_id)
        logger.info("Searching for batch with id=%s %s", obj.batch_id, batch)
        if batch is None:
            raise HTTPException(
                status_code=400,
                detail=f"Batch with id = {obj.batch_id} not found.",
            )
        return super(PressureService, self).create(obj)

    def createList(self, lst: List[schemas.PressureCreate]) -> List[models.Pressure]:
        logger.info("Adding %d pressure records for batch", len(lst))
        if len(lst) == 0:
            raise HTTPException(
                status_code=400,
                detail="No pressure readings in request.",
            )

        batch = self.db_session.get(models.Batch, lst[0].batch_id)
        logger.info("Searching for batch with id=%s %s", lst[0].batch_id, batch)
        if batch is None:
            raise HTTPException(
                status_code=400,
                detail=f"Batch with id = {lst[0].batch_id} not found.",
            )
        return super(PressureService, self).createList(lst)

    def search(self, chipId: str) -> List[models.Pressure]:
        filters = {"chip_id": chipId}
        objs: List[self.model] = self.db_session.scalars(
            select(self.model).filter_by(**filters)
        ).all()
        logger.info(
            "Fetched pressure based on chipId=%s, records found %d", chipId, len(objs)
        )
        return objs

    def search_by_batchId(self, batchId: int) -> List[models.Pressure]:
        filters = {"batch_id": batchId}
        objs: List[self.model] = self.db_session.scalars(
            select(self.model).filter_by(**filters)
        ).all()
        logger.info(
            "Fetched pressure based on batchId=%d, records found %d", batchId, len(objs)
        )
        return objs

    def get_latest(self, limit: int = 10) -> List[dict]:
        objs = self.db_session.query(
            models.Pressure.id,
            models.Pressure.temperature,
            models.Pressure.pressure,
            models.Pressure.pressure1,
            models.Pressure.battery,
            models.Pressure.rssi,
            models.Pressure.run_time,
            models.Pressure.created,
            models.Pressure.active,
            models.Pressure.batch_id,
            models.Batch.name.label('batch_name'),
            models.Batch.chip_id_pressure
        ).join(models.Batch).order_by(models.Pressure.created.desc()).limit(limit).all()
        
        logger.info("Fetched latest %d pressure records", len(objs))
        # Convert rows to dictionaries
        result = []
        for row in objs:
            result.append({
                'id': row.id,
                'temperature': row.temperature,
                'pressure': row.pressure,
                'pressure1': row.pressure1,
                'battery': row.battery,
                'rssi': row.rssi,
                'runTime': row.run_time,
                'created': row.created,
                'active': row.active,
                'batchId': row.batch_id,
                'batchName': row.batch_name,
                'chipIdPressure': row.chip_id_pressure
            })
        return result
