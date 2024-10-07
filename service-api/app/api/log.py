import logging
from datetime import datetime
from api.services import SystemLogService
from api.db import schemas
from api.db.session import create_session

logger = logging.getLogger(__name__)


def system_log(module, message, error_code):
    entry = schemas.SystemLogCreate(
        timestamp = datetime.now().isoformat(),
        module = module,
        log_level = 0,
        message = message,
        error_code = error_code)
    
    systemlog_service = SystemLogService(create_session())
    systemlog_service.create(entry)

def system_log_scheduler(message, error_code):
    system_log("scheduler", message=message, error_code=error_code)

def system_log_fermentationcontrol(message, error_code):
    system_log("fermentation_control", message=message, error_code=error_code)

def system_log_security(message, error_code):
    system_log("security", message=message, error_code=error_code)
