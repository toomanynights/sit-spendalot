"""Add prediction notification settings fields

Revision ID: 7d4c2e1b8a90
Revises: f3c1b9a7d501
Create Date: 2026-04-27 08:45:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7d4c2e1b8a90"
down_revision: Union[str, None] = "f3c1b9a7d501"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "settings",
        sa.Column(
            "prediction_notifications_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.add_column(
        "settings",
        sa.Column(
            "prediction_notifications_time",
            sa.String(length=5),
            nullable=False,
            server_default="09:00",
        ),
    )
    op.alter_column("settings", "prediction_notifications_enabled", server_default=None)
    op.alter_column("settings", "prediction_notifications_time", server_default=None)


def downgrade() -> None:
    op.drop_column("settings", "prediction_notifications_time")
    op.drop_column("settings", "prediction_notifications_enabled")
