from datetime import date

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.excluded_day import ExcludedDay
from app.schemas.excluded_day import ExcludedDayCreate, ExcludedDayResponse


def get_excluded_days(db: Session) -> list[ExcludedDayResponse]:
    rows = db.query(ExcludedDay).order_by(ExcludedDay.excluded_date.desc()).all()
    return [ExcludedDayResponse.model_validate(r) for r in rows]


def create_excluded_day(db: Session, data: ExcludedDayCreate) -> ExcludedDayResponse:
    existing = (
        db.query(ExcludedDay)
        .filter(ExcludedDay.excluded_date == data.excluded_date)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"{data.excluded_date} is already excluded.",
        )

    row = ExcludedDay(excluded_date=data.excluded_date, reason=data.reason)
    db.add(row)
    db.commit()
    db.refresh(row)
    return ExcludedDayResponse.model_validate(row)


def delete_excluded_day(db: Session, excluded_date: date) -> None:
    row = (
        db.query(ExcludedDay)
        .filter(ExcludedDay.excluded_date == excluded_date)
        .first()
    )
    if not row:
        raise HTTPException(
            status_code=404,
            detail=f"{excluded_date} is not in the excluded days list.",
        )
    db.delete(row)
    db.commit()
