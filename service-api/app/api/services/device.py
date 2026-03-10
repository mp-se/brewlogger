"""Device service for managing brewery device configurations and operations."""
import logging
from typing import List

from sqlalchemy import select
from sqlalchemy.orm import Session

from api.db import models, schemas

from .base import BaseService

logger = logging.getLogger(__name__)


class DeviceService(
    BaseService[models.Device, schemas.DeviceCreate, schemas.DeviceUpdate]
):
    """Service for managing brewery device configurations and operations."""
    def __init__(self, db_session: Session):
        super().__init__(models.Device, db_session)

    def search_chip_id(self, chip_id: str) -> List[models.Device]:
        """Search devices by chip ID."""
        filters = {"chip_id": chip_id}
        objs: List[self.model] = self.db_session.scalars(
            select(self.model).filter_by(**filters)
        ).all()
        logger.info(
            "Fetched device based on chipId=%s, records found %d", chip_id, len(objs)
        )
        return objs

    def search_software(self, software: str) -> List[models.Device]:
        """Search devices by software type."""
        filters = {"software": software}
        objs: List[self.model] = self.db_session.scalars(
            select(self.model).filter_by(**filters)
        ).all()
        logger.info(
            "Fetched device based on software=%s, records found %d", software, len(objs)
        )
        return objs

    def search_ble_color(self, ble_color: str) -> List[models.Device]:
        """Search devices by BLE color identifier."""
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
