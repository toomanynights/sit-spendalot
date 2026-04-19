"""Expand settings for Phase 6.4.

Revision ID: e3a1c4b9d2f0
Revises: 12e4ec427e0a
Create Date: 2026-04-18 00:00:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "e3a1c4b9d2f0"
down_revision: Union[str, None] = "12e4ec427e0a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "settings",
        sa.Column("daily_high_threshold", sa.Integer(), nullable=False, server_default="110"),
    )
    op.add_column(
        "settings",
        sa.Column("daily_low_threshold", sa.Integer(), nullable=False, server_default="90"),
    )
    op.add_column(
        "settings",
        sa.Column("show_decimals", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.add_column(
        "settings",
        sa.Column(
            "show_predictive_non_primary",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.add_column(
        "settings",
        sa.Column(
            "require_payment_method",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.add_column(
        "settings",
        sa.Column(
            "require_subcategory",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    # Keep defaults at ORM layer only; drop DB-level defaults after backfill.
    op.alter_column("settings", "daily_high_threshold", server_default=None)
    op.alter_column("settings", "daily_low_threshold", server_default=None)
    op.alter_column("settings", "show_decimals", server_default=None)
    op.alter_column("settings", "show_predictive_non_primary", server_default=None)
    op.alter_column("settings", "require_payment_method", server_default=None)
    op.alter_column("settings", "require_subcategory", server_default=None)


def downgrade() -> None:
    op.drop_column("settings", "require_subcategory")
    op.drop_column("settings", "require_payment_method")
    op.drop_column("settings", "show_predictive_non_primary")
    op.drop_column("settings", "show_decimals")
    op.drop_column("settings", "daily_low_threshold")
    op.drop_column("settings", "daily_high_threshold")
