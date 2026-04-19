from decimal import Decimal

from pydantic import BaseModel


class SpendingTodayResponse(BaseModel):
    # Net sum of today's transactions by type (positive = expense, negative = income/refund)
    daily: Decimal
    unplanned: Decimal
    predicted: Decimal


class TodayStatsResponse(BaseModel):
    account_id: int
    actual_balance: Decimal
    predicted_balance: Decimal
    spending_today: SpendingTodayResponse
    today_excluded: bool
    rolling_avg_daily_spend: Decimal
    # Mirrors Settings row for dashboard copy and threshold styling (no extra round-trip).
    rolling_average_days: int = 30
    prediction_horizon_days: int = 90
    daily_high_threshold: int = 110
    daily_low_threshold: int = 90
