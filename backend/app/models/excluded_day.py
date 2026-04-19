from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ExcludedDay(Base):
    """
    Dates excluded from the rolling average window.
    The stat window shifts back by 1 day per excluded day so the
    average always covers the configured number of active days.
    """

    __tablename__ = "excluded_days"

    id: Mapped[int] = mapped_column(primary_key=True)
    excluded_date: Mapped[date] = mapped_column(Date, nullable=False, unique=True)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
