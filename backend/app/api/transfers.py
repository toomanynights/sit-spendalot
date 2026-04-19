from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.transfer import TransferCreate, TransferResponse
from app.services import transfer_service

router = APIRouter(prefix="/api/transfers", tags=["transfers"])


@router.post("", response_model=TransferResponse, status_code=201)
def create_transfer(data: TransferCreate, db: Session = Depends(get_db)):
    return transfer_service.create_transfer(db, data)


@router.get("", response_model=list[TransferResponse])
def list_transfers(db: Session = Depends(get_db)):
    return transfer_service.get_transfers(db)
