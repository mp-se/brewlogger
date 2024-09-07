import logging
from api.routers import device as apiDevice
from api.routers import batch as apiBatch
from api.routers import pour as apiPour
from api.routers import gravity as apiGravity
from api.routers import pressure as apiPressure
from api.routers import setting as apiSetting
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from .config import get_settings
from .scheduler import scheduler_shutdown, scheduler_setup
from .utils import load_settings
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)

# TODO: Feature1: Add option to collect data from brewpi controller
# Collect data when gravity readings are received, a brewpi controller can be connected to one or more batches.

# TODO: Feature2:
#


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Running on startup
    logger.info("Running startup handler")
    load_settings()
    yield
    # Running on closedown
    logger.info("Running shutdown handler")
    scheduler_shutdown()


def register_handlers(app):
    origins = [
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:8081",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    app.include_router(apiDevice.router)
    app.include_router(apiBatch.router)
    app.include_router(apiGravity.router)
    app.include_router(apiPressure.router)
    app.include_router(apiPour.router)
    app.include_router(apiSetting.router)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ):
        exc_str = f"{exc}".replace("\n", " ").replace("   ", " ")
        logging.error(f"{request}: {exc_str}")
        content = {"status_code": 10422, "message": exc_str, "data": None}
        return JSONResponse(
            content=content, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
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
register_handlers(app)
scheduler_setup()
