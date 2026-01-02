import pytest
from api.main import register_handlers
from fastapi import FastAPI
from fastapi.testclient import TestClient
from api.db.session import engine, create_session
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker


@pytest.fixture()
def app_client():
    app = FastAPI()
    register_handlers(app)
    yield TestClient(app)


@pytest.fixture()
def db_session():
    """Provide a fresh database session for unit tests."""
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = Session()
    yield session
    session.close()


def truncate_database():
    print("Truncate all tables")
    with engine.connect() as con:
        try:
            con.execute(text("DELETE FROM pressure"))
            con.commit()
        except Exception as e:
            con.rollback()
            print(e)

        try:
            con.execute(text("DELETE FROM gravity"))
            con.commit()
        except Exception as e:
            con.rollback()
            print(e)

        try:
            con.execute(text("DELETE FROM pour"))
            con.commit()
        except Exception as e:
            con.rollback()
            print(e)

        try:
            con.execute(text("DELETE FROM device"))
            con.commit()
        except Exception as e:
            con.rollback()
            print(e)

        try:
            con.execute(text("DELETE FROM batch"))
            con.commit()
        except Exception as e:
            con.rollback()
            print(e)

        try:
            con.execute(text("DELETE FROM fermentationstep"))
            con.commit()
        except Exception as e:
            con.rollback()
            print(e)

        try:
            con.execute(text("DELETE FROM systemlog"))
            con.commit()
        except Exception as e:
            con.rollback()
            print(e)
