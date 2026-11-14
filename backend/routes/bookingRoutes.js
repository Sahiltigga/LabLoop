const express = require('express');
const router = express.Router();
const {
  getBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  checkInBooking,
  checkOutBooking,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getBookings);
router.post('/', createBooking);
router.get('/:id', getBookingById);
router.patch('/:id/status', authorize('admin', 'faculty'), updateBookingStatus);
router.post('/:id/check-in', checkInBooking);
router.post('/:id/check-out', checkOutBooking);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;

