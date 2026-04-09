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

"""Service layer providing business logic and database operations for API endpoints."""
from fastapi import Depends
from sqlalchemy.orm import Session

from api.db.session import get_session

from .device import DeviceService
from .batch import BatchService
from .gravity import GravityService
from .pressure import PressureService
from .brewlogger import BrewLoggerService
from .pour import PourService
from .fermentationstep import FermentationStepService
from .systemlog import SystemLogService


def get_device_service(db_session: Session = Depends(get_session)) -> DeviceService:
    """Provide DeviceService dependency for endpoints."""
    return DeviceService(db_session)


def get_batch_service(db_session: Session = Depends(get_session)) -> BatchService:
    """Provide BatchService dependency for endpoints."""
    return BatchService(db_session)


def get_gravity_service(db_session: Session = Depends(get_session)) -> GravityService:
    """Provide GravityService dependency for endpoints."""
    return GravityService(db_session)


def get_pressure_service(db_session: Session = Depends(get_session)) -> PressureService:
    """Provide PressureService dependency for endpoints."""
    return PressureService(db_session)


def get_pour_service(db_session: Session = Depends(get_session)) -> PourService:
    """Provide PourService dependency for endpoints."""
    return PourService(db_session)


def get_fermentationstep_service(
    db_session: Session = Depends(get_session),
) -> FermentationStepService:
    """Provide FermentationStepService dependency for endpoints."""
    return FermentationStepService(db_session)


def get_brewlogger_service(
    db_session: Session = Depends(get_session),
) -> BrewLoggerService:
    """Provide BrewLoggerService dependency for endpoints."""
    return BrewLoggerService(db_session)


def get_systemlog_service(
    db_session: Session = Depends(get_session),
) -> SystemLogService:
    """Provide SystemLogService dependency for endpoints."""
    return SystemLogService(db_session)


__all__ = (
    "get_device_service",
    "get_batch_service",
    "get_gravity_service",
    "get_pressure_service",
    "get_pour_service",
    "get_brewlogger_service",
    "get_fermentationstep_service",
    "get_systemlog_service",
)
