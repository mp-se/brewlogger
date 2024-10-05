from fastapi import Depends
from sqlalchemy.orm import Session

from api.db.session import get_session

from .device import DeviceService
from .batch import BatchService
from .gravity import GravityService
from .pressure import PressureService
from .brewlogger import BrewLoggerService
from .pour import PourService
from .fermentation_step import FermentationStepService

def get_device_service(db_session: Session = Depends(get_session)) -> DeviceService:
    return DeviceService(db_session)


def get_batch_service(db_session: Session = Depends(get_session)) -> BatchService:
    return BatchService(db_session)


def get_gravity_service(db_session: Session = Depends(get_session)) -> GravityService:
    return GravityService(db_session)


def get_pressure_service(db_session: Session = Depends(get_session)) -> PressureService:
    return PressureService(db_session)

def get_pour_service(db_session: Session = Depends(get_session)) -> PourService:
    return PourService(db_session)

def get_fermentation_step_service(db_session: Session = Depends(get_session)) -> FermentationStepService:
    return FermentationStepService(db_session)

def get_brewlogger_service(
    db_session: Session = Depends(get_session),
) -> BrewLoggerService:
    return BrewLoggerService(db_session)


__all__ = (
    "get_device_service",
    "get_batch_service",
    "get_gravity_service",
    "get_pressure_service",
    "get_pour_service",
    "get_brewlogger_service",
)
