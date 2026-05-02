const express = require('express');
const { getDashboard, getGlobalSummary } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All dashboard routes require authentication
router.use(protect);

// GET /api/dashboard/summary              - Overall summary across all user's projects
router.get('/summary', getGlobalSummary);

// GET /api/dashboard/:projectId           - Dashboard stats for a specific project
router.get('/:projectId', getDashboard);

module.exports = router;
