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

"""Database session management and configuration."""
import logging
import sqlite3
from datetime import datetime
from functools import lru_cache
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

from api.config import get_settings
from . import models

logger = logging.getLogger(__name__)

db_url = get_settings().database_url

if db_url.startswith("sqlite:"):
    logger.info("Creating database engine for SQLite.")

    def adapt_datetime(dt):
        """Convert Python datetime to ISO8601 string for SQLite."""
        return dt.isoformat() if isinstance(dt, datetime) else dt

    sqlite3.register_adapter(datetime, adapt_datetime)

    engine = create_engine(db_url, connect_args={"check_same_thread": False})
else:
    logger.info("Creating database engine for Postgres.")
    engine = create_engine(db_url, pool_pre_ping=True)

models.Base.metadata.create_all(bind=engine)


@lru_cache
def create_session() -> scoped_session:
    """Create session."""
    logger.info("Creating database session.")
    Session = scoped_session(  # pylint: disable=invalid-name
        sessionmaker(autocommit=False, autoflush=False, bind=engine)
    )
    return Session


def get_session() -> Generator[scoped_session, None, None]:
    """Get session."""
    Session = create_session()  # pylint: disable=invalid-name
    try:
        yield Session
    finally:
        Session.remove()
