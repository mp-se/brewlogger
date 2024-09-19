import logging
from fastapi.routing import APIRouter
from api.db import schemas
from api.db.session import create_session
from ..cache import writeKey, readKey
from api.services import BrewLoggerService
from api.db import schemas
from ..scheduler import scheduler

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

    return schemas.SelfTestResult(database_connection=database_connection, redis_connection=redis_connection, background_jobs=background_jobs)

