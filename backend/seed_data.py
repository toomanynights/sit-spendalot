"""
Seed data script for Sir Spendalot.

Creates:
- 3 sample accounts (Royal Treasury as primary, Dragon Hoard, Coin Purse)
- Top-level categories with subcategories
- A handful of sample transactions spread over the last 7 days
- The settings row (primary_account_id = Royal Treasury)
- A couple of prediction templates

Run from backend/ with the venv active:
    python seed_data.py

Safe to re-run: checks for existing data before inserting.
"""

import sys
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

sys.path.insert(0, ".")

from app.database import SessionLocal, engine
from app.models import (  # noqa: E402
    Account,
    Category,
    PaymentMethod,
    PredictionInstance,
    PredictionTemplate,
    Settings,
    Transaction,
)


def seed(db: Session) -> None:
    # ------------------------------------------------------------------ #
    # Accounts                                                             #
    # ------------------------------------------------------------------ #
    existing_accounts = db.query(Account).count()
    if existing_accounts:
        print(f"⚠️  Accounts already exist ({existing_accounts} found). Skipping seed.")
        return

    print("🗡️  Seeding Sir Spendalot's treasury...")

    royal_treasury = Account(
        name="Royal Treasury",
        account_type="current",
        is_primary=True,
        initial_balance=Decimal("3500.00"),
    )
    dragon_hoard = Account(
        name="Dragon Hoard",
        account_type="savings",
        is_primary=False,
        initial_balance=Decimal("12000.00"),
    )
    coin_purse = Account(
        name="Coin Purse",
        account_type="savings",
        is_primary=False,
        initial_balance=Decimal("500.00"),
    )
    db.add_all([royal_treasury, dragon_hoard, coin_purse])
    db.flush()

    print(f"  ✅ Accounts created: {royal_treasury.name}, {dragon_hoard.name}, {coin_purse.name}")

    # ------------------------------------------------------------------ #
    # Payment methods                                                      #
    # ------------------------------------------------------------------ #
    card = PaymentMethod(name="Card")
    cash = PaymentMethod(name="Cash")
    db.add_all([card, cash])
    db.flush()

    print("  ✅ Payment methods seeded: Card, Cash")

    # ------------------------------------------------------------------ #
    # Categories (transaction domain only)                                 #
    # ------------------------------------------------------------------ #
    # Top-level
    food = Category(name="Food & Drink", type="daily")
    transport = Category(name="Transportation", type="daily")
    housing = Category(name="Housing", type="daily")
    health = Category(name="Health", type="daily")
    unplanned_cat = Category(name="Unplanned", type="unplanned")
    db.add_all([food, transport, housing, health, unplanned_cat])
    db.flush()

    # Subcategories
    groceries = Category(name="Groceries", type="daily", parent_id=food.id)
    dining = Category(name="Dining Out", type="daily", parent_id=food.id)
    fuel = Category(name="Fuel", type="daily", parent_id=transport.id)
    public_transit = Category(name="Public Transit", type="daily", parent_id=transport.id)
    rent = Category(name="Rent", type="daily", parent_id=housing.id)
    utilities = Category(name="Utilities", type="daily", parent_id=housing.id)
    pharmacy = Category(name="Pharmacy", type="unplanned", parent_id=unplanned_cat.id)
    db.add_all([groceries, dining, fuel, public_transit, rent, utilities, pharmacy])
    db.flush()

    print("  ✅ Categories seeded (7 top-level + subcategories)")

    # ------------------------------------------------------------------ #
    # Transactions (last 7 days)                                           #
    # ------------------------------------------------------------------ #
    today = date.today()

    transactions = [
        Transaction(
            account_id=royal_treasury.id,
            category_id=groceries.id,
            subcategory="Weekly shop",
            amount=Decimal("68.40"),
            transaction_date=today - timedelta(days=6),
            type="daily",
            description="Aldgate Market — weekly provisions",
            payment_method_id=card.id,
            confirmed=True,
        ),
        Transaction(
            account_id=royal_treasury.id,
            category_id=fuel.id,
            amount=Decimal("55.00"),
            transaction_date=today - timedelta(days=5),
            type="daily",
            description="Stable refuelling",
            payment_method_id=card.id,
            confirmed=True,
        ),
        Transaction(
            account_id=royal_treasury.id,
            category_id=dining.id,
            subcategory="Lunch",
            amount=Decimal("18.50"),
            transaction_date=today - timedelta(days=4),
            type="daily",
            description="The Gilded Boar tavern",
            payment_method_id=cash.id,
            confirmed=True,
        ),
        Transaction(
            account_id=royal_treasury.id,
            category_id=public_transit.id,
            amount=Decimal("12.00"),
            transaction_date=today - timedelta(days=3),
            type="daily",
            description="Royal carriage pass",
            payment_method_id=card.id,
            confirmed=True,
        ),
        Transaction(
            account_id=royal_treasury.id,
            category_id=pharmacy.id,
            amount=Decimal("23.75"),
            transaction_date=today - timedelta(days=2),
            type="unplanned",
            description="Apothecary — potion of wellness",
            payment_method_id=card.id,
            confirmed=True,
        ),
        Transaction(
            account_id=royal_treasury.id,
            category_id=groceries.id,
            subcategory="Top-up",
            amount=Decimal("14.90"),
            transaction_date=today - timedelta(days=1),
            type="daily",
            description="Corner market top-up",
            payment_method_id=cash.id,
            confirmed=True,
        ),
        Transaction(
            account_id=royal_treasury.id,
            category_id=dining.id,
            subcategory="Coffee",
            amount=Decimal("4.80"),
            transaction_date=today,
            type="daily",
            description="Morning brew",
            payment_method_id=cash.id,
            confirmed=True,
        ),
    ]
    db.add_all(transactions)
    db.flush()

    print(f"  ✅ {len(transactions)} sample transactions created")

    # ------------------------------------------------------------------ #
    # Prediction templates                                                 #
    # ------------------------------------------------------------------ #
    rent_template = PredictionTemplate(
        name="Rent",
        account_id=royal_treasury.id,
        amount=Decimal("950.00"),
        frequency="monthly",
        day_of_month=1,
        start_date=date(today.year, today.month, 1),
        paused=False,
    )
    salary_template = PredictionTemplate(
        name="Payslip",
        account_id=royal_treasury.id,
        amount=Decimal("-2400.00"),  # negative = income (credit)
        frequency="monthly",
        day_of_month=25,
        start_date=date(today.year, today.month, 25),
        paused=False,
    )
    db.add_all([rent_template, salary_template])
    db.flush()

    print("  ✅ 2 prediction templates created (Rent, Payslip)")

    # ------------------------------------------------------------------ #
    # Settings row                                                         #
    # ------------------------------------------------------------------ #
    settings_row = Settings(
        prediction_horizon_days=90,
        rolling_average_days=30,
        primary_account_id=royal_treasury.id,
    )
    db.add(settings_row)

    db.commit()
    print("\n🎉 Seed complete! Royal Treasury is marked as primary account.")
    print(f"   Royal Treasury balance starts at £{royal_treasury.initial_balance:,.2f}")
    print(f"   Dragon Hoard balance starts at £{dragon_hoard.initial_balance:,.2f}")


def main() -> None:
    db = SessionLocal()
    try:
        seed(db)
    except Exception as exc:
        db.rollback()
        print(f"\n❌ Seed failed: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
