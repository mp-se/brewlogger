import logging
from fastapi import Depends, Request
from fastapi.routing import APIRouter
from fastapi.responses import HTMLResponse
from api.db import models
from api.services import DeviceService, get_device_service
from ..config import get_template, get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/html/device")

@router.get("/", response_class=HTMLResponse)
async def html_list_devices(
    request: Request, 
    devices_service: DeviceService = Depends(get_device_service)
):
    logger.info("Endpoint GET /html/device/")
    device_list = devices_service.list()
    return get_template().TemplateResponse("device_list.html", {"request": request, "device_list": device_list, "settings": get_settings() })

@router.get(
    "/{device_id}", response_class=HTMLResponse)
async def html_get_device_by_id(
    device_id: int,
    request: Request,
    func: str = "edit",
    devices_service: DeviceService = Depends(get_device_service)
):
    # Accepable func parameters are: edit, view, create
    logger.info("Endpoint GET /html/device/%d?func=%s", device_id, func)

    if func != "create":
        device = devices_service.get(device_id)
    else :
        device = models.Device()
        device.chip_family = ""
        device.config = ""
        device.chip_id = ""
        device.mdns = ""
        device.software = ""
        device.url = ""
        device.ble_color = ""

    logger.info(device)
    return get_template().TemplateResponse("device.html", {"request": request, "device": device, "func": func, "settings": get_settings() })
