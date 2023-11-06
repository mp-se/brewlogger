import logging
from fastapi import Depends, Request
from fastapi.routing import APIRouter
from fastapi.responses import HTMLResponse
from sqlalchemy.exc import OperationalError
from api.db.session import engine
from sqlalchemy import text
from ..security import api_key_auth
from ..config import get_template, get_settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/html/test")

@router.patch(
    "/migrate",
    status_code=200,
    dependencies=[Depends(api_key_auth)])
async def check_and_migrate_database():
    logger.info("Endpoint PATCH /html/test/migrate")

    logger.info("Running sql commands to migrate database from v0.2 to v.3")
    with engine.connect() as con:
        try:
            con.execute(text('ALTER TABLE gravity DROP COLUMN name;'))
            con.execute(text('ALTER TABLE gravity DROP COLUMN chip_id;'))
            con.execute(text('ALTER TABLE gravity DROP COLUMN interval;'))
            con.execute(text('ALTER TABLE gravity DROP COLUMN token;'))
            con.execute(text('ALTER TABLE gravity DROP COLUMN temp_units;'))
            con.execute(text('ALTER TABLE gravity DROP COLUMN gravity_units;'))
            con.commit()
        except OperationalError:
            logger.error("Failed to update database.")

@router.delete(
    "/cleardb",
    status_code=204,
    dependencies=[Depends(api_key_auth)])
async def delete_all_records_from_databas():
    logger.info("Endpoint DELETE /html/test/cleardb")

    with engine.connect() as con:
        con.execute(text('DELETE FROM gravity'))
        con.execute(text('DELETE FROM pour'))
        con.execute(text('DELETE FROM device'))
        con.execute(text('DELETE FROM batch'))
        con.execute(text('DELETE FROM pressure'))
        con.commit()

@router.get(
    "/get",
    status_code=200)
async def return_json_payload_using_get():
    logger.info("Endpoint DELETE /html/test/get")

    return { "test": "test", "test2": "test2" }

@router.post(
    "/post",
    status_code=200)
async def test_return_json_payload_using_post():
    logger.info("Endpoint POST /html/test/post")

    return { "test": "test", "test2": "test2" }

@router.get("/unit/", response_class=HTMLResponse)
async def html_unit_tests(request: Request):
    logger.info("Endpoint GET /html/test/unit/")
    return get_template().TemplateResponse("unit_test.html", {"request": request, "apikey": get_settings().api_key })

# @router.get("/scripts/", response_class=HTMLResponse)
# async def html_scripts(request: Request):
#     logger.info("Endpoint GET /html/test/scripts/")
#     return get_template().TemplateResponse("script_test.html", {"request": request, "apikey": get_settings().api_key })
