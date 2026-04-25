from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.payment_method import (
    PaymentMethodCreate,
    PaymentMethodResponse,
    PaymentMethodUpdate,
)
from app.services.auth_service import require_auth
from app.services import payment_method_service

router = APIRouter(
    prefix="/api/payment-methods",
    tags=["payment-methods"],
    dependencies=[Depends(require_auth)],
)


@router.get("", response_model=list[PaymentMethodResponse])
def list_payment_methods(db: Session = Depends(get_db)):
    return payment_method_service.get_payment_methods(db)


@router.post("", response_model=PaymentMethodResponse, status_code=201)
def create_payment_method(data: PaymentMethodCreate, db: Session = Depends(get_db)):
    return payment_method_service.create_payment_method(db, data)


@router.patch("/{method_id}", response_model=PaymentMethodResponse)
def update_payment_method(
    method_id: int, data: PaymentMethodUpdate, db: Session = Depends(get_db)
):
    return payment_method_service.update_payment_method(db, method_id, data)


@router.delete("/{method_id}", status_code=204)
def delete_payment_method(method_id: int, db: Session = Depends(get_db)):
    payment_method_service.delete_payment_method(db, method_id)
