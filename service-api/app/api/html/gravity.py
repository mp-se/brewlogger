import logging
from fastapi import Depends, Request
from fastapi.responses import HTMLResponse
from fastapi.routing import APIRouter
from api.services import GravityService, get_gravity_service
from ..config import get_template, get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/html/gravity")

@router.get("/", response_class=HTMLResponse)
async def html_list_gravities(
    request: Request, 
    batch_id: str = "*",
    gravities_service: GravityService = Depends(get_gravity_service)
):
    logger.info("Endpoint GET /html/gravity/")
    
    if batch_id == "*":
        gravity_list = gravities_service.list()
    else:
        gravity_list = gravities_service.search_by_batchId(int(batch_id))  
    
    return get_template().TemplateResponse("gravity_list.html", {"request": request, "gravity_list": gravity_list, "settings": get_settings() })
