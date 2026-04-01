"""Configuration settings API endpoints for managing application settings."""
import logging
from fastapi import Depends, BackgroundTasks
from fastapi.routing import APIRouter
from starlette.exceptions import HTTPException
from api.services import BrewLoggerService, get_brewlogger_service
from api.db import schemas
from ..security import api_key_auth, get_settings
from ..log import system_log, LogLevel
from ..ws import notify_clients

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/config")


@router.get(
    "/", response_model=schemas.BrewLogger, dependencies=[Depends(api_key_auth)]
)
async def get_configuration(
    brewlogger_service: BrewLoggerService = Depends(get_brewlogger_service),
):
    """Retrieve application configuration settings."""
    logger.info("Endpoint GET /api/config/")
    settings_list = brewlogger_service.list()

    # The following settings are defined during bootstrap and values in db are ignored
    if len(settings_list) > 0:
        settings_list[0].api_key_enabled = get_settings().api_key_enabled
        return settings_list[0]

    return None


@router.patch(
    "/{item_id}", response_model=schemas.BrewLogger, dependencies=[Depends(api_key_auth)]
)
async def update_configuration(
    item_id: int,
    brew_logger: schemas.BrewLoggerUpdate,
    background_tasks: BackgroundTasks,
    brewlogger_service: BrewLoggerService = Depends(get_brewlogger_service),
):
    """Update application configuration settings."""
    logger.info("Endpoint PATCH /api/config/%d", item_id)
    brew_logger.version = get_settings().version
    bl = brewlogger_service.update(item_id, brew_logger)
    if bl is None:
        raise HTTPException(status_code=404, detail="Configuration not found")
    background_tasks.add_task(notify_clients, "config", "update", item_id)
    bl.api_key_enabled = get_settings().api_key_enabled
    message = f"Configuration updated: gravity_forward_url={bool(bl.gravity_forward_url)}"
    system_log("config", message, error_code=0, log_level=LogLevel.INFO)
    return bl
