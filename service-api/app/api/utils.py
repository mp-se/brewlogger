"""Utility functions for database initialization and settings loading."""
import logging
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from api.db import schemas
from api.db.session import engine, create_session
from api.services.brewlogger import BrewLoggerService
from .config import get_settings

logger = logging.getLogger(__name__)


def load_settings():
    """Load application settings and verify database migrations."""
    logger.info("Loading settings and checking migration")

    with engine.connect() as con:
        try:
            con.execute(text("SELECT * FROM device"))
            con.commit()
            logger.info("Database connected.")
        except (SQLAlchemyError, OSError) as e:
            logger.error("Failed to connect to database, %s", e)
            con.rollback()

        brewlogger_service = BrewLoggerService(create_session())
        try:
            settings_list = brewlogger_service.list()

            if len(settings_list) == 0:
                logger.info("Missing configuration data, creating default settings")

                cfg = schemas.BrewLoggerCreate(
                    version=get_settings().version,
                    temperature_format="C",
                    pressure_format="PSI",
                    gravity_format="SG",
                    volume_format="L",
                    dark_mode=False,
                    gravityForwardUrl="",
                )
                brewlogger_service.create(cfg)
        except SQLAlchemyError as e:
            logger.error("Failed to query database, %s", e)
