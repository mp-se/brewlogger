from sqlalchemy import text
from sqlalchemy.exc import OperationalError, ProgrammingError, InternalError
from pydantic_settings import BaseSettings
from starlette.config import Config
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

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


def dump_metadata():
    if get_settings().database_url.startswith("sqlite:"):
        print("Running on sqlite so we skip trying to dump metadata")
        return

    with engine.connect() as con:
        try:
            print("Dumping database schema for brewlogger.")

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
            con.rollback()


if __name__ == '__main__':
    print("Dumping postgres database structure v0.7.")

    # Init database sessions
    db_url = get_settings().database_url

    if db_url.startswith("sqlite:"):
        print("This migration script will only work for Postgres.")
    else:
        print("Creating database engine for Postgres.")
        engine = create_engine(db_url, pool_pre_ping=True)  # POSTGRES

        dump_metadata()
