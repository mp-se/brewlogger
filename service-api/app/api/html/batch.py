import logging
from datetime import datetime
from fastapi import Depends, Request
from fastapi.routing import APIRouter
from fastapi.responses import HTMLResponse
from api.db import models
from api.services import BatchService, get_batch_service, DeviceService, get_device_service
from ..config import get_template, get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/html/batch")

@router.get("/", response_class=HTMLResponse)
async def html_list_batches(
    request: Request, 
    chipId: str = "*",
    batches_service: BatchService = Depends(get_batch_service)
):
    if chipId == "*":
        batch_list = batches_service.list()
    else:
        batch_list = batches_service.search_chipId(chipId)

    return get_template().TemplateResponse("batch_list.html", {"request": request, "batch_list": batch_list, "settings": get_settings() })

@router.get(
    "/{batch_id}", response_class=HTMLResponse)
async def html_get_batch_by_id(
    batch_id: int,
    request: Request, 
    func: str = "edit",
    batches_service: BatchService = Depends(get_batch_service),
    devices_service: DeviceService = Depends(get_device_service)
):
    # Accepable func parameters are: edit, view, create, graph

    if func != "create":
        batch = batches_service.get(batch_id)
    else:
        batch = models.Batch()
        batch.name = ""
        batch.chip_id = ""
        batch.brewer = ""
        batch.brew_date = ""
        batch.description = ""
        batch.style = ""
        batch.active = True
        batch.ebc = 0.0
        batch.abv = 0.0
        batch.ibu = 0.0
        batch.brewfather_id = ""
    
    if func == "graph":
        dateMin = datetime.now()
        dateMax = datetime.fromtimestamp(0)
        calc = { "fg": 2.0, "og": 0.0, "abv": 0.0, "records": len(batch.gravity) }

        # calculate the abv based on min / max values (gravity recordings)
        for gravity in batch.gravity:
            if gravity.gravity < calc["fg"]:
                calc["fg"] = gravity.gravity
            if gravity.gravity > calc["og"]:
                calc["og"] = gravity.gravity

            if gravity.created < dateMin:
                dateMin = gravity.created
            if gravity.created > dateMax:
                dateMax = gravity.created

        calc["dateMin"] = dateMin.strftime('%Y-%m-%d')
        calc["dateMax"] = dateMax.strftime('%Y-%m-%d')
        calc["dateDelta"] = (dateMax - dateMin).days + 1
        logging.info(calc)

        calc["abv"] = (calc["og"] - calc["fg"]) * 131.25
        return get_template().TemplateResponse("batch_graph.html", {"request": request, "batch": batch, "func": func, "calc": calc, "settings": get_settings() })

    devices = devices_service.list()
    return get_template().TemplateResponse("batch.html", {"request": request, "batch": batch, "func": func, "device_list": devices, "settings": get_settings() })
