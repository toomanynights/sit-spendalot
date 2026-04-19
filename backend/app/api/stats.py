from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.stats import TodayStatsResponse
from app.services import stats_service

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/today", response_model=TodayStatsResponse)
def get_today_stats(
    account_id: Optional[int] = Query(None, description="Defaults to primary account"),
    db: Session = Depends(get_db),
):
    return stats_service.get_today_stats(db, account_id=account_id)
