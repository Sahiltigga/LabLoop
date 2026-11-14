const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');

/**
 * Validate booking rules and detect overlapping reservations
 * Overlap formula: NewStart < ExistingEnd AND NewEnd > ExistingStart
 */
const validateBookingRequest = async ({
  userId,
  equipmentId,
  startTime,
  endTime,
  requestedQuantity = 1,
  userRole = 'student',
}) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  // 1. Time checks
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date/time format provided.');
  }

  if (start >= end) {
    throw new Error('Booking start time must be before the end time.');
  }

  // Allow a 5-minute grace period for clock skew
  if (start < new Date(now.getTime() - 5 * 60 * 1000)) {
    throw new Error('Cannot schedule a booking in the past.');
  }

  const durationHours = (end - start) / (1000 * 60 * 60);

  // 2. Equipment check
  const equipment = await Equipment.findById(equipmentId).populate('department');
  if (!equipment) {
    throw new Error('Equipment not found.');
  }

  // Check equipment usable status
  const unusableStatuses = ['Under Maintenance', 'Unavailable', 'Retired'];
  if (unusableStatuses.includes(equipment.status)) {
    throw new Error(
      `Equipment is currently '${equipment.status}' and cannot be reserved.`
    );
  }

  // 3. Max duration check
  if (equipment.maxBookingHours && durationHours > equipment.maxBookingHours) {
    throw new Error(
      `Booking duration (${durationHours.toFixed(1)} hrs) exceeds the maximum allowed limit of ${
        equipment.maxBookingHours
      } hours for this equipment.`
    );
  }

  // 4. Quantity validation
  const qty = parseInt(requestedQuantity, 10);
  if (isNaN(qty) || qty <= 0) {
    throw new Error('Requested quantity must be at least 1.');
  }

  if (qty > equipment.quantity) {
    throw new Error(
      `Requested quantity (${qty}) exceeds total equipment inventory (${equipment.quantity}).`
    );
  }

  // 5. Training requirement check
  // Students must meet training or faculty approval for specialized equipment
  if (equipment.requiresTraining && userRole === 'student') {
    // For academic demo, students can request, but flag notice
    // Or allow request which will require explicit faculty approval
  }

  // 6. Overlap conflict checking (Quantity-aware)
  // Overlap condition: (startTime < existing.endTime) AND (endTime > existing.startTime)
  // Active/Approved/Pending statuses that occupy quantity
  const activeBookings = await Booking.find({
    equipment: equipmentId,
    status: { $in: ['Pending', 'Approved', 'Checked-Out'] },
    startTime: { $lt: end },
    endTime: { $gt: start },
  });

  // Calculate sum of reserved quantities in this overlapping window
  const totalReservedInSlot = activeBookings.reduce(
    (sum, b) => sum + (b.requestedQuantity || 1),
    0
  );

  const availableInSlot = equipment.quantity - totalReservedInSlot;

  if (qty > availableInSlot) {
    throw new Error(
      `Scheduling conflict: ${equipment.name} only has ${Math.max(
        0,
        availableInSlot
      )} unit(s) available during the requested time slot (${totalReservedInSlot} currently reserved/pending).`
    );
  }

  return {
    valid: true,
    equipment,
    durationHours,
    availableInSlot,
  };
};

module.exports = {
  validateBookingRequest,
};

