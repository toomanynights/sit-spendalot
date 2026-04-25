from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.account import (
    AccountCreate,
    AccountResponse,
    AccountUpdate,
    BalanceCorrectionCreate,
)
from app.services.auth_service import require_auth
from app.services import account_service

router = APIRouter(
    prefix="/api/accounts",
    tags=["accounts"],
    dependencies=[Depends(require_auth)],
)


@router.get("", response_model=list[AccountResponse])
def list_accounts(db: Session = Depends(get_db)):
    return account_service.get_accounts(db)


@router.post("", response_model=AccountResponse, status_code=201)
def create_account(data: AccountCreate, db: Session = Depends(get_db)):
    return account_service.create_account(db, data)


@router.get("/{account_id}", response_model=AccountResponse)
def get_account(account_id: int, db: Session = Depends(get_db)):
    return account_service.get_account(db, account_id)


@router.patch("/{account_id}", response_model=AccountResponse)
def update_account(
    account_id: int, data: AccountUpdate, db: Session = Depends(get_db)
):
    return account_service.update_account(db, account_id, data)


@router.delete("/{account_id}", status_code=204)
def delete_account(account_id: int, db: Session = Depends(get_db)):
    account_service.delete_account(db, account_id)


@router.post("/{account_id}/balance-correction", response_model=AccountResponse)
def balance_correction(
    account_id: int,
    data: BalanceCorrectionCreate,
    db: Session = Depends(get_db),
):
    return account_service.apply_balance_correction(db, account_id, data)
