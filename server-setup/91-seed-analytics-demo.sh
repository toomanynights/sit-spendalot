#!/bin/bash
# Sir Spendalot - Seed rich demo data for Analytics validation
#
# Expected flow:
#   1) Optional reset: CONFIRM_NUKE=YES ./90-nuke-user-data.sh
#   2) Seed: ./91-seed-analytics-demo.sh

set -euo pipefail

echo "🧪 Seeding analytics demo data..."

cd /home/basil/sir-spendalot/backend
source /home/basil/sir-spendalot/venv/bin/activate

python seed_analytics_data.py

echo "✅ Done. You can now test /analytics with full-period data."
