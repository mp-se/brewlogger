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
"""Pytest configuration and shared fixtures."""


import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import sessionmaker
from api.db.session import engine
from api.main import register_handlers


@pytest.fixture()
def app_client():
    """App client."""
    app = FastAPI()
    register_handlers(app)
    yield TestClient(app)


@pytest.fixture()
def db_session():
    """Provide a fresh database session for unit tests."""
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)  # pylint: disable=invalid-name,too-many-statements
    session = Session()
    yield session
    session.close()


def truncate_database():  # pylint: disable=too-many-statements
    """Truncate database."""
    print("Truncate all tables")
    with engine.connect() as con:
        try:
            con.execute(text("DELETE FROM pressure"))
            con.commit()
        except SQLAlchemyError as e:
            con.rollback()
            print(e)

        try:
            con.execute(text("DELETE FROM gravity"))
            con.commit()
        except SQLAlchemyError as e:
            con.rollback()
            print(e)

        try:
            con.execute(text("DELETE FROM pour"))
            con.commit()
        except SQLAlchemyError as e:
            con.rollback()
            print(e)

        try:
            con.execute(text("DELETE FROM device"))
            con.commit()
        except SQLAlchemyError as e:
            con.rollback()
            print(e)

        try:
            con.execute(text("DELETE FROM batch"))
            con.commit()
        except SQLAlchemyError as e:
            con.rollback()
            print(e)

        try:
            con.execute(text("DELETE FROM fermentationstep"))
            con.commit()
        except SQLAlchemyError as e:
            con.rollback()
            print(e)

        try:
            con.execute(text("DELETE FROM systemlog"))
            con.commit()
        except SQLAlchemyError as e:
            con.rollback()
            print(e)
        try:
            con.execute(text("DELETE FROM receivelog"))
            con.commit()
        except SQLAlchemyError as e:
            con.rollback()
            print(e)
