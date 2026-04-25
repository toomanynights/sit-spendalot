from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.services.auth_service import require_auth
from app.services import category_service

router = APIRouter(
    prefix="/api/categories",
    tags=["categories"],
    dependencies=[Depends(require_auth)],
)


# NOTE: static paths must be declared before /{category_id}
@router.get("/subcategory-usage", response_model=dict[str, list[str]])
def subcategory_usage(db: Session = Depends(get_db)):
    return category_service.get_subcategory_usage_by_parent(db)


@router.get("", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return category_service.get_categories(db)


@router.post("", response_model=CategoryResponse, status_code=201)
def create_category(data: CategoryCreate, db: Session = Depends(get_db)):
    return category_service.create_category(db, data)


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    return category_service.get_category(db, category_id)


@router.patch("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int, data: CategoryUpdate, db: Session = Depends(get_db)
):
    return category_service.update_category(db, category_id, data)


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category_service.delete_category(db, category_id)
