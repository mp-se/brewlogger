import logging
from datetime import datetime
from json.decoder import JSONDecodeError
from typing import List, Optional
from fastapi import Depends, Request, BackgroundTasks
from fastapi.routing import APIRouter
from starlette.exceptions import HTTPException
from api.db import models, schemas
from api.services import (
    PressureService,
    get_pressure_service,
    BatchService,
    get_batch_service,
    DeviceService,
    get_device_service,
)
from ..security import api_key_auth
from ..ws import notifyClients

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/pressure")


@router.get(
    "/", response_model=List[schemas.Pressure], dependencies=[Depends(api_key_auth)]
)
async def list_pressures(
    batchId: int = -1,
    pressure_service: PressureService = Depends(get_pressure_service),
) -> List[models.Pressure]:
    logger.info("Endpoint GET /api/pressure/?batchId=%d", batchId)
    if batchId != -1:
        return pressure_service.search_by_batchId(batchId)
    return pressure_service.list()


@router.get(
    "/latest",
    response_model=List[schemas.PressureLatest],
    dependencies=[Depends(api_key_auth)],
)
async def get_latest_pressures(
    limit: int = 10,
    pressure_service: PressureService = Depends(get_pressure_service),
) -> List[dict]:
    logger.info(f"Endpoint GET /api/pressure/latest?limit={limit}")
    return pressure_service.get_latest(limit)


@router.get(
    "/{pressure_id}",
    response_model=schemas.Pressure,
    responses={404: {"description": "Pressure not found"}},
    dependencies=[Depends(api_key_auth)],
)
async def get_pressure_by_id(
    pressure_id: int, pressure_service: PressureService = Depends(get_pressure_service)
) -> Optional[models.Pressure]:
    logger.info("Endpoint GET /api/pressure/%d", pressure_id)
    return pressure_service.get(pressure_id)


@router.post(
    "/",
    response_model=schemas.Pressure,
    status_code=201,
    responses={409: {"description": "Conflict Error"}},
    dependencies=[Depends(api_key_auth)],
)
async def create_pressure(
    pressure: schemas.PressureCreate,
    background_tasks: BackgroundTasks,
    pressure_service: PressureService = Depends(get_pressure_service),
) -> models.Pressure:
    logger.info("Endpoint POST /api/pressure/")
    if pressure.created is None:
        pressure.created = datetime.now()
        logger.info("Added timestamp to pressure record %s", pressure.created)
    pressure = pressure_service.create(pressure)
    background_tasks.add_task(notifyClients, "batch", "update", pressure.batch_id)
    return pressure


@router.post(
    "/list/",
    response_model=List[schemas.Pressure],
    status_code=201,
    responses={409: {"description": "Conflict Error"}},
    dependencies=[Depends(api_key_auth)],
)
async def create_pressure_list(
    pressure_list: List[schemas.PressureCreate],
    background_tasks: BackgroundTasks,
    pressure_service: PressureService = Depends(get_pressure_service),
) -> List[models.Pressure]:
    logger.info("Endpoint POST /api/pressure/list/")
    pressure_list = pressure_service.createList(pressure_list)
    background_tasks.add_task(
        notifyClients, "batch", "update", pressure_list[0].batch_id
    )
    return pressure_list


@router.patch(
    "/{pressure_id}",
    response_model=schemas.Pressure,
    dependencies=[Depends(api_key_auth)],
)
async def update_pressure_by_id(
    pressure_id: int,
    pressure: schemas.PressureUpdate,
    background_tasks: BackgroundTasks,
    pressure_service: PressureService = Depends(get_pressure_service),
) -> Optional[models.Pressure]:
    logger.info("Endpoint PATCH /api/pressure/%d", pressure_id)
    pressure = pressure_service.update(pressure_id, pressure)
    background_tasks.add_task(notifyClients, "batch", "update", pressure.batch_id)
    return pressure


@router.delete("/{pressure_id}", status_code=204, dependencies=[Depends(api_key_auth)])
async def delete_pressure_by_id(
    pressure_id: int,
    background_tasks: BackgroundTasks,
    pressure_service: PressureService = Depends(get_pressure_service),
):
    logger.info("Endpoint DELETE /api/pressure/%d", pressure_id)
    pressure = pressure_service.get(pressure_id)
    background_tasks.add_task(notifyClients, "batch", "update", pressure.batch_id)
    pressure_service.delete(pressure_id)


@router.post("/public", response_model=schemas.Pressure, status_code=200)
async def create_pressure_using_json(
    request: Request,
    background_tasks: BackgroundTasks,
    pressure_service: PressureService = Depends(get_pressure_service),
    batch_service: BatchService = Depends(get_batch_service),
    device_service: DeviceService = Depends(get_device_service),
) -> models.Pressure:
    logger.info("Endpoint POST /api/pressure/public")

    try:
        req_json = await request.json()

        logger.info(f"Payload: {req_json}")

        chipId = req_json["id"]

        # Check if there is an active batch
        batchList = batch_service.search_chipId_active(chipId, True)

        if len(batchList) == 0:
            batch = schemas.BatchCreate(
                name="Batch for " + chipId,
                chipIdGravity="",
                chipIdPressure=chipId,
                description="Automatically created",
                brewDate=datetime.today().strftime("%Y-%m-%d"),
                style="",
                brewer="",
                brewfatherId="",
                active=True,
                abv=0.0,
                ebc=0.0,
                ibu=0.0,
                fermentation_steps="",
                # fermentation_chamber=None, # This is optional and should be assigned in UI
                tapList=True,
            )
            batch = batch_service.create(batch)
            background_tasks.add_task(notifyClients, "batch", "create", batch.id)
            batchList = batch_service.search_chipId_active(chipId, True)

        if len(batchList) == 0:
            raise HTTPException(status_code=409, detail="No batch found")

        # Check if there is an device registered
        deviceList = device_service.search_chipId(chipId)

        if len(deviceList) == 0:
            device = schemas.DeviceCreate(
                chipId=chipId,
                chipFamily="",
                software="",
                mdns="",
                config="",
                bleColor="",
                url="",
                description="",
                collectLogs=False,
            )
            device = device_service.create(device)
            background_tasks.add_task(notifyClients, "device", "create", device.id)

        """ Example payload from pressuremon v0.4
        {
            "name": "aaaa",
            "id": "cb3818",
            "interval": 10,
            "temperature": 21.71,
            "temperature_unit": "C",
            "pressure": -0.0023,
            "pressure1": -0.0023,
            "pressure_unit": "PSI",
            "battery": 0.00,
            "rssi": -82,
            "run-time": 0
        }
        """

        # Extract optional fields, defaulting to None if not present or None
        temperature = req_json.get("temperature", None)
        pressure = req_json.get("pressure")  # pressure is required
        pressure1 = req_json.get("pressure1", None)
        battery = req_json.get("battery", None)
        run_time = req_json.get("run-time", None)

        # Handle temperature unit conversion
        if temperature is not None and "temperature-unit" in req_json and req_json["temperature-unit"].upper() == "F":
            temperature = float(
                "%.2f" % ((temperature - 32) * 5 / 9)
            )  # °C = (°F − 32) x 5/9

        # Handle pressure unit conversion
        if "pressure-unit" in req_json:
            if req_json["pressure-unit"].upper() == "BAR":
                pressure = float("%.4f" % (pressure * 1000))
            elif req_json["pressure-unit"].upper() == "PSI":
                pressure = float("%.4f" % (pressure * 6.89476))

        # Handle pressure1 unit conversion
        if pressure1 is not None and pressure1 != 0.0 and "pressure-unit" in req_json:
            if req_json["pressure-unit"].upper() == "BAR":
                pressure1 = float("%.4f" % (pressure1 * 1000))
            elif req_json["pressure-unit"].upper() == "PSI":
                pressure1 = float("%.4f" % (pressure1 * 6.89476))

        pressure_obj = schemas.PressureCreate(
            temperature=temperature,
            pressure=pressure,
            pressure1=pressure1,
            battery=battery,
            rssi=req_json["rssi"],
            run_time=run_time,
            batch_id=batchList[0].id,
            created=datetime.now(),
            active=True,
        )

        pressure = pressure_service.create(pressure_obj)
        background_tasks.add_task(notifyClients, "batch", "update", pressure.batch_id)
        return pressure

    except JSONDecodeError:
        raise HTTPException(status_code=422, detail="Unable to parse request")
