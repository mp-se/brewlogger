"""Base service class providing generic CRUD operations for database models."""
import logging
from typing import Any, Generic, List, Optional, Type, TypeVar

import sqlalchemy
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.exceptions import HTTPException

from api.db import models
from api.db.models import Base

logger = logging.getLogger(__name__)

ModelType = TypeVar("ModelType", bound=Base)  # pylint: disable=invalid-name
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)  # pylint: disable=invalid-name
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)  # pylint: disable=invalid-name


class BaseService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """Generic base service class providing CRUD operations for database models."""
    def __init__(self, model: Type[ModelType], db_session: Session):
        self.model = model
        self.db_session = db_session

    def get(self, item_id: Any) -> Optional[ModelType]:
        """Retrieve a single item by ID, returns None if not found."""
        obj: Optional[ModelType] = self.db_session.get(self.model, item_id)
        return obj

    def list(self) -> List[ModelType]:
        """Retrieve all items of this model type."""
        objs: List[ModelType] = self.db_session.scalars(select(self.model)).all()
        return objs

    def create(self, obj: CreateSchemaType) -> ModelType:
        """Create a new item in the database."""
        db_obj: ModelType = self.model(**obj.model_dump())
        self.db_session.add(db_obj)
        try:
            self.db_session.commit()
        except sqlalchemy.exc.IntegrityError as e:
            self.db_session.rollback()
            if "duplicate key" in str(e):
                raise HTTPException(status_code=409, detail="Conflict Error") from e
            raise e

        return db_obj

    def create_list(self, lst: List[CreateSchemaType]) -> List[ModelType]:
        """Create multiple items in the database."""
        db_obj_lst = []
        for obj in lst:
            db_obj: ModelType = self.model(**obj.model_dump())
            self.db_session.add(db_obj)
            db_obj_lst.append(db_obj)
        try:
            self.db_session.commit()
        except sqlalchemy.exc.IntegrityError as e:
            self.db_session.rollback()
            if "duplicate key" in str(e):
                raise HTTPException(status_code=409, detail="Conflict Error") from e
            raise e

        return db_obj_lst

    def update(self, item_id: Any, obj: UpdateSchemaType) -> Optional[ModelType]:
        """Update an existing item in the database, returns None if not found."""
        db_obj = self.get(item_id)
        if db_obj is None:
            return None
        for column, value in obj.model_dump(exclude_unset=True).items():
            setattr(db_obj, column, value)
        self.db_session.commit()
        return db_obj

    def delete(self, item_id: Any):
        """Delete an item from the database by ID, returns False if not found."""
        db_obj = self.db_session.get(self.model, item_id)
        if db_obj is None:
            return False

        self.db_session.delete(db_obj)
        self.db_session.commit()
        return True

    def _validate_batch_exists(self, batch_id: int) -> models.Batch:
        """Validate that a batch exists and return it. Raises HTTPException if not found."""
        batch = self.db_session.get(models.Batch, batch_id)
        logger.info("Searching for batch with id=%s %s", batch_id, batch)
        if batch is None:
            raise HTTPException(
                status_code=400,
                detail=f"Batch with id = {batch_id} not found.",
            )
        return batch

    def _search_by_filter(self, filters: dict) -> List[ModelType]:
        """Generic search by filter dictionary."""
        objs: List[self.model] = self.db_session.scalars(
            select(self.model).filter_by(**filters)
        ).all()
        return objs
