# SPDX-License-Identifier: GPL-3.0-or-later
# Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger

"""Pressure service for managing fermentation pressure readings and batch associations."""
# pylint: disable=duplicate-code
import logging
from typing import List

from fastapi import HTTPException
from sqlalchemy.orm import Session

from api.db import models, schemas

from .base import BaseService

logger = logging.getLogger(__name__)


class PressureService(
    BaseService[models.Pressure, schemas.PressureCreate, schemas.PressureUpdate]
):
    """Service for managing fermentation pressure readings and batch associations."""
    def __init__(self, db_session: Session):
        super().__init__(models.Pressure, db_session)

    def create(self, obj: schemas.PressureCreate) -> models.Pressure:
        self._validate_batch_exists(obj.batch_id)
        return super().create(obj)

    def create_list(self, lst: List[schemas.PressureCreate]) -> List[models.Pressure]:
        logger.info("Adding %d pressure records for batch", len(lst))
        if len(lst) == 0:
            raise HTTPException(
                status_code=400,
                detail="No pressure readings in request.",
            )
        self._validate_batch_exists(lst[0].batch_id)
        return super().create_list(lst)

    def search(self, chip_id: str) -> List[models.Pressure]:
        """Search pressure readings by chip ID."""
        objs = self._search_by_filter({"chip_id": chip_id})
        logger.info(
            "Fetched pressure based on chipId=%s, records found %d", chip_id, len(objs)
        )
        return objs

    def search_by_batch_id(self, batch_id: int) -> List[models.Pressure]:
        """Search pressure readings by batch ID."""
        objs = self._search_by_filter({"batch_id": batch_id})
        logger.info(
            "Fetched pressure based on batchId=%d, records found %d", batch_id, len(objs)
        )
        return objs

    def get_latest(self, limit: int = 10) -> List[dict]:  # pylint: disable=duplicate-code
        """Get the latest pressure readings with batch information."""
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
