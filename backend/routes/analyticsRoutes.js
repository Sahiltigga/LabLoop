const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUtilizationAnalytics,
  getDepartmentAnalytics,
  getUsageHistory,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/utilization', getUtilizationAnalytics);
router.get('/department', getDepartmentAnalytics);
router.get('/usage-history', getUsageHistory);

module.exports = router;

