const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    updateProfile,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerRules, loginRules, validate } = require('../utils/validators');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes (no login needed)
router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/refresh', refreshAccessToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes (JWT token required)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Health check
router.get('/health', (req, res) => {
    res.json({ success: true, message: 'Auth routes working' });
});

module.exports = router;
