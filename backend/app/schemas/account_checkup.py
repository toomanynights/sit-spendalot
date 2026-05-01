from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CheckupBreakdownInput(BaseModel):
    """One per-payment-method line in a submitted checkup.

    `payment_method_id IS NULL` is the residual "Sundry coin" bucket.
    `amount` may be 0 — empty lines are simply not counted.
    """

    payment_method_id: Optional[int] = None
    amount: Decimal = Field(..., decimal_places=2)


class CheckupCreate(BaseModel):
    breakdowns: list[CheckupBreakdownInput] = Field(default_factory=list)
    note: Optional[str] = Field(None, max_length=255)


class CheckupBreakdownResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    payment_method_id: Optional[int]
    payment_method_name_snapshot: str
    amount: Decimal


class CheckupResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    account_id: int
    checkup_date: date
    ledger_balance: Decimal
    reported_balance: Decimal
    correction_amount: Decimal  # ledger - reported (computed)
    correction_transaction_id: Optional[int]
    note: Optional[str]
    created_at: datetime
    breakdowns: list[CheckupBreakdownResponse]
