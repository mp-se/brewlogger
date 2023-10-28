from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict, ValidationError, ValidationInfo, field_validator
from pydantic.functional_validators import AfterValidator
from typing_extensions import Annotated

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

class AppSetting(BaseModel):
    javascript_debug_enabled: bool = Field(default=False)

    api_key_enabled: Optional[bool] = Field(default=True)
    test_endpoints_enabled: Optional[bool] = Field(default=False)
    version: Optional[str] = Field(default="")

################################################################################

class DeviceBase(BaseModel):
    model_config = ConfigDict(alias_generator = to_camel, populate_by_name = True )
    chip_family: str = Field(min_length=0, max_length=10, description="Name of the chip type")
    software: str = Field(min_length=0, max_length=40, description="Software on the device")
    mdns: str = Field(min_length=0, max_length=40, description="Network name of the device")
    config: str = Field(default="", description="JSON document containing the device configuration")
    url: str = Field(min_length=0, max_length=80, description="URL to the device, will be used to communicate with it")

class DeviceUpdate(DeviceBase):
    pass

class DeviceCreate(DeviceBase):
    chip_id: str = Field(min_length=6, max_length=6, description="Chip id, must be 6 characters")

class Device(DeviceCreate):
    model_config = ConfigDict(from_attributes = True)
    id: int

################################################################################

class GravityBase(BaseModel):
    model_config = ConfigDict(alias_generator = to_camel, populate_by_name = True )

    chip_id: str = Field(min_length=6, max_length=6, description="Chip id, must be 6 characters")
    name: str = Field(min_length=0, max_length=40, description="Network name of the device")
    token: str = Field(min_length=0, max_length=40, description="Token that can be used on the server to process the data.")
    interval: int = Field(description="Time between transmissions")
    temperature: float = Field(description="Temperature value")
    temp_units: str = Field(min_length=0, max_length=1, description="Temperature unit, either C or F")
    gravity: float = Field(description="Calculated gravity")
    angle: float = Field(description="Tilt or angle of the device")
    battery: float = Field(description="Battery voltage")
    rssi: float = Field(description="WIFI signal strenght")
    corr_gravity: float = Field(description="Temperature corrected gravity")
    gravity_units: str = Field(min_length=0, max_length=2, description="Gravity unit, either P or SG")
    run_time: float = Field(description="Number of seconds the execution took")
    created: Optional[datetime] | None = Field(default=None, description="If undefined the current time will be used")

    @field_validator('temp_units')
    def validate_temp_units(cls, v: str, info: ValidationInfo) -> str:
        assert v == "C" or v == "F"
        return v

    @field_validator('gravity_units')
    def validate_gravity_units(cls, v: str, info: ValidationInfo) -> str:
        assert v == "SG" or v == "P"
        return v

class GravityUpdate(GravityBase):
    pass

class GravityCreate(GravityBase):
    batch_id: int

class Gravity(GravityCreate):
    model_config = ConfigDict(from_attributes = True)
    id: int

class GravityShort(BaseModel):
    model_config = ConfigDict(alias_generator = to_camel, populate_by_name = True )
    id: int
    temperature: float = Field(description="Temperature value")
    temp_units: str = Field(min_length=0, max_length=1, description="Temperature unit, either C or F")
    gravity: float = Field(description="Calculated gravity")
    angle: float = Field(description="Tilt or angle of the device")
    gravity_units: str = Field(min_length=0, max_length=2, description="Gravity unit, either P or SG")
    created: datetime = Field(description="When the record was created")

################################################################################

class PourBase(BaseModel):
    model_config = ConfigDict(alias_generator = to_camel, populate_by_name = True )
    pour: float = Field(description="How much was poured from the device")
    volume: float = Field(description="Total volume left in the device")
    created: Optional[datetime] | None = Field(default=None, description="If undefined the current time will be used")

class PourUpdate(PourBase):
    pass

class PourCreate(PourBase):
    batch_id: int

class Pour(PourCreate):
    model_config = ConfigDict(from_attributes = True)
    id: int

################################################################################

class BatchBase(BaseModel):
    model_config = ConfigDict(alias_generator = to_camel, populate_by_name = True)
    name: str = Field(min_length=0, max_length=40, description="Short name of the batch")
    description: str = Field(min_length=0, max_length=40, description="Longer description of the batch")
    chip_id: str = Field(min_length=6, max_length=6, description="Chip id, must be 6 characters")
    active: bool = Field(description="If the batch is active or not, active = can recive new gravity data")
    brew_date: str = Field(min_length=0, max_length=20, description="When the brew date was")
    style: str = Field(min_length=0, max_length=20, description="Style of the beer")
    brewer: str = Field(min_length=0, max_length=40, description="Name of the brewer")
    abv: float = Field(description="Alcohol level of the batch")
    ebc: float = Field(description="Color of the batch")
    ibu: float = Field(description="Bitterness of the batch")
    brewfather_id: str = Field(min_length=0, max_length=20, description="ID used in brewfather")

class BatchUpdate(BatchBase):
    pass

class BatchCreate(BatchBase):
    name: str = Field(min_length=0, max_length=40, description="Short name of the batch")

class Batch(BatchCreate):
    model_config = ConfigDict(from_attributes = True)
    id: int
    gravity: List[GravityShort] = None
    pour: List[Pour] = None

################################################################################
