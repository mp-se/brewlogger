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

"""Fermentation step service for managing fermentation process steps and device configurations."""
import logging
from typing import List

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from api.db import models, schemas

from .base import BaseService

logger = logging.getLogger(__name__)


class FermentationStepService(
    BaseService[
        models.FermentationStep,
        schemas.FermentationStepCreate,
        schemas.FermentationStepUpdate,
    ]
):
    """Service for managing fermentation process steps and device configurations."""
    def __init__(self, db_session: Session):
        super().__init__(
            models.FermentationStep, db_session
        )

    # def create(self, obj: schemas.FermentationStepCreate) -> models.FermentationStep:
    #     device = self.db_session.get(models.Device, obj.device_id)
    #     logger.info("Searching for device with id=%s %s", obj.device_id, device)
    #     if device is None:
    #         raise HTTPException(
    #             status_code=400,
    #             detail=f"Device with id = {obj.device_id} not found.",
    #         )
    #     return super().create(obj)

    def create_list(
        self, lst: List[schemas.FermentationStepCreate]
    ) -> List[models.FermentationStep]:
        logger.info("Adding %d fermentation step records for device", len(lst))
        if len(lst) == 0:
            raise HTTPException(
                status_code=400,
                detail="No fermentation steps in request.",
            )

        device = self.db_session.get(models.Device, lst[0].device_id)
        logger.info("Searching for batch with id=%s %s", lst[0].device_id, device)
        if device is None:
            raise HTTPException(
                status_code=400,
                detail=f"Device with id = {lst[0].device_id} not found.",
            )
        return super().create_list(lst)

    def search_by_device_id(self, device_id: int) -> List[models.FermentationStep]:
        """Search fermentation steps by device ID."""
        filters = {"device_id": device_id}
        objs: List[self.model] = self.db_session.scalars(
            select(self.model).filter_by(**filters)
        ).all()
        logger.info(
            "Fetched fermentation steps based on deviceId=%d, records found %d",
            device_id,
            len(objs),
        )
        return objs

    def delete_by_device_id(self, device_id: int) -> List[models.FermentationStep]:
        """Delete fermentation steps for a device by device ID."""
        filters = {"device_id": device_id}
        objs: List[self.model] = self.db_session.scalars(
            select(self.model).filter_by(**filters)
        ).all()

        for obj in objs:
            self.delete(obj.id)

        logger.info(
            "Deleted fermentation steps based on deviceId=%d, records found %d",
            device_id,
            len(objs),
        )
        return objs
