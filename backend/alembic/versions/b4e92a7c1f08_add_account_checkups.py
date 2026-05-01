"""Add account checkup tables and checkup notification settings

Revision ID: b4e92a7c1f08
Revises: 7d4c2e1b8a90
Create Date: 2026-05-01 22:00:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b4e92a7c1f08"
down_revision: Union[str, None] = "7d4c2e1b8a90"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Settings columns for checkup notifications.
    op.add_column(
        "settings",
        sa.Column(
            "checkup_notifications_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.add_column(
        "settings",
        sa.Column(
            "checkup_notification_days",
            sa.Integer(),
            nullable=False,
            server_default="30",
        ),
    )
    op.alter_column("settings", "checkup_notifications_enabled", server_default=None)
    op.alter_column("settings", "checkup_notification_days", server_default=None)

    # 2. account_checkups — header row per reconciliation.
    op.create_table(
        "account_checkups",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("checkup_date", sa.Date(), nullable=False),
        sa.Column("ledger_balance", sa.Numeric(12, 2), nullable=False),
        sa.Column("reported_balance", sa.Numeric(12, 2), nullable=False),
        sa.Column("correction_transaction_id", sa.Integer(), nullable=True),
        sa.Column("note", sa.String(length=255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["account_id"], ["accounts.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["correction_transaction_id"],
            ["transactions.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_account_checkups_account_id_date",
        "account_checkups",
        ["account_id", "checkup_date"],
    )

    # 3. account_checkup_breakdowns — per-payment-method line items.
    op.create_table(
        "account_checkup_breakdowns",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("checkup_id", sa.Integer(), nullable=False),
        sa.Column("payment_method_id", sa.Integer(), nullable=True),
        sa.Column(
            "payment_method_name_snapshot",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.ForeignKeyConstraint(
            ["checkup_id"], ["account_checkups.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["payment_method_id"],
            ["payment_methods.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_account_checkup_breakdowns_checkup_id",
        "account_checkup_breakdowns",
        ["checkup_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_account_checkup_breakdowns_checkup_id",
        table_name="account_checkup_breakdowns",
    )
    op.drop_table("account_checkup_breakdowns")
    op.drop_index(
        "ix_account_checkups_account_id_date", table_name="account_checkups"
    )
    op.drop_table("account_checkups")
    op.drop_column("settings", "checkup_notification_days")
    op.drop_column("settings", "checkup_notifications_enabled")
