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

"""Utility functions for database initialization and settings loading."""
import logging
import json
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from fastapi import Request

from api.db import schemas, models
from api.db.session import engine, create_session
from api.services.brewlogger import BrewLoggerService
from .config import get_settings

logger = logging.getLogger(__name__)


def get_client_ip(request: Request) -> str:
    """Extract real client IP address from request.
    
    Checks X-Real-IP header first (set by Nginx for direct clients),
    then X-Forwarded-For header (set by proxies), before falling back
    to direct client IP.

    Args:
        request: FastAPI Request object

    Returns:
        Client IP address as string, or "unknown" if unable to determine
    """
    # Check X-Real-IP header first (set by Nginx for the connecting client)
    if "x-real-ip" in request.headers:
        real_ip = request.headers["x-real-ip"].strip()
        if real_ip:
            return real_ip

    # Check X-Forwarded-For header (comma-separated list, take first)
    if "x-forwarded-for" in request.headers:
        forwarded_for = request.headers["x-forwarded-for"]
        # Take the first IP if there are multiple
        client_ip = forwarded_for.split(",")[0].strip()
        if client_ip:
            return client_ip

    # Fall back to direct client connection
    if request.client:
        return request.client.host

    return "unknown"


def log_public_request(ip_address: str, payload: dict) -> None:
    """Store incoming public endpoint request to the receivelog table.
    
    Args:
        ip_address: IP address of the client making the request
        payload: Dictionary containing the request payload
    """
    try:
        session = create_session()
        receive_log = models.ReceiveLog(
            ip_address=ip_address,
            payload=json.dumps(payload),
            timestamp=datetime.now()
        )
        session.add(receive_log)
        session.commit()
        session.close()
    except ValueError as e:
        logger.error("Failed to log request to database: %s", e)


def load_settings():
    """Load application settings and verify database migrations."""
    logger.info("Loading settings and checking migration")

    with engine.connect() as con:
        try:
            con.execute(text("SELECT * FROM device"))
            con.commit()
            logger.info("Database connected.")
        except (SQLAlchemyError, OSError) as e:
            logger.error("Failed to connect to database, %s", e)
            con.rollback()

        brewlogger_service = BrewLoggerService(create_session())
        try:
            settings_list = brewlogger_service.list()

            if len(settings_list) == 0:
                logger.info("Missing configuration data, creating default settings")

                cfg = schemas.BrewLoggerCreate(
                    version=get_settings().version,
                    temperature_format="C",
                    pressure_format="PSI",
                    gravity_format="SG",
                    volume_format="L",
                    dark_mode=False,
                    gravityForwardUrl="",
                )
                brewlogger_service.create(cfg)
        except SQLAlchemyError as e:
            logger.error("Failed to query database, %s", e)
