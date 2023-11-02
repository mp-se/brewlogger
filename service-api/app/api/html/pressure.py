import logging
from fastapi import Depends, Request
from fastapi.responses import HTMLResponse
from fastapi.routing import APIRouter
from api.services import PressureService, get_pressure_service
from ..config import get_template, get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/html/pressure")

@router.get("/", response_class=HTMLResponse)
async def html_list_pressures(request: Request, pressures_service: PressureService = Depends(get_pressure_service)):
    logger.info("Endpoint GET /html/pressure/")
    pressure_list = pressures_service.list()
    return get_template().TemplateResponse("pressure_list.html", {"request": request, "pressure_list": pressure_list, "settings": get_settings() })
