import logging
from typing import List, Optional
from fastapi import Depends
from fastapi.routing import APIRouter
from api.services import BrewLoggerService, get_brewlogger_service
from api.db import models, schemas
from ..security import api_key_auth, get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/config")

# TODO: Update to use the config object instead of BrewLogger, map to/from ConfigBase

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
        list[0].test_endpoints_enabled = get_settings().test_endpoints_enabled
        list[0].api_key_enabled = get_settings().api_key_enabled
        list[0].javascript_debug_enabled = get_settings().javascript_debug_enabled
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
    bl.test_endpoints_enabled = get_settings().test_endpoints_enabled
    bl.api_key_enabled = get_settings().api_key_enabled
    bl.javascript_debug_enabled = get_settings().javascript_debug_enabled
    return bl