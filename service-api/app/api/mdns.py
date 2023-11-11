import asyncio, logging, time
from typing import Optional, cast

from zeroconf import DNSQuestionType, IPVersion, ServiceStateChange, Zeroconf
from zeroconf.asyncio import AsyncServiceBrowser, AsyncServiceInfo, AsyncZeroconf

ALL_SERVICES = [
    "_pressuremon._tcp.local.",
    "_gravitymon._tcp.local.",
    "_kegmon._tcp.local.",
    "_http._tcp.local.",
    #"_brewpi._tcp.local.",
]

logger = logging.getLogger(__name__)
scan_result = []

async def scan_for_mdns(timeout):
    logger.info(f"Scanning for mdns devices, timout {timeout}")
    scan_result.clear()
    runner = AsyncDeviceScanner(timeout)
    await runner.async_run()
    logger.info(f"Scanning completed {scan_result}")
    return scan_result

def async_on_service_state_change(
    zeroconf: Zeroconf, service_type: str, name: str, state_change: ServiceStateChange
) -> None:
    logger.debug(f"Service {name} of type {service_type} state changed: {state_change}")
    asyncio.ensure_future(_async_show_service_info(zeroconf, service_type, name))

async def _async_show_service_info(zeroconf: Zeroconf, service_type: str, name: str) -> None:
    info = AsyncServiceInfo(service_type, name)
    await info.async_request(zeroconf, 3000, question_type=DNSQuestionType.QU)
    logger.debug("Info from zeroconf.get_service_info: %r" % (info))
    if info:
        addresses = ["%s:%d" % (addr, cast(int, info.port)) for addr in info.parsed_addresses()]
        type = info.type
        adresses = ", ".join(addresses)
        host = info.server
        logger.info(f"Endpoint: {type} {adresses} {host}" )
        mdns = { "type": type, "host": str(adresses), "name": host.strip('.') }
        scan_result.append(mdns)

class AsyncDeviceScanner:
    def __init__(self, timeout) -> None:
        self.start = time.time()
        self.timeout = timeout
        self.aiobrowser: Optional[AsyncServiceBrowser] = None
        self.aiozc: Optional[AsyncZeroconf] = None

    async def async_run(self) -> None:
        self.aiozc = AsyncZeroconf(ip_version=IPVersion.V4Only)
        await self.aiozc.zeroconf.async_wait_for_start()
        logging.info("\nBrowsing %s service(s), press Ctrl-C to exit...\n" % ALL_SERVICES)
        kwargs = {'handlers': [async_on_service_state_change], 'question_type': DNSQuestionType.QU}
        self.aiobrowser = AsyncServiceBrowser(self.aiozc.zeroconf, ALL_SERVICES, **kwargs)
        while (time.time() - self.start) < self.timeout:
            await asyncio.sleep(1)
        logging.info("Scanning completed, exiting.")
        await self.async_close()

    async def async_close(self) -> None:
        assert self.aiozc is not None
        assert self.aiobrowser is not None
        await self.aiobrowser.async_cancel()
        await self.aiozc.async_close()
