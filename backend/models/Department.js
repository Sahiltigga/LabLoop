const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide department name'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Please provide department code (e.g. CSE, ECE)'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    headOfDepartment: {
      type: String,
      default: '',
    },
    contactEmail: {
      type: String,
      trim: true,
      default: '',
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    laboratories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Laboratory',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Department', departmentSchema);

