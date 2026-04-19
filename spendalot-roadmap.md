# 🗡️ SIR SPENDALOT - Development Roadmap

## Tech Stack Decision

### Backend
- **Framework**: FastAPI (modern, async, auto-generated docs)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Migration**: Alembic
- **Auth**: JWT tokens (for future Android app)
- **Task Queue**: APScheduler (for prediction regeneration)
- **Telegram Bot**: python-telegram-bot

### Frontend
- **Framework**: React with Vite
- **Styling**: CSS-in-JS (styled-components) or Tailwind with custom medieval theme
- **State**: React Query for server state, Zustand for client state
- **Forms**: React Hook Form
- **Charts**: Recharts or Chart.js (for future analytics)

### Deployment
- **Server**: Your existing Linux server (Ubuntu/Debian assumed)
- **Web Server**: Caddy (you already use it)
- **Process Manager**: systemd
- **Database**: PostgreSQL service
- **Backup**: Your existing restic setup

---

## Phase 1: Foundation (Week 1-2)

### Milestone 1.1: Project Setup
**Goal**: Get the skeleton running

```bash
# Backend structure
sir-spendalot/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI app
│   │   ├── config.py        # Settings (DB, secrets)
│   │   ├── database.py      # SQLAlchemy setup
│   │   ├── models/          # DB models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── api/             # Route handlers
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helpers
│   ├── alembic/             # DB migrations
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── api/             # API client
│   │   ├── styles/          # Global styles
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── telegram-bot/
    ├── bot.py
    └── handlers/
```

**Tasks**:
- [ ] Initialize FastAPI project with Poetry/pip
- [ ] Set up PostgreSQL database
- [ ] Configure Alembic for migrations
- [ ] Create Vite + React project
- [ ] Set up basic Caddy reverse proxy config
- [ ] Create systemd service files (backend + bot)

**Cursor Prompts**:
```
"Create a FastAPI project structure with SQLAlchemy, Alembic, and environment-based config. Include a health check endpoint."

"Set up a Vite React project with Tailwind CSS. Include a basic layout component with medieval-themed colors."

"Write an Alembic migration script to create the initial database schema for accounts, transactions, categories, and prediction_templates."
```

---

### Milestone 1.2: Core Database Models

**Schema**:
```sql
-- accounts
id, name, account_type (checking/savings/card), is_primary (boolean), initial_balance, created_at

-- categories
id, name, type (daily/unplanned/predicted), parent_id (for subcategories), created_at

-- transactions
id, account_id, category_id, subcategory, amount, transaction_date, type, description, 
confirmed, created_at, updated_at

-- prediction_templates
id, account_id, category_id, amount, frequency (daily/weekly/monthly/yearly),
day_of_month, start_date, paused, last_generated_at

-- prediction_instances
id, template_id, account_id, category_id, amount, scheduled_date, status (pending/confirmed/skipped/modified),
confirmed_date, confirmed_amount

-- transfers
id, from_account_id, to_account_id, amount, transfer_date, description

-- settings
id, user_id, prediction_horizon_days, rolling_average_days, primary_account_id
```

**Tasks**:
- [ ] Define SQLAlchemy models for all tables
- [ ] Create Pydantic schemas for request/response
- [ ] Write initial Alembic migration
- [ ] Add database seed script with sample data

**Cursor Prompts**:
```
"Create SQLAlchemy models for accounts, categories, transactions, prediction_templates, prediction_instances, transfers, and settings. Use proper relationships and indexes."

"Write Pydantic schemas for creating/updating accounts, transactions, and prediction templates. Include validation for amounts, dates, and enums."

"Create a seed script that populates the database with sample accounts, categories, and a few transactions for testing."
```

---

## Phase 2: Core API (Week 3-4)

### Milestone 2.1: Account & Transaction CRUD

**Endpoints**:
```
GET    /api/accounts                    # List all accounts (includes isPrimary flag)
POST   /api/accounts                    # Create account (can set isPrimary)
GET    /api/accounts/{id}               # Get account details
PATCH  /api/accounts/{id}               # Update account (including isPrimary)
DELETE /api/accounts/{id}               # Delete account

GET    /api/transactions                # List transactions (filterable, includes subcategory)
POST   /api/transactions                # Create transaction (with optional subcategory)
POST   /api/transactions/batch          # Batch create (each can have subcategory)
GET    /api/transactions/{id}           # Get transaction
PATCH  /api/transactions/{id}           # Update transaction
DELETE /api/transactions/{id}           # Delete transaction

GET    /api/transactions/subcategories  # Get autocomplete list of used subcategories
POST   /api/transfers                   # Create transfer between accounts
```

**Tasks**:
- [ ] Implement account CRUD endpoints with primary account flag
- [ ] Implement transaction CRUD with filters (date range, category, type, account)
- [ ] Add subcategory field to transactions (optional text, auto-suggest from existing)
- [ ] Add transfer endpoint (creates two transactions + transfer record)
- [ ] Add balance correction endpoint
- [ ] Write unit tests for services

**Cursor Prompts**:
```
"Implement FastAPI CRUD endpoints for accounts with SQLAlchemy. Include proper error handling and validation."

"Create transaction endpoints with query filters for date_range, account_id, category_id, and transaction_type. Return paginated results."

"Implement a transfer endpoint that creates a debit transaction in from_account and credit transaction in to_account, wrapped in a database transaction."
```

---

### Milestone 2.2: Prediction Engine

**Core Logic**:
1. **Template Management**: CRUD for prediction templates
2. **Instance Generation**: Background job that generates instances for next X days
3. **Prediction Calculation**: Daily balance prediction algorithm

**Algorithm** (pseudocode):
```python
def calculate_predictions(account_id, horizon_days=90):
    # Get actual balance up to yesterday
    last_confirmed_date = get_last_confirmed_date()
    balance = get_actual_balance(account_id, last_confirmed_date)
    
    # Get rolling average of daily expenses (last N days)
    avg_daily = calculate_rolling_average(account_id, days=30, exclude_unplanned=True)
    
    predictions = []
    for day in range(1, horizon_days + 1):
        target_date = last_confirmed_date + timedelta(days=day)
        
        # Start with yesterday's balance
        daily_balance = balance
        
        # Subtract average daily expenses
        daily_balance -= avg_daily
        
        # Subtract/add predicted transactions for this day
        predicted_txns = get_prediction_instances(account_id, target_date)
        for txn in predicted_txns:
            daily_balance += txn.amount  # negative for expenses, positive for income
        
        predictions.append({
            'date': target_date,
            'predicted_balance': daily_balance
        })
        
        # Update balance for next iteration
        balance = daily_balance
    
    return predictions
```

**Endpoints**:
```
GET    /api/predictions                 # Get prediction templates
POST   /api/predictions                 # Create template
PATCH  /api/predictions/{id}            # Update template
DELETE /api/predictions/{id}            # Delete template
POST   /api/predictions/{id}/pause      # Pause template

GET    /api/predictions/forecast        # Get X-day forecast with daily balances
GET    /api/predictions/lowest          # Get TWO lowest points in forecast (next + following)
GET    /api/stats/today                 # Get today's stats (actual/predicted balance, spending breakdown by type)

POST   /api/predictions/instances/{id}/confirm   # Confirm a predicted transaction
POST   /api/predictions/instances/{id}/skip      # Skip a predicted transaction
```

**Tasks**:
- [ ] Implement prediction template CRUD
- [ ] Create instance generation service (run on template changes + daily)
- [ ] Implement prediction calculation algorithm
- [ ] Add forecast endpoint
- [ ] Add dual lowest point finder (returns next + following lowest points)
- [ ] Add today's stats endpoint (actual/predicted balance, spending breakdown)
- [ ] Schedule daily instance regeneration (APScheduler)

**Cursor Prompts**:
```
"Create a service that generates prediction_instances for the next 90 days based on prediction_templates. Handle monthly, weekly, and specific-day-of-month frequencies."

"Implement the prediction forecast algorithm: calculate daily predicted balances by starting with current balance, subtracting rolling average daily expenses, and accounting for predicted transactions."

"Create an APScheduler job that runs daily at midnight to regenerate prediction instances and clean up old confirmed instances."
```

---

## Phase 3: Frontend Dashboard (Week 5-6)

### Milestone 3.1: Dashboard Page

**Components**:
- AccountSwitcher (with primary account indicator ⭐)
- TodayStats card (Actual vs Predicted balance, spending breakdown by type)
- LowestPoint card (dual display: next and following perils, red when negative)
- QuickSubmit form (3 types: daily/unplanned/predicted with prefill from prophecies)
- RecentTransactions list (with subcategories displayed)
- UpcomingPredictions list (clickable to prefill form)
- FloatingSirSpendalot (bottom-right advisor with tips)

**Primary vs Non-Primary Account Views**:
- **Primary**: Full dashboard with predictions, daily stats, lowest fortune
- **Non-Primary**: Simplified view with balance, recent transactions, prophecies only

**Tasks**:
- [ ] Build medieval-themed layout (coin purse + shield header, no badge duplication)
- [ ] Implement API client with React Query
- [ ] Create reusable Card, Button, Input components
- [ ] Add account selector with primary indicator
- [ ] Fetch and display enhanced today's stats (actual/predicted/spending breakdown)
- [ ] Fetch and display dual lowest predicted points (color-coded)
- [ ] Build quick submit form with:
  - Three transaction types (daily/unplanned/predicted)
  - Subcategory support (datalist autocomplete)
  - Collapsible date picker (defaults to today, computed on interaction)
  - Prefill from prophecy clicks
- [ ] Display recent transactions with subcategory hierarchy
- [ ] Display clickable upcoming predictions
- [ ] Add floating Sir Spendalot advisor with rotatable badge and horizontal tip bubble
- [ ] Implement primary vs non-primary view logic

**Cursor Prompts**:
```
"Create a React component for the dashboard with medieval theming. Header has coin purse on left, title in center, shield on right. Set up React Query to fetch account data from /api/accounts. Mark primary account with ⭐ badge."

"Build a QuickSubmit form component with three tabs: daily, unplanned, predicted. For predicted type, fetch templates from /api/predictions and prefill when user clicks a prophecy. Include collapsible date picker that defaults to today but computes value on interaction, not page load."

"Create dual LowestPoint card that fetches two lowest predicted balances from /api/predictions/forecast?limit=2. Apply red styling only when amount < 0. Display as 'Next Peril' and 'Following Peril' with days until each."

"Implement floating Sir Spendalot advisor: fixed bottom-right, 120px badge, rotates on hover, shows random tip in horizontal speech bubble. Tips should reference actual user data when possible."

"Create conditional rendering for primary vs non-primary accounts: primary shows full dashboard, non-primary shows only current balance card, recent transactions, and prophecies."
```

---

### Milestone 3.2: Transaction Management Page

**Features**:
- Full transaction list with filters (date, category, type, account)
- Pagination
- Batch entry modal
- Edit/delete transactions
- Export to CSV

**Tasks**:
- [ ] Create transactions list page with filters
- [ ] Add pagination controls
- [ ] Build batch entry modal (array of transactions)
- [ ] Implement edit/delete modals
- [ ] Add CSV export functionality

**Cursor Prompts**:
```
"Create a transaction list page with filters for date range, account, category, and type. Use React Query with query params for server-side filtering."

"Build a batch transaction entry modal that allows entering multiple transactions at once with a dynamic form array."
```

---

## Phase 4: Telegram Bot (Week 7)

### Milestone 4.1: Basic Bot Commands

**Commands**:
```
/start      - Welcome message
/balance    - Show current balance of primary account
/add        - Submit expense (interactive flow)
/recent     - Show last 5 transactions
/predict    - Show lowest predicted balance
/accounts   - List all accounts
```

**Tasks**:
- [ ] Set up python-telegram-bot with webhook (or polling for simplicity)
- [ ] Implement /start and /balance commands
- [ ] Create conversation handler for /add (multi-step: amount → category → confirm)
- [ ] Implement /recent and /predict
- [ ] Add inline keyboard for category selection

**Cursor Prompts**:
```
"Create a Telegram bot using python-telegram-bot that connects to the Sir Spendalot API. Implement /balance command that fetches from /api/accounts and displays primary account balance."

"Implement a conversation handler for /add command: ask for amount, then show inline keyboard with categories, then confirm and POST to /api/transactions."
```

---

## Phase 5: Advanced Features (Week 8-10)

### Milestone 5.1: Prediction Management UI

**Features**:
- List all prediction templates
- Create/edit/delete templates
- Pause/resume templates
- View upcoming instances
- Confirm/skip individual instances

**Tasks**:
- [ ] Create predictions management page
- [ ] Build template creation/edit form (amount, frequency, day, start date)
- [ ] Add instance list with confirm/skip buttons
- [ ] Show visual calendar of upcoming predictions

---

### Milestone 5.2: Analytics & Insights

**Features**:
- Spending by category (pie chart)
- Daily expenses trend (line chart)
- Month-over-month comparison
- Budget warnings ("Thou art spending 150% of average!")

**Tasks**:
- [ ] Create analytics endpoint (aggregations by category, time period)
- [ ] Build charts with Recharts
- [ ] Implement warning system based on thresholds

---

### Milestone 5.3: Migration from Google Sheets

**Tool**: One-time migration script

**Steps**:
1. Export Google Sheets data to CSV/JSON
2. Create mapping config (old categories → new categories)
3. Run migration script that:
   - Creates accounts
   - Imports categories
   - Imports historical transactions
   - Creates prediction templates from existing predictions
   - Validates data integrity

**Tasks**:
- [ ] Write migration script with dry-run mode
- [ ] Create category mapping UI/config
- [ ] Add validation and error reporting

**Cursor Prompts**:
```
"Create a Python script that reads a CSV export from Google Sheets and imports transactions into Sir Spendalot. Include mapping for categories and validation."
```

---

## Phase 6: Android App Foundation (Week 11-12+)

### Milestone 6.1: Basic App

**Framework**: React Native or Flutter (your choice)

**Features**:
- Login with API token
- Dashboard view (similar to web)
- Quick expense submission
- Transaction list

**Tasks**:
- [ ] Set up React Native/Flutter project
- [ ] Implement API authentication
- [ ] Create dashboard screen
- [ ] Build transaction list with pull-to-refresh
- [ ] Add quick submit floating action button

---

### Milestone 6.2: Notification Interception

**Requirements**:
- Android NotificationListenerService
- Pattern matching for supported apps (Revolut, bank apps)
- Inbox system for unconfirmed expenses

**Tasks**:
- [ ] Request notification access permission
- [ ] Implement NotificationListenerService
- [ ] Create regex pattern config (per app)
- [ ] Parse amount, merchant, category from notification text
- [ ] Send to inbox endpoint (POST /api/inbox)
- [ ] Build inbox review UI

---

## Deployment Plan

### Server Setup

**Prerequisites**:
- Ubuntu/Debian server with SSH access
- Domain/subdomain for Sir Spendalot (e.g., spendalot.yourdomain.com)
- PostgreSQL installed
- Caddy installed

### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.11+
sudo apt install python3.11 python3.11-venv python3-pip

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Node.js (for building frontend)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs

# Install Caddy (if not already)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
```

---

### Step 2: Database Setup

```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE sir_spendalot;
CREATE USER spendalot_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE sir_spendalot TO spendalot_user;
\q
```

---

### Step 3: Deploy Backend

```bash
# Create application directory
sudo mkdir -p /opt/sir-spendalot
sudo chown $USER:$USER /opt/sir-spendalot
cd /opt/sir-spendalot

# Clone/upload your code
# If using git:
git clone <your-repo-url> .

# Or upload via rsync/scp from local:
# rsync -avz --exclude 'node_modules' --exclude '.venv' ./sir-spendalot/ user@server:/opt/sir-spendalot/

# Set up Python virtual environment
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://spendalot_user:your_secure_password@localhost/sir_spendalot
SECRET_KEY=$(openssl rand -hex 32)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
ENVIRONMENT=production
EOF

# Run migrations
alembic upgrade head

# Test the app
uvicorn app.main:app --host 0.0.0.0 --port 8000
# Visit http://your-server-ip:8000/docs to verify
```

---

### Step 4: Build Frontend

```bash
cd /opt/sir-spendalot/frontend

# Install dependencies
npm install

# Build for production
npm run build
# This creates /opt/sir-spendalot/frontend/dist
```

---

### Step 5: Configure Caddy

```bash
sudo nano /etc/caddy/Caddyfile
```

Add:
```
spendalot.yourdomain.com {
    # Serve frontend
    root * /opt/sir-spendalot/frontend/dist
    file_server
    
    # API reverse proxy
    handle /api/* {
        reverse_proxy localhost:8000
    }
    
    # Handle SPA routing (React Router)
    try_files {path} /index.html
    
    # Security headers
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy no-referrer-when-downgrade
    }
    
    # Enable gzip
    encode gzip
}
```

Reload Caddy:
```bash
sudo systemctl reload caddy
```

---

### Step 6: Create Systemd Services

**Backend Service**:
```bash
sudo nano /etc/systemd/system/spendalot-api.service
```

```ini
[Unit]
Description=Sir Spendalot API
After=network.target postgresql.service

[Service]
Type=simple
User=YOUR_USER
WorkingDirectory=/opt/sir-spendalot/backend
Environment="PATH=/opt/sir-spendalot/backend/.venv/bin"
ExecStart=/opt/sir-spendalot/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

**Telegram Bot Service**:
```bash
sudo nano /etc/systemd/system/spendalot-bot.service
```

```ini
[Unit]
Description=Sir Spendalot Telegram Bot
After=network.target spendalot-api.service

[Service]
Type=simple
User=YOUR_USER
WorkingDirectory=/opt/sir-spendalot/telegram-bot
Environment="PATH=/opt/sir-spendalot/backend/.venv/bin"
ExecStart=/opt/sir-spendalot/backend/.venv/bin/python bot.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable spendalot-api spendalot-bot
sudo systemctl start spendalot-api spendalot-bot

# Check status
sudo systemctl status spendalot-api
sudo systemctl status spendalot-bot
```

---

### Step 7: Set Up Backups

Use your existing restic setup:

```bash
# Add to your backup script
restic -r rclone:gdrive:backups backup /opt/sir-spendalot/backend/.env

# Database backup (add to cron)
sudo -u postgres pg_dump sir_spendalot | gzip > /opt/sir-spendalot/backups/db-$(date +%Y%m%d).sql.gz
restic -r rclone:gdrive:backups backup /opt/sir-spendalot/backups/
```

---

### Step 8: Monitoring & Logs

```bash
# View API logs
sudo journalctl -u spendalot-api -f

# View bot logs
sudo journalctl -u spendalot-bot -f

# Check Caddy logs
sudo journalctl -u caddy -f
```

---

## Testing Checklist

- [ ] Can create/view/update accounts
- [ ] Can submit daily expenses via web UI
- [ ] Can submit expenses via Telegram bot
- [ ] Predictions generate correctly for next 90 days
- [ ] Lowest point calculation is accurate
- [ ] Transfers work without affecting expense stats
- [ ] Prediction templates pause/resume correctly
- [ ] Frontend loads and displays data
- [ ] Mobile responsive design works
- [ ] API authentication secure (add JWT in later phase)
- [ ] Database backups running

---

## Future Enhancements (Post-MVP)

- **Multi-user support**: Add user authentication, separate data per user
- **Shared accounts**: Family budgeting with multiple users per account
- **Recurring transaction detection**: Auto-suggest creating prediction template
- **Budget goals**: Set monthly limits per category
- **Notifications**: Low balance alerts, prediction confirmations
- **Reports**: PDF export of monthly summaries
- **API webhooks**: Integrate with bank APIs (if available)
- **Dark/light theme toggle**: Because why not
- **Expense photos**: Attach receipt images to transactions

---

## Development Tips for Cursor

### General Prompt Structure
```
Context: [Describe what you're building and where it fits]
Current state: [What's already done]
Goal: [What you want to achieve]
Constraints: [Tech stack, patterns to follow]
Request: [Specific code/implementation needed]
```

### Example Prompts

**For database changes**:
```
"I need to add a 'notes' field to transactions. Create an Alembic migration that adds a TEXT column to the transactions table, and update the Transaction SQLAlchemy model and TransactionCreate Pydantic schema."
```

**For new features**:
```
"Implement a /api/stats/spending-by-category endpoint that returns aggregated spending grouped by category for a given date range. Use SQLAlchemy's func.sum() and group_by. Return as [{category_name, total, percentage}]."
```

**For frontend components**:
```
"Create a TransactionFilters component with date range picker, category dropdown, and account dropdown. When filters change, update the URL query params and trigger a React Query refetch."
```

---

## 🗡️ Go forth and build, noble developer!

"May thy code compile swiftly and thy bugs be few."
