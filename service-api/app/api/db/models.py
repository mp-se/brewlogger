from typing import Any
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Boolean,
    Text,
)
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
    gravity_forward_url = Column(String(100), nullable=False)
    dark_mode = Column(Boolean, nullable=False)

class Device(Base):
    __tablename__ = "device"

    id = Column(Integer, primary_key=True, index=True)
    chip_id = Column(String(6), index=True)
    chip_family = Column(String(10), nullable=False)
    software = Column(String(40), nullable=False)
    mdns = Column(String(40), nullable=False)
    config = Column(Text, nullable=False)
    url = Column(String(80), nullable=False)
    description = Column(String(150), nullable=False)

    # Gravitymon specific
    ble_color = Column(String(15), nullable=False)
    gravity_formula = Column(String(100), nullable=False)
    gravity_poly = Column(Text, nullable=False)


class Batch(Base):
    __tablename__ = "batch"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(40), nullable=False)
    chip_id = Column(String(6), nullable=False)
    description = Column(String(80), nullable=False)
    active = Column(Boolean, nullable=False)

    brew_date = Column(String, nullable=False)
    description = Column(String, nullable=False)
    style = Column(String, nullable=False)
    brewer = Column(String, nullable=False)
    abv = Column(Float, default=0.0, nullable=False)
    ebc = Column(Float, default=0.0, nullable=False)
    ibu = Column(Float, default=0.0, nullable=False)

    brewfather_id = Column(String(30), nullable=False)
    fermentation_chamber = Column(
        Integer, nullable=True
    )  # Device ID for connected brewpi

    gravity = relationship("Gravity", back_populates="batch", cascade="all,delete")
    pressure = relationship("Pressure", back_populates="batch", cascade="all,delete")
    pour = relationship("Pour", back_populates="batch", cascade="all,delete")


class Gravity(Base):
    __tablename__ = "gravity"

    # Data from Gravitymon
    id = Column(Integer, primary_key=True, index=True, nullable=False)
    temperature = Column(Float, nullable=False)
    gravity = Column(Float, nullable=False)
    angle = Column(Float, nullable=False)
    battery = Column(Float, nullable=False)
    rssi = Column(Float, nullable=False)
    corr_gravity = Column(Float, nullable=False)
    run_time = Column(Float, nullable=False)

    # Data from brewpi
    beer_temperature = Column(Float, nullable=True) # Temperature from brewpi
    chamber_temperature = Column(Float, nullable=True) # Temperature from brewpi

    # Internal
    created = Column(DateTime, nullable=False)
    active = Column(Boolean, nullable=False)

    batch_id = Column(Integer, ForeignKey(Batch.__table__.c.id))
    batch = relationship("Batch", back_populates="gravity")


class Pressure(Base):
    __tablename__ = "pressure"

    id = Column(Integer, primary_key=True, index=True, nullable=False)
    temperature = Column(Float, nullable=False)
    pressure = Column(Float, nullable=False)
    battery = Column(Float, nullable=False)
    rssi = Column(Float, nullable=False)
    run_time = Column(Float, nullable=False)
    created = Column(DateTime, nullable=False)
    active = Column(Boolean, nullable=False)

    batch_id = Column(Integer, ForeignKey(Batch.__table__.c.id))
    batch = relationship("Batch", back_populates="pressure")


class Pour(Base):
    __tablename__ = "pour"

    id = Column(Integer, primary_key=True, index=True, nullable=False)
    pour = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)
    created = Column(DateTime, nullable=False)
    active = Column(Boolean, nullable=False)

    batch_id = Column(Integer, ForeignKey(Batch.__table__.c.id))
    batch = relationship("Batch", back_populates="pour")
