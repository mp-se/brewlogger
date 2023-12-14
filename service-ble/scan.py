import asyncio, logging, json, requests, time, os
from uuid import UUID

from construct import Array, Byte, Const, Int8sl, Int16ub, Struct
from construct.core import ConstError

from bleak import BleakScanner, BleakClient
from bleak.backends.device import BLEDevice
from bleak.backends.scanner import AdvertisementData

logger = logging.getLogger("tilt")

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
lastGravitymonData = ""

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

async def parse_gravitymon(device: BLEDevice):
    global lastGravitymonData

    try:      
        async with BleakClient(device) as client:
            for service in client.services:
                if service.uuid.startswith("0000180a-"):
                    for char in service.characteristics:
                        if "read" in char.properties and char.uuid.startswith("00002900-"):
                            try:
                                value = await client.read_gatt_char(char.uuid)
                                data = json.loads( value.decode() )
                                logger.info( "Data received: %s", json.dumps(data) )
                                await client.disconnect()
                                try:
                                    if json.dumps(data) == lastGravitymonData:
                                        logger.info( "Skipping post since data is identical with last read.")
                                    else:
                                        logger.info( "Posting data.")
                                        lastGravitymonData = json.dumps(data)                                           
                                        r = requests.post(endpoint, json=data, headers=headers)
                                        logger.info( f"Response {r}.")
                                except Exception as e:
                                    logger.error( "Failed to post data, Error: %s", e)
                            except Exception as e:
                                logger.error( "Failed to read data, Error: %s", e)          
            await client.disconnect()           
    except Exception as e:
        pass

def parse_tilt(advertisement_data: AdvertisementData):
    #print(advertisement_data)

    try:
        apple_data = advertisement_data.manufacturer_data[0x004C]
        ibeacon = ibeacon_format.parse(apple_data)
        uuid = UUID(bytes=bytes(ibeacon.uuid))
        tilt = first(x for x in tilts if x.uuid == uuid)

        if tilt is not None:
            logger.debug(f"Found tilt device, checking if time has expired, min={minium_interval}s")

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
                    r = requests.post(endpoint, json=data, headers=headers)
                    logger.info( f"Response {r}.")
                except Exception as e:
                    logger.error( "Failed to post data, Error: %s", e)

    except KeyError as e:
        pass
    except ConstError as e:
        pass

async def device_found(device: BLEDevice, advertisement_data: AdvertisementData):
    if device.name == "gravitymon":
        await parse_gravitymon(device=device)
    else:
        parse_tilt(advertisement_data=advertisement_data)

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

    logger.info("Scanning for tilt/gravitymon BLE devices...")
    while True:
        await scanner.start()
        await asyncio.sleep(0.1)
        await scanner.stop()

    #scanner = BleakScanner(scanning_mode="passive")
    #logger.info("Scanning for tilt/gravitymon BLE devices...")
    #while True:
    #    results = await scanner.discover(timeout=3,return_adv=True)     
    #    for d, a  in results.values():
    #        if d.name == "gravitymon":
    #            pass
    #            #await parse_gravitymon(d)
    #        else:
    #            parse_tilt(a)
    #    print(".",end="")

asyncio.run(main())
logger.info("Exit from tilt scanner")
