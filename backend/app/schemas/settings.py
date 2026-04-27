from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class SettingsUpdate(BaseModel):
    prediction_horizon_days: Optional[int] = Field(None, ge=7, le=365)
    rolling_average_days: Optional[int] = Field(None, ge=3, le=180)
    daily_high_threshold: Optional[int] = Field(None, ge=80, le=300)
    daily_low_threshold: Optional[int] = Field(None, ge=50, le=150)
    show_decimals: Optional[bool] = None
    show_predictive_non_primary: Optional[bool] = None
    require_payment_method: Optional[bool] = None
    require_subcategory: Optional[bool] = None
    prediction_notifications_enabled: Optional[bool] = None
    prediction_notifications_time: Optional[str] = Field(
        None, pattern=r"^(?:[01]\d|2[0-3]):[0-5]\d$"
    )
    primary_account_id: Optional[int] = None


class SettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    prediction_horizon_days: int
    rolling_average_days: int
    daily_high_threshold: int
    daily_low_threshold: int
    show_decimals: bool
    show_predictive_non_primary: bool
    require_payment_method: bool
    require_subcategory: bool
    prediction_notifications_enabled: bool
    prediction_notifications_time: str
    primary_account_id: Optional[int]
    created_at: datetime
    updated_at: datetime
