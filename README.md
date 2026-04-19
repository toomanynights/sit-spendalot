# Sir Spendalot

Sir Spendalot is a self-hosted personal finance tracker with predictive budgeting and a medieval-themed interface.

## Features

- Track daily and unplanned transactions across multiple accounts
- Manage recurring prediction templates and upcoming prediction instances
- Forecast future balances and highlight likely low-balance "perils"
- Quick-entry flow for fast multi-row transaction input
- Configurable settings for forecast horizon, rolling averages, thresholds, and excluded days

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy, Alembic, PostgreSQL
- **Frontend:** React, Vite, Tailwind CSS
- **Deployment:** systemd + Caddy (or any reverse proxy)

## Repository Structure

- `backend/` - API routes, services, schemas, models, migrations
- `frontend/` - UI pages, components, hooks, API client
- `docs/` - supporting project docs
- `DEVELOPMENT_PLAN.md` - implementation checklist and detailed task specs

## Quick Start (Development)

### 1) Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment

Create `backend/.env` from `backend/.env.example` and provide at minimum:

- database connection settings
- authentication settings
- allowed origins / runtime environment settings

## Production Notes

- Run migrations before deploying backend changes:

```bash
cd backend
alembic upgrade head
```

- Build frontend for production:

```bash
cd frontend
npm run build
```

- Keep secrets out of git (`.env`, credentials, tokens).

## API Documentation

FastAPI auto-generates interactive API docs:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

When deployed, replace `localhost:8000` with your domain.

## Contributing

1. Create a feature branch
2. Implement and test changes
3. Commit with a clear message
4. Open a pull request

If documentation and implementation ever diverge, update docs in the same PR.
