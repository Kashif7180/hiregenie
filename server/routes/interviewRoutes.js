const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const {
    startInterview,
    submitAnswer,
    getInterviews,
    getInterviewById,
} = require('../controllers/interviewController');

// All routes are protected (require JWT login)

// POST /api/interview/start — Start new interview (AI generates questions)
// Rate limited because it calls Gemini AI
router.post('/start', protect, aiLimiter, startInterview);

// POST /api/interview/:interviewId/answer/:questionId — Submit answer
// Rate limited because it calls Gemini AI for evaluation
router.post('/:interviewId/answer/:questionId', protect, aiLimiter, submitAnswer);

// GET /api/interview — Get all interviews for user
router.get('/', protect, getInterviews);

// GET /api/interview/:id — Get single interview with details
router.get('/:id', protect, getInterviewById);

module.exports = router;
