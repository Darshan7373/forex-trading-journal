-- ═══════════════════════════════════════════════════════════════════════
-- FOREX TRADING JOURNAL - POSTGRESQL SCHEMA
-- Migrated from MongoDB to PostgreSQL
-- ═══════════════════════════════════════════════════════════════════════

-- Drop existing tables if they exist
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ═══════════════════════════════════════════════════════════════════════
-- USERS TABLE
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  default_risk_percentage DECIMAL(4,2) DEFAULT 1.00 CHECK (default_risk_percentage >= 0.1 AND default_risk_percentage <= 10),
  trading_goals TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email lookups
CREATE INDEX idx_users_email ON users(email);

-- ═══════════════════════════════════════════════════════════════════════
-- TRADES TABLE
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE trades (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Trade Details
  date TIMESTAMP NOT NULL,
  session VARCHAR(20) NOT NULL CHECK (session IN ('London', 'NY', 'Asia', 'Sydney')),
  currency_pair VARCHAR(10) NOT NULL,
  timeframe VARCHAR(5) NOT NULL CHECK (timeframe IN ('M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1', 'MN')),
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('Buy', 'Sell')),
  
  -- Price Levels
  entry_price DECIMAL(12,5) NOT NULL CHECK (entry_price > 0),
  stop_loss DECIMAL(12,5) NOT NULL CHECK (stop_loss > 0),
  take_profit DECIMAL(12,5) NOT NULL CHECK (take_profit > 0),
  
  -- Position Sizing
  lot_size DECIMAL(10,2) NOT NULL CHECK (lot_size >= 0.01),
  risk_percentage DECIMAL(4,2) NOT NULL CHECK (risk_percentage >= 0.1 AND risk_percentage <= 10),
  rr_ratio DECIMAL(10,2) NOT NULL CHECK (rr_ratio >= 0.1),
  
  -- Strategy & Outcome
  strategy_name VARCHAR(100) NOT NULL,
  outcome VARCHAR(10) NOT NULL CHECK (outcome IN ('Win', 'Loss', 'BE')),
  pips DECIMAL(10,2) NOT NULL,
  
  -- Notes & Emotions
  notes TEXT DEFAULT '',
  emotions_before VARCHAR(500) DEFAULT '',
  emotions_during VARCHAR(500) DEFAULT '',
  emotions_after VARCHAR(500) DEFAULT '',
  
  -- AI Feedback (stored as JSONB for flexibility)
  ai_feedback JSONB DEFAULT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance (matching MongoDB indexes)
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_user_date ON trades(user_id, date DESC);
CREATE INDEX idx_trades_user_outcome ON trades(user_id, outcome);
CREATE INDEX idx_trades_user_strategy ON trades(user_id, strategy_name);
CREATE INDEX idx_trades_user_session ON trades(user_id, session);
CREATE INDEX idx_trades_date ON trades(date);

-- ═══════════════════════════════════════════════════════════════════════
-- VIEWS FOR ANALYTICS
-- ═══════════════════════════════════════════════════════════════════════

-- User trading statistics view
CREATE OR REPLACE VIEW user_trading_stats AS
SELECT 
  user_id,
  COUNT(*) as total_trades,
  COUNT(CASE WHEN outcome = 'Win' THEN 1 END) as wins,
  COUNT(CASE WHEN outcome = 'Loss' THEN 1 END) as losses,
  COUNT(CASE WHEN outcome = 'BE' THEN 1 END) as break_evens,
  SUM(pips) as net_pips,
  AVG(rr_ratio) as avg_rr_ratio,
  AVG(risk_percentage) as avg_risk_percentage,
  AVG(CASE WHEN ai_feedback IS NOT NULL 
      THEN (ai_feedback->>'executionScore')::INTEGER 
      ELSE NULL END) as avg_execution_score
FROM trades
GROUP BY user_id;

-- Strategy performance view
CREATE OR REPLACE VIEW strategy_performance AS
SELECT 
  user_id,
  strategy_name,
  COUNT(*) as total_trades,
  COUNT(CASE WHEN outcome = 'Win' THEN 1 END) as wins,
  SUM(pips) as total_pips,
  AVG(rr_ratio) as avg_rr_ratio
FROM trades
GROUP BY user_id, strategy_name;

-- Session performance view
CREATE OR REPLACE VIEW session_performance AS
SELECT 
  user_id,
  session,
  COUNT(*) as total_trades,
  COUNT(CASE WHEN outcome = 'Win' THEN 1 END) as wins,
  SUM(pips) as total_pips
FROM trades
GROUP BY user_id, session;

-- ═══════════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for trades table
CREATE TRIGGER update_trades_updated_at
BEFORE UPDATE ON trades
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════
-- SEED DATA (OPTIONAL - for testing)
-- ═══════════════════════════════════════════════════════════════════════

-- Sample user (password: password123)
-- Uncomment to insert test user
-- INSERT INTO users (email, password, name) 
-- VALUES ('trader@example.com', '$2a$10$8ZqV9K7xGXX4yP5Z.1M8sO7vY6K8LqNZ1F2MQX6zJ8GZQX4YJ8GZQ', 'Test Trader');
