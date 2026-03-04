const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDashboardReport } = require('../controllers/reportController');

// GET /api/reports/dashboard — Full aggregated report
router.get('/dashboard', protect, getDashboardReport);

module.exports = router;
