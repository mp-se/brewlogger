"""Batch service for managing brewing batch data and operations."""
import logging
from typing import List

from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from api.db import models, schemas

from .base import BaseService

logger = logging.getLogger(__name__)


class BatchService(BaseService[models.Batch, schemas.BatchCreate, schemas.BatchUpdate]):
    """Service for managing brewing batch data and operations."""
    def __init__(self, db_session: Session):
        super().__init__(models.Batch, db_session)

    def search_chip_id(self, chip_id: str) -> List[models.Batch]:
        """Search batches by gravity or pressure chip ID."""
        filters = or_(self.model.chip_id_gravity == chip_id, self.model.chip_id_pressure == chip_id)
        objs: List[self.model] = self.db_session.scalars(
            select(self.model).filter(filters)
        ).all()
        logger.info(
            "Fetched batches based on chipId=%s, records found %d", chip_id, len(objs)
        )
        return objs

    def list_filtered(self, chip_id: str = None, active: bool = None) -> List[models.Batch]:
        """List batches with optional filtering by chip ID and/or active status."""
        query = select(self.model)

        if chip_id and active is not None:
            query = query.filter(and_(
                or_(self.model.chip_id_gravity == chip_id, self.model.chip_id_pressure == chip_id),
                self.model.active == active
            ))
            logger.info("Fetched batches based on chipId=%s + active=%s", chip_id, active)
        elif chip_id:
            query = query.filter(or_(
                self.model.chip_id_gravity == chip_id,
                self.model.chip_id_pressure == chip_id
            ))
            logger.info("Fetched batches based on chipId=%s", chip_id)
        elif active is not None:
            query = query.filter(self.model.active == active)
            logger.info("Fetched batches based on active=%s", active)

        objs: List[self.model] = self.db_session.scalars(query).all()
        logger.info("Total batches found: %d", len(objs))
        return objs

    def search_tap_list(self) -> List[models.Batch]:
        """Search batches that are on tap list."""
        filters = {"tap_list": True}
        objs: List[self.model] = self.db_session.scalars(
            select(self.model).filter_by(**filters)
        ).all()
        logger.info(
            "Fetched batches based on taplist=true, records found %d", len(objs)
        )
        return objs

    def search_active(self, active: bool) -> List[models.Batch]:
        """Search batches by active status."""
        filters = {"active": active}
        objs: List[self.model] = self.db_session.scalars(
            select(self.model).filter_by(**filters)
        ).all()
        logger.info(
            "Fetched batches based on active=%s, records found %d", active, len(objs)
        )
        return objs

    def search_chip_id_active(self, chip_id: str, active: bool) -> List[models.Batch]:
        """Search batches by chip ID and active status."""
        filters = and_(
            or_(self.model.chip_id_gravity == chip_id, self.model.chip_id_pressure == chip_id),
            self.model.active == active
        )
        objs: List[self.model] = self.db_session.scalars(
            select(self.model).filter(filters)
        ).all()
        logger.info(
            "Fetched batches based on active=%s + chipId=%s, records found %d",
            active,
            chip_id,
            len(objs),
        )
        return objs

    def search_brewfather_id(self, brewfather_id: int) -> List[models.Batch]:
        """Search batches by Brewfather batch ID."""
        filters = {"brewfather_id": brewfather_id}
        objs: List[self.model] = self.db_session.scalars(
            select(self.model).filter_by(**filters)
        ).all()
        logger.info(
            "Fetched batches based on brewfather_id=%s, records found %d", brewfather_id, len(objs)
        )
        return objs
