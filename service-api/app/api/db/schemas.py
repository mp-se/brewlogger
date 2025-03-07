from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator


def to_camel(string: str) -> str:
    if "_" not in string:
        return string
    words = string.split("_")
    words = [words[0]] + [word.capitalize() for word in words[1:]]
    return "".join(words)


################################################################################


class ProxyRequest(BaseModel):
    url: str
    method: str
    body: Optional[str]
    header: Optional[str]


class Mdns(BaseModel):
    type: str
    host: str
    name: str


class Job(BaseModel):
    name: str
    nextRunIn: int


class SelfTestResult(BaseModel):
    databaseConnection: bool
    redisConnection: bool
    backgroundJobs: List[str]


class BrewfatherBatch(BaseModel):
    name: str
    brewDate: str
    style: str
    brewer: str
    abv: float
    ebc: float
    ibu: float
    brewfatherId: str
    fermentationSteps: str


class TapListBatch(BaseModel):
    name: str
    brewDate: str
    style: str
    abv: float
    ebc: float
    ibu: float
    id: int
    brewfatherId: str


################################################################################


class BrewLoggerBase(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    temperature_format: str = Field(
        min_length=0, max_length=1, description="Temperature format for presentation"
    )
    pressure_format: str = Field(
        min_length=0, max_length=3, description="Pressure format for presentation"
    )
    gravity_format: str = Field(
        min_length=0, max_length=2, description="Gravity format for presentation"
    )
    volume_format: str = Field(
        min_length=0, max_length=2, description="Volume format for presentation"
    )
    version: str = Field(
        min_length=0, max_length=10, description="Database software version"
    )
    gravity_forward_url: str = Field(
        min_length=0, max_length=200, description="URL to forward gravity data to"
    )
    dark_mode: bool = Field(description="Enable dark mode in UI")


class BrewLoggerUpdate(BrewLoggerBase):
    pass


class BrewLoggerCreate(BrewLoggerBase):
    pass


class BrewLogger(BrewLoggerCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int

    api_key_enabled: Optional[bool]


################################################################################


class SystemLogBase(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    message: str
    module: str
    error_code: int
    log_level: int


class SystemLogUpdate(SystemLogBase):
    pass


class SystemLogCreate(SystemLogBase):
    timestamp: datetime


class SystemLog(SystemLogCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


################################################################################


class FermentationStepBase(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    date: str = Field(min_length=0, max_length=20, description="Date this step starts")
    order: int = Field(description="Sequence number for the fermentation step")
    temp: float = Field(description="Target temperature")
    days: int = Field(description="Number of days")
    name: str = Field(min_length=0, max_length=30, description="Name of the step")
    type: str = Field(min_length=0, max_length=30, description="Type of the step")


class FermentationStepUpdate(FermentationStepBase):
    pass


class FermentationStepCreate(FermentationStepBase):
    device_id: int


class FermentationStep(FermentationStepCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


################################################################################


class DeviceBase(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    chip_family: str = Field(
        min_length=0, max_length=10, description="Name of the chip type"
    )
    software: str = Field(
        min_length=0, max_length=40, description="Software on the device"
    )
    mdns: str = Field(
        min_length=0, max_length=40, description="Network name of the device"
    )
    config: str = Field(
        default="", description="JSON document containing the device configuration"
    )
    url: str = Field(
        min_length=0,
        max_length=80,
        description="URL to the device, will be used to communicate with it",
    )
    description: str = Field(
        min_length=0, max_length=150, description="Longer description of the device"
    )
    ble_color: str = Field(
        min_length=0, max_length=15, description="Bluetooth color (Gravitymon)"
    )
    collect_logs: bool = Field(description="Collect logs from device")


class DeviceUpdate(DeviceBase):
    pass


class DeviceCreate(DeviceBase):
    chip_id: str = Field(
        min_length=6, max_length=6, description="Chip id, must be 6 characters"
    )


class Device(DeviceCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    fermentation_step: List[FermentationStep] = None


################################################################################


class GravityBase(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    temperature: float = Field(description="Temperature value in C")
    gravity: float = Field(description="Calculated gravity in SG")
    angle: float = Field(description="Tilt or angle of the device")
    battery: float = Field(description="Battery voltage")
    rssi: float = Field(description="WIFI signal strenght")
    corr_gravity: float = Field(description="Temperature corrected gravity")
    run_time: float = Field(description="Number of seconds the execution took")
    created: Optional[datetime] | None = Field(
        default=None, description="If undefined the current time will be used"
    )
    active: bool = Field(
        description="If the gravity is active or not, active = shown in graphs"
    )
    chamber_temperature: Optional[float] = Field(
        None, description="Chamber Temperature from Chamber Controller, value in C"
    )
    beer_temperature: Optional[float] = Field(
        None, description="Beer Temperature from Chamber Controller, value in C"
    )


class GravityUpdate(GravityBase):
    pass


class GravityCreate(GravityBase):
    batch_id: int


class Gravity(GravityCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


################################################################################


class PressureBase(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    temperature: float = Field(description="Temperature value in C")
    pressure: float = Field(description="Measured pressure in kPa")
    pressure1: float = Field(description="Measured pressure1 in kPa")
    battery: float = Field(description="Battery voltage")
    rssi: float = Field(description="WIFI signal strenght")
    run_time: float = Field(description="Number of seconds the execution took")
    created: Optional[datetime] | None = Field(
        default=None, description="If undefined the current time will be used"
    )
    active: bool = Field(
        description="If the pressure is active or not, active = shown in graphs"
    )


class PressureUpdate(PressureBase):
    pass


class PressureCreate(PressureBase):
    batch_id: int


class Pressure(PressureCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


################################################################################


class PourBase(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    pour: float = Field(description="How much was poured from the device in liters")
    volume: float = Field(description="Volume left in the device in liters")
    max_volume: float = Field(
        description="Total volume the container can hold in liters"
    )
    created: Optional[datetime] | None = Field(
        default=None, description="If undefined the current time will be used"
    )
    active: bool = Field(
        description="If the pour is active or not, active = shown in graphs"
    )


class PourUpdate(PourBase):
    pass


class PourCreate(PourBase):
    batch_id: int


class Pour(PourCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


################################################################################


class BatchBase(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    name: str = Field(
        min_length=0, max_length=40, description="Short name of the batch"
    )
    description: str = Field(
        min_length=0, max_length=80, description="Longer description of the batch"
    )
    chip_id_gravity: str = Field(
        min_length=0, max_length=6, description="Chip id, 6 characters or empty"
    )
    chip_id_pressure: str = Field(
        min_length=0, max_length=6, description="Chip id, 6 characters or empty"
    )

    @field_validator("chip_id_gravity")
    @classmethod
    def validate_gravity_chip_id(cls, v: str) -> str:
        if len(v) != 0 and len(v) != 6:
            raise ValueError("chip_id_gravity must be zero or 6 characters long")
        return v

    @field_validator("chip_id_pressure")
    @classmethod
    def validate_pressure_chip_id(cls, v: str) -> str:
        if len(v) != 0 and len(v) != 6:
            raise ValueError("chip_id_gravity must be zero or 6 characters long")
        return v

    active: bool = Field(
        description="If the batch is active or not, active = can recive new gravity data"
    )
    tap_list: bool = Field(description="If the batch should be visible in the tap list")
    brew_date: str = Field(
        min_length=0, max_length=20, description="When the brew date was"
    )
    style: str = Field(min_length=0, max_length=40, description="Style of the beer")
    brewer: str = Field(min_length=0, max_length=40, description="Name of the brewer")
    abv: float = Field(description="Alcohol level of the batch")
    ebc: float = Field(description="Color of the batch")
    ibu: float = Field(description="Bitterness of the batch")
    brewfather_id: str = Field(
        min_length=0, max_length=30, description="ID used in brewfather"
    )
    fermentation_chamber: Optional[int] = Field(
        None,
        description="Device Index of the fermentation chamber (Chamber Controller)",
    )
    fermentation_steps: Optional[str] = Field(
        None, description="JSON document with fermentation steps (Chamber Controller)"
    )


class BatchUpdate(BatchBase):
    pass


class BatchCreate(BatchBase):
    name: str = Field(
        min_length=0, max_length=40, description="Short name of the batch"
    )


class Batch(BatchCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    gravity: List[Gravity] = None
    pressure: List[Pressure] = None
    pour: List[Pour] = None


class BatchDashboard(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    id: int
    name: str = Field(
        min_length=0, max_length=40, description="Short name of the batch"
    )
    chip_id_gravity: str = Field(
        min_length=0, max_length=6, description="Chip id, must be 6 characters"
    )
    chip_id_pressure: str = Field(
        min_length=0, max_length=6, description="Chip id, must be 6 characters"
    )

    @field_validator("chip_id_gravity")
    @classmethod
    def validate_gravity_chip_id(cls, v: str) -> str:
        if len(v) != 0 and len(v) != 6:
            raise ValueError("chip_id_gravity must be zero or 6 characters long")
        return v

    @field_validator("chip_id_pressure")
    @classmethod
    def validate_pressure_chip_id(cls, v: str) -> str:
        if len(v) != 0 and len(v) != 6:
            raise ValueError("chip_id_gravity must be zero or 6 characters long")
        return v

    active: bool = Field(
        description="If the batch is active or not, active = can recive new gravity data"
    )
    gravity: List[Gravity] = None
    pressure: List[Pressure] = None
    pour: List[Pour] = None


################################################################################
