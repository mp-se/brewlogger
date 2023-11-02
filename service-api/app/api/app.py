import logging
from api.routers import device as apiDevice
from api.routers import batch as apiBatch
from api.routers import pour as apiPour
from api.routers import gravity as apiGravity
from api.routers import pressure as apiPressure
from api.routers import setting as apiSetting
from api.html import device as htmlDevice
from api.html import batch as htmlBatch
from api.html import gravity as htmlGravity
from api.html import setting as htmlSetting
from api.html import test as htmlTest
from api.html import about as htmlAbout
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from .config import get_settings, get_template

logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    logger.info("Creating FastAPI application and registering routers.")
    settings = get_settings()

    app = FastAPI(
        title="BrewLogger API",
        description="Application for managing brews and brew devices.",
        version=settings.version,
    )

    @app.get("/health")
    async def health():
        return { "status": "ok" }

    @app.get("/", response_class=HTMLResponse)
    async def html_get_index(request: Request):
        return get_template().TemplateResponse("index.html", {"request": request, "settings": get_settings()})

    app.include_router(apiDevice.router)
    app.include_router(apiBatch.router)
    app.include_router(apiGravity.router)
    app.include_router(apiPressure.router)
    app.include_router(apiPour.router)
    app.include_router(apiSetting.router)

    app.include_router(htmlDevice.router)
    app.include_router(htmlBatch.router)
    app.include_router(htmlGravity.router)
    app.include_router(htmlSetting.router)
    app.include_router(htmlAbout.router)

    if settings.test_endpoints_enabled:
        logger.info("Mounting test endpoints, should be disabled for production")
        app.include_router(htmlTest.router)

    try:
        app.mount("/static", StaticFiles(directory="static"), name="static")
    except:
        logger.error("Unable to mount static directory.")

    return app
