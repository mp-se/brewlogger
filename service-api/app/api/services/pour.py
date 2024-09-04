from fastapi import HTTPException
from sqlalchemy.orm import Session
from api.db import models, schemas
from .base import BaseService
import logging

logger = logging.getLogger(__name__)


class PourService(BaseService[models.Pour, schemas.PourCreate, schemas.PourUpdate]):
    def __init__(self, db_session: Session):
        super(PourService, self).__init__(models.Pour, db_session)

    def create(self, obj: schemas.PourCreate) -> models.Pour:
        batch = self.db_session.get(models.Batch, obj.batch_id)
        if batch is None:
            raise HTTPException(
                status_code=400,
                detail=f"Batch with id = {obj.batch_id} not found.",
            )
        return super(PourService, self).create(obj)
