import logging
import httpx
import json
from json import JSONDecodeError
from datetime import datetime
from api.db.session import create_session
from api.services import BrewLoggerService, DeviceService
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from .config import get_settings
from .cache import writeKey, findKey, readKey, deleteKey
from .mdns import scan_for_mdns

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

    devices = DeviceService(create_session()).search_software('Brewpi')
    timeout = httpx.Timeout(10.0, connect=10.0, read=10.0)
    headers = {
        "Content-Type": "application/json",
    }

    for device in devices:
        logger.info(f"Processing brewpi device {device.id}, {device.url}")
        url = device.url

        if url != "http://" and url != "https://" and url != "":
            if not url.endswith("/"):
                url += "/"

            url += "api/temps/"

            try:
                logger.info(f"Fetching temps from brewpi device {url}")
                async with httpx.AsyncClient(timeout=timeout) as client:
                    res = await client.get(url, headers=headers)

                    if res.status_code == 200:
                        json = res.json()
                        logger.info(f"JSON response received {json}")

                        key = "brewpi_" + str(device.id) + "_beer_temp"
                        writeKey(key, json["BeerTemp"], ttl=300)
                        key = "brewpi_" + str(device.id) + "_fridge_temp"
                        writeKey(key, json["FridgeTemp"], ttl=300)
                    else:
                        logger.error(
                            f"Got response {res.status_code} from Brewpi device at {url}"
                        )

            except JSONDecodeError:
                logger.error(f"Unable to parse JSON response {url}")
            except httpx.ReadTimeout:
                logger.error(f"Unable to connect to device {url}")
            except httpx.ConnectError:
                logger.error(f"Unable to read from device {url}")
            except httpx.ConnectTimeout:
                logger.error(f"Unable to connect to device {url}")
        else:
            logger.error(
                f"brewpi device {device['id']} has no defined url, unable to find temperatures."
            )


async def task_forward_gravity():
    logger.info(f"Task: task_forward_gravity is running at {datetime.now()}")

    settings = BrewLoggerService(create_session()).list()[0]

    if settings.gravity_forward_url == "":
        return # Nothing to do

    url = settings.gravity_forward_url
    keys = findKey("gravity_*")
    for k in keys:
        value = readKey(k).decode()

        try:
            value = json.loads(value)

            # If we are using brewfather it requires [SG] in the name if that is the gravity unit used.
            if settings.gravity_format == "SG" and value["name"].find("[SG]") == -1 and url.find(".brewfather.") >= 0:
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
            key = mdns["host"] + mdns['type']
            writeKey(key, json.dumps(mdns), ttl=900)
        except JSONDecodeError:
            logger.error(f"Unable to parse JSON response {mdns}")


def scheduler_setup(app):
    global app_client
    logger.info("Setting up scheduler")
    app_client = app

    if get_settings().scheduler_enabled:
        # Setting up task to fetch brewpi temperatures and store these in redis cache
        brewpi_trigger = CronTrigger(second=0)
        scheduler.add_job(func=task_fetch_brewpi_temps, trigger=brewpi_trigger, max_instances=1)

        # Setting up task to forward gravity data to remove endpoint from redis cache
        gravity_trigger = CronTrigger(second=30)
        scheduler.add_job(func=task_forward_gravity, trigger=gravity_trigger, max_instances=1)

        # Setting up task to scan for mdns data
        scheduler.add_job(task_scan_mdns, 'interval', minutes=1, max_instances=1)

        scheduler.start()
    else:
        logger.info("Scheduler disabled in configuration")

