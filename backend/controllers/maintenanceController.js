const Maintenance = require('../models/Maintenance');
const Equipment = require('../models/Equipment');
const Notification = require('../models/Notification');
const Booking = require('../models/Booking');

// @desc    Get all maintenance records
// @route   GET /api/maintenance
// @access  Private
const getMaintenanceList = async (req, res, next) => {
  try {
    const { status, priority, equipmentId, technicianId } = req.query;
    const filter = {};

    if (status && status !== 'All') filter.status = status;
    if (priority && priority !== 'All') filter.priority = priority;
    if (equipmentId) filter.equipment = equipmentId;

    // Technicians can filter by their assigned tasks
    if (req.user.role === 'technician') {
      filter.$or = [{ assignedTo: req.user._id }, { status: 'Reported' }];
    } else if (technicianId) {
      filter.assignedTo = technicianId;
    }

    const records = await Maintenance.find(filter)
      .populate({
        path: 'equipment',
        select: 'name equipmentCode category department laboratory condition status',
        populate: [
          { path: 'department', select: 'name code' },
          { path: 'laboratory', select: 'name location' },
        ],
      })
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single maintenance record
// @route   GET /api/maintenance/:id
// @access  Private
const getMaintenanceById = async (req, res, next) => {
  try {
    const record = await Maintenance.findById(req.params.id)
      .populate({
        path: 'equipment',
        populate: [
          { path: 'department', select: 'name code' },
          { path: 'laboratory', select: 'name location' },
        ],
      })
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email phone');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance ticket not found.',
      });
    }

    res.status(200).json({
      success: true,
      record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report equipment fault / Request maintenance
// @route   POST /api/maintenance
// @access  Private (All roles)
const createMaintenanceReport = async (req, res, next) => {
  try {
    const {
      equipmentId,
      issue,
      description,
      priority = 'Medium',
      assignedTo,
    } = req.body;

    if (!equipmentId || !issue || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide equipment, issue title, and detailed fault description.',
      });
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found.',
      });
    }

    const initialStatus = assignedTo ? 'Assigned' : 'Reported';

    const record = await Maintenance.create({
      equipment: equipmentId,
      reportedBy: req.user._id,
      assignedTo: assignedTo || null,
      issue: issue.trim(),
      description: description.trim(),
      priority,
      status: initialStatus,
    });

    // Mark equipment as Under Maintenance or Needs Maintenance
    equipment.status = 'Under Maintenance';
    equipment.condition = 'Needs Maintenance';
    await equipment.save();

    // Check for affected upcoming bookings and warn
    const affectedBookings = await Booking.find({
      equipment: equipmentId,
      status: { $in: ['Pending', 'Approved'] },
      endTime: { $gte: new Date() },
    }).populate('user', 'email name');

    for (const b of affectedBookings) {
      await Notification.create({
        recipient: b.user._id,
        title: 'Equipment Maintenance Notice',
        message: `Notice: ${equipment.name} scheduled for your booking has been placed under maintenance for repairs (${issue}). Please consider rescheduling or contacting lab staff.`,
        type: 'maintenance',
        relatedRecord: {
          modelName: 'Booking',
          recordId: b._id,
        },
      });
    }

    const populated = await Maintenance.findById(record._id)
      .populate('equipment', 'name equipmentCode')
      .populate('reportedBy', 'name email');

    res.status(201).json({
      success: true,
      message:
        'Fault report logged successfully. Equipment flagged for technical service.',
      record: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update maintenance status & repair progress
// @route   PATCH /api/maintenance/:id
// @access  Private (Technician, Faculty, Admin)
const updateMaintenanceStatus = async (req, res, next) => {
  try {
    const {
      status,
      assignedTo,
      resolutionNotes,
      repairCost,
      newCondition = 'Good',
    } = req.body;

    const record = await Maintenance.findById(req.params.id).populate('equipment');
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance ticket not found.',
      });
    }

    if (status) record.status = status;
    if (assignedTo !== undefined) record.assignedTo = assignedTo;
    if (resolutionNotes !== undefined) record.resolutionNotes = resolutionNotes;
    if (repairCost !== undefined) record.repairCost = parseFloat(repairCost) || 0;

    // Handle lifecycle completion
    if (status === 'Completed') {
      record.completedAt = new Date();

      // Restore equipment availability
      if (record.equipment) {
        await Equipment.findByIdAndUpdate(record.equipment._id, {
          status: 'Available',
          condition: newCondition,
          availableQuantity: record.equipment.quantity,
        });
      }

      // Notify the reporter
      if (record.reportedBy) {
        await Notification.create({
          recipient: record.reportedBy,
          title: 'Maintenance Completed',
          message: `The maintenance ticket for ${record.equipment?.name} has been resolved and marked complete.`,
          type: 'maintenance',
          relatedRecord: {
            modelName: 'Maintenance',
            recordId: record._id,
          },
        });
      }
    } else if (status === 'Rejected') {
      // Revert equipment if false alarm
      if (record.equipment) {
        await Equipment.findByIdAndUpdate(record.equipment._id, {
          status: 'Available',
        });
      }
    }

    await record.save();

    const populated = await Maintenance.findById(record._id)
      .populate('equipment', 'name equipmentCode condition status')
      .populate('assignedTo', 'name email phone')
      .populate('reportedBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Maintenance ticket updated to '${record.status}'.`,
      record: populated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMaintenanceList,
  getMaintenanceById,
  createMaintenanceReport,
  updateMaintenanceStatus,
};

