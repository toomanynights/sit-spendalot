from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.excluded_day import ExcludedDayCreate, ExcludedDayResponse
from app.services.auth_service import require_auth
from app.services import excluded_day_service

router = APIRouter(
    prefix="/api/excluded-days",
    tags=["excluded-days"],
    dependencies=[Depends(require_auth)],
)


@router.get("", response_model=list[ExcludedDayResponse])
def list_excluded_days(db: Session = Depends(get_db)):
    return excluded_day_service.get_excluded_days(db)


@router.post("", response_model=ExcludedDayResponse, status_code=201)
def create_excluded_day(data: ExcludedDayCreate, db: Session = Depends(get_db)):
    return excluded_day_service.create_excluded_day(db, data)


@router.delete("/{excluded_date}", status_code=204)
def delete_excluded_day(excluded_date: date, db: Session = Depends(get_db)):
    excluded_day_service.delete_excluded_day(db, excluded_date)
