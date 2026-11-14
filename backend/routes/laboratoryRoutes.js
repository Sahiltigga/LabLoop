const express = require('express');
const router = express.Router();
const {
  getLaboratories,
  getLaboratoryById,
  createLaboratory,
  updateLaboratory,
  deleteLaboratory,
} = require('../controllers/laboratoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getLaboratories);
router.get('/:id', getLaboratoryById);

router.post('/', protect, authorize('admin', 'faculty'), createLaboratory);
router.put('/:id', protect, authorize('admin', 'faculty'), updateLaboratory);
router.delete('/:id', protect, authorize('admin'), deleteLaboratory);

module.exports = router;

