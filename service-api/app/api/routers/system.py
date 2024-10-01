import logging
import asyncio
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.routing import APIRouter
from api.db import schemas
from api.db.session import create_session
from api.services import BrewLoggerService
from api.db import schemas
from ..cache import writeKey, readKey
from ..scheduler import scheduler
from ..utils import migrate_database
from ..ws import ws_manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/system")

@router.get(
    "/self_test/", response_model=schemas.SelfTestResult
)
async def run_self_test():
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

    return schemas.SelfTestResult(databaseConnection=database_connection, redisConnection=redis_connection, backgroundJobs=background_jobs)

@router.get(
    "/db_migration/"
)
async def run_db_migration():
    logger.info("Endpoint GET /api/system/db_migration/")
    migrate_database()


@router.websocket("/notify")
async def websocket_endpoint(websocket: WebSocket):
   await ws_manager.connect(websocket)
   try:
        while True:
            await websocket.receive_text()
   except WebSocketDisconnect:
       ws_manager.disconnect(websocket)
       logger.info(f"Client disconnected")
    