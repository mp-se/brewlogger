#
# Collect logs from all devices with a valid URL registered in the Brewlogger database
#
# Requires the following environment variables
#
#   API_URL: Name of base URL (eg. http://localhost:8000)
#   API_KEY: API Key for server
#
# Options:
#
#   --chipid <chipid> Collect from device with this ID
#   --software <software> Collect from all devices with this software
#
# Data will be stored in the current director with filename <chipid>.log
#
import threading
import asyncio
import logging
from time import time
import requests
import redis
import os
from websockets.sync.client import connect
from websockets.exceptions import WebSocketException

logger = logging.getLogger(__name__)

# Write the following keys to redis to share the current status
# log_<chipid>_start : <connect time>
# log_<chipid>_last  : <update time>
# log_<chipid>_count : <number of lines read>
# log_<chipid>_size  : <number of bytes read>

endpoint = ""
headers = {}
threads = dict()
maxFileSize = 100000
pool = None

def writeKey(key, value):
    if pool is None:
        return True

    ttl = 60*60*6 # 6 hours

    logger.info(f"Writing key {key} = {value} ttl:{ttl}.")
    try:
        r = redis.Redis(connection_pool=pool)
        r.set(name=key, value=str(value), ex=ttl)
        return True
    except redis.exceptions.ConnectionError as e:
        logger.error(f"Failed to connect with redis {e}.")
    return False

class ThreadWrapper:
    def __init__(self):
        self.thread = None
        self.event = threading.Event()

    def is_stopped(self):
        return self.event.is_set()

    def is_alive(self):
        return self.thread.is_alive()

    def stop(self):
        self.event.set()


def websocket_collector(url, chipId):
    uri = url.replace("http://", "ws://") + "serialws"
    logger.info(f"Collecing logs from {uri} and saving to {chipId}")
    fileName = "log/" + chipId + ".log"

    try:
        with connect(uri) as websocket:
            logger.info(f"Connected to {uri} listening for logs...")
            writeKey(f"log_{chipId}_start", int(time()))

            line = ""
            lineCnt = 0
            byteCnt = 0

            while True:
                line += websocket.recv()
                if line.endswith("\n") or len(line) > 200:
                    # logger.info(f"Received log line from {uri}: {line.strip()}")
                    f = open(fileName, "a")
                    f.write(line)
                    lineCnt += 1
                    byteCnt += len(line)
                    line = ""
                    f.close()
                    writeKey(f"log_{chipId}_last", int(time()))
                    writeKey(f"log_{chipId}_count", lineCnt)
                    writeKey(f"log_{chipId}_size", byteCnt)

                    if os.stat(fileName).st_size > maxFileSize:
                        logger.info(
                            f"Logile is to large (>{maxFileSize}), rotating {fileName} to {fileName}.1"
                        )
                        try:
                            os.remove(fileName + ".1")
                        except Exception:
                            pass
                        os.rename(fileName, fileName + ".1")

                # Check if we should to a graceful exit
                tw = threads.get(chipId, None)
                if tw is not None and tw.is_stopped():
                    break

    except WebSocketException as e:
        logger.error(f"Websocket exception in log collection {e}")
    except Exception as e:
        logger.error(f"Unknown exception in log collection {e}")

    logger.info(f"Stopping log collection for {uri}")


async def main():
    global pool

    redis_host = os.getenv("REDIS_HOST")

    if redis_host is None:
        logger.warning("No REDIS_HOST env variable, not sharing status...")
    else:
        logger.info(f"Using redis {redis_host}")
        pool = redis.ConnectionPool(host=redis_host, port=6379, db=0)

    while True:
        devices = []

        try:
            logger.info(f"Fetching device list from brewlogger API {endpoint}.")
            r = requests.get(endpoint, headers=headers)
            if r.ok:
                for d in r.json():
                    devices.append(d)
        except Exception as e:
            logger.error(f"Failed to request device list, Error: {e}")

        for d in devices:
            tw = threads.get(d["chipId"], None)
            # logger.info(f"{d['chipId']}, {d['collectLogs']}, {tw}")

            try:
                if tw is None:  # Create a new task for the device
                    if d["collectLogs"]:
                        if len(d["url"]) > 0:
                            logger.info(
                                f"Found device with activated log collection {d['chipId']}, {d['url']} {d['collectLogs']}"
                            )
                            tw = ThreadWrapper()
                            tw.thread = threading.Thread(
                                target=websocket_collector, args=[d["url"], d["chipId"]]
                            )
                            tw.thread.daemon = True  # Set the thread as a daemon
                            tw.thread.start()
                            threads[d["chipId"]] = tw
                        else:
                            logger.warning(
                                f"Device has logging enabled but is missing an url {d['chipId']}"
                            )
                else:
                    if d["collectLogs"] is False:  # Task exist, but lets stop it
                        if not threads[d["chipId"]].is_stopped():
                            logger.info(f"Stopping thread for {d['chipId']}")
                            threads[d["chipId"]].stop()
                        elif not tw.is_alive():
                            logger.info(f"Removing thread for {d['chipId']}")
                            threads.pop(d["chipId"])

                    else:  # Already exists, check if its still running
                        logger.info(
                            f"Checking if thread is alive {d['chipId']} {tw.is_alive()}"
                        )
                        if tw.is_alive() is False:
                            logger.warning(f"Task has exited for device {d['chipId']}")
                            threads.pop(d["chipId"])

            except Exception as e:
                logger.error(f"Failed to create task {e}")
        await asyncio.sleep(5)


if __name__ == "__main__":    
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)-15s %(name)-8s %(levelname)s: %(message)s",
    )

    apiHost = os.getenv("API_HOST")
    apiKey = os.getenv("API_KEY")
    i = os.getenv("MAX_FILE_SIZE")

    if i is not None:
        maxFileSize = int(i)

    if apiHost is None or apiKey is None:
        logging.error(
            "Environment variables APAPI_HOSTI_URL and API_KEY needs to be set"
        )
        exit(-1)

    endpoint = "http://" + apiHost + "/api/device/"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey,
    }

    logger.info(f"Starting log collector, max file size is {maxFileSize/1000} kb")
    asyncio.run(main())
    logger.info("Exiting...")

# EOF
