const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authMiddleware } = require('../middleware/auth');

// All analytics routes require authentication
router.use(authMiddleware);

// Routes
router.get('/summary', analyticsController.getSummary);
router.get('/ai-review', analyticsController.getAIReview);
router.get('/export', analyticsController.exportTrades);
router.get('/trends', analyticsController.getTrends);

module.exports = router;
