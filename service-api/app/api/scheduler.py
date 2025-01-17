import logging
import httpx
import json
from datetime import datetime
from api.db.session import create_session
from api.services import BrewLoggerService, DeviceService
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from .config import get_settings
from .cache import writeKey, findKey, readKey, deleteKey
from .fermentationcontrol import fermentation_controller_run
from .chamberctrl import chamberctrl_temps
from .log import system_log_scheduler, system_log_purge

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()
headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}


def scheduler_shutdown():
    logger.info("Shutting down scheduler")
    scheduler.shutdown()


async def task_fetch_chamberctrl_temps():
    logger.info(f"Task: fetch_chamberctrl_temps is running at {datetime.now()}")

    devices = DeviceService(create_session()).search_software("Chamber-Controller")
    for device in devices:
        logger.info(f"Processing chamber controller device {device.id}, {device.url}")
        url = device.url

        if url != "":
            res = await chamberctrl_temps(url)
            if res is not None:
                logger.info(f'Chamber controller temps, beer={res["pid_beer_temp"]}, chamber={res["pid_fridge_temp"]}')
                key = "chamber_" + str(device.id) + "_beer_temp"
                writeKey(key, res["pid_beer_temp"], ttl=300)
                key = "chamber_" + str(device.id) + "_fridge_temp"
                writeKey(key, res["pid_fridge_temp"], ttl=300)


async def task_forward_gravity():
    logger.info(f"Task: task_forward_gravity is running at {datetime.now()}")

    settings = BrewLoggerService(create_session()).list()[0]

    if settings.gravity_forward_url == "":
        return  # Nothing to do

    url = settings.gravity_forward_url
    keys = findKey("gravity_*")
    for k in keys:
        value = readKey(k).decode()

        try:
            value = json.loads(value)

            # If we are using brewfather it requires [SG] in the name if that is the gravity unit used.
            if (
                settings.gravity_format == "SG"
                and value["name"].find("[SG]") == -1
                and url.find(".brewfather.") >= 0
            ):
                value["name"] = value["name"] + "[SG]"

            logger.info(f"Task: Processing {k} with value {value} forwarding to {url}")

            timeout = httpx.Timeout(10.0, connect=10.0, read=10.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                logger.info("Request using get %s", url)
                res = await client.post(url, headers=headers, data=json.dumps(value))
                logger.info(f"Reqeust to {url} returned code {res.status_code}")
                deleteKey(k)

        except httpx.ReadTimeout:
            system_log_scheduler(f"Failed to forward gravity to {url}, ReadTimeout", 0)
            logger.error(f"Unable to connect to device {url}")
        except httpx.ConnectError:
            system_log_scheduler(f"Failed to forward gravity to {url}, ConnectError", 0)
            logger.error(f"Unable to read from device {url}")
        except httpx.ConnectTimeout:
            system_log_scheduler(
                f"Failed to forward gravity to {url}, ConnectTimeout", 0
            )
            logger.error(f"Unable to connect to device {url}")
        except Exception as e:
            system_log_scheduler(
                f"Failed to forward gravity to {url}, Uknown error {e}", 0
            )
            logger.error(f"Unknown exception {e}")


async def task_fermentation_control():
    logger.info(f"Task: task_fermentation_control is running at {datetime.now()}")
    await fermentation_controller_run(datetime.now())


async def task_check_database():
    logger.info(f"Task: task_check_database is running at {datetime.now()}")
    system_log_purge()


def scheduler_setup(app):
    global app_client
    logger.info("Setting up scheduler")
    app_client = app

    if get_settings().scheduler_enabled:
        # Setting up task to fetch chamber controller temperatures and store these in redis cache
        scheduler.add_job(
            task_fetch_chamberctrl_temps, "interval", minutes=5, max_instances=1
        )

        # Setting up task to forward gravity data to remove endpoint from redis cache
        scheduler.add_job(task_forward_gravity, "interval", minutes=15, max_instances=1)

        # Setting up task to scan for mdns data
        scheduler.add_job(task_check_database, "interval", hours=6, max_instances=1)

        # Setting up task to run fermentation control
        scheduler.add_job(
            task_fermentation_control, "interval", minutes=5, max_instances=1
        )
    else:
        logger.warning("Scheduler disabled in configuration")

    scheduler.start()
