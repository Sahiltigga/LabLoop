const User = require('../models/User');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { role, department, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentOrEmployeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('department', 'name code');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role or department (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { role, department, isVerified, name } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (role) user.role = role;
    if (department !== undefined) user.department = department || null;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (name) user.name = name;

    await user.save();

    const updated = await User.findById(user._id)
      .select('-password')
      .populate('department', 'name code');

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      user: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of technicians (for maintenance assignments)
// @route   GET /api/users/technicians
// @access  Private
const getTechnicians = async (req, res, next) => {
  try {
    const technicians = await User.find({ role: 'technician' })
      .select('name email department phone')
      .populate('department', 'name code');

    res.status(200).json({
      success: true,
      technicians,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  getTechnicians,
};

