const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  getTechnicians,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/technicians', getTechnicians);
router.get('/', authorize('admin'), getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', authorize('admin'), updateUser);

module.exports = router;

