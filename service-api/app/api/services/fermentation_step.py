from typing import List
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from api.db import models, schemas
from .base import BaseService
import logging

logger = logging.getLogger(__name__)


class FermentationStepService(
    BaseService[models.FermentationStep, schemas.FermentationStepCreate, schemas.FermentationStepUpdate]
):
    def __init__(self, db_session: Session):
        super(FermentationStepService, self).__init__(models.FermentationStep, db_session)

    # def create(self, obj: schemas.FermentationStepCreate) -> models.FermentationStep:
    #     device = self.db_session.get(models.Device, obj.device_id)
    #     logger.info("Searching for device with id=%s %s", obj.device_id, device)
    #     if device is None:
    #         raise HTTPException(
    #             status_code=400,
    #             detail=f"Device with id = {obj.device_id} not found.",
    #         )
    #     return super(FermentationStepService, self).create(obj)

    def createList(self, lst: List[schemas.FermentationStepCreate]) -> List[models.FermentationStep]:
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
        return super(FermentationStepService, self).createList(lst)

    def search_by_deviceId(self, deviceId: int) -> List[models.FermentationStep]:
        filters = {"device_id": deviceId}
        objs: List[self.model] = self.db_session.scalars(
            select(self.model).filter_by(**filters)
        ).all()
        logger.info(
            "Fetched fermentation steps based on deviceId=%d, records found %d", deviceId, len(objs)
        )
        return objs

    def delete_by_deviceId(self, deviceId: int) -> List[models.FermentationStep]:
        filters = {"device_id": deviceId}
        objs: List[self.model] = self.db_session.scalars(
            select(self.model).filter_by(**filters)
        ).all()

        for obj in objs:
            self.delete(obj.id)

        logger.info(
            "Deleted fermentation steps based on deviceId=%d, records found %d", deviceId, len(objs)
        )
        return objs