#
# Collect logs from all devices with a valid URL registered in the Brewlogger database
#
# Requires the following environment variables 
#
#   API_URL: Name of host (eg. localhost:8000)
#   API_KEY: API Key for server
#
# Options:
# 
#   --chipid <chipid> Collect from device with this ID 
#   --software <software> Collect from all devices with this software 
# 
# Data will be stored in the current director with filename <chipid>.log
# 
import asyncio
import logging
import requests
import os
from websockets.client import connect
import argparse

logger = logging.getLogger(__name__)

endpoint = ""
headers = {}
devices = []

filter_chip_id = ""
filter_software = ""

def getDeviceList():
    try:
        logger.info(f"Fetching device list from brewlogger API {endpoint}.")
        r = requests.get(
            endpoint, headers=headers
        )
        if r.ok:
            for d in r.json():
                f = False

                if filter_chip_id == "" and filter_software == "": # No filter applied, take all with valid URL
                    f = True
                elif len(filter_chip_id) and d['url'] == filter_chip_id: # ChipId matched
                    f = True 
                elif len(filter_software) and d['software'] == filter_software: # Software matched
                    f = True 

                if f and d['url'] != "": # Url is valid
                    devices.append({ "url": d['url'], "id": d['chipId']})
                    logger.info(f"Found matching device with url {d['url']}")

    except Exception as e:
        logger.error(f"Failed to request device list, Error: {e}")
    logger.info(f"Found the following urls: {devices}")


async def collect_logs(url, fileName):
    uri = url.replace("http://", "ws://") + "serialws"

    # TODO: Detect when connection drops and do retry

    logger.info(f"Collecing logs from {uri} and saving to {fileName}")
    f = open(fileName, "a")
    try:
        async with connect(uri) as websocket:
            line = ""
            while True:
                line += await websocket.recv()
            
                if line.endswith("\n") or len(line) > 200:
                    f.write(f"< {line}")
                    print(f"< {line.strip('\n')}")
                    line = ""
    except Exception as e:
        logger.error(f"Failed log collection {e}")
        
    f.close()

async def main():
    getDeviceList()    
    tasks = []

    for d in devices:
        try:
            tasks.append(asyncio.create_task(collect_logs(d['url'], d['id'] + ".log" )))
        except Exception as e:
            logger.error(f"Failed to create tasks {e}") 
    try:
        await asyncio.gather(*tasks)
    except asyncio.TimeoutError:
        logger.error("AsyncIO Timeout error") 

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)-15s %(name)-8s %(levelname)s: %(message)s",
    )

    apiUrl = os.getenv("API_URL")
    apiKey = os.getenv("API_KEY")

    if apiUrl == None or apiKey == None:
        logging.error("Environment variables API_URL and API_KEY needs to be set")
        exit(-1)
    
    endpoint = "http://" + apiUrl + "/api/device/"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey,
    }

    parser = argparse.ArgumentParser()
    parser.add_argument("--chipid", help="Enter name of device to collect logs from, fetched from brewlogger",
                    type=str)
    parser.add_argument("--software", help="Enter name of the software to collect logs from, fetched from brewlogger",
                    type=str)
    args = parser.parse_args()

    if args.chipid:
        filter_chip_id = args.chipid 

    if args.software:
        filter_software = args.software 

    logger.info("Starting log collector")
    asyncio.run(main())
    logger.info("Exiting...") 
