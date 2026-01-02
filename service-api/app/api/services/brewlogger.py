"""BrewLogger service for managing application configuration settings."""
import logging

from sqlalchemy.orm import Session

from api.db import models, schemas

from .base import BaseService

logger = logging.getLogger(__name__)


class BrewLoggerService(
    BaseService[models.BrewLogger, schemas.BrewLoggerCreate, schemas.BrewLoggerUpdate]
):
    """Service for managing BrewLogger application settings and configuration."""
    def __init__(self, db_session: Session):
        super().__init__(models.BrewLogger, db_session)
