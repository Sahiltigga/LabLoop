const express = require('express');
const router = express.Router();
const {
  getMaintenanceList,
  getMaintenanceById,
  createMaintenanceReport,
  updateMaintenanceStatus,
} = require('../controllers/maintenanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getMaintenanceList);
router.post('/', createMaintenanceReport);
router.get('/:id', getMaintenanceById);
router.patch(
  '/:id',
  authorize('admin', 'faculty', 'technician'),
  updateMaintenanceStatus
);

module.exports = router;

