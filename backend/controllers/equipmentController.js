const Equipment = require('../models/Equipment');
const Booking = require('../models/Booking');
const Maintenance = require('../models/Maintenance');

// @desc    Get all equipment with search, filter, and pagination
// @route   GET /api/equipment
// @access  Public
const getEquipment = async (req, res, next) => {
  try {
    const {
      search,
      department,
      category,
      status,
      condition,
      requiresTraining,
      page = 1,
      limit = 50,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    const query = {};

    // Text search on name, code, description, modelNumber
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { equipmentCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { modelNumber: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (condition && condition !== 'All') {
      query.condition = condition;
    }

    if (requiresTraining !== undefined) {
      query.requiresTraining = requiresTraining === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Equipment.countDocuments(query);

    const equipment = await Equipment.find(query)
      .populate('department', 'name code')
      .populate('laboratory', 'name laboratoryCode location')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Get unique categories for filtering
    const categories = await Equipment.distinct('category');

    res.status(200).json({
      success: true,
      count: equipment.length,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      categories,
      equipment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single equipment by ID
// @route   GET /api/equipment/:id
// @access  Public
const getEquipmentById = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('department', 'name code headOfDepartment contactEmail contactPhone')
      .populate('laboratory', 'name laboratoryCode location operatingHours');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found.',
      });
    }

    // Get upcoming active bookings for this equipment
    const upcomingBookings = await Booking.find({
      equipment: equipment._id,
      status: { $in: ['Pending', 'Approved', 'Checked-Out'] },
      endTime: { $gte: new Date() },
    })
      .populate('user', 'name email department')
      .sort({ startTime: 1 })
      .limit(10);

    // Get recent maintenance history
    const maintenanceHistory = await Maintenance.find({
      equipment: equipment._id,
    })
      .populate('reportedBy', 'name')
      .populate('assignedTo', 'name')
      .sort({ reportedAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      equipment,
      upcomingBookings,
      maintenanceHistory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new equipment
// @route   POST /api/equipment
// @access  Private/Admin/Faculty
const createEquipment = async (req, res, next) => {
  try {
    const {
      name,
      equipmentCode,
      category,
      description,
      department,
      laboratory,
      modelNumber,
      manufacturer,
      quantity = 1,
      availableQuantity,
      condition = 'Good',
      status = 'Available',
      requiresTraining = false,
      maxBookingHours = 4,
      purchaseDate,
      maintenanceDueDate,
      specifications,
      imageUrl,
    } = req.body;

    if (!name || !equipmentCode || !category || !department || !laboratory) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, equipment code, category, department, and laboratory.',
      });
    }

    const existingCode = await Equipment.findOne({
      equipmentCode: equipmentCode.toUpperCase().trim(),
    });

    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: `Equipment with code '${equipmentCode}' already exists.`,
      });
    }

    const totalQty = parseInt(quantity, 10) || 1;
    const availQty =
      availableQuantity !== undefined
        ? parseInt(availableQuantity, 10)
        : totalQty;

    const equipment = await Equipment.create({
      name: name.trim(),
      equipmentCode: equipmentCode.toUpperCase().trim(),
      category: category.trim(),
      description: description || '',
      department,
      laboratory,
      modelNumber: modelNumber || '',
      manufacturer: manufacturer || '',
      quantity: totalQty,
      availableQuantity: Math.min(availQty, totalQty),
      condition,
      status,
      requiresTraining: Boolean(requiresTraining),
      maxBookingHours: parseInt(maxBookingHours, 10) || 4,
      purchaseDate: purchaseDate || Date.now(),
      maintenanceDueDate: maintenanceDueDate || null,
      specifications: specifications || '',
      imageUrl: imageUrl || '',
    });

    const populated = await Equipment.findById(equipment._id)
      .populate('department', 'name code')
      .populate('laboratory', 'name laboratoryCode location');

    res.status(201).json({
      success: true,
      message: 'Equipment registered successfully.',
      equipment: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Private/Admin/Faculty
const updateEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found.',
      });
    }

    const updatableFields = [
      'name',
      'equipmentCode',
      'category',
      'description',
      'department',
      'laboratory',
      'modelNumber',
      'manufacturer',
      'quantity',
      'availableQuantity',
      'condition',
      'status',
      'requiresTraining',
      'maxBookingHours',
      'purchaseDate',
      'maintenanceDueDate',
      'specifications',
      'imageUrl',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'equipmentCode') {
          equipment[field] = req.body[field].toUpperCase().trim();
        } else {
          equipment[field] = req.body[field];
        }
      }
    });

    // Safeguard availableQuantity <= quantity
    if (equipment.availableQuantity > equipment.quantity) {
      equipment.availableQuantity = equipment.quantity;
    }

    await equipment.save();

    const updated = await Equipment.findById(equipment._id)
      .populate('department', 'name code')
      .populate('laboratory', 'name laboratoryCode location');

    res.status(200).json({
      success: true,
      message: 'Equipment updated successfully.',
      equipment: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete equipment
// @route   DELETE /api/equipment/:id
// @access  Private/Admin
const deleteEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found.',
      });
    }

    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      equipment: equipment._id,
      status: { $in: ['Pending', 'Approved', 'Checked-Out'] },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete equipment: it has ${activeBookings} active or pending reservation(s).`,
      });
    }

    await Equipment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Equipment removed from catalog.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};

