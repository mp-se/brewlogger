"""Device management API endpoints for registering, configuring, and monitoring brewery devices."""
import json
import logging
import os
from json import JSONDecodeError
from typing import Any, List, Optional

import httpx
from fastapi import Depends, BackgroundTasks
from fastapi.responses import Response
from fastapi.routing import APIRouter
from starlette.exceptions import HTTPException

from api.db import models, schemas
from api.services import (
    DeviceService,
    get_device_service,
    FermentationStepService,
    get_fermentationstep_service,
)

from ..cache import find_key, read_key
from ..security import api_key_auth
from ..ws import notify_clients

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/device")


@router.get(
    "/", response_model=List[schemas.Device], dependencies=[Depends(api_key_auth)]
)
async def list_devices(
    software: str = "*",
    devices_service: DeviceService = Depends(get_device_service),
) -> List[models.Device]:
    """List all devices, optionally filtered by software type."""
    logger.info("Endpoint GET /api/device/?software=%s", software)
    if software != "*":
        return devices_service.search_software(software=software)
    return devices_service.list()


@router.get(
    "/{device_id}",
    response_model=schemas.Device,
    responses={404: {"description": "Device not found"}},
    dependencies=[Depends(api_key_auth)],
)
async def get_device_by_id(
    device_id: int, devices_service: DeviceService = Depends(get_device_service)
) -> Optional[models.Device]:
    """Retrieve a specific device by ID."""
    logger.info("Endpoint GET /api/device/%d", device_id)
    return devices_service.get(device_id)


@router.get(
    "/logs/",
    dependencies=[Depends(api_key_auth)],
)
async def get_device_logs() -> List[str]:
    """Retrieve list of device log files."""
    logger.info("Endpoint GET /api/device/logs/")
    files = [f for f in os.listdir(path="log") if os.path.isfile("log/" + f)]
    return files


@router.delete(
    "/logs/{chip_id}",
    dependencies=[Depends(api_key_auth)],
)
async def delete_device_log_for_chip_id(chip_id: str) -> None:
    """Delete device log file for a specific chip ID."""
    logger.info("Endpoint DEL /api/device/logs/%s", chip_id)
    try:
        os.remove("log/" + chip_id + ".log")
    except FileNotFoundError:
        pass
    try:
        os.remove("log/" + chip_id + ".log.1")
    except FileNotFoundError:
        pass


@router.post(
    "/",
    response_model=schemas.Device,
    status_code=201,
    responses={409: {"description": "Conflict Error"}},
    dependencies=[Depends(api_key_auth)],
)
async def create_device(
    device: schemas.DeviceCreate,
    background_tasks: BackgroundTasks,
    devices_service: DeviceService = Depends(get_device_service),
) -> models.Device:
    """Create a new device."""
    logger.info("Endpoint POST /api/device/")
    if device.chip_id != "000000":
        device_list = devices_service.search_chip_id(device.chip_id)
        if len(device_list) > 0:
            raise HTTPException(
                status_code=409,
                detail=f"Device with chip_id '{device.chip_id}' already exists"
            )
    logger.info("Creating device: %s", device)
    device = devices_service.create(device)
    background_tasks.add_task(notify_clients, "device", "create", device.id)
    return device


@router.patch(
    "/{device_id}", response_model=schemas.Device, dependencies=[Depends(api_key_auth)]
)
async def update_device_by_id(
    device_id: int,
    device: schemas.DeviceUpdate,
    background_tasks: BackgroundTasks,
    devices_service: DeviceService = Depends(get_device_service),
) -> Optional[models.Device]:
    """Update a specific device by ID."""
    logger.info("Endpoint PATCH /api/device/%d", device_id)
    background_tasks.add_task(notify_clients, "device", "update", device_id)
    return devices_service.update(device_id, device)


@router.delete("/{device_id}", status_code=204, dependencies=[Depends(api_key_auth)])
async def delete_device_by_id(
    device_id: int,
    background_tasks: BackgroundTasks,
    devices_service: DeviceService = Depends(get_device_service),
):
    """Delete a specific device by ID."""
    logger.info("Endpoint DELETE /api/device/%d", device_id)
    device = devices_service.get(device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    devices_service.delete(device_id)
    background_tasks.add_task(notify_clients, "device", "delete", device_id)


@router.post("/proxy_fetch/", status_code=200, dependencies=[Depends(api_key_auth)])
async def fetch_data_from_device(proxy_req: schemas.ProxyRequest) -> Any:
    """Fetch data from a device via proxy request.
    
    Args:
        proxy_req: Proxy request containing URL, method, body, and headers
    
    Returns:
        JSON object if response is JSON, otherwise string of response text
    """
    logger.info("Endpoint POST /api/device/proxy_fetch: %s %s", proxy_req.method, proxy_req.url)

    try:
        timeout = httpx.Timeout(10.0, connect=10.0, read=10.0)

        headers = {}

        if proxy_req.header != "":
            s = proxy_req.header.split(":")
            headers = {s[0]: s[1].strip(" ")}
            logger.info("Header provided %s", headers)

        async with httpx.AsyncClient(timeout=timeout) as client:
            if proxy_req.method.lower() == "post":
                logger.info("Request using post %s", proxy_req.url)
                res = await client.post(
                    proxy_req.url, data=proxy_req.body, headers=headers
                )
            elif proxy_req.method.lower() == "put":
                logger.info("Request using put %s", proxy_req.url)
                res = await client.put(
                    proxy_req.url, data=proxy_req.body, headers=headers
                )
            elif proxy_req.method.lower() == "delete":
                logger.info("Request using delete %s", proxy_req.url)
                res = await client.delete(proxy_req.url, headers=headers)
            else:
                logger.info("Request using get %s", proxy_req.url)
                res = await client.get(proxy_req.url, headers=headers)

            logger.info("Response received %s", res)

            if res.status_code != 200:
                raise HTTPException(
                    status_code=res.status_code, detail="Response from endpoint."
                )

            # if the data is not pure Json, return it as text
            try:
                response_data = res.json()
            except ValueError:
                response_data = res.text
            logger.info("Payload from external service: %s", response_data)
            return response_data
    except JSONDecodeError as exc:
        logger.error("Unable to parse JSON response")
        raise HTTPException(
            status_code=400, detail="Unable to parse JSON from remote endpoint."
        ) from exc
    except httpx.ReadTimeout as exc:
        logger.error("Unable to connect to device")
        raise HTTPException(
            status_code=400,
            detail="Unable to connect to remote endpoint (ConnectError).",
        ) from exc
    except httpx.ConnectError as exc:
        logger.error("Unable to read from device")
        raise HTTPException(
            status_code=400,
            detail="Unable to connect to remote endpoint (ReadTimeout).",
        ) from exc
    except httpx.ConnectTimeout as exc:
        logger.error("Unable to connect to device")
        raise HTTPException(
            status_code=400,
            detail="Unable to connect to remote endpoint (ConnectTimeout).",
        ) from exc
    # except:
    #    logger.error("Unknown error occured when trying to fetch data from remote")


@router.get("/mdns/", status_code=200, dependencies=[Depends(api_key_auth)])
async def scan_for_mdns_devices() -> list[schemas.Mdns]:
    """Scan for mDNS devices on the network.
    
    Returns:
        List of discovered mDNS devices on the local network
    """
    logger.info("Endpoint GET /api/device/mdns/")

    mdns = []

    keys = find_key("*.local.")
    for k in keys:
        value = read_key(k).decode()
        logger.info("Found {key} = {value}")
        mdns.append(json.loads(value))

    return Response(content=json.dumps(mdns), media_type="application/json")


@router.post(
    "/{device_id}/step",
    response_model=List[schemas.FermentationStep],
    status_code=201,
    responses={409: {"description": "Conflict Error"}},
    dependencies=[Depends(api_key_auth)],
)
async def create_fermentation_step(
    device_id: int,
    fermentation_step_list: List[schemas.FermentationStepCreate],
    fermentation_step_service: FermentationStepService = Depends(
        get_fermentationstep_service
    ),
) -> List[models.FermentationStep]:
    """Create fermentation steps for a device."""
    logger.info("Endpoint POST /api/device/%s/step", device_id)

    step_list = fermentation_step_service.search_by_device_id(device_id)
    if len(step_list) > 0:
        raise HTTPException(status_code=409, detail="Conflict Error")

    return fermentation_step_service.create_list(fermentation_step_list)


@router.delete(
    "/{device_id}/step", status_code=204, dependencies=[Depends(api_key_auth)]
)
async def delete_fermentation_step_by_device_id(
    device_id: int,
    fermentation_step_service: FermentationStepService = Depends(
        get_fermentationstep_service
    ),
):
    """Delete fermentation steps for a device."""
    logger.info("Endpoint DELETE /api/fermentation_step/%s", device_id)
    fermentation_step_service.delete_by_device_id(device_id)
