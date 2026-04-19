from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ExcludedDayCreate(BaseModel):
    excluded_date: date
    reason: Optional[str] = Field(None, max_length=255)


class ExcludedDayResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    excluded_date: date
    reason: Optional[str]
    created_at: datetime
