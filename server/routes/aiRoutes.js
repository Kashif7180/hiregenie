const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const { analyzeResumeController } = require('../controllers/aiController');

// POST /api/ai/analyze/:resumeId
// Middleware chain: protect (JWT) → aiLimiter (30/hour) → controller
// Rate limited because AI calls are expensive!
router.post('/analyze/:resumeId', protect, aiLimiter, analyzeResumeController);

// Health check
router.get('/health', (req, res) => {
    res.json({ success: true, message: 'AI routes working' });
});

module.exports = router;
