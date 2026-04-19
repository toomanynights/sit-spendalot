#!/bin/bash
# Sir Spendalot - System Dependencies Installation

set -e

echo "Installing system dependencies for Sir Spendalot..."

# Refresh package metadata first.
sudo apt update

# Repair package manager state if previous run failed mid-install.
sudo dpkg --configure -a || true
sudo apt --fix-broken install -y || true

# Python 3.11 and venv/pip tooling
sudo apt install -y python3.11 python3.11-venv python3-pip

# PostgreSQL database server + extras
sudo apt install -y postgresql postgresql-contrib

# Node.js 20 (for frontend build tooling)
# Remove distro-provided Node 12 dev packages that conflict with NodeSource.
sudo apt remove -y nodejs libnode-dev nodejs-dev || true
sudo apt autoremove -y || true

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Build dependencies for Python packages like psycopg2
sudo apt install -y build-essential libpq-dev

# Git
sudo apt install -y git

echo "Dependencies installed successfully."
echo "Python version: $(python3.11 --version)"
echo "PostgreSQL version: $(psql --version)"
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
