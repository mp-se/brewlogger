import logging
from api.routers import device as apiDevice
from api.routers import batch as apiBatch
from api.routers import pour as apiPour
from api.routers import gravity as apiGravity
from api.routers import pressure as apiPressure
from api.routers import setting as apiSetting
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import get_settings
from contextlib import asynccontextmanager
from .utils import load_settings

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan_handler(app: FastAPI):
    # Running on startup
    logger.info("Running startup handler")
    load_settings()
    yield
    # Running on closedown
    logger.info("Running shutdown handler")

def create_app() -> FastAPI:
    logger.info("Creating FastAPI application and registering routers.")
    settings = get_settings()

    app = FastAPI(
        title="BrewLogger API",
        description="Application for managing brews and brew devices.",
        version=settings.version,
        lifespan=lifespan_handler,
    )

    origins = [
        "http://localhost:8080",
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
        return { "status": "ok" }
    
    app.include_router(apiDevice.router)
    app.include_router(apiBatch.router)
    app.include_router(apiGravity.router)
    app.include_router(apiPressure.router)
    app.include_router(apiPour.router)
    app.include_router(apiSetting.router)

    return app
