from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CategoryType(str, Enum):
    daily = "daily"
    unplanned = "unplanned"


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: CategoryType
    parent_id: Optional[int] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[CategoryType] = None
    parent_id: Optional[int] = None


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    type: str
    parent_id: Optional[int]
    created_at: datetime
