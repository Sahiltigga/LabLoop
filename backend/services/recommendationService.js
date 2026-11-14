const Equipment = require('../models/Equipment');
const Booking = require('../models/Booking');
const Maintenance = require('../models/Maintenance');
const Department = require('../models/Department');
const { calculateUtilizationMetrics } = require('./utilizationService');

/**
 * LABLOOP RESOURCE INTELLIGENCE ENGINE
 * Rule-based, explainable, transparent resource optimization
 */

/**
 * Feature A: Detect Idle and Underutilized Assets
 * Finds equipment with low utilization, good condition, and surplus availability
 */
const getIdleEquipmentRecommendations = async () => {
  const { equipmentUtilization } = await calculateUtilizationMetrics(30);

  // Criteria for idle asset recommendation:
  // 1. Utilization < 25%
  // 2. Status is Available or Partially Available
  // 3. Condition is Good or Excellent
  // 4. Not currently under maintenance or retired
  // 5. Available quantity >= 1
  const idleEquipment = equipmentUtilization.filter((eq) => {
    return (
      eq.utilizationRate < 25 &&
      ['Available', 'Partially Available'].includes(eq.status) &&
      ['Excellent', 'Good'].includes(eq.condition)
    );
  });

  // Generate actionable sharing recommendations with explainable logic
  const recommendations = idleEquipment.map((eq) => {
    const idleScore = Math.max(0, 100 - eq.utilizationRate * 4); // 0-100 idle potential
    const explanation = `${eq.name} in the ${
      eq.department?.name || 'holding'
    } department has an estimated 30-day utilization of only ${
      eq.utilizationRate
    }%. With ${
      eq.quantity
    } unit(s) in ${eq.condition.toLowerCase()} condition, this asset is an ideal candidate for inter-departmental sharing, research collaboration, or cross-lab pooling to prevent duplicate institutional procurement.`;

    return {
      equipmentId: eq._id,
      equipmentName: eq.name,
      equipmentCode: eq.equipmentCode,
      category: eq.category,
      department: eq.department,
      laboratory: eq.laboratory,
      condition: eq.condition,
      status: eq.status,
      quantity: eq.quantity,
      utilizationRate: eq.utilizationRate,
      idleScore: parseFloat(idleScore.toFixed(1)),
      recommendationType: 'Inter-Departmental Sharing Candidate',
      explanation,
      suggestedAction: 'List for inter-department reservation or research loan.',
    };
  });

  return recommendations.sort((a, b) => b.idleScore - a.idleScore);
};

/**
 * Feature B: Inter-Departmental Equipment Matching Engine
 * Matches a target request against equipment in other departments
 * Weights:
 * - Category compatibility: 30%
 * - Availability compatibility: 25%
 * - Quantity availability: 20%
 * - Location suitability: 15%
 * - Department access policy: 10%
 */
const findEquipmentMatches = async ({
  targetCategory,
  requestedDepartmentId,
  minQuantity = 1,
  startTime,
  endTime,
}) => {
  // 1. Hard constraint: exclude equipment under maintenance, retired, or in poor condition
  const filter = {
    status: { $in: ['Available', 'Partially Available'] },
    condition: { $in: ['Excellent', 'Good', 'Fair'] },
  };

  if (targetCategory && targetCategory !== 'All') {
    filter.category = new RegExp(targetCategory, 'i');
  }

  const candidateEquipment = await Equipment.find(filter)
    .populate('department', 'name code')
    .populate('laboratory', 'name location operatingHours');

  const matches = [];

  for (const eq of candidateEquipment) {
    const isDifferentDept =
      !requestedDepartmentId ||
      (eq.department && eq.department._id.toString() !== requestedDepartmentId.toString());

    // 1. Category Compatibility (30% weight)
    let categoryScore = 0;
    if (targetCategory) {
      if (eq.category.toLowerCase() === targetCategory.toLowerCase()) {
        categoryScore = 30;
      } else if (
        eq.category.toLowerCase().includes(targetCategory.toLowerCase()) ||
        targetCategory.toLowerCase().includes(eq.category.toLowerCase())
      ) {
        categoryScore = 20;
      } else {
        categoryScore = 10;
      }
    } else {
      categoryScore = 30;
    }

    // 2. Availability Compatibility (25% weight)
    let availabilityScore = 25;
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      const conflicts = await Booking.find({
        equipment: eq._id,
        status: { $in: ['Pending', 'Approved', 'Checked-Out'] },
        startTime: { $lt: end },
        endTime: { $gt: start },
      });

      const reservedQty = conflicts.reduce(
        (sum, c) => sum + (c.requestedQuantity || 1),
        0
      );
      const remainingInSlot = eq.quantity - reservedQty;

      if (remainingInSlot < minQuantity) {
        // Hard constraint violation for specific slot
        continue;
      }

      const ratio = remainingInSlot / (eq.quantity || 1);
      availabilityScore = parseFloat((ratio * 25).toFixed(1));
    } else {
      if (eq.status === 'Available') availabilityScore = 25;
      else if (eq.status === 'Partially Available') availabilityScore = 15;
      else availabilityScore = 5;
    }

    // 3. Quantity Availability (20% weight)
    let quantityScore = 0;
    if (eq.availableQuantity >= minQuantity * 2) {
      quantityScore = 20; // Healthy surplus
    } else if (eq.availableQuantity >= minQuantity) {
      quantityScore = 15; // Exact match
    } else {
      quantityScore = 5;
    }

    // 4. Location Suitability (15% weight)
    // Same campus / well-documented location
    let locationScore = 12;
    if (eq.laboratory && eq.laboratory.location) {
      locationScore = 15;
    }

    // 5. Department Access Policy (10% weight)
    // Cross-department sharing incentive
    const accessScore = isDifferentDept ? 10 : 8;

    const totalMatchScore = Math.min(
      100,
      Math.round(
        categoryScore +
          availabilityScore +
          quantityScore +
          locationScore +
          accessScore
      )
    );

    // Build human-readable explanation
    const explanation = `Matched ${eq.name} (${eq.equipmentCode}) from the ${
      eq.department?.name || 'host'
    } department with a compatibility score of ${totalMatchScore}/100. Category alignment: ${Math.round(
      (categoryScore / 30) * 100
    )}%, Available stock: ${eq.availableQuantity} unit(s), Condition: ${
      eq.condition
    }.`;

    matches.push({
      equipment: eq,
      score: totalMatchScore,
      scoreBreakdown: {
        categoryCompatibility: categoryScore,
        availabilityCompatibility: availabilityScore,
        quantityAvailability: quantityScore,
        locationSuitability: locationScore,
        accessPolicy: accessScore,
      },
      isCrossDepartment: isDifferentDept,
      explanation,
    });
  }

  // Sort by highest matching score descending
  return matches.sort((a, b) => b.score - a.score);
};

/**
 * Feature C: Equipment Demand Analysis
 * Analyzes booking frequency, shortage bottlenecks, and high-demand departments
 */
const getDemandAnalysis = async () => {
  // Aggregate booking counts per equipment
  const bookingStats = await Booking.aggregate([
    {
      $group: {
        _id: '$equipment',
        totalBookings: { $sum: 1 },
        approvedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] },
        },
        rejectedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] },
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] },
        },
        completedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
        },
      },
    },
    { $sort: { totalBookings: -1 } },
  ]);

  // Populate equipment details
  const populatedStats = await Equipment.populate(bookingStats, {
    path: '_id',
    select: 'name equipmentCode category department condition status quantity availableQuantity',
    populate: { path: 'department', select: 'name code' },
  });

  const highDemandEquipment = [];
  const bottleneckEquipment = [];

  populatedStats.forEach((stat) => {
    if (!stat._id) return;
    const eq = stat._id;

    if (stat.totalBookings >= 3) {
      highDemandEquipment.push({
        equipment: eq,
        totalBookings: stat.totalBookings,
        completedBookings: stat.completedBookings,
        approvalRate:
          stat.totalBookings > 0
            ? Math.round((stat.approvedBookings / stat.totalBookings) * 100)
            : 0,
      });
    }

    // Repeated rejections indicate bottleneck or shortage
    if (stat.rejectedBookings >= 1 || eq.availableQuantity === 0) {
      bottleneckEquipment.push({
        equipment: eq,
        rejectedRequests: stat.rejectedBookings,
        availableQuantity: eq.availableQuantity,
        recommendation: `High contention detected for ${eq.name}. Consider borrowing compatible units from other departments or scaling lab quantity.`,
      });
    }
  });

  // Department-wise demand breakdown
  const departmentDemand = await Booking.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userInfo',
      },
    },
    { $unwind: '$userInfo' },
    {
      $group: {
        _id: '$userInfo.department',
        totalRequests: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'departments',
        localField: '_id',
        foreignField: '_id',
        as: 'deptInfo',
      },
    },
    { $unwind: { path: '$deptInfo', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        departmentName: { $ifNull: ['$deptInfo.name', 'Central/Admin'] },
        departmentCode: { $ifNull: ['$deptInfo.code', 'ALL'] },
        totalRequests: 1,
      },
    },
    { $sort: { totalRequests: -1 } },
  ]);

  return {
    highDemandEquipment,
    bottleneckEquipment,
    departmentDemand,
  };
};

module.exports = {
  getIdleEquipmentRecommendations,
  findEquipmentMatches,
  getDemandAnalysis,
};

