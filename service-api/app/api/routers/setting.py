import logging
from fastapi import Depends
from fastapi.routing import APIRouter
from api.services import BrewLoggerService, get_brewlogger_service
from api.db import schemas
from ..security import api_key_auth, get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/config")

@router.get(
    "/",
    response_model=schemas.BrewLogger,
    dependencies=[Depends(api_key_auth)])
async def get_configuration(
    brewlogger_service: BrewLoggerService = Depends(get_brewlogger_service)
):
    logger.info("Endpoint GET /api/config/")
    list = brewlogger_service.list()

    # The following settings are defined during bootstrap and values in db are ignored
    if len(list) > 0:
        list[0].api_key_enabled = get_settings().api_key_enabled
        return list[0]

    return None

@router.patch(
    "/{id}",
    response_model=schemas.BrewLogger,
    dependencies=[Depends(api_key_auth)])
async def update_configuration(
    id: int,
    brewLogger: schemas.BrewLoggerUpdate,
    brewlogger_service: BrewLoggerService = Depends(get_brewlogger_service),
):
    logger.info("Endpoint PATCH /api/config/%d", id)
    brewLogger.version = get_settings().version
    bl = brewlogger_service.update(id, brewLogger)
    bl.api_key_enabled = get_settings().api_key_enabled
    return bl