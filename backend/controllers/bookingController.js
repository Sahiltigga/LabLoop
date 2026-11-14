const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { validateBookingRequest } = require('../services/bookingService');

// @desc    Get all bookings (Role-aware & filtered)
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res, next) => {
  try {
    const { status, equipment, department, startDate, endDate } = req.query;
    const filter = {};

    // Role-based visibility
    if (req.user.role === 'student') {
      filter.user = req.user._id;
    } else if (req.user.role === 'faculty' && req.user.department) {
      // Faculty primarily views bookings for equipment in their department
      // But can also view all if explicitly requested
      if (department) {
        filter.department = department;
      } else {
        filter.department = req.user.department._id || req.user.department;
      }
    } else if (department) {
      filter.department = department;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (equipment) {
      filter.equipment = equipment;
    }

    if (startDate && endDate) {
      filter.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'name email role studentOrEmployeeId phone department')
      .populate({
        path: 'equipment',
        select: 'name equipmentCode category laboratory quantity availableQuantity condition status requiresTraining maxBookingHours',
        populate: { path: 'laboratory', select: 'name location' },
      })
      .populate('department', 'name code')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email role studentOrEmployeeId phone department')
      .populate({
        path: 'equipment',
        populate: [
          { path: 'department', select: 'name code' },
          { path: 'laboratory', select: 'name location' },
        ],
      })
      .populate('department', 'name code')
      .populate('approvedBy', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking record not found.',
      });
    }

    // Authorization check: students can only view their own bookings
    if (
      req.user.role === 'student' &&
      booking.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking record.',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new booking request
// @route   POST /api/bookings
// @access  Private (Student, Faculty, Admin)
const createBooking = async (req, res, next) => {
  try {
    const { equipmentId, startTime, endTime, requestedQuantity = 1, purpose } =
      req.body;

    if (!equipmentId || !startTime || !endTime || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Please provide equipment, start time, end time, and purpose.',
      });
    }

    // Run safe conflict and quantity validation
    const validation = await validateBookingRequest({
      userId: req.user._id,
      equipmentId,
      startTime,
      endTime,
      requestedQuantity,
      userRole: req.user.role,
    });

    const equipment = validation.equipment;

    // Faculty or Admin can auto-approve their own bookings if needed, otherwise 'Pending'
    const initialStatus =
      req.user.role === 'admin' ? 'Approved' : 'Pending';

    const booking = await Booking.create({
      user: req.user._id,
      equipment: equipmentId,
      department: equipment.department._id || equipment.department,
      requestedQuantity: parseInt(requestedQuantity, 10),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      purpose: purpose.trim(),
      status: initialStatus,
      approvedBy: initialStatus === 'Approved' ? req.user._id : null,
      approvedAt: initialStatus === 'Approved' ? new Date() : null,
    });

    // Populate for response
    const populated = await Booking.findById(booking._id)
      .populate('user', 'name email studentOrEmployeeId')
      .populate('equipment', 'name equipmentCode category')
      .populate('department', 'name code');

    // Create notification for department faculty / lab manager
    const facultyMembers = await User.find({
      role: { $in: ['faculty', 'admin'] },
      $or: [
        { department: equipment.department._id || equipment.department },
        { role: 'admin' },
      ],
    }).limit(3);

    for (const faculty of facultyMembers) {
      await Notification.create({
        recipient: faculty._id,
        title: 'New Booking Request',
        message: `${req.user.name} requested ${requestedQuantity} unit(s) of ${
          equipment.name
        } for ${new Date(startTime).toLocaleDateString()}.`,
        type: 'booking',
        relatedRecord: {
          modelName: 'Booking',
          recordId: booking._id,
        },
      });
    }

    res.status(201).json({
      success: true,
      message:
        initialStatus === 'Approved'
          ? 'Booking confirmed automatically.'
          : 'Booking request submitted successfully! Awaiting faculty review.',
      booking: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject a booking request
// @route   PATCH /api/bookings/:id/status
// @access  Private (Faculty, Admin)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Approved' or 'Rejected'.",
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('equipment')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (booking.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot change status: Booking is already '${booking.status}'.`,
      });
    }

    // If approving, re-verify conflict prevention safely
    if (status === 'Approved') {
      await validateBookingRequest({
        userId: booking.user._id,
        equipmentId: booking.equipment._id,
        startTime: booking.startTime,
        endTime: booking.endTime,
        requestedQuantity: booking.requestedQuantity,
        userRole: booking.user.role,
      });

      booking.status = 'Approved';
      booking.approvedBy = req.user._id;
      booking.approvedAt = new Date();
      booking.rejectionReason = '';
    } else {
      booking.status = 'Rejected';
      booking.rejectionReason = rejectionReason || 'Request declined by faculty/manager.';
    }

    await booking.save();

    // Notify student of decision
    await Notification.create({
      recipient: booking.user._id,
      title: `Booking ${status}`,
      message: `Your booking for ${booking.equipment.name} has been ${status.toLowerCase()}.${
        status === 'Rejected' ? ` Reason: ${booking.rejectionReason}` : ''
      }`,
      type: 'booking',
      relatedRecord: {
        modelName: 'Booking',
        recordId: booking._id,
      },
    });

    const populated = await Booking.findById(booking._id)
      .populate('user', 'name email')
      .populate('equipment', 'name equipmentCode category')
      .populate('approvedBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Booking has been ${status.toLowerCase()}.`,
      booking: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-in / Handover equipment
// @route   POST /api/bookings/:id/check-in
// @access  Private (Student, Faculty, Technician, Admin)
const checkInBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('equipment');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (booking.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: `Only 'Approved' bookings can be checked out. Current status: '${booking.status}'.`,
      });
    }

    booking.status = 'Checked-Out';
    booking.actualCheckIn = new Date();
    await booking.save();

    // Decrement equipment availableQuantity if applicable
    await Equipment.findByIdAndUpdate(booking.equipment._id, {
      $inc: { availableQuantity: -Math.min(booking.requestedQuantity, 1) },
    });

    res.status(200).json({
      success: true,
      message: 'Equipment successfully checked out for laboratory session.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-out / Return equipment
// @route   POST /api/bookings/:id/check-out
// @access  Private (Student, Faculty, Technician, Admin)
const checkOutBooking = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    const booking = await Booking.findById(req.params.id).populate('equipment');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (booking.status !== 'Checked-Out') {
      return res.status(400).json({
        success: false,
        message: `Booking is not currently checked out. Status: '${booking.status}'.`,
      });
    }

    const checkOutTime = new Date();
    const checkInTime = booking.actualCheckIn || booking.startTime;
    const durationHours = Math.max(
      0.1,
      parseFloat(((checkOutTime - checkInTime) / (1000 * 60 * 60)).toFixed(2))
    );

    booking.status = 'Completed';
    booking.actualCheckOut = checkOutTime;
    booking.actualUsageHours = durationHours;
    if (remarks) booking.remarks = remarks;

    await booking.save();

    // Restore availableQuantity
    await Equipment.findByIdAndUpdate(booking.equipment._id, {
      $inc: { availableQuantity: Math.min(booking.requestedQuantity, 1) },
    });

    res.status(200).json({
      success: true,
      message: `Equipment returned successfully. Recorded usage: ${durationHours} hours.`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (Owner or Admin)
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('equipment');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Role check
    if (
      req.user.role === 'student' &&
      booking.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own bookings.',
      });
    }

    if (['Completed', 'Cancelled', 'Checked-Out'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking that is already '${booking.status}'.`,
      });
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  checkInBooking,
  checkOutBooking,
  cancelBooking,
};

