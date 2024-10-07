import logging
import httpx
import json
from json import JSONDecodeError
from datetime import datetime
from api.db.session import create_session
from api.services import BrewLoggerService, DeviceService
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from .config import get_settings
from .cache import writeKey, findKey, readKey, deleteKey
from .mdns import scan_for_mdns
from .fermentationcontrol import fermentation_controller_run
from .brewpi import brewpi_temps

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()
headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}


def scheduler_shutdown():
    logger.info("Shutting down scheduler")
    scheduler.shutdown()


async def task_fetch_brewpi_temps():
    logger.info(f"Task: fetch_brewpi_temps is running at {datetime.now()}")

    devices = DeviceService(create_session()).search_software("Brewpi")
    for device in devices:
        logger.info(f"Processing brewpi device {device.id}, {device.url}")
        url = device.url

        res = await brewpi_temps(url)
        if res is not None:
            key = "brewpi_" + str(device.id) + "_beer_temp"
            writeKey(key, res["BeerTemp"], ttl=300)
            key = "brewpi_" + str(device.id) + "_fridge_temp"
            writeKey(key, res["FridgeTemp"], ttl=300)


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
            logger.error(f"Unable to connect to device {url}")
        except httpx.ConnectError:
            logger.error(f"Unable to read from device {url}")
        except httpx.ConnectTimeout:
            logger.error(f"Unable to connect to device {url}")
        except Exception as e:
            logger.error(f"Unknown exception {e}")


async def task_scan_mdns():
    logger.info(f"Task: task_scan_mdns is running at {datetime.now()}")

    mdns_list = await scan_for_mdns(20)

    for mdns in mdns_list:
        try:
            key = mdns["host"] + mdns["type"]
            writeKey(key, json.dumps(mdns), ttl=900)
        except JSONDecodeError:
            logger.error(f"Unable to parse JSON response {mdns}")


async def task_fermentation_control():
    logger.info(f"Task: task_fermentation_control is running at {datetime.now()}")
    await fermentation_controller_run(datetime.now())


def scheduler_setup(app):
    global app_client
    logger.info("Setting up scheduler")
    app_client = app

    if get_settings().scheduler_enabled:
        # Setting up task to fetch brewpi temperatures and store these in redis cache
        scheduler.add_job(
            task_fetch_brewpi_temps, "interval", minutes=2, max_instances=1
        )

        # Setting up task to forward gravity data to remove endpoint from redis cache
        scheduler.add_job(task_forward_gravity, "interval", minutes=5, max_instances=1)

        # Setting up task to scan for mdns data
        scheduler.add_job(task_scan_mdns, "interval", minutes=1, max_instances=1)

        # Setting up task to run fermentation control
        scheduler.add_job(
            task_fermentation_control, "interval", seconds=30, max_instances=1
        )

        scheduler.start()
    else:
        logger.warning("Scheduler disabled in configuration")
