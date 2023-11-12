from typing import Any
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import declarative_base, relationship

Base: Any = declarative_base()

class BrewLogger(Base):
    __tablename__ = "brewlogger"

    id = Column(Integer, primary_key=True, index=True)
    version = Column(String(10), nullable=False)
    mdns_timeout = Column(Integer, nullable=False, default=10)
    temperature_format = Column(String(3), nullable=False)
    pressure_format = Column(String(3), nullable=False)
    gravity_format = Column(String(3), nullable=False)

class Device(Base):
    __tablename__ = "device"

    id = Column(Integer, primary_key=True, index=True)
    chip_id = Column(String(6), unique=True, index=True)
    chip_family = Column(String(10), nullable=False)
    software = Column(String(40), nullable=False)
    mdns = Column(String(40), nullable=False)
    config = Column(Text, nullable=False)
    ble_color = Column(String(15), nullable=False)
    url = Column(String(80), nullable=False)

class Batch(Base):
    __tablename__ = "batch"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(40))
    chip_id = Column(String(6))
    description = Column(String(80))
    active = Column(Boolean)

    brew_date = Column(String)
    description = Column(String)
    style = Column(String)
    brewer = Column(String)
    abv = Column(Float, default=0.0)
    ebc = Column(Float, default=0.0)
    ibu = Column(Float, default=0.0)

    brewfather_id = Column(String(30))

    gravity = relationship("Gravity", back_populates="batch", cascade="all,delete")
    pressure = relationship("Pressure", back_populates="batch", cascade="all,delete")
    pour = relationship("Pour", back_populates="batch", cascade="all,delete")

class Gravity(Base):
    __tablename__ = "gravity"

    id = Column(Integer, primary_key=True, index=True)
    temperature = Column(Float)
    gravity = Column(Float)
    angle = Column(Float)
    battery = Column(Float)
    rssi = Column(Float)
    corr_gravity = Column(Float)
    run_time = Column(Float)
    created = Column(DateTime)

    batch_id = Column(Integer, ForeignKey(Batch.__table__.c.id))
    batch = relationship("Batch", back_populates="gravity")

class Pressure(Base):
    __tablename__ = "pressure"

    id = Column(Integer, primary_key=True, index=True)
    temperature = Column(Float)
    pressure = Column(Float)
    battery = Column(Float)
    rssi = Column(Float)
    run_time = Column(Float)
    created = Column(DateTime)

    batch_id = Column(Integer, ForeignKey(Batch.__table__.c.id))
    batch = relationship("Batch", back_populates="pressure")

class Pour(Base):
    __tablename__ = "pour"

    id = Column(Integer, primary_key=True, index=True)
    pour = Column(Float)
    volume = Column(Float)
    created = Column(DateTime)

    batch_id = Column(Integer, ForeignKey(Batch.__table__.c.id))
    batch = relationship("Batch", back_populates="pour")
