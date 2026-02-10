const Trade = require('../models/Trade');
const aiService = require('../services/aiService');
const { validationResult } = require('express-validator');

/**
 * Get all trades for logged-in user
 * GET /api/trades
 */
exports.getAllTrades = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50,
      sortBy = 'date',
      order = 'desc',
      outcome,
      strategy,
      session
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const options = {
      limit: parseInt(limit),
      offset,
      sortBy,
      order: order.toUpperCase(),
      outcome,
      strategy,
      session
    };
    
    const trades = await Trade.findByUserId(req.userId, options);
    const total = await Trade.countByUserId(req.userId, { outcome, strategy, session });
    
    res.json({
      trades,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalTrades: total,
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({
      error: 'Failed to fetch trades',
      details: error.message
    });
  }
};

/**
 * Get single trade by ID
 * GET /api/trades/:id
 */
exports.getTradeById = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id, req.userId);
    
    if (!trade) {
      return res.status(404).json({
        error: 'Trade not found'
      });
    }
    
    res.json({ trade });
    
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch trade',
      details: error.message
    });
  }
};

/**
 * Create new trade (with automatic AI analysis)
 * POST /api/trades
 */
exports.createTrade = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    if (!req.userId) {
      return res.status(401).json({
        error: 'Unauthorized. User not authenticated.'
      });
    }
    
    // Prepare trade data
    const tradeData = {
      ...req.body,
      userId: req.userId
    };
    
    // Get user's trading history for AI context
    const userTrades = await Trade.findByUserId(req.userId, { limit: 20 });
    
    // Generate AI feedback
    const aiFeedback = await aiService.analyzeTrade(tradeData, userTrades);
    tradeData.aiFeedback = aiFeedback;
    
    // Create trade with AI feedback
    const trade = await Trade.create(tradeData);
    
    res.status(201).json({
      message: 'Trade created successfully with AI analysis',
      trade,
      aiInsights: {
        score: aiFeedback.executionScore,
        quickSummary: aiFeedback.suggestion
      }
    });
    
  } catch (error) {
    console.error('Create trade error:', error);
    res.status(500).json({
      error: 'Failed to create trade',
      details: error.message
    });
  }
};

/**
 * Update trade
 * PUT /api/trades/:id
 */
exports.updateTrade = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id, req.userId);
    
    if (!trade) {
      return res.status(404).json({
        error: 'Trade not found'
      });
    }
    
    // Check if significant fields changed (re-analyze with AI)
    const significantFields = ['outcome', 'pips', 'entryPrice', 'stopLoss', 'takeProfit'];
    const hasSignificantChanges = significantFields.some(field => req.body[field] !== undefined);
    
    let updates = { ...req.body };
    
    if (hasSignificantChanges) {
      const userTrades = await Trade.findByUserId(req.userId, { limit: 20 });
      const mergedTrade = { ...trade, ...updates, userId: req.userId };
      const aiFeedback = await aiService.analyzeTrade(mergedTrade, userTrades);
      updates.aiFeedback = aiFeedback;
    }
    
    const updatedTrade = await Trade.update(req.params.id, req.userId, updates);
    
    res.json({
      message: 'Trade updated successfully',
      trade: updatedTrade
    });
    
  } catch (error) {
    console.error('Update trade error:', error);
    res.status(500).json({
      error: 'Failed to update trade',
      details: error.message
    });
  }
};

/**
 * Delete trade
 * DELETE /api/trades/:id
 */
exports.deleteTrade = async (req, res) => {
  try {
    const trade = await Trade.delete(req.params.id, req.userId);
    
    if (!trade) {
      return res.status(404).json({
        error: 'Trade not found'
      });
    }
    
    res.json({
      message: 'Trade deleted successfully',
      tradeId: trade.id
    });
    
  } catch (error) {
    console.error('Delete trade error:', error);
    res.status(500).json({
      error: 'Failed to delete trade',
      details: error.message
    });
  }
};

/**
 * Batch delete trades
 * DELETE /api/trades/batch
 */
exports.batchDeleteTrades = async (req, res) => {
  try {
    const { tradeIds } = req.body;
    
    if (!Array.isArray(tradeIds) || tradeIds.length === 0) {
      return res.status(400).json({
        error: 'tradeIds must be a non-empty array'
      });
    }
    
    const deletedCount = await Trade.deleteMany(tradeIds, req.userId);
    
    res.json({
      message: `${deletedCount} trades deleted successfully`,
      deletedCount
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete trades',
      details: error.message
    });
  }
};
