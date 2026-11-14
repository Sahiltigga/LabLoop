const Laboratory = require('../models/Laboratory');
const Department = require('../models/Department');
const Equipment = require('../models/Equipment');

// @desc    Get all laboratories
// @route   GET /api/laboratories
// @access  Public
const getLaboratories = async (req, res, next) => {
  try {
    const { department, status } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (status) filter.status = status;

    const laboratories = await Laboratory.find(filter)
      .populate('department', 'name code')
      .populate('manager', 'name email phone')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: laboratories.length,
      laboratories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single laboratory
// @route   GET /api/laboratories/:id
// @access  Public
const getLaboratoryById = async (req, res, next) => {
  try {
    const laboratory = await Laboratory.findById(req.params.id)
      .populate('department', 'name code')
      .populate('manager', 'name email phone');

    if (!laboratory) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found.',
      });
    }

    const equipment = await Equipment.find({ laboratory: laboratory._id });

    res.status(200).json({
      success: true,
      laboratory,
      equipment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create laboratory
// @route   POST /api/laboratories
// @access  Private/Admin/Faculty
const createLaboratory = async (req, res, next) => {
  try {
    const {
      name,
      laboratoryCode,
      department,
      location,
      description,
      manager,
      status,
      operatingHours,
    } = req.body;

    if (!name || !laboratoryCode || !department || !location) {
      return res.status(400).json({
        success: false,
        message: 'Name, laboratory code, department, and location are required.',
      });
    }

    const dept = await Department.findById(department);
    if (!dept) {
      return res.status(404).json({
        success: false,
        message: 'Selected department does not exist.',
      });
    }

    const existing = await Laboratory.findOne({
      laboratoryCode: laboratoryCode.toUpperCase().trim(),
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Laboratory code already exists.',
      });
    }

    const laboratory = await Laboratory.create({
      name: name.trim(),
      laboratoryCode: laboratoryCode.toUpperCase().trim(),
      department,
      location: location.trim(),
      description: description || '',
      manager: manager || req.user._id,
      status: status || 'Active',
      operatingHours: operatingHours || { open: '09:00', close: '17:00' },
    });

    // Add laboratory reference to Department
    dept.laboratories.push(laboratory._id);
    await dept.save();

    res.status(201).json({
      success: true,
      message: 'Laboratory created successfully.',
      laboratory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update laboratory
// @route   PUT /api/laboratories/:id
// @access  Private/Admin/Faculty
const updateLaboratory = async (req, res, next) => {
  try {
    const laboratory = await Laboratory.findById(req.params.id);
    if (!laboratory) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found.',
      });
    }

    const {
      name,
      laboratoryCode,
      location,
      description,
      manager,
      status,
      operatingHours,
    } = req.body;

    if (name) laboratory.name = name.trim();
    if (laboratoryCode) laboratory.laboratoryCode = laboratoryCode.toUpperCase().trim();
    if (location) laboratory.location = location.trim();
    if (description !== undefined) laboratory.description = description;
    if (manager !== undefined) laboratory.manager = manager;
    if (status) laboratory.status = status;
    if (operatingHours) laboratory.operatingHours = operatingHours;

    await laboratory.save();

    res.status(200).json({
      success: true,
      message: 'Laboratory updated successfully.',
      laboratory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete laboratory
// @route   DELETE /api/laboratories/:id
// @access  Private/Admin
const deleteLaboratory = async (req, res, next) => {
  try {
    const laboratory = await Laboratory.findById(req.params.id);
    if (!laboratory) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found.',
      });
    }

    const eqCount = await Equipment.countDocuments({ laboratory: laboratory._id });
    if (eqCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete laboratory: ${eqCount} equipment items are assigned to it.`,
      });
    }

    // Remove from Department laboratories array
    await Department.findByIdAndUpdate(laboratory.department, {
      $pull: { laboratories: laboratory._id },
    });

    await Laboratory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Laboratory deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLaboratories,
  getLaboratoryById,
  createLaboratory,
  updateLaboratory,
  deleteLaboratory,
};

