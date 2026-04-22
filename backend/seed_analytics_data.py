"""
Seed richer demo data for Analytics page validation.

Creates:
- primary + secondary account
- payment methods
- category tree (daily + unplanned with children)
- settings row
- 8 months of varied transactions (daily/unplanned/predicted, incl. gains)
- prediction templates + one overdue pending instance

Run from backend/:
  python seed_analytics_data.py
"""

from __future__ import annotations

import math
import sys
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

sys.path.insert(0, ".")

from app.database import SessionLocal
from app.models import (
    Account,
    Category,
    PaymentMethod,
    PredictionInstance,
    PredictionTemplate,
    Settings,
    Transaction,
)


def _money(value: float) -> Decimal:
    return Decimal(f"{value:.2f}")


def seed(db: Session) -> None:
    if db.query(Account).count() > 0:
        print("⚠️  Accounts already exist; aborting analytics seed to avoid duplicates.")
        return

    today = date.today()
    start = today - timedelta(days=240)

    print("🗡️  Seeding analytics demo data...")

    # Accounts
    primary = Account(
        name="Royal Treasury",
        account_type="current",
        is_primary=True,
        initial_balance=Decimal("4500.00"),
    )
    savings = Account(
        name="Dragon Hoard",
        account_type="savings",
        is_primary=False,
        initial_balance=Decimal("12000.00"),
    )
    db.add_all([primary, savings])
    db.flush()

    # Payment methods
    card = PaymentMethod(name="Card")
    cash = PaymentMethod(name="Cash")
    bank = PaymentMethod(name="Bank Transfer")
    db.add_all([card, cash, bank])
    db.flush()

    # Categories
    daily_root = Category(name="Daily", type="daily")
    unplanned_root = Category(name="Unplanned", type="unplanned")
    db.add_all([daily_root, unplanned_root])
    db.flush()

    groceries = Category(name="Groceries", type="daily", parent_id=daily_root.id)
    transport = Category(name="Transportation", type="daily", parent_id=daily_root.id)
    dining = Category(name="Dining", type="daily", parent_id=daily_root.id)
    bills = Category(name="Bills", type="daily", parent_id=daily_root.id)
    health = Category(name="Health", type="unplanned", parent_id=unplanned_root.id)
    home = Category(name="Home Repairs", type="unplanned", parent_id=unplanned_root.id)
    travel = Category(name="Travel", type="unplanned", parent_id=unplanned_root.id)
    db.add_all([groceries, transport, dining, bills, health, home, travel])
    db.flush()

    # Settings (analytics-related knobs)
    db.add(
        Settings(
            prediction_horizon_days=90,
            rolling_average_days=30,
            daily_high_threshold=110,
            daily_low_threshold=90,
            show_decimals=True,
            show_predictive_non_primary=False,
            require_payment_method=False,
            require_subcategory=False,
            primary_account_id=primary.id,
        )
    )

    # Prediction templates
    rent_template = PredictionTemplate(
        name="Rent",
        account_id=primary.id,
        amount=Decimal("950.00"),
        frequency="monthly",
        day_of_month=1,
        start_date=date(today.year, today.month, 1),
        paused=False,
        payment_method_id=bank.id,
    )
    salary_template = PredictionTemplate(
        name="Payslip",
        account_id=primary.id,
        amount=Decimal("-2600.00"),  # negative = gain
        frequency="monthly",
        day_of_month=25,
        start_date=date(today.year, today.month, 25),
        paused=False,
        payment_method_id=bank.id,
    )
    db.add_all([rent_template, salary_template])
    db.flush()

    # One overdue pending prediction (for insights)
    db.add(
        PredictionInstance(
            template_id=rent_template.id,
            account_id=primary.id,
            amount=Decimal("950.00"),
            scheduled_date=today - timedelta(days=12),
            status="pending",
        )
    )

    txs: list[Transaction] = []
    day = start
    i = 0
    while day <= today:
        # Daily baseline spend; deterministic wave + weekday effect
        wave = 16 + (math.sin(i / 5) * 6) + ((day.weekday() in (4, 5)) * 7)

        # Groceries (frequent)
        txs.append(
            Transaction(
                account_id=primary.id,
                category_id=groceries.id,
                subcategory="General",
                amount=_money(max(6.5, wave)),
                transaction_date=day,
                type="daily",
                payment_method_id=card.id,
                description="Market run",
                confirmed=True,
            )
        )

        # Transportation (every 2nd day)
        if i % 2 == 0:
            txs.append(
                Transaction(
                    account_id=primary.id,
                    category_id=transport.id,
                    amount=_money(8 + (i % 7) * 0.9),
                    transaction_date=day,
                    type="daily",
                    payment_method_id=card.id,
                    description="Commuting",
                    confirmed=True,
                )
            )

        # Dining (every 3rd day)
        if i % 3 == 0:
            txs.append(
                Transaction(
                    account_id=primary.id,
                    category_id=dining.id,
                    amount=_money(11 + (i % 5) * 2.1),
                    transaction_date=day,
                    type="daily",
                    payment_method_id=cash.id,
                    description="Tavern meal",
                    confirmed=True,
                )
            )

        # Utility/bills chunk monthly-ish
        if day.day in (5, 12, 21):
            txs.append(
                Transaction(
                    account_id=primary.id,
                    category_id=bills.id,
                    amount=_money(34 + (day.day % 3) * 9),
                    transaction_date=day,
                    type="daily",
                    payment_method_id=bank.id,
                    description="Utilities",
                    confirmed=True,
                )
            )

        # Unplanned events
        if i % 11 == 0:
            txs.append(
                Transaction(
                    account_id=primary.id,
                    category_id=health.id,
                    amount=_money(28 + (i % 4) * 17),
                    transaction_date=day,
                    type="unplanned",
                    payment_method_id=card.id,
                    description="Apothecary",
                    confirmed=True,
                )
            )
        if i % 29 == 0:
            txs.append(
                Transaction(
                    account_id=primary.id,
                    category_id=home.id,
                    amount=_money(120 + (i % 3) * 65),
                    transaction_date=day,
                    type="unplanned",
                    payment_method_id=bank.id,
                    description="Repairs",
                    confirmed=True,
                )
            )

        # Scheduled/predicted monthly spend and gains
        if day.day == 1:
            txs.append(
                Transaction(
                    account_id=primary.id,
                    amount=Decimal("950.00"),
                    transaction_date=day,
                    type="predicted",
                    payment_method_id=bank.id,
                    description="Confirmed: Rent",
                    subcategory="In lieu of 1 Jan 2026" if day.month in (2, 5, 8, 11) else None,
                    confirmed=True,
                )
            )
        if day.day == 25:
            txs.append(
                Transaction(
                    account_id=primary.id,
                    amount=Decimal("-2600.00"),
                    transaction_date=day,
                    type="predicted",
                    payment_method_id=bank.id,
                    description="Confirmed: Payslip",
                    subcategory="In lieu of 25 Jan 2026" if day.month in (3, 6, 9, 12) else None,
                    confirmed=True,
                )
            )

        day += timedelta(days=1)
        i += 1

    # One explicit large unplanned purchase in current period
    txs.append(
        Transaction(
            account_id=primary.id,
            category_id=travel.id,
            amount=Decimal("389.00"),
            transaction_date=today - timedelta(days=14),
            type="unplanned",
            payment_method_id=card.id,
            description="Emergency flight",
            confirmed=True,
        )
    )

    # A few transactions for secondary account so account switcher has useful analytics there too.
    for delta, amt, kind, cat_id, note in [
        (26, Decimal("22.40"), "daily", groceries.id, "Savings groceries"),
        (19, Decimal("41.00"), "daily", transport.id, "Fuel top-up"),
        (14, Decimal("78.00"), "unplanned", home.id, "Locker maintenance"),
        (8, Decimal("-120.00"), "predicted", None, "Confirmed: Savings Interest"),
        (3, Decimal("18.20"), "daily", dining.id, "Snack run"),
    ]:
        txs.append(
            Transaction(
                account_id=savings.id,
                category_id=cat_id,
                amount=amt,
                transaction_date=today - timedelta(days=delta),
                type=kind,
                payment_method_id=card.id if kind != "predicted" else bank.id,
                description=note,
                subcategory=("In lieu of 1 Feb 2026" if kind == "predicted" else None),
                confirmed=True,
            )
        )

    db.add_all(txs)
    db.commit()
    print(f"✅ Seeded {len(txs)} transactions across ~8 months.")
    print("✅ Analytics demo dataset ready.")


def main() -> None:
    db = SessionLocal()
    try:
        seed(db)
    except Exception as exc:
        db.rollback()
        print(f"❌ Analytics seed failed: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
