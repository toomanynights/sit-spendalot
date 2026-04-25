from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.prediction import (
    ForecastResponse,
    PerilsResponse,
    PredictionInstanceConfirm,
    PredictionInstanceResponse,
    PredictionTemplateCreate,
    PredictionTemplateResponse,
    PredictionTemplateUpdate,
)
from app.services.auth_service import require_auth
from app.services import forecast_service, prediction_instance_service, prediction_template_service

router = APIRouter(
    prefix="/api/predictions",
    tags=["predictions"],
    dependencies=[Depends(require_auth)],
)


# ------------------------------------------------------------------ #
# Forecast endpoints                                                   #
# NOTE: declared before /{template_id} so FastAPI doesn't treat the   #
# literal strings "forecast" and "lowest" as integer path params.     #
# ------------------------------------------------------------------ #


@router.get("/forecast", response_model=ForecastResponse)
def get_forecast(
    account_id: Optional[int] = Query(None, description="Defaults to primary account"),
    days: Optional[int] = Query(None, ge=1, le=365, description="Forecast horizon; defaults to settings value"),
    db: Session = Depends(get_db),
):
    return forecast_service.get_forecast(db, account_id=account_id, horizon_days=days)


@router.get("/lowest", response_model=PerilsResponse)
def get_lowest_perils(
    account_id: Optional[int] = Query(None, description="Defaults to primary account"),
    count: int = Query(2, ge=1, le=10, description="Number of sequential peril points to return"),
    db: Session = Depends(get_db),
):
    return forecast_service.get_lowest_perils(db, account_id=account_id, count=count)


# ------------------------------------------------------------------ #
# Instance list / confirm / skip                                       #
# NOTE: declared before /{template_id} for the same routing reason.   #
# ------------------------------------------------------------------ #


@router.get("/instances", response_model=list[PredictionInstanceResponse])
def list_instances(
    account_id: Optional[int] = Query(None),
    template_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None, description="pending | confirmed | skipped"),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    next_per_template: bool = Query(
        False,
        description="Return only the earliest pending instance per template (one per template, sorted by date)",
    ),
    db: Session = Depends(get_db),
):
    return prediction_instance_service.get_instances(
        db,
        account_id=account_id,
        template_id=template_id,
        status=status,
        date_from=date_from,
        date_to=date_to,
        next_per_template=next_per_template,
    )


@router.post("/instances/{instance_id}/confirm", response_model=PredictionInstanceResponse)
def confirm_instance(
    instance_id: int,
    data: PredictionInstanceConfirm,
    db: Session = Depends(get_db),
):
    return prediction_instance_service.confirm_instance(db, instance_id, data)


@router.post("/instances/{instance_id}/skip", response_model=PredictionInstanceResponse)
def skip_instance(instance_id: int, db: Session = Depends(get_db)):
    return prediction_instance_service.skip_instance(db, instance_id)


# ------------------------------------------------------------------ #
# Template CRUD                                                        #
# ------------------------------------------------------------------ #


@router.get("", response_model=list[PredictionTemplateResponse])
def list_templates(
    account_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    return prediction_template_service.get_templates(db, account_id=account_id)


@router.post("", response_model=PredictionTemplateResponse, status_code=201)
def create_template(data: PredictionTemplateCreate, db: Session = Depends(get_db)):
    return prediction_template_service.create_template(db, data)


@router.get("/{template_id}", response_model=PredictionTemplateResponse)
def get_template(template_id: int, db: Session = Depends(get_db)):
    return prediction_template_service.get_template(db, template_id)


@router.patch("/{template_id}", response_model=PredictionTemplateResponse)
def update_template(
    template_id: int, data: PredictionTemplateUpdate, db: Session = Depends(get_db)
):
    return prediction_template_service.update_template(db, template_id, data)


@router.delete("/{template_id}", status_code=204)
def delete_template(template_id: int, db: Session = Depends(get_db)):
    prediction_template_service.delete_template(db, template_id)


# ------------------------------------------------------------------ #
# Pause / Resume                                                       #
# ------------------------------------------------------------------ #


@router.post("/{template_id}/pause", response_model=PredictionTemplateResponse)
def pause_template(template_id: int, db: Session = Depends(get_db)):
    return prediction_template_service.pause_template(db, template_id)


@router.post("/{template_id}/resume", response_model=PredictionTemplateResponse)
def resume_template(template_id: int, db: Session = Depends(get_db)):
    return prediction_template_service.resume_template(db, template_id)
