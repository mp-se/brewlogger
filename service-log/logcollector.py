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
import requests
import time
import os
from websockets.sync.client import connect
from websockets.exceptions import WebSocketException

logger = logging.getLogger(__name__)
threadLogger = logging.getLogger('thead')

endpoint = ""
headers = {}
threads = dict()

MAX_FILE_SIZE = 10000

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
    threadLogger.info(f"Collecing logs from {url} and saving to {chipId}")
    uri = url.replace("http://", "ws://") + "serialws"
    fileName = 'log/' + chipId + ".log"

    # time.sleep(200)

    try:
        with connect(uri) as websocket:
            line = ""

            while True:
                line += websocket.recv()            
                if line.endswith("\n") or len(line) > 200:
                    f = open(fileName, "a")
                    f.write(f"< {line}")
                    line = ""
                    f.close()

                    if os.stat(fileName).st_size > MAX_FILE_SIZE:
                        threadLogger.info(f"Logile is to large (>{MAX_FILE_SIZE}), rotating {fileName} to {fileName}.1")
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
        threadLogger.error(f"Websocket exception in log collection {e}")
    except Exception as e:
        threadLogger.error(f"Unknown exception in log collection {e}")
        
    threadLogger.info(f"Stopping log collection for {url}")
 

async def main():
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
            tw = threads.get(d['chipId'], None)
            # logger.info(f"{d['chipId']}, {d['collectLogs']}, {tw}") 

            try:
                if tw is None: # Create a new task for the device
                    if d['collectLogs']:
                        if len(d['url']) > 0:
                            logger.info(f"Found device with activated log collection {d['chipId']}, {d['url']} {d['collectLogs']}") 
                            tw = ThreadWrapper()
                            tw.thread =  threading.Thread(target=websocket_collector, args=[d['url'], d['chipId']])
                            tw.thread.daemon = True # Set the thread as a daemon
                            tw.thread.start()
                            threads[d['chipId']] = tw
                        else:
                            logger.warning(f"Device has logging enabled but is missing an url {d['chipId']}")                        
                else:                    
                    if d['collectLogs'] is False: # Task exist, but lets stop it
                        if not threads[d['chipId']].is_stopped():
                            logger.info(f"Stopping thread for {d['chipId']}") 
                            threads[d['chipId']].stop()
                        elif not tw.is_alive():
                            logger.info(f"Removing thread for {d['chipId']}") 
                            threads.pop(d['chipId'])

                    else: # Already exists, check if its still running
                        logger.info(f"Checking if thread is alive {d['chipId']} {tw.is_alive()}") 
                        if tw.is_alive() is False:
                            logger.warning(f"Task has exited for device {d['chipId']}")
                            threads.pop(d['chipId'])

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

    if apiHost == None or apiKey == None:
        logging.error("Environment variables APAPI_HOSTI_URL and API_KEY needs to be set")
        exit(-1)
    
    endpoint = "http://" + apiHost + "/api/device/"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey,
    }

    logger.info("Starting log collector")
    asyncio.run(main())
    logger.info("Exiting...") 

# EOF
