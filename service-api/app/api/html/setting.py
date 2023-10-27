import logging
from fastapi import Depends, Request
from fastapi.routing import APIRouter
from fastapi.responses import HTMLResponse
from api.services import DeviceService, get_device_service, BatchService, get_batch_service, GravityService, get_gravity_service
from ..config import get_template, get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/html/setting")

@router.get("/", response_class=HTMLResponse)
async def html_get_setting(request: Request, gravities_service: GravityService = Depends(get_gravity_service), 
    batches_service: BatchService = Depends(get_batch_service), devices_service: DeviceService = Depends(get_device_service)
):
    records = len(batches_service.list()) + len(devices_service.list()) + len(gravities_service.list())
    return get_template().TemplateResponse("setting.html", {"request": request, "records": records, "testendpoints": get_settings().test_endpoints_enabled, "apikey": get_settings().api_key})
