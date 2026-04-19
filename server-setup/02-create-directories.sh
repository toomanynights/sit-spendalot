#!/bin/bash
# Sir Spendalot - Directory Structure Setup

set -e

echo "Creating project directories..."

BASE_DIR="/home/basil/sir-spendalot"

# Main directories
mkdir -p "$BASE_DIR"/{backend,frontend,server-setup,docs,backups}

# Backend directories
mkdir -p "$BASE_DIR/backend"/{app,alembic/versions,logs}
mkdir -p "$BASE_DIR/backend/app"/{models,schemas,api,services,utils}

# Frontend directories
mkdir -p "$BASE_DIR/frontend"/{src,public}
mkdir -p "$BASE_DIR/frontend/src"/{components,pages,api,hooks,styles}

# Ensure ownership and permissions are consistent.
sudo chown -R basil:basil "$BASE_DIR"
chmod -R 755 "$BASE_DIR"

echo "Directory structure created."
ls -la "$BASE_DIR"
