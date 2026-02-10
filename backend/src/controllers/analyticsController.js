const Trade = require('../models/Trade');
const aiService = require('../services/aiService');
const db = require('../config/database');

/**
 * Get dashboard summary statistics
 * GET /api/analytics/summary
 */
exports.getSummary = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get all user trades for analytics
    const trades = await Trade.getAllForAnalytics(userId);
    
    if (trades.length === 0) {
      return res.json({
        message: 'No trades found. Start logging your trades!',
        stats: {
          totalTrades: 0,
          winRate: 0,
          lossRate: 0,
          netPips: 0,
          avgRR: 0,
          bestStrategy: 'N/A',
          commonMistake: 'N/A'
        }
      });
    }
    
    // Calculate statistics using SQL
    const statsQuery = `
      SELECT 
        COUNT(*) as total_trades,
        COUNT(CASE WHEN outcome = 'Win' THEN 1 END) as wins,
        COUNT(CASE WHEN outcome = 'Loss' THEN 1 END) as losses,
        COUNT(CASE WHEN outcome = 'BE' THEN 1 END) as break_even,
        SUM(pips) as net_pips,
        AVG(rr_ratio) as avg_rr,
        AVG(CASE WHEN ai_feedback IS NOT NULL 
            THEN (ai_feedback->>'executionScore')::INTEGER 
            ELSE NULL END) as avg_execution_score
      FROM trades
      WHERE user_id = $1
    `;
    
    const statsResult = await db.query(statsQuery, [userId]);
    const stats = statsResult.rows[0];
    
    const totalTrades = parseInt(stats.total_trades);
    const wins = parseInt(stats.wins);
    const losses = parseInt(stats.losses);
    const breakEven = parseInt(stats.break_even);
    const winRate = ((wins / totalTrades) * 100).toFixed(1);
    const lossRate = ((losses / totalTrades) * 100).toFixed(1);
    const netPips = parseFloat(stats.net_pips || 0).toFixed(1);
    const avgRR = parseFloat(stats.avg_rr || 0).toFixed(2);
    
    // Best performing strategy
    const strategyQuery = `
      SELECT 
        strategy_name,
        COUNT(*) as total,
        COUNT(CASE WHEN outcome = 'Win' THEN 1 END) as wins,
        SUM(pips) as total_pips
      FROM trades
      WHERE user_id = $1
      GROUP BY strategy_name
      ORDER BY (COUNT(CASE WHEN outcome = 'Win' THEN 1 END)::FLOAT / COUNT(*)) DESC
      LIMIT 1
    `;
    
    const strategyResult = await db.query(strategyQuery, [userId]);
    let bestStrategy = 'N/A';
    if (strategyResult.rows.length > 0) {
      const s = strategyResult.rows[0];
      const strategyWR = ((s.wins / s.total) * 100).toFixed(0);
      bestStrategy = `${s.strategy_name} (${strategyWR}% WR, ${parseFloat(s.total_pips).toFixed(0)} pips)`;
    }
    
    // Most common mistake from AI feedback
    const mistakeCounts = {};
    trades.forEach(t => {
      if (t.aiFeedback && t.aiFeedback.mistakes) {
        t.aiFeedback.mistakes.forEach(mistake => {
          mistakeCounts[mistake] = (mistakeCounts[mistake] || 0) + 1;
        });
      }
    });
    
    let commonMistake = 'N/A';
    let maxCount = 0;
    Object.entries(mistakeCounts).forEach(([mistake, count]) => {
      if (count > maxCount) {
        maxCount = count;
        commonMistake = mistake;
      }
    });
    
    // Recent performance (last 10 trades)
    const recentTrades = trades.slice(0, 10);
    const recentWinRate = recentTrades.length > 0
      ? ((recentTrades.filter(t => t.outcome === 'Win').length / recentTrades.length) * 100).toFixed(1)
      : 0;
    
    // Session performance
    const sessionQuery = `
      SELECT 
        session,
        COUNT(*) as total,
        COUNT(CASE WHEN outcome = 'Win' THEN 1 END) as wins,
        SUM(pips) as total_pips
      FROM trades
      WHERE user_id = $1
      GROUP BY session
    `;
    
    const sessionResult = await db.query(sessionQuery, [userId]);
    const sessionPerformance = sessionResult.rows.map(row => ({
      session: row.session,
      winRate: ((row.wins / row.total) * 100).toFixed(1),
      totalPips: parseFloat(row.total_pips).toFixed(1),
      trades: parseInt(row.total)
    }));
    
    // Strategy breakdown
    const strategyBreakdownQuery = `
      SELECT 
        strategy_name,
        COUNT(*) as total,
        COUNT(CASE WHEN outcome = 'Win' THEN 1 END) as wins,
        SUM(pips) as total_pips
      FROM trades
      WHERE user_id = $1
      GROUP BY strategy_name
    `;
    
    const strategyBreakdownResult = await db.query(strategyBreakdownQuery, [userId]);
    const strategyBreakdown = strategyBreakdownResult.rows.map(row => ({
      strategy: row.strategy_name,
      winRate: ((row.wins / row.total) * 100).toFixed(1),
      totalPips: parseFloat(row.total_pips).toFixed(1),
      trades: parseInt(row.total)
    }));
    
    res.json({
      stats: {
        totalTrades,
        winRate: parseFloat(winRate),
        lossRate: parseFloat(lossRate),
        breakEvenRate: ((breakEven / totalTrades) * 100).toFixed(1),
        netPips: parseFloat(netPips),
        avgRR: parseFloat(avgRR),
        bestStrategy,
        commonMistake,
        avgExecutionScore: stats.avg_execution_score ? parseFloat(stats.avg_execution_score).toFixed(1) : 'N/A',
        recentWinRate: parseFloat(recentWinRate)
      },
      breakdown: {
        wins,
        losses,
        breakEven
      },
      sessionPerformance,
      strategyBreakdown
    });
    
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      error: 'Failed to generate summary',
      details: error.message
    });
  }
};

/**
 * Get AI-generated weekly or monthly review
 * GET /api/analytics/ai-review?period=weekly|monthly
 */
exports.getAIReview = async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    
    if (!['weekly', 'monthly'].includes(period)) {
      return res.status(400).json({
        error: 'Period must be "weekly" or "monthly"'
      });
    }
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    if (period === 'weekly') {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }
    
    // Get trades in period
    const trades = await Trade.findByDateRange(req.userId, startDate, now);
    
    // Generate AI review
    const review = await aiService.generatePeriodReview(trades, period);
    
    res.json({
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      review
    });
    
  } catch (error) {
    console.error('Get AI review error:', error);
    res.status(500).json({
      error: 'Failed to generate AI review',
      details: error.message
    });
  }
};

/**
 * Export trades to CSV
 * GET /api/analytics/export
 */
exports.exportTrades = async (req, res) => {
  try {
    const trades = await Trade.getAllForAnalytics(req.userId);
    
    if (trades.length === 0) {
      return res.status(404).json({
        error: 'No trades to export'
      });
    }
    
    // Build CSV
    const headers = [
      'Date',
      'Session',
      'Pair',
      'Timeframe',
      'Direction',
      'Entry',
      'Stop Loss',
      'Take Profit',
      'Lot Size',
      'Risk %',
      'R:R',
      'Strategy',
      'Outcome',
      'Pips',
      'Execution Score',
      'AI Suggestion',
      'Strengths',
      'Mistakes',
      'Emotions Before',
      'Emotions During',
      'Emotions After',
      'Notes'
    ];
    
    const rows = trades.map(t => [
      new Date(t.date).toISOString().split('T')[0],
      t.session,
      t.currencyPair,
      t.timeframe,
      t.direction,
      t.entryPrice,
      t.stopLoss,
      t.takeProfit,
      t.lotSize,
      t.riskPercentage,
      t.rrRatio,
      t.strategyName,
      t.outcome,
      t.pips,
      t.aiFeedback?.executionScore || 'N/A',
      t.aiFeedback?.suggestion || 'N/A',
      t.aiFeedback?.strengths?.join('; ') || 'N/A',
      t.aiFeedback?.mistakes?.join('; ') || 'N/A',
      t.emotionsBefore || '',
      t.emotionsDuring || '',
      t.emotionsAfter || '',
      t.notes || ''
    ]);
    
    // Escape CSV values
    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    
    const csv = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');
    
    // Set headers for download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=trades-export-${Date.now()}.csv`);
    res.send(csv);
    
  } catch (error) {
    console.error('Export trades error:', error);
    res.status(500).json({
      error: 'Failed to export trades',
      details: error.message
    });
  }
};

/**
 * Get performance trends over time
 * GET /api/analytics/trends
 */
exports.getTrends = async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE_TRUNC('week', date) as week,
        COUNT(*) as total,
        COUNT(CASE WHEN outcome = 'Win' THEN 1 END) as wins,
        SUM(pips) as total_pips
      FROM trades
      WHERE user_id = $1
      GROUP BY DATE_TRUNC('week', date)
      ORDER BY week ASC
    `;
    
    const result = await db.query(query, [req.userId]);
    
    const trends = result.rows.map(row => ({
      week: row.week.toISOString().split('T')[0],
      winRate: ((row.wins / row.total) * 100).toFixed(1),
      totalPips: parseFloat(row.total_pips).toFixed(1),
      trades: parseInt(row.total)
    }));
    
    res.json({ trends });
    
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get trends',
      details: error.message
    });
  }
};
