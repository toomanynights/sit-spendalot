from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.account import Account
    from app.models.payment_method import PaymentMethod
    from app.models.transaction import Transaction


class AccountCheckup(Base):
    """
    A point-in-time reconciliation of an account's ledger balance against the
    sum of user-reported per-payment-method actual amounts.

    Even when ledger and reported balances match (no correction needed), we
    still keep a row so the audit trail records *that* the user reconciled.
    """

    __tablename__ = "account_checkups"

    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(
        ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False
    )
    checkup_date: Mapped[date] = mapped_column(Date, nullable=False)
    ledger_balance: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    reported_balance: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    correction_transaction_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True
    )
    note: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    account: Mapped["Account"] = relationship(foreign_keys=[account_id])
    correction_transaction: Mapped[Optional["Transaction"]] = relationship(
        foreign_keys=[correction_transaction_id]
    )
    breakdowns: Mapped[list["AccountCheckupBreakdown"]] = relationship(
        back_populates="checkup",
        cascade="all, delete-orphan",
        order_by="AccountCheckupBreakdown.id",
    )


class AccountCheckupBreakdown(Base):
    """
    Per-payment-method amount entered during a checkup.

    `payment_method_id IS NULL` represents the residual "Sundry coin" bucket —
    cash on hand or any sums that don't fit a defined payment method.

    `payment_method_name_snapshot` captures the display label at checkup time
    so renames or deletions of a PaymentMethod don't garble historical rows.
    """

    __tablename__ = "account_checkup_breakdowns"

    id: Mapped[int] = mapped_column(primary_key=True)
    checkup_id: Mapped[int] = mapped_column(
        ForeignKey("account_checkups.id", ondelete="CASCADE"), nullable=False
    )
    payment_method_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("payment_methods.id", ondelete="SET NULL"), nullable=True
    )
    payment_method_name_snapshot: Mapped[str] = mapped_column(
        String(50), nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    checkup: Mapped["AccountCheckup"] = relationship(back_populates="breakdowns")
    payment_method: Mapped[Optional["PaymentMethod"]] = relationship(
        foreign_keys=[payment_method_id]
    )
