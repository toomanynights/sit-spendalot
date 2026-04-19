from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.payment_method import PaymentMethod
from app.models.transaction import Transaction
from app.schemas.payment_method import (
    PaymentMethodCreate,
    PaymentMethodResponse,
    PaymentMethodUpdate,
)

_DEFAULTS = ["Card", "Cash"]


# ------------------------------------------------------------------ #
# Internal helpers                                                     #
# ------------------------------------------------------------------ #


def _get_or_404(db: Session, method_id: int) -> PaymentMethod:
    pm = db.get(PaymentMethod, method_id)
    if not pm:
        raise HTTPException(status_code=404, detail="Payment method not found.")
    return pm


def _assert_name_unique(db: Session, name: str, exclude_id: int | None = None) -> None:
    q = db.query(PaymentMethod).filter(
        func.lower(PaymentMethod.name) == name.strip().lower()
    )
    if exclude_id is not None:
        q = q.filter(PaymentMethod.id != exclude_id)
    if q.first():
        raise HTTPException(
            status_code=409,
            detail=f"A payment method named '{name}' already exists.",
        )


# ------------------------------------------------------------------ #
# Seeding                                                              #
# ------------------------------------------------------------------ #


def ensure_defaults(db: Session) -> None:
    """Create Card and Cash if they don't already exist. Safe to call repeatedly."""
    for name in _DEFAULTS:
        exists = db.scalar(
            select(PaymentMethod).where(
                func.lower(PaymentMethod.name) == name.lower()
            )
        )
        if not exists:
            db.add(PaymentMethod(name=name))
    db.commit()


# ------------------------------------------------------------------ #
# Public service functions                                             #
# ------------------------------------------------------------------ #


def get_payment_methods(db: Session) -> list[PaymentMethodResponse]:
    methods = db.query(PaymentMethod).order_by(PaymentMethod.name).all()
    count_rows = db.execute(
        select(Transaction.payment_method_id, func.count())
        .where(
            Transaction.payment_method_id.is_not(None),
            Transaction.deleted_at.is_(None),
        )
        .group_by(Transaction.payment_method_id)
    ).all()
    counts = {int(row[0]): int(row[1]) for row in count_rows}
    return [
        PaymentMethodResponse(
            id=m.id,
            name=m.name,
            created_at=m.created_at,
            transaction_count=counts.get(m.id, 0),
        )
        for m in methods
    ]


def create_payment_method(
    db: Session, data: PaymentMethodCreate
) -> PaymentMethodResponse:
    _assert_name_unique(db, data.name)
    pm = PaymentMethod(name=data.name.strip())
    db.add(pm)
    db.commit()
    db.refresh(pm)
    return PaymentMethodResponse.model_validate(pm)


def update_payment_method(
    db: Session, method_id: int, data: PaymentMethodUpdate
) -> PaymentMethodResponse:
    pm = _get_or_404(db, method_id)
    _assert_name_unique(db, data.name, exclude_id=method_id)
    pm.name = data.name.strip()
    db.commit()
    db.refresh(pm)
    return PaymentMethodResponse.model_validate(pm)


def delete_payment_method(db: Session, method_id: int) -> None:
    pm = _get_or_404(db, method_id)

    tx_count = db.scalar(
        select(func.count())
        .select_from(Transaction)
        .where(
            Transaction.payment_method_id == method_id,
            Transaction.deleted_at.is_(None),
        )
    )
    if tx_count:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Cannot delete: '{pm.name}' is used by {tx_count} transaction(s). "
                "Reassign them first."
            ),
        )

    db.delete(pm)
    db.commit()
