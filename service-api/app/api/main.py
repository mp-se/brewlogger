"""FastAPI application factory and configuration for BrewLogger API server."""
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from api.routers import batch as apiBatch
from api.routers import brewfather as apiBrewfather
from api.routers import device as apiDevice
from api.routers import dispatch as apiDispatch
from api.routers import gravity as apiGravity
from api.routers import pour as apiPour
from api.routers import pressure as apiPressure
from api.routers import setting as apiSetting
from api.routers import system as apiSystem

from .cache import write_key
from .config import get_settings
from .log import system_log
from .scheduler import scheduler_setup, scheduler_shutdown
from .utils import load_settings

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Manage application startup and shutdown lifecycle events."""
    # Running on startup
    logger.info("Running startup handler")
    load_settings()
    scheduler_setup(application)
    write_key("brewlogger", get_settings().version, ttl=None)
    system_log("main", "System started", 0)
    yield
    # Running on closedown
    logger.info("Running shutdown handler")
    scheduler_shutdown()


def register_handlers(application: FastAPI):
    """Register CORS and exception handlers for the FastAPI application."""
    origins = [
        "*",
        # "http://localhost:5173",
        # "http://localhost:8080",
        # "http://localhost:8081",
    ]

    application.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @application.get("/health")
    async def health():
        return {"status": "ok"}

    application.include_router(apiDevice.router)
    application.include_router(apiBatch.router)
    application.include_router(apiGravity.router)
    application.include_router(apiPressure.router)
    application.include_router(apiPour.router)
    application.include_router(apiSetting.router)
    application.include_router(apiSystem.router)
    application.include_router(apiBrewfather.router)
    application.include_router(apiDispatch.router)

    @application.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ):
        exc_str = f"{exc}".replace("\n", " ").replace("   ", " ")
        logger.error("%s: %s", request, exc_str)
        content = {"status_code": 10422, "message": exc_str, "data": None}
        return JSONResponse(
            content=content, status_code=status.HTTP_422_UNPROCESSABLE_CONTENT
        )


logger.info("Creating FastAPI application and registering routers.")
settings = get_settings()
app = FastAPI(
    debug=True,
    title="BrewLogger API",
    description="Application for managing brews and brew devices.",
    version=settings.version,
    lifespan=lifespan,
)

# Use absolute path for log directory
log_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "log")
if os.path.exists(log_dir):
    app.mount("/logs", StaticFiles(directory=log_dir), name="logs")

# Register handlers at module level (middleware and routes must be added before app starts)
register_handlers(app)
