import asyncio, logging, json, requests

from bleak import BleakClient, BleakScanner
from bleak.exc import BleakError

logger = logging.getLogger("gravmon")

endpoint = "http://brew_api:80/api/gravity/public"
headers = {
    "Content-Type": "application/json",
}

async def main():
    while True:
        try:
            device = await BleakScanner.find_device_by_name("gravitymon", cb=dict(use_bdaddr=False))
            if device is None:
                pass
            else:
                logger.info("Connecting to gravitymon.")

                async with BleakClient(
                    device,
                ) as client:
                    logger.info("Connected to gravitymon.")
                    for service in client.services:
                        for char in service.characteristics:
                            if "read" in char.properties and char.uuid.startswith("00002903"):
                                try:
                                    value = await client.read_gatt_char(char.uuid)
                                    data = json.loads( value.decode() )
                                    logger.info( "Data received: %s", json.dumps(data) )

                                    try:
                                        logger.info( "Posting data.")
                                        r = requests.post(endpoint, json=data, headers=headers)
                                        logger.info( f"Response {r}.")
                                    except Exception as e:
                                        logger.error( "Failed to post data, Error: %s", e)

                                except Exception as e:
                                    logger.error( "Failed to read data, Error: %s", e)
                logger.info("Disconnected from gravitymon")
        except TimeoutError as e:
            logger.error( "Timeout reading from gravitymon, Error: %s", e)          
        except BleakError as e:
            logger.error( "Bleak error reading from gravitymon, Error: %s", e)          
        except Exception as e:
            logger.error( "Unexpected error: %s", str(e))          

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)-15s %(name)-8s %(levelname)s: %(message)s",
    )

    logger.info("Scanning for gravitymon devices...")

    asyncio.run(main())
    
    logger.info("Exit from gravitymon scanner")
