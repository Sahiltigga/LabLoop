const Equipment = require('../models/Equipment');
const Booking = require('../models/Booking');
const Maintenance = require('../models/Maintenance');
const Department = require('../models/Department');
const User = require('../models/User');
const { calculateUtilizationMetrics } = require('../services/utilizationService');

// @desc    Get top-level dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const { departmentId } = req.query;
    const eqFilter = {};
    const bookingFilter = {};
    const maintFilter = {};

    if (departmentId && departmentId !== 'All') {
      eqFilter.department = departmentId;
      bookingFilter.department = departmentId;
    }

    const [
      totalEquipment,
      availableEquipment,
      underMaintenanceEquipment,
      totalBookings,
      pendingBookings,
      activeBookings,
      completedBookings,
      totalUsers,
      totalDepartments,
      recentBookings,
      recentMaintenance,
    ] = await Promise.all([
      Equipment.countDocuments(eqFilter),
      Equipment.countDocuments({
        ...eqFilter,
        status: { $in: ['Available', 'Partially Available'] },
      }),
      Equipment.countDocuments({ ...eqFilter, status: 'Under Maintenance' }),
      Booking.countDocuments(bookingFilter),
      Booking.countDocuments({ ...bookingFilter, status: 'Pending' }),
      Booking.countDocuments({
        ...bookingFilter,
        status: { $in: ['Approved', 'Checked-Out'] },
      }),
      Booking.countDocuments({ ...bookingFilter, status: 'Completed' }),
      User.countDocuments(),
      Department.countDocuments(),
      Booking.find(bookingFilter)
        .populate('user', 'name role department')
        .populate('equipment', 'name equipmentCode category')
        .sort({ createdAt: -1 })
        .limit(6),
      Maintenance.find(maintFilter)
        .populate('equipment', 'name equipmentCode')
        .populate('reportedBy', 'name')
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    // Calculate utilization overview
    const { equipmentUtilization } = await calculateUtilizationMetrics(30);
    const underutilizedCount = equipmentUtilization.filter(
      (e) => e.isUnderutilized
    ).length;

    // Overall institutional utilization rate
    const totalActualHours = equipmentUtilization.reduce(
      (s, e) => s + e.actualUsageHours,
      0
    );
    const totalAvailHours = equipmentUtilization.reduce(
      (s, e) => s + e.availableOperatingHours,
      0
    );
    const overallUtilizationRate =
      totalAvailHours > 0
        ? parseFloat(((totalActualHours / totalAvailHours) * 100).toFixed(1))
        : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalEquipment,
        availableEquipment,
        underMaintenanceEquipment,
        totalBookings,
        pendingBookings,
        activeBookings,
        completedBookings,
        totalUsers,
        totalDepartments,
        underutilizedCount,
        overallUtilizationRate,
      },
      recentBookings,
      recentMaintenance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get equipment utilization details
// @route   GET /api/analytics/utilization
// @access  Private
const getUtilizationAnalytics = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const metrics = await calculateUtilizationMetrics(days);

    res.status(200).json({
      success: true,
      ...metrics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get department-wise utilization comparison
// @route   GET /api/analytics/department
// @access  Private
const getDepartmentAnalytics = async (req, res, next) => {
  try {
    const { departmentUtilization } = await calculateUtilizationMetrics(30);

    res.status(200).json({
      success: true,
      departmentUtilization,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get historical monthly booking and usage trends
// @route   GET /api/analytics/usage-history
// @access  Private
const getUsageHistory = async (req, res, next) => {
  try {
    // Generate past 6 months timeline
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
      });
    }

    const trends = await Promise.all(
      months.map(async (m) => {
        const [total, approved, completed] = await Promise.all([
          Booking.countDocuments({
            createdAt: { $gte: m.start, $lte: m.end },
          }),
          Booking.countDocuments({
            createdAt: { $gte: m.start, $lte: m.end },
            status: { $in: ['Approved', 'Checked-Out'] },
          }),
          Booking.countDocuments({
            createdAt: { $gte: m.start, $lte: m.end },
            status: 'Completed',
          }),
        ]);

        return {
          month: m.label,
          totalBookings: total,
          approvedBookings: approved,
          completedBookings: completed,
        };
      })
    );

    res.status(200).json({
      success: true,
      trends,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUtilizationAnalytics,
  getDepartmentAnalytics,
  getUsageHistory,
};

