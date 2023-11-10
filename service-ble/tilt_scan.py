import asyncio, logging, json, requests, time, os
from uuid import UUID

from construct import Array, Byte, Const, Int8sl, Int16ub, Struct
from construct.core import ConstError

from bleak import BleakScanner
from bleak.backends.device import BLEDevice
from bleak.backends.scanner import AdvertisementData

logger = logging.getLogger(__name__)

endpoint = "http://brew_api:80/api/gravity/public"
headers = {
    "Content-Type": "application/json",
}

minium_interval = 0

ibeacon_format = Struct(
    "type_length" / Const(b"\x02\x15"),
    "uuid" / Array(16, Byte),
    "major" / Int16ub,
    "minor" / Int16ub,
    "power" / Int8sl,
)

class tilt:
    def __init__(self, color, uuid, time):
        self.color = color
        self.uuid = uuid
        self.time = time

tilts = []

def init():
    tilts.append(tilt("red", UUID("A495BB10-C5B1-4B44-B512-1370F02D74DE"), time.time()-minium_interval))
    tilts.append(tilt("green", UUID("A495BB20-C5B1-4B44-B512-1370F02D74DE"), time.time()-minium_interval))
    tilts.append(tilt("black", UUID("A495BB30-C5B1-4B44-B512-1370F02D74DE"), time.time()-minium_interval))
    tilts.append(tilt("purple", UUID("A495BB40-C5B1-4B44-B512-1370F02D74DE"), time.time()-minium_interval))
    tilts.append(tilt("orange", UUID("A495BB50-C5B1-4B44-B512-1370F02D74DE"), time.time()-minium_interval))
    tilts.append(tilt("blue", UUID("A495BB60-C5B1-4B44-B512-1370F02D74DE"), time.time()-minium_interval))
    tilts.append(tilt("yellow", UUID("A495BB70-C5B1-4B44-B512-1370F02D74DE"), time.time()-minium_interval))
    tilts.append(tilt("pink", UUID("A495BB80-C5B1-4B44-B512-1370F02D74DE"), time.time()-minium_interval))

def contains(list, filter):
    for x in list:
        if filter(x):
            return True
    return False

def first(iterable, default=None):
  for item in iterable:
    return item
  return default

def device_found(
    device: BLEDevice, advertisement_data: AdvertisementData
):
    try:
        apple_data = advertisement_data.manufacturer_data[0x004C]
        ibeacon = ibeacon_format.parse(apple_data)
        uuid = UUID(bytes=bytes(ibeacon.uuid))
        tilt = first(x for x in tilts if x.uuid == uuid)

        if tilt is not None:
            logger.info(f"Found tilt device, checking if time has expired {minium_interval}")

            now = time.time()

            if abs(tilt.time - now) > minium_interval:
                tilt.time = now
                tempF = ibeacon.major
                gravitySG = ibeacon.minor/1000

                data = {
                    "color": tilt.color,
                    "gravity": gravitySG,
                    "temperature": tempF,
                    "RSSI": advertisement_data.rssi,
                }

                logger.info( "Data received: %s", json.dumps(data) )

                try:
                    logger.info( "Posting data.")
                    #r = requests.post(endpoint, json=data, headers=headers)
                    #logger.info( f"Response {r}.")
                except Exception as e:
                    logger.error( "Failed to post data, Error: %s", e)
            else:
                logger.info("Too short time between transmissions, skipping.")

    except KeyError as e:
        pass
    except ConstError as e:
        pass

async def main():
    global minium_interval

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)-15s %(name)-8s %(levelname)s: %(message)s",
    )

    t = os.getenv('MIN_INTERVAL') 
    minium_interval = 5*60 # seconds
    if t != None:
        minium_interval = int(t)
    logger.info("Minium interval = %d", minium_interval)

    init()
    scanner = BleakScanner(detection_callback=device_found,scanning_mode="passive")

    while True:
        logger.info("Scanning for tilt devices...")
        await scanner.start()
        await asyncio.sleep(1.0)
        await scanner.stop()

asyncio.run(main())