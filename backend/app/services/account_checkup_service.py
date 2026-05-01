from datetime import date
from decimal import Decimal
from typing import Optional

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.account_checkup import AccountCheckup, AccountCheckupBreakdown
from app.models.payment_method import PaymentMethod
from app.models.transaction import Transaction
from app.schemas.account_checkup import (
    CheckupBreakdownResponse,
    CheckupCreate,
    CheckupResponse,
)

SUNDRY_COIN_LABEL = "Sundry coin"


def _get_account_or_404(db: Session, account_id: int) -> Account:
    account = db.get(Account, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


def _compute_ledger_balance(db: Session, account: Account) -> Decimal:
    """Mirror of account_service._compute_balance — kept local to avoid
    cross-service imports tightening the call graph."""
    total = db.scalar(
        select(func.coalesce(func.sum(Transaction.amount), Decimal("0"))).where(
            Transaction.account_id == account.id,
            Transaction.deleted_at.is_(None),
        )
    )
    return account.initial_balance - (total or Decimal("0"))


def _to_response(checkup: AccountCheckup) -> CheckupResponse:
    return CheckupResponse.model_validate(
        {
            "id": checkup.id,
            "account_id": checkup.account_id,
            "checkup_date": checkup.checkup_date,
            "ledger_balance": checkup.ledger_balance,
            "reported_balance": checkup.reported_balance,
            "correction_amount": checkup.ledger_balance - checkup.reported_balance,
            "correction_transaction_id": checkup.correction_transaction_id,
            "note": checkup.note,
            "created_at": checkup.created_at,
            "breakdowns": [
                CheckupBreakdownResponse.model_validate(b) for b in checkup.breakdowns
            ],
        }
    )


def list_checkups(db: Session, account_id: int) -> list[CheckupResponse]:
    _get_account_or_404(db, account_id)
    rows = (
        db.query(AccountCheckup)
        .filter(AccountCheckup.account_id == account_id)
        .order_by(AccountCheckup.created_at.desc(), AccountCheckup.id.desc())
        .all()
    )
    return [_to_response(r) for r in rows]


def get_last_checkup_info(
    db: Session, account_id: int
) -> tuple[Optional[date], Optional[int]]:
    """Returns (last_checkup_date, days_since_last_checkup) for the account.

    If the account has never been reconciled, both are None — the dashboard
    treats null as "overdue" against any configured threshold.
    """
    last_date: Optional[date] = db.scalar(
        select(func.max(AccountCheckup.checkup_date)).where(
            AccountCheckup.account_id == account_id
        )
    )
    if last_date is None:
        return None, None
    return last_date, (date.today() - last_date).days


def create_checkup(
    db: Session, account_id: int, data: CheckupCreate
) -> CheckupResponse:
    account = _get_account_or_404(db, account_id)

    pm_lookup: dict[int, PaymentMethod] = {
        pm.id: pm for pm in db.query(PaymentMethod).all()
    }

    reported_balance = Decimal("0")
    breakdown_rows: list[AccountCheckupBreakdown] = []
    seen_pm_ids: set[Optional[int]] = set()

    for entry in data.breakdowns:
        if entry.payment_method_id in seen_pm_ids:
            raise HTTPException(
                status_code=422,
                detail="Duplicate payment_method_id in breakdowns; submit one row per method.",
            )
        seen_pm_ids.add(entry.payment_method_id)

        if entry.payment_method_id is None:
            snapshot_name = SUNDRY_COIN_LABEL
        else:
            pm = pm_lookup.get(entry.payment_method_id)
            if not pm:
                raise HTTPException(
                    status_code=422,
                    detail=f"Payment method {entry.payment_method_id} not found.",
                )
            snapshot_name = pm.name

        amount = Decimal(entry.amount)
        reported_balance += amount

        breakdown_rows.append(
            AccountCheckupBreakdown(
                payment_method_id=entry.payment_method_id,
                payment_method_name_snapshot=snapshot_name,
                amount=amount,
            )
        )

    ledger_balance = _compute_ledger_balance(db, account)
    correction_amount = ledger_balance - reported_balance
    today = date.today()

    correction_tx_id: Optional[int] = None
    if correction_amount != 0:
        descriptor = (data.note or "").strip() or "Reconciliation"
        correction_tx = Transaction(
            account_id=account_id,
            amount=correction_amount,
            transaction_date=today,
            type="correction",
            description=f"Checkup: {descriptor}",
            confirmed=True,
        )
        db.add(correction_tx)
        db.flush()  # populate id
        correction_tx_id = correction_tx.id

    checkup = AccountCheckup(
        account_id=account_id,
        checkup_date=today,
        ledger_balance=ledger_balance,
        reported_balance=reported_balance,
        correction_transaction_id=correction_tx_id,
        note=(data.note or "").strip() or None,
    )
    for row in breakdown_rows:
        checkup.breakdowns.append(row)

    db.add(checkup)
    db.commit()
    db.refresh(checkup)
    return _to_response(checkup)
