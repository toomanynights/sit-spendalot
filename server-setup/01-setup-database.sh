#!/bin/bash
# Sir Spendalot - Database Setup

set -e

echo "Setting up PostgreSQL database for Sir Spendalot..."

# Allow override when rerunning intentionally with a known password.
DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -base64 32)}"

ROLE_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='basil'" | xargs)
if [ "$ROLE_EXISTS" = "1" ]; then
    sudo -u postgres psql -c "ALTER ROLE basil WITH LOGIN PASSWORD '${DB_PASSWORD}';"
else
    sudo -u postgres psql -c "CREATE ROLE basil LOGIN PASSWORD '${DB_PASSWORD}';"
fi

DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='sir_spendalot'" | xargs)
if [ "$DB_EXISTS" != "1" ]; then
    sudo -u postgres createdb -O basil sir_spendalot
fi

sudo -u postgres psql -d sir_spendalot <<EOF
GRANT ALL PRIVILEGES ON DATABASE sir_spendalot TO basil;
GRANT ALL ON SCHEMA public TO basil;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO basil;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO basil;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
EOF

echo "Database setup complete."
echo ""
echo "Save these credentials:"
echo "Database: sir_spendalot"
echo "User: basil"
echo "Password: $DB_PASSWORD"
echo ""
echo "Add this to /home/basil/sir-spendalot/backend/.env:"
echo "DATABASE_URL=postgresql://basil:$DB_PASSWORD@localhost/sir_spendalot"
