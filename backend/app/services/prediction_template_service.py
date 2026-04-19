from datetime import date, datetime, timezone
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from app.models.account import Account
from app.models.prediction import PredictionInstance, PredictionTemplate
from app.schemas.prediction import (
    PredictionTemplateCreate,
    PredictionTemplateResponse,
    PredictionTemplateUpdate,
    PredictionType,
)
from app.services import prediction_instance_service


# ------------------------------------------------------------------ #
# Internal helpers                                                     #
# ------------------------------------------------------------------ #


def _get_or_404(db: Session, template_id: int) -> PredictionTemplate:
    template = db.get(PredictionTemplate, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Prediction template not found")
    return template


def _apply_sign(amount: Decimal, type: PredictionType) -> Decimal:
    """
    Convert user-facing (positive amount + type) to signed internal representation.
    expense → positive (reduces balance)
    income  → negative (increases balance)
    Matches the transaction amount convention.
    """
    return amount if type == PredictionType.expense else -amount


# ------------------------------------------------------------------ #
# Public service functions                                             #
# ------------------------------------------------------------------ #


def get_templates(
    db: Session,
    *,
    account_id: int | None = None,
) -> list[PredictionTemplateResponse]:
    q = db.query(PredictionTemplate).options(joinedload(PredictionTemplate.payment_method))
    if account_id is not None:
        q = q.filter(PredictionTemplate.account_id == account_id)
    templates = q.order_by(PredictionTemplate.id).all()
    return [PredictionTemplateResponse.model_validate(t) for t in templates]


def get_template(db: Session, template_id: int) -> PredictionTemplateResponse:
    return PredictionTemplateResponse.model_validate(_get_or_404(db, template_id))


def create_template(
    db: Session, data: PredictionTemplateCreate
) -> PredictionTemplateResponse:
    if not db.get(Account, data.account_id):
        raise HTTPException(
            status_code=422, detail=f"Account {data.account_id} not found."
        )

    template = PredictionTemplate(
        name=data.name,
        account_id=data.account_id,
        amount=_apply_sign(data.amount, data.type),
        frequency=data.frequency,
        interval=data.interval,
        day_of_month=data.day_of_month,
        start_date=data.start_date,
        payment_method_id=data.payment_method_id,
    )
    db.add(template)
    db.commit()
    db.refresh(template)

    prediction_instance_service.generate_instances_for_template(db, template.id)

    db.refresh(template)
    return PredictionTemplateResponse.model_validate(template)


def update_template(
    db: Session, template_id: int, data: PredictionTemplateUpdate
) -> PredictionTemplateResponse:
    template = _get_or_404(db, template_id)

    updates = data.model_dump(exclude_unset=True)

    if "account_id" in updates and not db.get(Account, updates["account_id"]):
        raise HTTPException(
            status_code=422, detail=f"Account {updates['account_id']} not found."
        )

    # amount and type arrive together (enforced by schema validator); convert to signed.
    if "amount" in updates and "type" in updates:
        raw_amount: Decimal = updates.pop("amount")
        raw_type: str = updates.pop("type")
        updates["amount"] = _apply_sign(
            raw_amount, PredictionType(raw_type)
        )
    else:
        updates.pop("amount", None)
        updates.pop("type", None)

    for key, value in updates.items():
        setattr(template, key, value)

    db.commit()
    db.refresh(template)

    # Purge future pending instances and regenerate so schedule changes take effect.
    prediction_instance_service.generate_instances_for_template(
        db, template.id, purge_pending=True
    )

    db.refresh(template)
    return PredictionTemplateResponse.model_validate(template)


def delete_template(db: Session, template_id: int) -> None:
    template = _get_or_404(db, template_id)
    # Cascade via SQLAlchemy relationship (all, delete-orphan) removes all instances.
    db.delete(template)
    db.commit()


def pause_template(db: Session, template_id: int) -> PredictionTemplateResponse:
    template = _get_or_404(db, template_id)

    if template.paused:
        raise HTTPException(
            status_code=409, detail="Template is already paused."
        )

    template.paused = True

    # Hard-delete all future pending instances so they don't linger in forecasts.
    today = date.today()
    future_pending = (
        db.query(PredictionInstance)
        .filter(
            PredictionInstance.template_id == template_id,
            PredictionInstance.status == "pending",
            PredictionInstance.scheduled_date >= today,
        )
        .all()
    )
    for instance in future_pending:
        db.delete(instance)

    db.commit()
    db.refresh(template)
    return PredictionTemplateResponse.model_validate(template)


def resume_template(db: Session, template_id: int) -> PredictionTemplateResponse:
    template = _get_or_404(db, template_id)

    if not template.paused:
        raise HTTPException(
            status_code=409, detail="Template is not paused."
        )

    template.paused = False
    db.commit()
    db.refresh(template)

    prediction_instance_service.generate_instances_for_template(db, template.id)

    db.refresh(template)
    return PredictionTemplateResponse.model_validate(template)
