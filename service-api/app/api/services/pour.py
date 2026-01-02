"""Pour service for managing beer pour events and batch associations."""
# pylint: disable=duplicate-code
import logging
from typing import List

from fastapi import HTTPException
from sqlalchemy.orm import Session

from api.db import models, schemas

from .base import BaseService

logger = logging.getLogger(__name__)


class PourService(BaseService[models.Pour, schemas.PourCreate, schemas.PourUpdate]):
    """Service for managing beer pour events and batch associations."""
    def __init__(self, db_session: Session):
        super().__init__(models.Pour, db_session)

    def create(self, obj: schemas.PourCreate) -> models.Pour:
        self._validate_batch_exists(obj.batch_id)
        return super().create(obj)

    def create_list(self, lst: List[schemas.PourCreate]) -> List[models.Pour]:
        logger.info("Adding %d pour records for batch", len(lst))
        if len(lst) == 0:
            raise HTTPException(
                status_code=400,
                detail="No pour readings in request.",
            )
        self._validate_batch_exists(lst[0].batch_id)
        return super().create_list(lst)
    def search_by_batch_id(self, batch_id: int) -> List[models.Pour]:
        """Search pour events by batch ID."""
        objs = self._search_by_filter({"batch_id": batch_id})
        logger.info(
            "Fetched pour based on batchId=%d, records found %d", batch_id, len(objs)
        )
        return objs

    def get_latest(self, limit: int = 10) -> List[dict]:
        """Get the latest pour events with batch information."""
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
