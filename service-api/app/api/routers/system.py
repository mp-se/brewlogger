"""System management API endpoints for health checks, scheduling, and real-time notifications."""
import logging
import json
from json import JSONDecodeError
from datetime import datetime, timezone
from typing import List
import redis
from sqlalchemy.exc import SQLAlchemyError
from fastapi import Depends, WebSocket, WebSocketDisconnect, Query
from fastapi.routing import APIRouter
from api.db import models, schemas
from api.db.session import create_session
from api.services import BrewLoggerService, SystemLogService, get_systemlog_service
from ..cache import write_key, read_key, find_key
from ..scheduler import scheduler
from ..ws import ws_manager
from ..security import api_key_auth
from ..config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/system")


@router.get("/self_test/", response_model=schemas.SelfTestResult)
async def self_test() -> schemas.SelfTestResult:
    """Perform system self-test checking database, redis, and scheduler connectivity.
    
    Returns:
        SelfTestResult containing status of all system components
    """
    logger.info("Endpoint GET /api/system/self_test/")

    # Check for database connectivity
    database_connection = False
    try:
        logger.info("Checking database connection")
        cfg = BrewLoggerService(create_session()).list()
        if len(cfg) > 0:
            database_connection = True
    except (SQLAlchemyError, OSError) as e:
        logger.info("Failed to connect with database %s", e)

    # Check for redis connectivity
    redis_connection = False
    try:
        logger.info("Checking redis connection")
        write_key("self_test", "testing", 60)
        if read_key("self_test").decode() == "testing":
            redis_connection = True
    except (redis.ConnectionError, AttributeError) as e:
        logger.info("Failed to connect with redis cache %s", e)

    # Check scheduler
    jobs = scheduler.get_jobs()
    background_jobs = []
    for job in jobs:
        background_jobs.append(job.name)

    keys = find_key("log_*")
    log = []
    for key in keys:
        value = read_key(key)
        log.append({"name": key, "value": value.decode() if value else None})

    keys = find_key("ble_*")
    ble = []
    for key in keys:
        value = read_key(key)
        ble.append({"name": key, "value": value.decode() if value else None})

    return schemas.SelfTestResult(
        databaseConnection=database_connection,
        redisConnection=redis_connection,
        backgroundJobs=background_jobs,
        log=log,
        ble=ble,
    )


@router.get("/scheduler/", response_model=List[schemas.Job])
async def scheduler_status() -> List[schemas.Job]:
    """Get status of all scheduled background jobs with next run times.
    
    Returns:
        List of scheduled jobs with their names and next run times
    """
    logger.info("Endpoint GET /api/system/scheduler/")

    jobs = scheduler.get_jobs()
    today = datetime.now(timezone.utc)
    background_jobs = []
    for job in jobs:
        background_jobs.append(
            schemas.Job(
                name=job.name,
                nextRunIn=int((job.next_run_time - today).total_seconds()),
            )
        )

    return background_jobs


@router.get(
    "/log/",
    response_model=List[schemas.SystemLog],
    dependencies=[Depends(api_key_auth)],
)
async def system_log(
    limit: int = 100,
    systemlog_service: SystemLogService = Depends(get_systemlog_service),
):
    """Retrieve system logs with optional limit parameter."""
    logger.info("Endpoint GET /api/system/log/")
    return systemlog_service.list(limit)


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
    """Create a new system log entry."""
    logger.info("Endpoint POST /api/system/log/")
    record = systemlog_service.create(log)
    return record


@router.websocket("/notify")
async def websocket_endpoint(websocket: WebSocket) -> None:
    """WebSocket endpoint for real-time notifications of data changes.
    
    Requires API key authentication via query parameter:
    ws://host/api/system/notify?apiKey=YOUR_API_KEY
    
    Args:
        websocket: The WebSocket connection
    """
    # Extract and validate API key from query parameters
    api_key = websocket.query_params.get("apiKey")

    if not api_key:
        logger.warning("WebSocket connection attempted without API key")
        await websocket.close(code=1008, reason="Missing API key")
        return

    # Validate API key matches configured key
    settings = get_settings()
    if api_key != settings.api_key:
        logger.warning("WebSocket connection attempted with invalid API key: %s...", api_key[:10])
        await websocket.close(code=1008, reason="Invalid API key")
        return

    logger.info("WebSocket client connected with valid authentication")
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
        logger.info("Client disconnected")
    except RuntimeError as e:
        logger.error("WebSocket error: %s", e)
        ws_manager.disconnect(websocket)


@router.post("/mdns", status_code=201, dependencies=[Depends(api_key_auth)])
async def add_mdns_to_cache(mdns: schemas.Mdns) -> None:
    """Cache mDNS service information."""
    logger.info("Endpoint POST /api/system/mdns")

    try:
        logger.info("Caching mdns for %s", mdns.name)
        key = mdns.host + mdns.type
        write_key(
            key,
            json.dumps({"type": mdns.type, "host": mdns.host, "name": mdns.name}),
            ttl=900,
        )
    except JSONDecodeError:
        logger.error("Unable to parse JSON response %s", mdns)

    return None


@router.get(
    "/receive_logs",
    response_model=schemas.ReceiveLogPaginatedResponse,
    dependencies=[Depends(api_key_auth)],
)
async def get_receive_logs(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=500, description="Number of records to return"),
) -> schemas.ReceiveLogPaginatedResponse:
    """Retrieve receive logs with pagination support."""
    logger.info("Endpoint GET /api/system/receive_logs/ (skip=%d, limit=%d)", skip, limit)

    try:
        session = create_session()
        total = session.query(models.ReceiveLog).count()
        records = session.query(models.ReceiveLog).order_by(
            models.ReceiveLog.created.desc()
        ).offset(skip).limit(limit).all()

        return schemas.ReceiveLogPaginatedResponse(
            total=total,
            skip=skip,
            limit=limit,
            data=records
        )
    except SQLAlchemyError as e:
        logger.error("Database error retrieving receive logs: %s", e)
        return schemas.ReceiveLogPaginatedResponse(
            total=0,
            skip=skip,
            limit=limit,
            data=[]
        )
