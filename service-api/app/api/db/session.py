from functools import lru_cache
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

from api.config import get_settings
from . import models
import logging

logger = logging.getLogger(__name__)

db_url = get_settings().database_url

if db_url.startswith("sqlite:"):
    engine = create_engine(db_url, connect_args={"check_same_thread": False}) # SQLITE
else:
    engine = create_engine(db_url, pool_pre_ping=True) # POSTGRES

models.Base.metadata.create_all(bind=engine)

@lru_cache
def create_session() -> scoped_session:
    logger.info("Creating database session.")
    Session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))
    return Session

def get_session() -> Generator[scoped_session, None, None]:
    Session = create_session()
    try:
        yield Session
    finally:
        Session.remove()
