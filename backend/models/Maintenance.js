const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Please select equipment for maintenance'],
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter must be identified'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    issue: {
      type: String,
      required: [true, 'Please provide issue title or summary'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide detailed fault description'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: [
        'Reported',
        'Pending',
        'Assigned',
        'In Progress',
        'Awaiting Inspection',
        'Completed',
        'Rejected',
      ],
      default: 'Reported',
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    repairCost: {
      type: Number,
      default: 0,
      min: [0, 'Cost cannot be negative'],
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
maintenanceSchema.index({ equipment: 1, status: 1 });
maintenanceSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);

