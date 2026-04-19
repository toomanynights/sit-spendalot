from fastapi import HTTPException
from collections import defaultdict

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate


def _get_or_404(db: Session, category_id: int) -> Category:
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


def get_categories(db: Session) -> list[CategoryResponse]:
    categories = (
        db.query(Category)
        .order_by(Category.type, Category.parent_id.nulls_first(), Category.name)
        .all()
    )
    return [CategoryResponse.model_validate(c) for c in categories]


def get_subcategory_usage_by_parent(db: Session) -> dict[str, list[str]]:
    """
    Maps top-level category id (string key for JSON) to distinct subcategory
    strings from non-deleted transactions whose category is that parent or one
    of its direct children.
    """
    categories = {c.id: c for c in db.query(Category).all()}

    def top_parent_id(category_id: int) -> int | None:
        c = categories.get(category_id)
        if not c:
            return None
        if c.parent_id is None:
            return c.id
        p = categories.get(c.parent_id)
        if not p:
            return c.parent_id
        return p.id

    rows = db.execute(
        select(Transaction.category_id, Transaction.subcategory).where(
            Transaction.category_id.is_not(None),
            Transaction.subcategory.is_not(None),
            Transaction.subcategory != "",
            Transaction.deleted_at.is_(None),
        ).distinct()
    ).all()

    buckets: dict[int, set[str]] = defaultdict(set)
    for cat_id, sub in rows:
        root = top_parent_id(int(cat_id))
        if root is None:
            continue
        s = (sub or "").strip()
        if s:
            buckets[root].add(s)
    return {str(k): sorted(v) for k, v in buckets.items()}


def get_category(db: Session, category_id: int) -> CategoryResponse:
    return CategoryResponse.model_validate(_get_or_404(db, category_id))


def create_category(db: Session, data: CategoryCreate) -> CategoryResponse:
    if data.parent_id is not None:
        parent = db.get(Category, data.parent_id)
        if not parent:
            raise HTTPException(
                status_code=422,
                detail=f"Parent category {data.parent_id} not found.",
            )
        if parent.parent_id is not None:
            raise HTTPException(
                status_code=422,
                detail="Categories support only one level of nesting. The chosen parent is itself a subcategory.",
            )

    category = Category(
        name=data.name,
        type=data.type,
        parent_id=data.parent_id,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return CategoryResponse.model_validate(category)


def update_category(
    db: Session, category_id: int, data: CategoryUpdate
) -> CategoryResponse:
    category = _get_or_404(db, category_id)

    if data.parent_id is not None:
        if data.parent_id == category_id:
            raise HTTPException(
                status_code=422,
                detail="A category cannot be its own parent.",
            )
        parent = db.get(Category, data.parent_id)
        if not parent:
            raise HTTPException(
                status_code=422,
                detail=f"Parent category {data.parent_id} not found.",
            )
        if parent.parent_id is not None:
            raise HTTPException(
                status_code=422,
                detail="Categories support only one level of nesting. The chosen parent is itself a subcategory.",
            )
        child_count = db.scalar(
            select(func.count())
            .select_from(Category)
            .where(Category.parent_id == category_id)
        )
        if child_count:
            raise HTTPException(
                status_code=422,
                detail=f"Cannot make a parent category into a subcategory while it still has {child_count} child(ren).",
            )

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(category, key, value)

    db.commit()
    db.refresh(category)
    return CategoryResponse.model_validate(category)


def delete_category(db: Session, category_id: int) -> None:
    category = _get_or_404(db, category_id)

    child_count = db.scalar(
        select(func.count())
        .select_from(Category)
        .where(Category.parent_id == category_id)
    )
    if child_count:
        raise HTTPException(
            status_code=422,
            detail=f"Cannot delete: category has {child_count} subcategory(ies). Remove them first.",
        )

    tx_count = db.scalar(
        select(func.count())
        .select_from(Transaction)
        .where(
            Transaction.category_id == category_id,
            Transaction.deleted_at.is_(None),
        )
    )
    if tx_count:
        raise HTTPException(
            status_code=422,
            detail=f"Cannot delete: category is used by {tx_count} transaction(s). Reassign them first.",
        )

    db.delete(category)
    db.commit()
