import time
from sqlalchemy import text
from sqlalchemy.exc import OperationalError, ProgrammingError, InternalError
from pydantic_settings import BaseSettings
from starlette.config import Config
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from psycopg2.errors import UndefinedTable

config = Config()


class Settings(BaseSettings):
    database_url: str = config(
        "DATABASE_URL", cast=str, default="sqlite:///./brewlogger.sqlite"
    )


def get_settings() -> Settings:
    settings = Settings()
    return settings


def create_session() -> scoped_session:
    print("Creating database session.")
    Session = scoped_session(
        sessionmaker(autocommit=False, autoflush=False, bind=engine)
    )
    return Session


def migrate_database():
    if get_settings().database_url.startswith("sqlite:"):
        print("Running on sqlite so we skip trying to migrate")
        return

    connectionReady = False

    while not connectionReady:
        with engine.connect() as con:
            try:
                print("Checking for database to update")
                con.execute(text("SELECT * FROM brewlogger"))
                con.commit()
                connectionReady = True
            except OperationalError:
                con.rollback()
            except UndefinedTable:
                con.rollback()
                print("Table does not exist, database not initialized yet, exiting.")
                return
            except Exception:
                con.rollback()
                print(
                    "Unable to search database, probably not created so there is nothing to update."
                )
                return

        print("Waiting for database to become available.")
        time.sleep(1)

    print("Running postgres sql commands to migrate database from v0.5 to v0.9")
    # return

    db_updates = [
        # Changes from v0.4
        # "ALTER TABLE gravity ADD COLUMN active BOOLEAN",
        # "UPDATE gravity SET active = true WHERE active IS NULL",
        # "ALTER TABLE gravity ALTER COLUMN active SET NOT NULL",
        # "ALTER TABLE pour ADD COLUMN active BOOLEAN",
        # "UPDATE pour SET active = true WHERE active IS NULL",
        # "ALTER TABLE pour ALTER COLUMN active SET NOT NULL",
        # "ALTER TABLE pressure ADD COLUMN active BOOLEAN",
        # "UPDATE pressure SET active = true WHERE active IS NULL",
        # "ALTER TABLE pressure ALTER COLUMN active SET NOT NULL",
        # Changes from v0.5 -> v0.7
        # "ALTER TABLE batch ADD COLUMN fermentation_chamber INTEGER",
        # "ALTER TABLE gravity ADD COLUMN beer_temperature FLOAT",
        # "ALTER TABLE gravity ADD COLUMN chamber_temperature FLOAT",
        # # "ALTER TABLE device ADD COLUMN gravity_poly TEXT",
        # # "UPDATE device SET gravity_poly = '' WHERE gravity_poly IS NULL",
        # # "ALTER TABLE device ALTER COLUMN gravity_poly SET NOT NULL",
        # # "ALTER TABLE device ADD COLUMN gravity_formula VARCHAR(100)",
        # # "UPDATE device SET gravity_formula = '' WHERE gravity_formula IS NULL",
        # # "ALTER TABLE device ALTER COLUMN gravity_formula SET NOT NULL",
        # "ALTER TABLE brewlogger ADD COLUMN gravity_forward_url VARCHAR(100)",
        # "UPDATE brewlogger SET gravity_forward_url = '' WHERE gravity_forward_url IS NULL",
        # "ALTER TABLE brewlogger ALTER COLUMN gravity_forward_url SET NOT NULL",
        # "ALTER TABLE batch ADD COLUMN fermentation_steps TEXT",
        # "UPDATE batch SET fermentation_steps = '' WHERE fermentation_steps IS NULL",
        # "ALTER TABLE batch ALTER COLUMN fermentation_steps SET NOT NULL",
        # "DROP INDEX ix_device_chip_id",
        # "ALTER TABLE brewlogger DROP COLUMN mdns_timeout",
        # Changes from 0.7 to 0.8
        "ALTER TABLE device DROP COLUMN gravity_poly",
        "ALTER TABLE device DROP COLUMN gravity_formula",

        "ALTER TABLE batch ADD COLUMN tap_list BOOLEAN",
        "UPDATE batch SET tap_list = true WHERE tap_list IS NULL",

        "ALTER TABLE pour ADD COLUMN max_volume FLOAT",
        "UPDATE pour SET max_volume = 0 WHERE max_volume IS NULL",
        "ALTER TABLE pour ALTER COLUMN max_volume SET NOT NULL",

        "ALTER TABLE brewlogger ADD COLUMN volume_format VARCHAR(3)",

        "UPDATE brewlogger SET volume_format = 'L' WHERE volume_format IS NULL",

        "ALTER TABLE brewlogger ALTER COLUMN volume_format SET NOT NULL",

        "ALTER TABLE systemlog ALTER COLUMN message TYPE varchar(300)",

        "ALTER TABLE device ADD COLUMN collect_logs BOOLEAN",
        "UPDATE device SET collect_logs = false WHERE collect_logs IS NULL",
        "ALTER TABLE device ALTER COLUMN collect_logs SET NOT NULL",

        # Changes from v0.8 -> v0.9
        "ALTER TABLE pressure ADD COLUMN pressure1 FLOAT",
        "UPDATE pressure SET pressure1 = 0 WHERE pressure1 IS NULL",
        "ALTER TABLE pressure ALTER COLUMN pressure1 SET NOT NULL",

        "ALTER TABLE batch RENAME COLUMN chip_id TO chip_id_gravity",

        "ALTER TABLE batch ADD COLUMN chip_id_pressure VARCHAR(6)",
        "UPDATE batch SET chip_id_pressure = '' WHERE chip_id_pressure IS NULL",
        "ALTER TABLE batch ALTER COLUMN chip_id_pressure SET NOT NULL",
    ]

    with engine.connect() as con:
        for db_update in db_updates:
            try:
                print(f"Success running SQL {db_update}")
                con.execute(text(db_update))
                con.commit()
            except (OperationalError, ProgrammingError, InternalError) as e:
                con.rollback()
                print(f"Error {e}")

    print("Completed postgres migration.")


if __name__ == "__main__":
    print("Checking postgres database.")

    # Init database sessions
    db_url = get_settings().database_url

    if db_url.startswith("sqlite:"):
        print("This migration script will only work for Postgresx exiting...")
    else:
        engine = create_engine(db_url, pool_pre_ping=True)  # POSTGRES
        migrate_database()
