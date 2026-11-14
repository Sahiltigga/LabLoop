const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide equipment name'],
      trim: true,
    },
    equipmentCode: {
      type: String,
      required: [true, 'Please provide equipment code/ID (e.g. EQ-CSE-001)'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select equipment category'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide equipment description'],
      default: '',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Please specify department'],
    },
    laboratory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laboratory',
      required: [true, 'Please specify laboratory'],
    },
    modelNumber: {
      type: String,
      trim: true,
      default: '',
    },
    manufacturer: {
      type: String,
      trim: true,
      default: '',
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify total quantity'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Please specify available quantity'],
      min: [0, 'Available quantity cannot be negative'],
      default: 1,
    },
    condition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Needs Maintenance'],
      default: 'Good',
    },
    status: {
      type: String,
      enum: [
        'Available',
        'Partially Available',
        'Fully Booked',
        'Under Maintenance',
        'Unavailable',
        'Retired',
      ],
      default: 'Available',
    },
    requiresTraining: {
      type: Boolean,
      default: false,
    },
    maxBookingHours: {
      type: Number,
      default: 4,
      min: [1, 'Maximum booking hours must be at least 1 hour'],
      max: [24, 'Maximum booking hours cannot exceed 24 hours per session'],
    },
    maintenanceDueDate: {
      type: Date,
    },
    specifications: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index for quick queries
equipmentSchema.index({ department: 1, status: 1 });
equipmentSchema.index({ category: 1 });

module.exports = mongoose.model('Equipment', equipmentSchema);

