import logging
from datetime import datetime, timezone
from typing import List
from fastapi import Depends, WebSocket, WebSocketDisconnect
from fastapi.routing import APIRouter
from api.db import models, schemas
from api.db.session import create_session
from api.services import BrewLoggerService, SystemLogService, get_systemlog_service
from ..cache import writeKey, readKey
from ..scheduler import scheduler
from ..ws import ws_manager
from ..security import api_key_auth

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/system")


@router.get("/self_test/", response_model=schemas.SelfTestResult)
async def self_test():
    logger.info("Endpoint GET /api/system/self_test/")

    # Check for database connectivity
    database_connection = False
    try:
        logger.info("Checking database connection")
        cfg = BrewLoggerService(create_session()).list()
        if len(cfg) > 0:
            database_connection = True
    except Exception as e:
        logger.info(f"Failed to connect with database {e}")

    # Check for redis connectivity
    redis_connection = False
    try:
        logger.info("Checking redis connection")
        writeKey("self_test", "testing", 60)
        if readKey("self_test").decode() == "testing":
            redis_connection = True
    except Exception as e:
        logger.info(f"Failed to connect with redis cache {e}")

    # Check scheduler
    jobs = scheduler.get_jobs()
    background_jobs = list()
    for job in jobs:
        background_jobs.append(job.name)

    return schemas.SelfTestResult(
        databaseConnection=database_connection,
        redisConnection=redis_connection,
        backgroundJobs=background_jobs,
    )


@router.get("/scheduler/", response_model=List[schemas.Job])
async def scheduler_status():
    logger.info("Endpoint GET /api/system/scheduler/")

    jobs = scheduler.get_jobs()
    today = datetime.now(timezone.utc)
    background_jobs = list()
    for job in jobs:
        background_jobs.append(
            schemas.Job(
                name=job.name,
                nextRunIn=int((job.next_run_time - today).total_seconds()),
            )
        )

    return background_jobs


@router.get("/log/", response_model=List[schemas.SystemLog], dependencies=[Depends(api_key_auth)])
async def system_log(
    systemlog_service: SystemLogService = Depends(get_systemlog_service),
):
    logger.info("Endpoint GET /api/system/log/")
    return systemlog_service.list()


@router.post(
    "/log/",
    response_model=schemas.SystemLog,
    status_code=201,
    responses={409: {"description": "Conflict Error"}},
    dependencies=[Depends(api_key_auth)],
)
async def create_device(
    log: schemas.SystemLogCreate,
    systemlog_service: SystemLogService = Depends(get_systemlog_service),
) -> models.SystemLog:
    logger.info("Endpoint POST /api/system/log/")
    record = systemlog_service.create(log)
    return record


@router.websocket("/notify")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
        logger.info("Client disconnected")
