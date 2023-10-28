import logging
from functools import lru_cache
from typing import List, Optional
from fastapi import Depends
from fastapi.routing import APIRouter
from api.db import models, schemas
from ..security import api_key_auth, get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/setting")

def get_current_appsetting() -> schemas.AppSetting:
    setting = schemas.AppSetting()
    setting.test_endpoints_enabled = get_settings().test_endpoints_enabled
    setting.api_key_enabled = get_settings().api_key_enabled
    setting.version = get_settings().version
    setting.javascript_debug_enabled = get_settings().javascript_debug_enabled
    logger.info("App settings=%s", setting)
    return setting

@router.get(
    "/",
    response_model=schemas.AppSetting,
    dependencies=[Depends(api_key_auth)])
async def get_appsetting():
    return get_current_appsetting()

@router.patch(
    "/",
    response_model=schemas.AppSetting,
    dependencies=[Depends(api_key_auth)])
async def update_batch_by_id(
    setting: schemas.AppSetting,
):
    logger.info("Javascript debugging set to %s", get_settings().javascript_debug_enabled)
    get_settings().javascript_debug_enabled = setting.javascript_debug_enabled
    return get_current_appsetting()

