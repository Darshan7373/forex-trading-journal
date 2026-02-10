# FOREX TRADING JOURNAL - PERN STACK
## PostgreSQL + Express + React + Node.js

**Migration Status:** ✅ **COMPLETE** - Fully migrated from MERN to PERN

---

## 📦 What Was Done

### ✅ Complete Migration from MongoDB to PostgreSQL
- Removed all Mongoose dependencies
- Converted MongoDB schemas to PostgreSQL tables
- Replaced all MongoDB queries with parameterized SQL
- Converted MongoDB aggregations to SQL with GROUP BY, SUM, AVG, COUNT
- Created PostgreSQL views for repeated analytics queries
- Preserved all application logic, routes, and behavior
- Added database indexes matching original MongoDB indexes

### ✅ Backend Changes
- **Database Layer**: Replaced Mongoose with `pg` (node-postgres)
- **Models**: Converted to class-based models with static SQL methods
- **Controllers**: Updated to use new SQL models (behavior identical)
- **Schema**: Created comprehensive PostgreSQL schema with constraints
- **AI Service**: No changes needed (works with both stacks)
- **Authentication**: No changes needed (JWT remains the same)

### ✅ Frontend
- **No changes required** - Frontend works identically
- API contracts preserved exactly
- All features work as before

---

## 🗄️ PostgreSQL Schema

### Tables Created
1. **users** - User accounts with authentication
2. **trades** - Trade entries with AI feedback (JSONB)

### Views Created
1. **user_trading_stats** - Aggregated user statistics
2. **strategy_performance** - Performance by strategy
3. **session_performance** - Performance by trading session

### Indexes Added
- All critical queries indexed for performance
- Matches original MongoDB index structure

---

## 🚀 QUICK START

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Step 1: Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Run installer
- Remember your postgres password

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE forex_trading_journal;

# Exit
\q

# Run schema (creates tables, indexes, views)
cd backend
psql -U postgres -d forex_trading_journal -f schema.sql
```

### Step 3: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your PostgreSQL credentials
nano .env  # or use your favorite editor
```

**Important:** Update these in `.env`:
```env
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=forex_trading_journal
JWT_SECRET=generate-a-long-random-string-here
```

### Step 4: Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

### Step 5: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Access:** http://localhost:3000

---

## 📊 Database Schema Details

### Users Table
```sql
id                      SERIAL PRIMARY KEY
email                   VARCHAR(255) UNIQUE NOT NULL
password                VARCHAR(255) NOT NULL
name                    VARCHAR(255) NOT NULL
default_risk_percentage DECIMAL(4,2) DEFAULT 1.00
trading_goals           TEXT
created_at              TIMESTAMP
updated_at              TIMESTAMP
```

### Trades Table
```sql
id                 SERIAL PRIMARY KEY
user_id            INTEGER REFERENCES users(id)
date               TIMESTAMP NOT NULL
session            VARCHAR(20) CHECK (session IN ('London', 'NY', 'Asia', 'Sydney'))
currency_pair      VARCHAR(10) NOT NULL
timeframe          VARCHAR(5) CHECK (timeframe IN ('M1', 'M5', ...))
direction          VARCHAR(10) CHECK (direction IN ('Buy', 'Sell'))
entry_price        DECIMAL(12,5) NOT NULL
stop_loss          DECIMAL(12,5) NOT NULL
take_profit        DECIMAL(12,5) NOT NULL
lot_size           DECIMAL(10,2) NOT NULL
risk_percentage    DECIMAL(4,2) NOT NULL
rr_ratio           DECIMAL(10,2) NOT NULL
strategy_name      VARCHAR(100) NOT NULL
outcome            VARCHAR(10) CHECK (outcome IN ('Win', 'Loss', 'BE'))
pips               DECIMAL(10,2) NOT NULL
notes              TEXT
emotions_before    VARCHAR(500)
emotions_during    VARCHAR(500)
emotions_after     VARCHAR(500)
ai_feedback        JSONB  -- Stores AI analysis as JSON
created_at         TIMESTAMP
updated_at         TIMESTAMP
```

### AI Feedback Structure (JSONB)
```json
{
  "executionScore": 7,
  "strengths": ["Good R:R", "Emotional discipline"],
  "mistakes": ["Entry too early"],
  "suggestion": "Wait for confirmation",
  "patterns": ["good_discipline"],
  "riskAssessment": "good",
  "emotionalState": "calm",
  "analyzedAt": "2024-02-09T..."
}
```

---

## 🔧 Environment Variables

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# PostgreSQL
DB_USER=postgres
DB_HOST=localhost
DB_NAME=forex_trading_journal
DB_PASSWORD=your_password
DB_PORT=5432

# Security
JWT_SECRET=generate-32-char-random-string

# CORS
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🧪 Testing the Migration

### Test 1: Database Connection
```bash
cd backend
node -e "const db = require('./src/config/database'); db.query('SELECT NOW()').then(r => console.log('✅ Connected:', r.rows[0].now)).catch(e => console.error('❌ Error:', e))"
```

### Test 2: Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### Test 3: Create Trade
```bash
# First login to get token, then:
curl -X POST http://localhost:5000/api/trades \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-02-09",
    "session": "London",
    "currencyPair": "EURUSD",
    "timeframe": "H1",
    "direction": "Buy",
    "entryPrice": 1.0850,
    "stopLoss": 1.0830,
    "takeProfit": 1.0890,
    "lotSize": 0.1,
    "riskPercentage": 1,
    "rrRatio": 2,
    "strategyName": "Trend Following",
    "outcome": "Win",
    "pips": 40
  }'
```

---

## 📈 Performance Optimizations

### Indexes Created
```sql
-- Primary performance indexes
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_user_date ON trades(user_id, date DESC);
CREATE INDEX idx_trades_user_outcome ON trades(user_id, outcome);
CREATE INDEX idx_trades_user_strategy ON trades(user_id, strategy_name);
CREATE INDEX idx_trades_user_session ON trades(user_id, session);
```

### Views for Analytics
```sql
-- Pre-computed statistics
CREATE VIEW user_trading_stats AS ...
CREATE VIEW strategy_performance AS ...
CREATE VIEW session_performance AS ...
```

---

## 🚀 Production Deployment

### Option 1: Heroku (Easiest)

**Backend:**
```bash
# Install Heroku CLI
heroku create forex-journal-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend.com

# Deploy
git push heroku main

# Run schema
heroku pg:psql < backend/schema.sql
```

**Frontend (Vercel):**
```bash
# Install Vercel CLI
vercel

# Set environment variable
vercel env add REACT_APP_API_URL production
# Enter: https://your-backend-api.herokuapp.com/api

# Deploy
vercel --prod
```

### Option 2: Railway (Modern)

**Backend:**
1. Connect GitHub repo
2. Add PostgreSQL plugin
3. Set environment variables
4. Deploy automatically

**Frontend:**
1. Deploy to Vercel/Netlify
2. Set REACT_APP_API_URL

### Option 3: DigitalOcean/AWS

**Database:**
- Use managed PostgreSQL (DigitalOcean Database, RDS)
- Run schema.sql on initial setup

**Backend:**
- Deploy to App Platform, EC2, or container
- Set all environment variables

**Frontend:**
- Build: `npm run build`
- Deploy build/ folder to S3, Netlify, or Vercel

---

## 🔐 Security Checklist

- ✅ All SQL queries use parameterized statements (prevents SQL injection)
- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens for authentication
- ✅ CORS configured
- ✅ Rate limiting enabled
- ✅ Helmet.js security headers
- ✅ Environment variables for secrets
- ✅ No credentials in code

---

## 🆘 Troubleshooting

### "Connection refused" error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS

# Start if not running
sudo systemctl start postgresql  # Linux
brew services start postgresql  # macOS
```

### "Database does not exist"
```bash
psql -U postgres -c "CREATE DATABASE forex_trading_journal;"
psql -U postgres -d forex_trading_journal -f backend/schema.sql
```

### "Password authentication failed"
```bash
# Reset postgres password
sudo -u postgres psql
ALTER USER postgres PASSWORD 'newpassword';
\q

# Update .env file with new password
```

### "Port 5432 already in use"
```bash
# Find process using port
lsof -i :5432  # macOS/Linux
netstat -ano | findstr :5432  # Windows

# Kill process or change port in .env
```

### "Table does not exist"
```bash
# Run schema again
cd backend
psql -U postgres -d forex_trading_journal -f schema.sql
```

---

## 📚 API Endpoints (Unchanged)

All API endpoints work exactly as before:

```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

Trades:
GET    /api/trades
POST   /api/trades
GET    /api/trades/:id
PUT    /api/trades/:id
DELETE /api/trades/:id
DELETE /api/trades/batch/delete

Analytics:
GET    /api/analytics/summary
GET    /api/analytics/ai-review?period=weekly|monthly
GET    /api/analytics/export
GET    /api/analytics/trends
```

---

## 🎯 Migration Benefits

### Why PostgreSQL?
✅ **Better for analytics** - Superior SQL aggregation capabilities
✅ **ACID compliance** - Stronger data integrity
✅ **Better indexing** - Faster complex queries
✅ **JSON support** - JSONB for AI feedback (best of both worlds)
✅ **Free hosting** - Heroku, Railway, Supabase all offer free PostgreSQL
✅ **Industry standard** - More familiar to most developers
✅ **Better tooling** - pgAdmin, DBeaver, etc.

### What Stayed the Same?
✅ All API routes
✅ All features
✅ AI analysis engine
✅ Frontend (100% unchanged)
✅ Authentication flow
✅ CSV export
✅ All business logic

---

## 📝 Maintenance

### Backup Database
```bash
pg_dump -U postgres forex_trading_journal > backup.sql
```

### Restore Database
```bash
psql -U postgres -d forex_trading_journal < backup.sql
```

### View Database Size
```sql
SELECT pg_size_pretty(pg_database_size('forex_trading_journal'));
```

### Monitor Connections
```sql
SELECT * FROM pg_stat_activity WHERE datname = 'forex_trading_journal';
```

---

## 🎓 Next Steps

1. ✅ Run `npm install` in both backend and frontend
2. ✅ Create PostgreSQL database
3. ✅ Run schema.sql
4. ✅ Configure .env files
5. ✅ Start backend and frontend
6. ✅ Register an account
7. ✅ Add your first trade
8. ✅ View AI analysis
9. ✅ Check dashboard
10. ✅ Deploy to production

---

## 📄 License

MIT - Free for personal use

---

**Migration Complete!** 🎉

Your Forex Trading Journal is now running on the PERN stack with all features intact and improved database performance.
