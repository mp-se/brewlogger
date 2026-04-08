# SPDX-License-Identifier: GPL-3.0-or-later
# Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger

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

    def update_prediction(self, batch_id: int):
        """Update fermentation prediction for a batch."""
        from predict.predict_python import BrewloggerPredictor  # pylint: disable=import-outside-toplevel
        from .gravity import GravityService  # pylint: disable=import-outside-toplevel
        from api.ws import notify_clients  # pylint: disable=import-outside-toplevel
        import asyncio  # pylint: disable=import-outside-toplevel
        import time  # pylint: disable=import-outside-toplevel
        from datetime import datetime  # pylint: disable=import-outside-toplevel

        start_time_proc = time.perf_counter()
        try:
            batch = self.get(batch_id)
            if not batch or not batch.active:
                return

            gravity_service = GravityService(self.db_session)
            # Get points from last 24h
            points = gravity_service.search_by_batch_id_last_24h(batch_id)
            if len(points) < 2:
                logger.debug("Not enough data for prediction (batch %d)", batch_id)
                return

            # Prepare history for predictor: (timestamp, gravity, temp)
            history = [(p.created, p.gravity, p.temperature) for p in points]

            # Get first point ever to calculate hours_elapsed
            first_point = self.db_session.query(models.Gravity).filter(
                models.Gravity.batch_id == batch_id
            ).order_by(models.Gravity.created.asc()).first()

            if not first_point:
                return

            hours_elapsed = (datetime.now() - first_point.created).total_seconds() / 3600

            # Predict
            predictor = BrewloggerPredictor()
            hours_left = predictor.predict(
                history=history,
                current_gravity=points[-1].gravity,
                current_temp=points[-1].temperature,
                start_gravity=batch.og or points[0].gravity,
                plateau_gravity=batch.fg or 1.010,
                hours_elapsed=hours_elapsed
            )

            duration = time.perf_counter() - start_time_proc
            if hours_left is not None:
                batch.prediction_hours_left = float(hours_left)
                batch.prediction_at_timestamp = datetime.utcnow()
                self.db_session.commit()
                logger.info("Updated prediction for batch %d: %.2f hours left (took %.4f seconds)",
                            batch_id, hours_left, duration)

                # Send WebSocket notification to trigger UI update
                try:
                    loop = asyncio.get_event_loop()
                    if loop.is_running():
                        loop.create_task(notify_clients("batch", "update", batch_id))
                except Exception as ws_err:  # pylint: disable=broad-exception-caught
                    logger.warning("Failed to queue WS notification for batch %d: %s",
                                   batch_id, str(ws_err))
            else:
                logger.debug("Predictor skipped processing for batch %d (took %.4f seconds)",
                             batch_id, duration)
        except Exception as e:  # pylint: disable=broad-exception-caught
            logger.error("Prediction failed for batch %d: %s", batch_id, str(e))
            self.db_session.rollback()
