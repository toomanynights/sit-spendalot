from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.excluded_day import ExcludedDay
from app.models.settings import Settings
from app.models.transaction import Transaction
from app.schemas.stats import SpendingTodayResponse, TodayStatsResponse
from app.services import forecast_service


def _sum_type(db: Session, account_id: int, today: date, transaction_type: str) -> Decimal:
    result = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.account_id == account_id,
        Transaction.transaction_date == today,
        Transaction.deleted_at.is_(None),
        Transaction.type == transaction_type,
    ).scalar()
    return Decimal(str(result))


def get_today_stats(db: Session, *, account_id: Optional[int] = None) -> TodayStatsResponse:
    today = date.today()

    # Reuse forecast_service for actual + predicted balance (horizon=1 is enough for today)
    forecast_data = forecast_service.get_forecast(db, account_id=account_id, horizon_days=1)
    resolved_account_id = forecast_data.account_id

    # Day 0 of the forecast IS today's predicted balance
    predicted_balance = forecast_data.forecast[0].predicted_balance

    spending = SpendingTodayResponse(
        daily=_sum_type(db, resolved_account_id, today, "daily"),
        unplanned=_sum_type(db, resolved_account_id, today, "unplanned"),
        predicted=_sum_type(db, resolved_account_id, today, "predicted"),
    )

    today_excluded = (
        db.query(ExcludedDay)
        .filter(ExcludedDay.excluded_date == today)
        .first()
    ) is not None

    settings_row = db.query(Settings).filter(Settings.id == 1).first()
    rolling_average_days = settings_row.rolling_average_days if settings_row else 30
    prediction_horizon_days = settings_row.prediction_horizon_days if settings_row else 90
    daily_high_threshold = settings_row.daily_high_threshold if settings_row else 110
    daily_low_threshold = settings_row.daily_low_threshold if settings_row else 90

    return TodayStatsResponse(
        account_id=resolved_account_id,
        actual_balance=forecast_data.actual_balance,
        predicted_balance=predicted_balance,
        spending_today=spending,
        today_excluded=today_excluded,
        rolling_avg_daily_spend=forecast_data.rolling_avg_daily_spend,
        rolling_average_days=rolling_average_days,
        prediction_horizon_days=prediction_horizon_days,
        daily_high_threshold=daily_high_threshold,
        daily_low_threshold=daily_low_threshold,
    )
