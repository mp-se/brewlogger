# BrewLogger
# Copyright (c) 2021-2026 Magnus
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Alternatively, this software may be used under the terms of a
# commercial license. See LICENSE_COMMERCIAL for details.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
#

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
        try:
            con.execute(text("DELETE FROM receivelog"))
            con.commit()
        except Exception as e:
            con.rollback()
            print(e)