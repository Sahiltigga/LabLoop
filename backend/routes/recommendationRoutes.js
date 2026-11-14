const express = require('express');
const router = express.Router();
const {
  getIdleEquipment,
  getMatches,
  getDemand,
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/idle-equipment', getIdleEquipment);
router.get('/equipment-matches', getMatches);
router.get('/demand-analysis', getDemand);

module.exports = router;

