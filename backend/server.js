const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database configuration
const db = require('./src/config/database');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const tradeRoutes = require('./src/routes/tradeRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

const app = express();

// ═══════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════

// Security headers
app.use(helmet());

// CORS configuration - supports both development and production
const allowedOrigins = [
  'http://localhost:3000', // Local development
  process.env.FRONTEND_URL, // Environment variable for production
  'https://forex-trading-journal-rfue4jcu3-darshans-projects-1289424d.vercel.app' // Vercel URL
].filter(Boolean); // Remove undefined/null values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting - prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ═══════════════════════════════════════════════════════════
// DATABASE CONNECTION TEST
// ═══════════════════════════════════════════════════════════

// Test PostgreSQL connection on startup
(async () => {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected at:', result.rows[0].now);
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    process.exit(1);
  }
})();

// ═══════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════

app.use('/api/auth', authRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/analytics', analyticsRoutes);

// Simple status endpoint requested
app.get('/api/status', (req, res) => {
  res.send('API Running Successfully');
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({
      status: 'OK',
      message: 'Forex Trading Journal API is running (PERN Stack)',
      timestamp: new Date().toISOString(),
      database: 'PostgreSQL - Connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      database: 'PostgreSQL - Disconnected'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Forex Trading Journal API (PERN Stack)',
    status: 'API Running Successfully',
    version: '2.0.0',
    stack: 'PostgreSQL + Express + React + Node.js',
    endpoints: {
      auth: '/api/auth',
      trades: '/api/trades',
      analytics: '/api/analytics',
      health: '/api/health',
      status: '/api/status'
    }
  });
});

// ═══════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // PostgreSQL errors
  if (err.code) {
    if (err.code === '23505') { // Unique violation
      return res.status(400).json({
        error: 'Duplicate entry',
        details: err.detail
      });
    }
    if (err.code === '23503') { // Foreign key violation
      return res.status(400).json({
        error: 'Invalid reference',
        details: err.detail
      });
    }
    if (err.code === '23514') { // Check violation
      return res.status(400).json({
        error: 'Validation error',
        details: err.detail
      });
    }
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired'
    });
  }
  
  // Default error
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ═══════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║     🚀 FOREX TRADING JOURNAL API - PERN STACK             ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: PostgreSQL`);
  console.log(`🤖 AI Analysis: Enabled`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  • POST   /api/auth/register`);
  console.log(`  • POST   /api/auth/login`);
  console.log(`  • GET    /api/trades`);
  console.log(`  • POST   /api/trades`);
  console.log(`  • PUT    /api/trades/:id`);
  console.log(`  • DELETE /api/trades/:id`);
  console.log(`  • GET    /api/analytics/summary`);
  console.log(`  • GET    /api/analytics/ai-review`);
  console.log(`  • GET    /api/analytics/export`);
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await db.pool.end();
  process.exit(0);
});

module.exports = app;
