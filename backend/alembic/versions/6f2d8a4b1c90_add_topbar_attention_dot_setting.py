"""Add topbar attention dot setting

Revision ID: 6f2d8a4b1c90
Revises: b4e92a7c1f08
Create Date: 2026-05-02 00:30:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6f2d8a4b1c90"
down_revision: Union[str, None] = "b4e92a7c1f08"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "settings",
        sa.Column(
            "topbar_attention_dot_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
    )
    op.alter_column("settings", "topbar_attention_dot_enabled", server_default=None)


def downgrade() -> None:
    op.drop_column("settings", "topbar_attention_dot_enabled")
