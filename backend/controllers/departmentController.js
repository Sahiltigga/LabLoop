const Department = require('../models/Department');
const Laboratory = require('../models/Laboratory');
const Equipment = require('../models/Equipment');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .populate('laboratories', 'name laboratoryCode location status')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Public
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate(
      'laboratories'
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.',
      });
    }

    // Also get equipment count for this department
    const equipmentCount = await Equipment.countDocuments({
      department: department._id,
    });

    res.status(200).json({
      success: true,
      department,
      equipmentCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private/Admin
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, headOfDepartment, contactEmail, contactPhone } =
      req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Department name and code are required.',
      });
    }

    const existingCode = await Department.findOne({
      $or: [{ code: code.toUpperCase() }, { name: name.trim() }],
    });

    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: 'Department name or code already exists.',
      });
    }

    const department = await Department.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      description: description || '',
      headOfDepartment: headOfDepartment || '',
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.',
      });
    }

    const { name, code, description, headOfDepartment, contactEmail, contactPhone } =
      req.body;

    if (name) department.name = name.trim();
    if (code) department.code = code.toUpperCase().trim();
    if (description !== undefined) department.description = description;
    if (headOfDepartment !== undefined)
      department.headOfDepartment = headOfDepartment;
    if (contactEmail !== undefined) department.contactEmail = contactEmail;
    if (contactPhone !== undefined) department.contactPhone = contactPhone;

    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.',
      });
    }

    // Check if equipment exists in department
    const eqCount = await Equipment.countDocuments({ department: department._id });
    if (eqCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department: ${eqCount} equipment items are still assigned to it.`,
      });
    }

    await Department.findByIdAndDelete(req.params.id);
    await Laboratory.deleteMany({ department: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Department and associated laboratories removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};

