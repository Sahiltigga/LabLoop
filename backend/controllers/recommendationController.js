const {
  getIdleEquipmentRecommendations,
  findEquipmentMatches,
  getDemandAnalysis,
} = require('../services/recommendationService');

// @desc    Get recommendations for idle/underutilized equipment
// @route   GET /api/recommendations/idle-equipment
// @access  Private
const getIdleEquipment = async (req, res, next) => {
  try {
    const recommendations = await getIdleEquipmentRecommendations();

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Match available equipment in other departments
// @route   GET /api/recommendations/equipment-matches
// @access  Private
const getMatches = async (req, res, next) => {
  try {
    const { category, departmentId, minQuantity, startTime, endTime } = req.query;

    const matches = await findEquipmentMatches({
      targetCategory: category,
      requestedDepartmentId: departmentId,
      minQuantity: parseInt(minQuantity, 10) || 1,
      startTime,
      endTime,
    });

    res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get demand and shortage bottleneck analysis
// @route   GET /api/recommendations/demand-analysis
// @access  Private
const getDemand = async (req, res, next) => {
  try {
    const analysis = await getDemandAnalysis();

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIdleEquipment,
  getMatches,
  getDemand,
};

