# DEPLOYMENT GUIDE - PERN Stack

## 🚀 Quick Deploy (5 Minutes)

### Option 1: Heroku + Vercel (Recommended for Beginners)

#### Backend on Heroku

```bash
# 1. Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Create app
cd backend
heroku create your-app-name

# 4. Add PostgreSQL
heroku addons:create heroku-postgresql:essential-0

# 5. Set environment variables
heroku config:set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend-url.vercel.app

# 6. Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku main

# 7. Setup database
heroku pg:psql < schema.sql

# 8. Open
heroku open
```

#### Frontend on Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
cd frontend
vercel

# Follow prompts

# 3. Set environment variable
vercel env add REACT_APP_API_URL
# Enter: https://your-backend.herokuapp.com/api

# 4. Deploy to production
vercel --prod
```

**Done!** Your app is live.

---

### Option 2: Railway (Modern, Easy)

#### Both Backend + Database

```bash
# 1. Sign up at railway.app

# 2. Create new project

# 3. Add PostgreSQL service
# Click "New" → "Database" → "PostgreSQL"

# 4. Add Backend service
# Click "New" → "GitHub Repo" → Select your repo

# 5. Environment Variables (in Railway dashboard)
JWT_SECRET=generate-random-32-char-string
NODE_ENV=production
FRONTEND_URL=your-frontend-url
DB_USER=postgres (auto-filled)
DB_HOST=containers-us-west-xxx.railway.app (auto-filled)
DB_NAME=railway (auto-filled)
DB_PASSWORD=xxx (auto-filled)
DB_PORT=5432 (auto-filled)

# 6. Deploy
# Automatic on git push

# 7. Run schema
# In Railway dashboard → PostgreSQL → Query
# Paste contents of schema.sql → Execute
```

#### Frontend on Vercel

```bash
cd frontend
vercel

# Set REACT_APP_API_URL to your Railway backend URL
vercel env add REACT_APP_API_URL production

vercel --prod
```

---

### Option 3: DigitalOcean (Full Control)

#### Database (Managed PostgreSQL)

```bash
# 1. Create Managed PostgreSQL
# Go to DigitalOcean → Databases → Create
# Choose PostgreSQL 15
# Select plan ($15/mo minimum)

# 2. Get connection details
# Copy: Host, Port, User, Password, Database

# 3. Connect and setup
psql "postgresql://user:password@host:port/database?sslmode=require"
# Paste schema.sql contents
```

#### Backend (App Platform)

```bash
# 1. Go to App Platform
# Click "Create App"
# Connect GitHub repo → select backend folder

# 2. Environment Variables
DB_USER=your-db-user
DB_HOST=your-db-host
DB_NAME=your-db-name
DB_PASSWORD=your-db-password
DB_PORT=25060
JWT_SECRET=generate-random-string
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url

# 3. Deploy
# Automatic
```

#### Frontend (App Platform or Vercel)

**Option A: DigitalOcean App Platform**
```bash
# Create App → Connect repo → Select frontend folder
# Build command: npm run build
# Run command: (leave default for static site)
```

**Option B: Vercel (easier)**
```bash
cd frontend
vercel --prod
```

---

### Option 4: AWS (Advanced)

#### Database: RDS PostgreSQL

```bash
# 1. Create RDS instance
# Go to RDS → Create Database
# Choose PostgreSQL 15
# Template: Free tier (or Production)
# Remember master password

# 2. Security Group
# Allow inbound on port 5432 from your IP
# Later: Allow from EC2 security group

# 3. Connect and setup
psql -h your-rds-endpoint.amazonaws.com -U postgres -d postgres
CREATE DATABASE forex_trading_journal;
\c forex_trading_journal
# Paste schema.sql contents
```

#### Backend: EC2 or Elastic Beanstalk

**Option A: EC2**
```bash
# 1. Launch EC2 instance (Ubuntu)

# 2. SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Clone repo
git clone your-repo-url
cd forex-pern/backend
npm install

# 5. Create .env
nano .env
# Add all environment variables

# 6. Install PM2
sudo npm install -g pm2

# 7. Start app
pm2 start server.js
pm2 startup
pm2 save

# 8. Setup Nginx
sudo apt install nginx
# Configure reverse proxy
```

**Option B: Elastic Beanstalk**
```bash
# 1. Install EB CLI
pip install awsebcli

# 2. Initialize
cd backend
eb init

# 3. Create environment
eb create forex-journal-env

# 4. Set environment variables
eb setenv JWT_SECRET=xxx DB_HOST=xxx DB_USER=xxx ...

# 5. Deploy
eb deploy
```

#### Frontend: S3 + CloudFront

```bash
# 1. Build
cd frontend
npm run build

# 2. Create S3 bucket
aws s3 mb s3://forex-journal-frontend

# 3. Upload build
aws s3 sync build/ s3://forex-journal-frontend

# 4. Enable static website hosting
aws s3 website s3://forex-journal-frontend --index-document index.html

# 5. Setup CloudFront (optional, for HTTPS)
# Go to CloudFront → Create Distribution
# Origin: your-bucket.s3.amazonaws.com
```

---

## 🔧 Environment Variables Checklist

### Backend
```env
✅ PORT=5000
✅ NODE_ENV=production
✅ DB_USER=postgres
✅ DB_HOST=your-database-host
✅ DB_NAME=forex_trading_journal
✅ DB_PASSWORD=your-strong-password
✅ DB_PORT=5432
✅ JWT_SECRET=32-char-random-string
✅ FRONTEND_URL=https://your-frontend.com
```

### Frontend
```env
✅ REACT_APP_API_URL=https://your-backend.com/api
```

---

## ✅ Pre-Deployment Checklist

### Security
- [ ] Change JWT_SECRET to secure random string
- [ ] Use strong database password
- [ ] Enable HTTPS (automatic on Vercel/Heroku)
- [ ] Configure CORS to your frontend domain only
- [ ] Review rate limiting settings

### Database
- [ ] Run schema.sql on production database
- [ ] Verify all tables created
- [ ] Verify indexes created
- [ ] Test connection from backend

### Backend
- [ ] Set NODE_ENV=production
- [ ] All environment variables configured
- [ ] Database connection string correct
- [ ] Test /api/health endpoint
- [ ] Test user registration

### Frontend
- [ ] REACT_APP_API_URL points to production backend
- [ ] Build completes successfully
- [ ] No console errors in production build

---

## 🧪 Post-Deployment Testing

### 1. Test Health
```bash
curl https://your-backend.com/api/health
```

### 2. Test Registration
```bash
curl -X POST https://your-backend.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test"}'
```

### 3. Test Login
```bash
curl -X POST https://your-backend.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 4. Test Frontend
- Visit https://your-frontend.com
- Register account
- Add a trade
- View AI feedback
- Check dashboard
- Export CSV

---

## 📊 Monitoring

### Free Options

**Backend Monitoring:**
- Heroku: Built-in logs `heroku logs --tail`
- Railway: Built-in observability
- DigitalOcean: App metrics

**Database Monitoring:**
- Heroku Postgres: Built-in dashboard
- Railway: Query logs
- DigitalOcean: Database metrics

**External Monitoring:**
- UptimeRobot (free)
- Better Uptime (free tier)
- Sentry (free tier for errors)

### Setup UptimeRobot
```bash
# 1. Sign up at uptimerobot.com

# 2. Add monitor
Type: HTTP(s)
URL: https://your-backend.com/api/health
Interval: 5 minutes

# 3. Get alerts
Email or SMS when down
```

---

## 💰 Cost Estimates (Monthly)

### Free Tier (Testing)
- Heroku + Vercel: $0
- Railway: $0 (with $5 credit)
- Supabase + Vercel: $0

### Small Production (~100 users)
- Heroku Essential Postgres + Dyno: ~$12
- Railway Pro: ~$20
- DigitalOcean: ~$25

### Medium Production (~1000 users)
- Heroku: ~$50
- DigitalOcean: ~$50
- AWS: ~$40

---

## 🔄 CI/CD Setup (Optional)

### GitHub Actions (Free)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd backend && npm install
      - run: cd backend && npm test
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "your-app-name"
          heroku_email: "your@email.com"
  
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          vercel-args: '--prod'
          working-directory: ./frontend
```

---

## 🆘 Common Deployment Issues

### Issue: Database connection timeout
**Solution:**
- Check database host/port in .env
- Verify SSL mode: `?sslmode=require`
- Check firewall rules

### Issue: 502 Bad Gateway
**Solution:**
- Backend not started
- Check logs: `heroku logs --tail`
- Verify PORT environment variable

### Issue: CORS errors
**Solution:**
- Add frontend URL to FRONTEND_URL in backend .env
- Check CORS configuration in server.js

### Issue: "Failed to load resource: net::ERR_CONNECTION_REFUSED"
**Solution:**
- Frontend REACT_APP_API_URL is wrong
- Check: Must include `/api` at end
- Rebuild frontend after changing .env

---

## 📝 Backup Strategy

### Heroku PostgreSQL
```bash
# Manual backup
heroku pg:backups:capture

# Download backup
heroku pg:backups:download

# Automated (upgrade to paid plan)
heroku pg:backups:schedule --at "02:00 America/Los_Angeles"
```

### Railway
```bash
# Backups automatic with Pro plan
# Download from dashboard
```

### DigitalOcean
```bash
# Daily automatic backups included
# Configure in database settings
```

---

## ✅ You're Done!

Your Forex Trading Journal is now:
- ✅ Running on production
- ✅ Using PostgreSQL database
- ✅ Secured with HTTPS
- ✅ Monitored for uptime
- ✅ Ready for use

**Next:** Start logging your trades and let AI help you improve!
