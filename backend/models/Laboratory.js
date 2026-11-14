const mongoose = require('mongoose');

const laboratorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide laboratory name'],
      trim: true,
    },
    laboratoryCode: {
      type: String,
      required: [true, 'Please provide laboratory code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Please associate laboratory with a department'],
    },
    location: {
      type: String,
      required: [true, 'Please provide laboratory location (e.g., Block B, Room 302)'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Active', 'Under Renovation', 'Inactive'],
      default: 'Active',
    },
    operatingHours: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '17:00' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Laboratory', laboratorySchema);

