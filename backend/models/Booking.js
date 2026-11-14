const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must be associated with a user'],
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Booking must specify an equipment'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    requestedQuantity: {
      type: Number,
      required: [true, 'Please specify requested quantity'],
      min: [1, 'Requested quantity must be at least 1'],
      default: 1,
    },
    startTime: {
      type: Date,
      required: [true, 'Please specify booking start time'],
    },
    endTime: {
      type: Date,
      required: [true, 'Please specify booking end time'],
    },
    purpose: {
      type: String,
      required: [true, 'Please provide booking purpose / project details'],
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Approved',
        'Rejected',
        'Cancelled',
        'Checked-Out',
        'Completed',
      ],
      default: 'Pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    actualCheckIn: {
      type: Date,
    },
    actualCheckOut: {
      type: Date,
    },
    actualUsageHours: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for conflict checking and analytics
bookingSchema.index({ equipment: 1, status: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ user: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

