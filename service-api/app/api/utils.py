import logging
from api.db.session import engine
from api.db import schemas
from sqlalchemy import text
from api.db.session import create_session
from api.services.brewlogger import BrewLoggerService
from .config import get_settings

logger = logging.getLogger(__name__)


def load_settings():
    logger.info("Loading settings and checking migration")

    with engine.connect() as con:
        try:
            con.execute(text("SELECT * FROM device"))
            con.commit()
            logger.info("Database connected.")
        except Exception as e:
            logger.error(f"Failed to connect to database, {e}")
            con.rollback()

        brewlogger_service = BrewLoggerService(create_session())
        try:
            list = brewlogger_service.list()

            if len(list) == 0:
                logger.info("Missing configuration data, creating default settings")

                cfg = schemas.BrewLoggerCreate(
                    version=get_settings().version,
                    temperature_format="C",
                    pressure_format="PSI",
                    gravity_format="SG",
                    dark_mode=False,
                    gravityForwardUrl="",
                )
                brewlogger_service.create(cfg)
        except Exception as e:
            logger.error(f"Failed to query database, {e}")
