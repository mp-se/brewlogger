import logging
from api.db.session import engine
from api.db import schemas
from sqlalchemy import text
from api.db.session import create_session
from api.services.brewlogger import BrewLoggerService
from .config import get_settings
from sqlalchemy.exc import OperationalError, ProgrammingError, InternalError

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

        brewlogger_service = BrewLoggerService(create_session())
        try:
            list = brewlogger_service.list()

            if len(list) == 0:
                logger.info("Missing configuration data, creating default settings")

                cfg = schemas.BrewLoggerCreate(
                    version=get_settings().version,
                    mdns_timeout=10,
                    temperature_format="C",
                    pressure_format="PSI",
                    gravity_format="SG",
                    dark_mode=False,
                    gravityForwardUrl="",
                )
                brewlogger_service.create(cfg)
                migrate_database()
            else:
                cfg = list[0]
                logger.info(f"Database version {cfg.version}")
                if cfg.version != get_settings().version:
                    logger.info(
                        "Database does not match the application version, trying to do migration"
                    )
                    migrate_database()
                    cfg2 = schemas.BrewLoggerUpdate(**cfg.__dict__)
                    cfg2.version = get_settings().version
                    logger.info(cfg2)
                    brewlogger_service.update(cfg.id, cfg2)
        except Exception as e:
            logger.error(f"Failed to query database, {e}")
            migrate_database()


def migrate_database():
    if get_settings().database_url.startswith("sqlite:"):
        logger.info("Running on sqlite so we skip trying to migrate")
        return

    with engine.connect() as con:
        try:
            logger.info("Dumping database schema for brewlogger.")

            res1 = con.execute(
                text(
                    "SELECT * FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'brewlogger' ORDER BY ordinal_position;"
                )
            ).fetchall()
            res2 = con.execute(
                text(
                    "SELECT * FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'device' ORDER BY ordinal_position;"
                )
            ).fetchall()
            res3 = con.execute(
                text(
                    "SELECT * FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'batch' ORDER BY ordinal_position;"
                )
            ).fetchall()
            res4 = con.execute(
                text(
                    "SELECT * FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'gravity' ORDER BY ordinal_position;"
                )
            ).fetchall()
            res5 = con.execute(
                text(
                    "SELECT * FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pour' ORDER BY ordinal_position;"
                )
            ).fetchall()
            res6 = con.execute(
                text(
                    "SELECT * FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pressure' ORDER BY ordinal_position;"
                )
            ).fetchall()

            idx = con.execute(
                text(
                    "SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;"
                )
            ).fetchall()
            con.commit()

            for r in res1:
                print(
                    f"Table: {r[2]:15} Column: {r[3]:20} Nullable: {r[6]:10} Type: {r[7]:30} MaxLength: {r[8]}"
                )

            for r in res2:
                print(
                    f"Table: {r[2]:15} Column: {r[3]:20} Nullable: {r[6]:10} Type: {r[7]:30} MaxLength: {r[8]}"
                )

            for r in res3:
                print(
                    f"Table: {r[2]:15} Column: {r[3]:20} Nullable: {r[6]:10} Type: {r[7]:30} MaxLength: {r[8]}"
                )

            for r in res4:
                print(
                    f"Table: {r[2]:15} Column: {r[3]:20} Nullable: {r[6]:10} Type: {r[7]:30} MaxLength: {r[8]}"
                )

            for r in res5:
                print(
                    f"Table: {r[2]:15} Column: {r[3]:20} Nullable: {r[6]:10} Type: {r[7]:30} MaxLength: {r[8]}"
                )

            for r in res6:
                print(
                    f"Table: {r[2]:15} Column: {r[3]:20} Nullable: {r[6]:10} Type: {r[7]:30} MaxLength: {r[8]}"
                )

            for i in idx:
                print(f"Table: {i[0]:15} Index: {i[1]:20}")

        except (OperationalError, ProgrammingError, InternalError) as e:
            logger.error(f"Failed to update database, Step 1, {e}")

    logger.info("Running postgres sql commands to migrate database from v0.5 to v0.6")

    db_updates = {
        "ALTER TABLE batch ADD COLUMN fermentation_chamber INTEGER",

        "ALTER TABLE gravity ADD COLUMN beer_temperature FLOAT",
        "ALTER TABLE gravity ADD COLUMN chamber_temperature FLOAT",
        "ALTER TABLE device ADD COLUMN gravity_poly TEXT",
        'ALTER TABLE device ADD COLUMN gravity_formula VARCHAR(100)',
        "UPDATE device SET gravity_poly = '' WHERE gravity_poly IS NULL",
        "UPDATE device SET gravity_formula = '' WHERE gravity_formula IS NULL",
        "ALTER TABLE device ALTER COLUMN gravity_poly SET NOT NULL",
        "ALTER TABLE device ALTER COLUMN gravity_formula SET NOT NULL",

        'ALTER TABLE brewlogger ADD COLUMN gravity_forward_url VARCHAR(100)',
        "UPDATE brewlogger SET gravity_forward_url = '' WHERE gravity_forward_url IS NULL",
        "ALTER TABLE brewlogger ALTER COLUMN gravity_forward_url SET NOT NULL",

        "DROP INDEX ix_device_chip_id",
    }

    with engine.connect() as con:
        for db_update in db_updates:
            try:
                logger.info(f"Running SQL {db_update}")
                con.execute(text(db_update))
                con.commit()
            except (OperationalError, ProgrammingError, InternalError) as e:
                logger.error(f"Failed to run command, {e}")

    logger.info("Completed postgres migration")

