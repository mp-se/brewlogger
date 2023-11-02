import sqlalchemy

from typing import Any, Generic, List, Optional, Type, TypeVar
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import select
from starlette.exceptions import HTTPException
from api.db.models import Base
import logging

logger = logging.getLogger(__name__)

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class BaseService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType], db_session: Session):
        self.model = model
        self.db_session = db_session

    def get(self, id: Any) -> Optional[ModelType]:
        obj: Optional[ModelType] = self.db_session.get(self.model, id)
        if obj is None:
            raise HTTPException(status_code=404, detail="Not Found")
        return obj

    def list(self) -> List[ModelType]:
        objs: List[ModelType] = self.db_session.scalars(select(self.model)).all()
        return objs

    def create(self, obj: CreateSchemaType) -> ModelType:
        db_obj: ModelType = self.model(**obj.model_dump())
        self.db_session.add(db_obj)
        try:
            self.db_session.commit()
        except sqlalchemy.exc.IntegrityError as e:
            self.db_session.rollback()
            if "duplicate key" in str(e):
                raise HTTPException(status_code=409, detail="Conflict Error")
            else:
                raise e
        return db_obj

    def createList(self, lst: List[CreateSchemaType]) -> List[ModelType]:
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
                raise HTTPException(status_code=409, detail="Conflict Error")
            else:
                raise e
        return db_obj_lst

    def update(self, id: Any, obj: UpdateSchemaType) -> Optional[ModelType]:
        db_obj = self.get(id)
        for column, value in obj.model_dump(exclude_unset=True).items():
            setattr(db_obj, column, value)
        self.db_session.commit()
        return db_obj

    def delete(self, id: Any):
        obj = self.db_session.get(self.model, id)
        if obj == None:
            raise HTTPException(status_code=404, detail="Not Found")

        self.db_session.delete(obj)
        self.db_session.commit()
