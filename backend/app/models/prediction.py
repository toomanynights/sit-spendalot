from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.account import Account
    from app.models.payment_method import PaymentMethod
    from app.models.transaction import Transaction


class PredictionTemplate(Base):
    """
    Defines a recurring predicted transaction (e.g. "Rent", "Payslip").
    Not linked to transaction categories — predictions are a separate domain.
    """

    __tablename__ = "prediction_templates"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    # every_n_days / monthly / yearly / once
    frequency: Mapped[str] = mapped_column(String(20), nullable=False)
    # every_n_days: step size in days (e.g. 1=daily, 7=weekly, 14=biweekly). Null for other frequencies.
    interval: Mapped[Optional[int]] = mapped_column(nullable=True)
    # monthly: which day of the month to fire (1-31). Null for other frequencies.
    # yearly: derived from start_date.month + start_date.day — no separate column needed.
    day_of_month: Mapped[Optional[int]] = mapped_column(nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    paused: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    # Optional default payment method for confirmed instances of this template.
    payment_method_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("payment_methods.id", ondelete="SET NULL"), nullable=True
    )
    last_generated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    account: Mapped["Account"] = relationship(back_populates="prediction_templates")
    instances: Mapped[list["PredictionInstance"]] = relationship(
        back_populates="template", cascade="all, delete-orphan"
    )
    payment_method: Mapped[Optional["PaymentMethod"]] = relationship()

    @property
    def payment_method_name(self) -> Optional[str]:
        return self.payment_method.name if self.payment_method else None


class PredictionInstance(Base):
    """
    A materialized occurrence of a PredictionTemplate on a specific date.
    Status lifecycle: pending → confirmed | skipped
    """

    __tablename__ = "prediction_instances"
    __table_args__ = (
        UniqueConstraint("template_id", "scheduled_date", name="uq_prediction_instance_template_date"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    template_id: Mapped[int] = mapped_column(
        ForeignKey("prediction_templates.id"), nullable=False
    )
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False)
    # pending / confirmed / skipped
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    confirmed_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    confirmed_amount: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(12, 2), nullable=True
    )
    transaction_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("transactions.id"), nullable=True, unique=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    template: Mapped["PredictionTemplate"] = relationship(back_populates="instances")
    account: Mapped["Account"] = relationship(back_populates="prediction_instances")
    transaction: Mapped[Optional["Transaction"]] = relationship()

    @property
    def template_name(self) -> Optional[str]:
        return self.template.name if self.template else None

    @property
    def template_payment_method_id(self) -> Optional[int]:
        return self.template.payment_method_id if self.template else None

    @property
    def template_payment_method_name(self) -> Optional[str]:
        return self.template.payment_method_name if self.template else None
