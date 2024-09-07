import pytest
from api.app import register_handlers
from fastapi import FastAPI
from fastapi.testclient import TestClient
from api.db.session import engine
from sqlalchemy import text


@pytest.fixture()
def app_client():
    app = FastAPI()
    register_handlers(app)
    yield TestClient(app)


def truncate_database():
    print("Truncate all tables")
    with engine.connect() as con:
        try:
            con.execute(text("DELETE FROM pressure"))
            con.commit()
        except Exception as e:
            print(e)

        try:
            con.execute(text("DELETE FROM gravity"))
            con.commit()
        except Exception as e:
            print(e)

        try:
            con.execute(text("DELETE FROM pour"))
            con.commit()
        except Exception as e:
            print(e)

        try:
            con.execute(text("DELETE FROM device"))
            con.commit()
        except Exception as e:
            print(e)

        try:
            con.execute(text("DELETE FROM batch"))
            con.commit()
        except Exception as e:
            print(e)
