import logging
from fastapi import Depends, Request
from fastapi.routing import APIRouter
from fastapi.responses import HTMLResponse
from api.services import DeviceService, get_device_service, BatchService, get_batch_service, GravityService, get_gravity_service, PressureService, get_pressure_service
from ..config import get_template, get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/html/about")

@router.get("/", response_class=HTMLResponse)
async def html_get_about(request: Request, gravities_service: GravityService = Depends(get_gravity_service), 
batches_service: BatchService = Depends(get_batch_service), devices_service: DeviceService = Depends(get_device_service), pressures_service: PressureService = Depends(get_pressure_service)):
    data = { "apikey": False, "testendpoints": False, "database": "Postgres" }
    setting = get_settings()
    
    if setting.api_key_enabled:
        data["apikey"] = True

    if setting.test_endpoints_enabled:
        data["testendpoints"] = True

    if setting.database_url.startswith("sqlite:"):
        data["database"] = "SQLite"

    data["batch_count"] = len(batches_service.list())
    data["device_count"] = len(devices_service.list())
    data["gravity_count"] = len(gravities_service.list())
    data["pressure_count"] = len(pressures_service.list())

    data["version"] = get_settings().version

    return get_template().TemplateResponse("about.html", {"request": request, "config": data, "settings": get_settings()})
