"""Pressure sensor API endpoints for managing fermentation pressure readings and device data."""
import logging
from datetime import datetime
from json.decoder import JSONDecodeError
from typing import List, Optional, Union
from fastapi import Depends, Request, BackgroundTasks, Query
from fastapi.routing import APIRouter
from fastapi.responses import Response
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
from ..ws import notify_clients
from ..utils import log_public_request, get_client_ip
from ..log import system_log, LogLevel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/pressure")


@router.get(
    "/", response_model=List[schemas.Pressure], dependencies=[Depends(api_key_auth)]
)
async def list_pressures(
    batch_id: Optional[int] = Query(None, alias="batchId"),
    pressure_service: PressureService = Depends(get_pressure_service),
) -> List[models.Pressure]:
    """List pressure readings, optionally filtered by batch ID."""
    logger.info("Endpoint GET /api/pressure/?batch_id=%d", batch_id or -1)
    if batch_id is not None:
        return pressure_service.search_by_batch_id(batch_id)
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
    """Get the most recent pressure readings with limit."""
    logger.info("Endpoint GET /api/pressure/latest?limit=%s", limit)
    return pressure_service.get_latest(limit)


@router.post("/public", response_model=schemas.Pressure, status_code=200)
async def create_pressure_using_json(  # pylint: disable=too-many-locals,duplicate-code
    request: Request,
    background_tasks: BackgroundTasks,
    pressure_service: PressureService = Depends(get_pressure_service),
    batch_service: BatchService = Depends(get_batch_service),
    device_service: DeviceService = Depends(get_device_service),
) -> models.Pressure:
    """Create a pressure reading from JSON format data."""
    logger.info("Endpoint POST /api/pressure/public")

    try:
        req_json = await request.json()

        # Get client IP address and log the request
        client_host = get_client_ip(request)
        background_tasks.add_task(log_public_request, client_host, req_json)

        logger.info("Payload: %s", req_json)

        chip_id = req_json["id"]

        # Check if there is an active batch
        batch_list = batch_service.search_chip_id_active(chip_id, True)

        if len(batch_list) == 0:
            batch = schemas.BatchCreate(
                name="Batch for " + chip_id,
                chipIdGravity="",
                chipIdPressure=chip_id,
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
            system_log("pressure", f"Batch auto-created from public endpoint: {batch.name}", error_code=0, log_level=LogLevel.INFO)
            background_tasks.add_task(notify_clients, "batch", "create", batch.id)
            batch_list = batch_service.search_chip_id_active(chip_id, True)

        if len(batch_list) == 0:
            system_log("pressure", f"No batch found for device {req_json['ID']}", error_code=409, log_level=LogLevel.WARNING)
            raise HTTPException(status_code=409, detail="No batch found")

        # Check if there is an device registered
        device_list = device_service.search_chip_id(chip_id)

        if len(device_list) == 0:
            device = schemas.DeviceCreate(
                chipId=chip_id,
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
            system_log("pressure", f"Device auto-created from public endpoint: {device.chip_id}", error_code=0, log_level=LogLevel.INFO)
            background_tasks.add_task(notify_clients, "device", "create", device.id)

        # Example payload from pressuremon v0.4
        # {
        #     "name": "aaaa",
        #     "id": "cb3818",
        #     "interval": 10,
        #     "temperature": 21.71,
        #     "temperature_unit": "C",
        #     "pressure": -0.0023,
        #     "pressure1": -0.0023,
        #     "pressure_unit": "PSI",
        #     "battery": 0.00,
        #     "rssi": -82,
        #     "run-time": 0
        # }

        # Extract optional fields, defaulting to None if not present or None
        temperature = req_json.get("temperature", None)
        pressure = req_json.get("pressure")  # pressure is required
        pressure1 = req_json.get("pressure1", None)
        battery = req_json.get("battery", None)
        run_time = req_json.get("run-time", None)

        # Handle temperature unit conversion
        has_temp_unit = "temperature-unit" in req_json
        is_fahrenheit = has_temp_unit and req_json["temperature-unit"].upper() == "F"
        if temperature is not None and is_fahrenheit:
            temperature = float(
                f"{(temperature - 32) * 5 / 9:.2f}"
            )  # °C = (°F − 32) x 5/9

        # Handle pressure unit conversion
        if "pressure-unit" in req_json:
            if req_json["pressure-unit"].upper() == "BAR":
                pressure = float(f"{pressure * 1000:.4f}")
            elif req_json["pressure-unit"].upper() == "PSI":
                pressure = float(f"{pressure * 6.89476:.4f}")

        # Handle pressure1 unit conversion
        if pressure1 is not None and pressure1 != 0.0 and "pressure-unit" in req_json:
            if req_json["pressure-unit"].upper() == "BAR":
                pressure1 = float(f"{pressure1 * 1000:.4f}")
            elif req_json["pressure-unit"].upper() == "PSI":
                pressure1 = float(f"{pressure1 * 6.89476:.4f}")

        pressure_obj = schemas.PressureCreate(
            temperature=temperature,
            pressure=pressure,
            pressure1=pressure1,
            battery=battery,
            rssi=req_json["rssi"],
            run_time=run_time,
            batch_id=batch_list[0].id,
            created=datetime.now(),
            active=True,
        )

        pressure = pressure_service.create(pressure_obj)
        background_tasks.add_task(notify_clients, "batch", "update", pressure.batch_id)
        return Response(content="", status_code=200)

    except JSONDecodeError as exc:
        system_log("pressure", "Failed to parse pressure data: JSONDecodeError", error_code=0, log_level=LogLevel.ERROR)
        raise HTTPException(status_code=422, detail="Unable to parse request") from exc


@router.get(
    "/{pressure_id}",
    response_model=schemas.Pressure,
    responses={404: {"description": "Pressure not found"}},
    dependencies=[Depends(api_key_auth)],
)
async def get_pressure_by_id(
    pressure_id: int, pressure_service: PressureService = Depends(get_pressure_service)
) -> Optional[models.Pressure]:
    """Retrieve a specific pressure reading by ID."""
    logger.info("Endpoint GET /api/pressure/%d", pressure_id)
    pressure = pressure_service.get(pressure_id)
    if pressure is None:
        raise HTTPException(status_code=404, detail="Pressure not found")
    return pressure


@router.post(
    "/",
    response_model=Union[schemas.Pressure, List[schemas.Pressure]],
    status_code=201,
    responses={409: {"description": "Conflict Error"}},
    dependencies=[Depends(api_key_auth)],
)
async def create_pressure(
    pressure: Union[schemas.PressureCreate, List[schemas.PressureCreate]],
    background_tasks: BackgroundTasks,
    pressure_service: PressureService = Depends(get_pressure_service),
) -> Union[models.Pressure, List[models.Pressure]]:
    """Create one or multiple pressure readings in a single request."""
    logger.info("Endpoint POST /api/pressure/")

    # Handle single pressure reading
    if isinstance(pressure, schemas.PressureCreate):
        if pressure.created is None:
            pressure.created = datetime.now()
            logger.info("Added timestamp to pressure record %s", pressure.created)
        result = pressure_service.create(pressure)
        background_tasks.add_task(notify_clients, "batch", "update", result.batch_id)
        return result

    # Handle multiple pressure readings
    for p in pressure:
        if p.created is None:
            p.created = datetime.now()
    result = pressure_service.create_list(pressure)
    background_tasks.add_task(notify_clients, "batch", "update", result[0].batch_id)
    return result


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
    """Update a specific pressure reading by ID."""
    logger.info("Endpoint PATCH /api/pressure/%d", pressure_id)
    pressure = pressure_service.update(pressure_id, pressure)
    if pressure is None:
        raise HTTPException(status_code=404, detail="Pressure not found")
    background_tasks.add_task(notify_clients, "batch", "update", pressure.batch_id)
    return pressure


@router.delete("/{pressure_id}", status_code=204, dependencies=[Depends(api_key_auth)])
async def delete_pressure_by_id(
    pressure_id: int,
    background_tasks: BackgroundTasks,
    pressure_service: PressureService = Depends(get_pressure_service),
):
    """Delete a specific pressure reading by ID."""
    logger.info("Endpoint DELETE /api/pressure/%d", pressure_id)
    pressure = pressure_service.get(pressure_id)
    if not pressure:
        raise HTTPException(status_code=404, detail="Pressure not found")
    background_tasks.add_task(notify_clients, "batch", "update", pressure.batch_id)
    pressure_service.delete(pressure_id)
