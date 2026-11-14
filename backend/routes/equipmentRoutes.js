const express = require('express');
const router = express.Router();
const {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} = require('../controllers/equipmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getEquipment);
router.get('/:id', getEquipmentById);

router.post('/', protect, authorize('admin', 'faculty'), createEquipment);
router.put('/:id', protect, authorize('admin', 'faculty', 'technician'), updateEquipment);
router.delete('/:id', protect, authorize('admin'), deleteEquipment);

module.exports = router;
