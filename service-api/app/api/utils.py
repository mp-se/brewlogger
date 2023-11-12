import logging
from api.db.session import engine
from api.db import schemas
from sqlalchemy import text
from api.db.session import create_session
from api.services.brewlogger import BrewLoggerService
from .config import get_settings
from sqlalchemy.exc import OperationalError, ProgrammingError, InternalError
from sqlalchemy import text

logger = logging.getLogger(__name__)

def load_settings():
  with engine.connect() as con:
    try:
      con.execute(text('SELECT * FROM device'))
      con.commit()
      logger.info("Database connected.")
    except Exception as e:
      logger.error(f"Failed to connect to database, {e}")

    brewlogger_service = BrewLoggerService(create_session())
    list = brewlogger_service.list()

    if len(list) == 0:
      logger.info("Missing configuration data, creating default settings")

      cfg = schemas.BrewLoggerCreate(
        version = get_settings().version,
        mdns_timeout = 10,
        temperature_format = "C",
        pressure_format = "PSI",
        gravity_format = "SG",
      )
      brewlogger_service.create(cfg)
      migrate_database()
    else:
      cfg = list[0]
      if cfg.version != get_settings().version:
        logger.info("Database does not match the application version, trying to do migration")
        migrate_database()
        cfg2 = schemas.BrewLoggerUpdate(**cfg.__dict__)
        cfg2.version = get_settings().version
        logger.info(cfg2)
        brewlogger_service.update(cfg.id, cfg2)

def migrate_database():
    logger.info("Running postgres sql commands to migrate database from v0.2 to v0.3")

    with engine.connect() as con:
        try:
            con.execute(text('ALTER TABLE gravity DROP COLUMN name;'))
            con.execute(text('ALTER TABLE gravity DROP COLUMN chip_id;'))
            con.execute(text('ALTER TABLE gravity DROP COLUMN interval;'))
            con.execute(text('ALTER TABLE gravity DROP COLUMN token;'))
            con.execute(text('ALTER TABLE gravity DROP COLUMN temp_units;'))
            con.execute(text('ALTER TABLE gravity DROP COLUMN gravity_units;'))
            con.commit()
        except (OperationalError, ProgrammingError, InternalError) as e:
            logger.error(f"Failed to update database, Step 1, {e}")

    with engine.connect() as con:
        try:
            con.execute(text('ALTER TABLE device ADD COLUMN ble_color VARCHAR(15)'))
            con.commit()
        except (OperationalError, ProgrammingError, InternalError) as e:
            logger.error(f"Failed to update database, Step 2, {e}")

    with engine.connect() as con:
        try:
            con.execute(text("UPDATE device SET ble_color = '' WHERE ble_color IS NULL"))
            con.commit()
        except (OperationalError, ProgrammingError, InternalError) as e:
            logger.error(f"Failed to update database, Step 3, {e}")

    with engine.connect() as con:
        try:
            con.execute(text('ALTER TABLE device ALTER COLUMN ble_color SET NOT NULL'))
            con.commit()
        except (OperationalError, ProgrammingError, InternalError) as e:
            logger.error(f"Failed to update database, Step 4, {e}")
            