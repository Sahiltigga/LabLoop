const Equipment = require('../models/Equipment');
const Booking = require('../models/Booking');
const Maintenance = require('../models/Maintenance');
const Department = require('../models/Department');

/**
 * Calculate equipment and department utilization metrics
 * Utilization % = (Actual Equipment Usage Hours / Available Operating Hours) * 100
 */
const calculateUtilizationMetrics = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Standard laboratory operating hours: 8 hours/day
  const operatingHoursPerDay = 8;
  const totalOperatingHoursPerUnit = days * operatingHoursPerDay; // 240 hrs for 30 days

  // 1. Fetch all equipment with department details
  const equipmentList = await Equipment.find()
    .populate('department', 'name code')
    .populate('laboratory', 'name location');

  // 2. Fetch all completed and checked-out bookings in the time window
  const bookings = await Booking.find({
    createdAt: { $gte: startDate },
    status: { $in: ['Completed', 'Checked-Out', 'Approved'] },
  }).populate('equipment');

  // 3. Fetch maintenance logs
  const maintenanceLogs = await Maintenance.find({
    reportedAt: { $gte: startDate },
  });

  // Calculate usage hours per equipment
  const usageMap = {};
  bookings.forEach((b) => {
    if (!b.equipment) return;
    const eqId = b.equipment._id ? b.equipment._id.toString() : b.equipment.toString();

    let hours = 0;
    if (b.actualUsageHours && b.actualUsageHours > 0) {
      hours = b.actualUsageHours;
    } else if (b.startTime && b.endTime) {
      hours = (new Date(b.endTime) - new Date(b.startTime)) / (1000 * 60 * 60);
    }
    // Multiply by requested quantity
    const totalHours = Math.max(0, hours) * (b.requestedQuantity || 1);

    usageMap[eqId] = (usageMap[eqId] || 0) + totalHours;
  });

  // Calculate downtime from maintenance
  const downtimeMap = {};
  maintenanceLogs.forEach((m) => {
    if (!m.equipment) return;
    const eqId = m.equipment.toString();
    let downHours = 24; // Default estimate 24 hours per maintenance incident
    if (m.completedAt && m.reportedAt) {
      downHours = (new Date(m.completedAt) - new Date(m.reportedAt)) / (1000 * 60 * 60);
    }
    downtimeMap[eqId] = (downtimeMap[eqId] || 0) + Math.min(downHours, totalOperatingHoursPerUnit);
  });

  // Compute utilization per equipment
  const equipmentUtilization = equipmentList.map((eq) => {
    const eqId = eq._id.toString();
    const actualHours = usageMap[eqId] || 0;
    const downtimeHours = downtimeMap[eqId] || 0;

    // Available operating hours scaled by equipment quantity minus downtime
    const totalCapHours = (eq.quantity || 1) * totalOperatingHoursPerUnit;
    const effectiveAvailableHours = Math.max(1, totalCapHours - downtimeHours);

    const utilizationRate = Math.min(
      100,
      parseFloat(((actualHours / effectiveAvailableHours) * 100).toFixed(1))
    );

    return {
      _id: eq._id,
      name: eq.name,
      equipmentCode: eq.equipmentCode,
      category: eq.category,
      department: eq.department,
      laboratory: eq.laboratory,
      quantity: eq.quantity,
      condition: eq.condition,
      status: eq.status,
      actualUsageHours: parseFloat(actualHours.toFixed(1)),
      downtimeHours: parseFloat(downtimeHours.toFixed(1)),
      availableOperatingHours: totalCapHours,
      utilizationRate,
      isUnderutilized: utilizationRate < 25 && eq.status !== 'Under Maintenance',
    };
  });

  // Aggregate by Department
  const deptMap = {};
  equipmentUtilization.forEach((item) => {
    const deptId = item.department ? item.department._id.toString() : 'unknown';
    const deptName = item.department ? item.department.name : 'Unknown Department';
    const deptCode = item.department ? item.department.code : 'GEN';

    if (!deptMap[deptId]) {
      deptMap[deptId] = {
        departmentId: deptId,
        departmentName: deptName,
        departmentCode: deptCode,
        totalEquipmentCount: 0,
        totalQuantity: 0,
        totalUsageHours: 0,
        totalOperatingHours: 0,
        equipment: [],
      };
    }

    deptMap[deptId].totalEquipmentCount += 1;
    deptMap[deptId].totalQuantity += item.quantity;
    deptMap[deptId].totalUsageHours += item.actualUsageHours;
    deptMap[deptId].totalOperatingHours += item.availableOperatingHours;
    deptMap[deptId].equipment.push(item);
  });

  const departmentUtilization = Object.values(deptMap).map((d) => {
    const rate =
      d.totalOperatingHours > 0
        ? parseFloat(((d.totalUsageHours / d.totalOperatingHours) * 100).toFixed(1))
        : 0;
    return {
      ...d,
      averageUtilization: rate,
    };
  });

  return {
    timeWindowDays: days,
    equipmentUtilization,
    departmentUtilization,
  };
};

module.exports = {
  calculateUtilizationMetrics,
};

