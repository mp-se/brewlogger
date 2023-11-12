from sqlalchemy.orm import Session
from api.db import schemas, models
from .base import BaseService
import logging

logger = logging.getLogger(__name__)

class BrewLoggerService(BaseService[models.BrewLogger, schemas.BrewLoggerCreate, schemas.BrewLoggerUpdate]):
    def __init__(self, db_session: Session):
        super(BrewLoggerService, self).__init__(models.BrewLogger, db_session)
