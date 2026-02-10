const db = require('../config/database');

class Trade {
  /**
   * Create a new trade
   */
  static async create(tradeData) {
    const query = `
      INSERT INTO trades (
        user_id, date, session, currency_pair, timeframe, direction,
        entry_price, stop_loss, take_profit, lot_size, risk_percentage, rr_ratio,
        strategy_name, outcome, pips, notes, emotions_before, emotions_during, emotions_after,
        ai_feedback, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [
      tradeData.userId,
      tradeData.date,
      tradeData.session,
      tradeData.currencyPair.toUpperCase(),
      tradeData.timeframe,
      tradeData.direction,
      tradeData.entryPrice,
      tradeData.stopLoss,
      tradeData.takeProfit,
      tradeData.lotSize,
      tradeData.riskPercentage,
      tradeData.rrRatio,
      tradeData.strategyName,
      tradeData.outcome,
      tradeData.pips,
      tradeData.notes || '',
      tradeData.emotionsBefore || '',
      tradeData.emotionsDuring || '',
      tradeData.emotionsAfter || '',
      tradeData.aiFeedback ? JSON.stringify(tradeData.aiFeedback) : null
    ];

    const result = await db.query(query, values);
    return Trade.formatTrade(result.rows[0]);
  }

  /**
   * Find all trades for a user
   */
  static async findByUserId(userId, options = {}) {
    const { 
      limit = 50, 
      offset = 0, 
      sortBy = 'date', 
      order = 'DESC',
      outcome,
      strategy,
      session
    } = options;

    let whereConditions = ['user_id = $1'];
    let params = [userId];
    let paramCount = 2;

    if (outcome) {
      whereConditions.push(`outcome = $${paramCount}`);
      params.push(outcome);
      paramCount++;
    }

    if (strategy) {
      whereConditions.push(`strategy_name = $${paramCount}`);
      params.push(strategy);
      paramCount++;
    }

    if (session) {
      whereConditions.push(`session = $${paramCount}`);
      params.push(session);
      paramCount++;
    }

    const query = `
      SELECT * FROM trades 
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${sortBy} ${order}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows.map(Trade.formatTrade);
  }

  /**
   * Count trades for a user
   */
  static async countByUserId(userId, filters = {}) {
    let whereConditions = ['user_id = $1'];
    let params = [userId];
    let paramCount = 2;

    if (filters.outcome) {
      whereConditions.push(`outcome = $${paramCount}`);
      params.push(filters.outcome);
      paramCount++;
    }

    if (filters.strategy) {
      whereConditions.push(`strategy_name = $${paramCount}`);
      params.push(filters.strategy);
      paramCount++;
    }

    if (filters.session) {
      whereConditions.push(`session = $${paramCount}`);
      params.push(filters.session);
      paramCount++;
    }

    const query = `SELECT COUNT(*) FROM trades WHERE ${whereConditions.join(' AND ')}`;
    const result = await db.query(query, params);
    return parseInt(result.rows[0].count);
  }

  /**
   * Find trade by ID
   */
  static async findById(id, userId) {
    const query = 'SELECT * FROM trades WHERE id = $1 AND user_id = $2';
    const result = await db.query(query, [id, userId]);
    return result.rows[0] ? Trade.formatTrade(result.rows[0]) : null;
  }

  /**
   * Update trade
   */
  static async update(id, userId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const fieldMap = {
      date: 'date',
      session: 'session',
      currencyPair: 'currency_pair',
      timeframe: 'timeframe',
      direction: 'direction',
      entryPrice: 'entry_price',
      stopLoss: 'stop_loss',
      takeProfit: 'take_profit',
      lotSize: 'lot_size',
      riskPercentage: 'risk_percentage',
      rrRatio: 'rr_ratio',
      strategyName: 'strategy_name',
      outcome: 'outcome',
      pips: 'pips',
      notes: 'notes',
      emotionsBefore: 'emotions_before',
      emotionsDuring: 'emotions_during',
      emotionsAfter: 'emotions_after',
      aiFeedback: 'ai_feedback'
    };

    Object.keys(updates).forEach(key => {
      if (fieldMap[key] && updates[key] !== undefined) {
        let value = updates[key];
        
        // Special handling for JSON fields
        if (key === 'aiFeedback') {
          value = JSON.stringify(value);
        }
        
        // Special handling for uppercase fields
        if (key === 'currencyPair') {
          value = value.toUpperCase();
        }

        fields.push(`${fieldMap[key]} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return await Trade.findById(id, userId);
    }

    values.push(id, userId);
    const query = `
      UPDATE trades 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0] ? Trade.formatTrade(result.rows[0]) : null;
  }

  /**
   * Delete trade
   */
  static async delete(id, userId) {
    const query = 'DELETE FROM trades WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await db.query(query, [id, userId]);
    return result.rows[0] ? Trade.formatTrade(result.rows[0]) : null;
  }

  /**
   * Delete multiple trades
   */
  static async deleteMany(ids, userId) {
    const query = 'DELETE FROM trades WHERE id = ANY($1) AND user_id = $2';
    const result = await db.query(query, [ids, userId]);
    return result.rowCount;
  }

  /**
   * Find trades by date range
   */
  static async findByDateRange(userId, startDate, endDate) {
    const query = `
      SELECT * FROM trades 
      WHERE user_id = $1 AND date >= $2 AND date <= $3
      ORDER BY date DESC
    `;
    const result = await db.query(query, [userId, startDate, endDate]);
    return result.rows.map(Trade.formatTrade);
  }

  /**
   * Get all trades for analytics (no limit)
   */
  static async getAllForAnalytics(userId) {
    const query = 'SELECT * FROM trades WHERE user_id = $1 ORDER BY date DESC';
    const result = await db.query(query, [userId]);
    return result.rows.map(Trade.formatTrade);
  }

  /**
   * Format trade from database to match MongoDB structure
   */
  static formatTrade(trade) {
    if (!trade) return null;

    return {
      _id: trade.id,
      id: trade.id,
      userId: trade.user_id,
      date: trade.date,
      session: trade.session,
      currencyPair: trade.currency_pair,
      timeframe: trade.timeframe,
      direction: trade.direction,
      entryPrice: parseFloat(trade.entry_price),
      stopLoss: parseFloat(trade.stop_loss),
      takeProfit: parseFloat(trade.take_profit),
      lotSize: parseFloat(trade.lot_size),
      riskPercentage: parseFloat(trade.risk_percentage),
      rrRatio: parseFloat(trade.rr_ratio),
      strategyName: trade.strategy_name,
      outcome: trade.outcome,
      pips: parseFloat(trade.pips),
      notes: trade.notes,
      emotionsBefore: trade.emotions_before,
      emotionsDuring: trade.emotions_during,
      emotionsAfter: trade.emotions_after,
      aiFeedback: trade.ai_feedback,
      createdAt: trade.created_at,
      updatedAt: trade.updated_at
    };
  }

  /**
   * Calculate R:R ratio from prices
   */
  static calculateRR(entryPrice, stopLoss, takeProfit) {
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(takeProfit - entryPrice);
    return reward / risk;
  }
}

module.exports = Trade;
