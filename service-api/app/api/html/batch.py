import logging
from datetime import datetime, timedelta
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
    logger.info("Endpoint GET /html/batch/?chipId=%s", chipId)

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
    logger.info("Endpoint GET /html/batch/%d?func=%s", batch_id, func)

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
        logger.info(calc)

        calc["abv"] = (calc["og"] - calc["fg"]) * 131.25

        def sort_created(item):
            return item.created

        batch.gravity = sorted(batch.gravity, key=sort_created, reverse=True)
        batch.pressure = sorted(batch.pressure, key=sort_created, reverse=True)

        # Analyse the batch contents

        ts = [] 
        rt_ave = 0 

        for gravity in batch.gravity:
            ts.append( gravity.created )
            rt_ave += gravity.run_time

        ts_min = min(ts)
        ts_max = max(ts)
        ts_ave = (ts_max-ts_min)/(len(ts))
        rt_ave = rt_ave / len(ts)

        calc["aMinDate"] = ts_min
        calc["aMaxDate"] = ts_max
        calc["aAveTime"] = ts_ave
        calc["aAveRunTime"] = rt_ave

        calc["batt60s"] = timedelta(seconds=len(ts) * 60)
        calc["batt300s"] = timedelta(seconds=len(ts) * 300)
        calc["batt900s"] = timedelta(seconds=len(ts) * 900)
        calc["batt1800s"] = timedelta(seconds=len(ts) * 1800)
        calc["batt3600s"] = timedelta(seconds=len(ts) * 3600)

        logger.info(calc)

        # Create the html file
        return get_template().TemplateResponse("batch_graph.html", {"request": request, "batch": batch, "func": func, "calc": calc, "settings": get_settings() })

    devices = devices_service.list()
    return get_template().TemplateResponse("batch.html", {"request": request, "batch": batch, "func": func, "device_list": devices, "settings": get_settings() })
