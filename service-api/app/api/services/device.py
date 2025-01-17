from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session
from api.db import schemas, models
from .base import BaseService
import logging

logger = logging.getLogger(__name__)


class DeviceService(
    BaseService[models.Device, schemas.DeviceCreate, schemas.DeviceUpdate]
):
    def __init__(self, db_session: Session):
        super(DeviceService, self).__init__(models.Device, db_session)

    def search_chipId(self, chipId: str) -> List[models.Device]:
        filters = {"chip_id": chipId}
        objs: List[self.model] = self.db_session.scalars(
            select(self.model).filter_by(**filters)
        ).all()
        logger.info(
            "Fetched device based on chipId=%s, records found %d", chipId, len(objs)
        )
        return objs

    def search_software(self, software: str) -> List[models.Device]:
        filters = {"software": software}
        objs: List[self.model] = self.db_session.scalars(
            select(self.model).filter_by(**filters)
        ).all()
        logger.info(
            "Fetched device based on software=%s, records found %d", software, len(objs)
        )
        return objs

    def search_ble_color(self, ble_color: str) -> List[models.Device]:
        filters = {"ble_color": ble_color}
        objs: List[self.model] = self.db_session.scalars(
            select(self.model).filter_by(**filters)
        ).all()
        logger.info(
            "Fetched device based on ble_color=%s, records found %d",
            ble_color,
            len(objs),
        )
        return objs
