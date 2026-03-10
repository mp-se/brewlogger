"""Gravity service for managing fermentation gravity readings and batch associations."""
# pylint: disable=duplicate-code
import logging
from typing import List

from fastapi import HTTPException
from sqlalchemy.orm import Session

from api.db import models, schemas

from .base import BaseService

logger = logging.getLogger(__name__)


class GravityService(
    BaseService[models.Gravity, schemas.GravityCreate, schemas.GravityUpdate]
):
    """Service for managing fermentation gravity readings and batch associations."""
    def __init__(self, db_session: Session):
        super().__init__(models.Gravity, db_session)

    def create(self, obj: schemas.GravityCreate) -> models.Gravity:
        self._validate_batch_exists(obj.batch_id)
        return super().create(obj)

    def create_list(self, lst: List[schemas.GravityCreate]) -> List[models.Gravity]:
        logger.info("Adding %d gravity records for batch", len(lst))
        if len(lst) == 0:
            raise HTTPException(
                status_code=400,
                detail="No gravity readings in request.",
            )
        self._validate_batch_exists(lst[0].batch_id)
        return super().create_list(lst)
    def search_by_batch_id(self, batch_id: int) -> List[models.Gravity]:
        """Search gravity readings by batch ID."""
        objs = self._search_by_filter({"batch_id": batch_id})
        logger.info(
            "Fetched gravity based on batchId=%d, records found %d", batch_id, len(objs)
        )
        return objs

    def get_latest(self, limit: int = 10) -> List[dict]:  # pylint: disable=duplicate-code
        """Get the latest gravity readings with batch information."""
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
