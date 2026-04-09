# BrewLogger
# Copyright (c) 2021-2026 Magnus
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Alternatively, this software may be used under the terms of a
# commercial license. See LICENSE_COMMERCIAL for details.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
#

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
