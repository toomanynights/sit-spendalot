from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Settings(Base):
    """
    Single-row application config table.
    Designed so a future user_id column can be added without breaking changes
    (avoid any hardcoded single-row assumptions in queries — always filter by id=1).
    """

    __tablename__ = "settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    prediction_horizon_days: Mapped[int] = mapped_column(
        Integer, nullable=False, default=90
    )
    rolling_average_days: Mapped[int] = mapped_column(
        Integer, nullable=False, default=30
    )
    daily_high_threshold: Mapped[int] = mapped_column(
        Integer, nullable=False, default=110
    )
    daily_low_threshold: Mapped[int] = mapped_column(
        Integer, nullable=False, default=90
    )
    show_decimals: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True
    )
    show_predictive_non_primary: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    require_payment_method: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    require_subcategory: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    prediction_notifications_enabled: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    prediction_notifications_time: Mapped[str] = mapped_column(
        String(5), nullable=False, default="09:00"
    )
    primary_account_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("accounts.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
