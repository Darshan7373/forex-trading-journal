const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const tradeController = require('../controllers/tradeController');
const { authMiddleware } = require('../middleware/auth');

// All trade routes require authentication
router.use(authMiddleware);

// Validation rules for trade creation/update
const tradeValidation = [
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('session')
    .isIn(['London', 'NY', 'Asia', 'Sydney'])
    .withMessage('Session must be London, NY, Asia, or Sydney'),
  body('currencyPair')
    .notEmpty()
    .trim()
    .toUpperCase()
    .withMessage('Currency pair is required'),
  body('timeframe')
    .isIn(['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1', 'MN'])
    .withMessage('Invalid timeframe'),
  body('direction')
    .isIn(['Buy', 'Sell'])
    .withMessage('Direction must be Buy or Sell'),
  body('entryPrice')
    .isFloat({ min: 0 })
    .withMessage('Entry price must be a positive number'),
  body('stopLoss')
    .isFloat({ min: 0 })
    .withMessage('Stop loss must be a positive number'),
  body('takeProfit')
    .isFloat({ min: 0 })
    .withMessage('Take profit must be a positive number'),
  body('lotSize')
    .isFloat({ min: 0.01 })
    .withMessage('Lot size must be at least 0.01'),
  body('riskPercentage')
    .isFloat({ min: 0.1, max: 10 })
    .withMessage('Risk percentage must be between 0.1 and 10'),
  body('rrRatio')
    .isFloat({ min: 0.1 })
    .withMessage('R:R ratio must be a positive number'),
  body('strategyName')
    .notEmpty()
    .trim()
    .withMessage('Strategy name is required'),
  body('outcome')
    .isIn(['Win', 'Loss', 'BE'])
    .withMessage('Outcome must be Win, Loss, or BE'),
  body('pips')
    .isFloat()
    .withMessage('Pips must be a number')
];

// Routes
router.get('/', tradeController.getAllTrades);
router.get('/:id', tradeController.getTradeById);
router.post('/', tradeValidation, tradeController.createTrade);
router.put('/:id', tradeController.updateTrade);
router.delete('/:id', tradeController.deleteTrade);
router.delete('/batch/delete', tradeController.batchDeleteTrades);

module.exports = router;
