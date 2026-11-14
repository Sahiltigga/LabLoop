const path = require('path');
const dotenv = require('dotenv');

// Guarantee dotenv loads before anything else
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

// Models
const Department = require('../models/Department');
const Laboratory = require('../models/Laboratory');
const Equipment = require('../models/Equipment');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Maintenance = require('../models/Maintenance');
const Notification = require('../models/Notification');

const seedDatabase = async () => {
  let shouldDisconnect = false;
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
      shouldDisconnect = true;
    }

    console.log('[Seed] Initializing/Verifying LabLoop Demonstration Dataset...');

    // 1. Academic Departments (Idempotent Upsert)
    const departmentData = [
      {
        code: 'CSE',
        name: 'Computer Science',
        description: 'Computer Science, Artificial Intelligence, and Software Engineering',
        headOfDepartment: 'Dr. Alan Turing',
        contactEmail: 'cse.head@labloop.edu',
        contactPhone: '+1-555-0101',
      },
      {
        code: 'ECE',
        name: 'Electronics',
        description: 'Electronics, VLSI Design, and Communication Engineering',
        headOfDepartment: 'Dr. Claude Shannon',
        contactEmail: 'ece.head@labloop.edu',
        contactPhone: '+1-555-0102',
      },
      {
        code: 'ME',
        name: 'Mechanical Engineering',
        description: 'Mechanical Engineering, Rapid Prototyping, and Robotics',
        headOfDepartment: 'Dr. James Watt',
        contactEmail: 'me.head@labloop.edu',
        contactPhone: '+1-555-0103',
      },
    ];

    const departments = {};
    for (const item of departmentData) {
      departments[item.code] = await Department.findOneAndUpdate(
        { code: item.code },
        { $set: item },
        { new: true, upsert: true, runValidators: true }
      );
    }
    console.log(`[Seed] Synced ${Object.keys(departments).length} academic departments.`);

    // 2. Laboratories (Idempotent Upsert)
    const laboratoryData = [
      {
        laboratoryCode: 'CSE-LAB-01',
        name: 'Programming Laboratory',
        department: departments.CSE._id,
        location: 'Block A, Room 101',
        status: 'Active',
        operatingHours: { open: '08:30', close: '18:00' },
      },
      {
        laboratoryCode: 'ECE-LAB-01',
        name: 'Electronics Laboratory',
        department: departments.ECE._id,
        location: 'Block B, Room 202',
        status: 'Active',
        operatingHours: { open: '09:00', close: '17:30' },
      },
      {
        laboratoryCode: 'ME-LAB-01',
        name: 'Mechanical Workshop',
        department: departments.ME._id,
        location: 'Block C, Room 301',
        status: 'Active',
        operatingHours: { open: '08:00', close: '17:00' },
      },
    ];

    const laboratories = {};
    for (const item of laboratoryData) {
      const lab = await Laboratory.findOneAndUpdate(
        { laboratoryCode: item.laboratoryCode },
        { $set: item },
        { new: true, upsert: true, runValidators: true }
      );
      laboratories[item.laboratoryCode] = lab;

      // Ensure parent department references this laboratory
      await Department.findByIdAndUpdate(item.department, {
        $addToSet: { laboratories: lab._id },
      });
    }
    console.log(`[Seed] Synced ${Object.keys(laboratories).length} laboratories.`);

    // 3. User Accounts (4 Distinct Institutional Roles)
    const userData = [
      {
        email: 'admin@labloop.edu',
        name: 'Dr. Robert Vance (Super Admin)',
        role: 'admin',
        department: null,
        studentOrEmployeeId: 'ADM-9001',
        phone: '+1-555-1000',
        passwordPlain: 'Password@123',
      },
      {
        email: 'faculty.cse@labloop.edu',
        name: 'Prof. Sarah Jenkins (Faculty)',
        role: 'faculty',
        department: departments.CSE._id,
        studentOrEmployeeId: 'FAC-CSE-101',
        phone: '+1-555-1001',
        passwordPlain: 'Password@123',
      },
      {
        email: 'student@labloop.edu',
        name: 'Alex Morgan (Student)',
        role: 'student',
        department: departments.CSE._id,
        studentOrEmployeeId: 'STU-2026-088',
        phone: '+1-555-1002',
        passwordPlain: 'Password@123',
      },
      {
        email: 'technician@labloop.edu',
        name: 'Marcus Taylor (Technician)',
        role: 'technician',
        department: departments.ME._id,
        studentOrEmployeeId: 'TECH-ME-05',
        phone: '+1-555-1003',
        passwordPlain: 'Password@123',
      },
    ];

    const users = {};
    for (const item of userData) {
      let existingUser = await User.findOne({ email: item.email.toLowerCase() });
      if (!existingUser) {
        existingUser = await User.create({
          email: item.email.toLowerCase(),
          name: item.name,
          role: item.role,
          department: item.department,
          studentOrEmployeeId: item.studentOrEmployeeId,
          phone: item.phone,
          password: item.passwordPlain, // Pre-save hook hashes it
          isVerified: true,
        });
      } else {
        // Update non-password profile fields idempotently
        existingUser.name = item.name;
        existingUser.role = item.role;
        existingUser.department = item.department;
        existingUser.studentOrEmployeeId = item.studentOrEmployeeId;
        existingUser.phone = item.phone;
        await existingUser.save();
      }
      users[item.role] = existingUser;
    }
    console.log(`[Seed] Synced ${Object.keys(users).length} institutional user accounts.`);

    // 4. Equipment Records (6 Required Core Items + Specifications)
    const equipmentData = [
      {
        equipmentCode: 'EQ-001',
        name: 'Raspberry Pi Kit',
        category: 'Embedded Systems',
        description: 'Raspberry Pi 4 Model B development kit for IoT, edge computing, and robotics prototyping.',
        department: departments.CSE._id,
        laboratory: laboratories['CSE-LAB-01']._id,
        modelNumber: 'RPI4-8GB-KIT',
        manufacturer: 'Raspberry Pi Foundation',
        quantity: 10,
        availableQuantity: 8,
        condition: 'Excellent',
        status: 'Available',
        requiresTraining: false,
        maxBookingHours: 4,
      },
      {
        equipmentCode: 'EQ-002',
        name: 'High Performance Computer',
        category: 'Computer Hardware',
        description: 'Multi-GPU workstation equipped with NVIDIA RTX 4090 for deep learning training and CAD.',
        department: departments.CSE._id,
        laboratory: laboratories['CSE-LAB-01']._id,
        modelNumber: 'PRECISION-7920',
        manufacturer: 'Dell Enterprise',
        quantity: 5,
        availableQuantity: 3,
        condition: 'Good',
        status: 'Available',
        requiresTraining: false,
        maxBookingHours: 6,
      },
      {
        equipmentCode: 'EQ-003',
        name: 'Arduino Uno Kit',
        category: 'Microcontroller',
        description: 'Arduino Uno Rev3 development kit complete with sensors, actuators, and breadboard modules.',
        department: departments.ECE._id,
        laboratory: laboratories['ECE-LAB-01']._id,
        modelNumber: 'ARD-UNO-R3',
        manufacturer: 'Arduino LLC',
        quantity: 15,
        availableQuantity: 12,
        condition: 'Excellent',
        status: 'Available',
        requiresTraining: false,
        maxBookingHours: 4,
      },
      {
        equipmentCode: 'EQ-004',
        name: 'Digital Oscilloscope',
        category: 'Measurement Instrument',
        description: '4-channel 100 MHz digital storage oscilloscope with logic analyzer and waveform generator.',
        department: departments.ECE._id,
        laboratory: laboratories['ECE-LAB-01']._id,
        modelNumber: 'DS1054Z',
        manufacturer: 'Rigol Technologies',
        quantity: 4,
        availableQuantity: 2,
        condition: 'Good',
        status: 'Available',
        requiresTraining: true,
        maxBookingHours: 3,
      },
      {
        equipmentCode: 'EQ-005',
        name: '3D Printer',
        category: 'Manufacturing',
        description: 'Dual-extrusion high-precision fused deposition modeling (FDM) rapid prototyping 3D printer.',
        department: departments.ME._id,
        laboratory: laboratories['ME-LAB-01']._id,
        modelNumber: 'ULT-S5-PRO',
        manufacturer: 'UltiMaker',
        quantity: 2,
        availableQuantity: 1,
        condition: 'Good',
        status: 'Available',
        requiresTraining: true,
        maxBookingHours: 8,
      },
      {
        equipmentCode: 'EQ-006',
        name: 'CNC Machine',
        category: 'Manufacturing',
        description: 'Benchtop 3-axis precision CNC milling machine for rapid milling and subtractive manufacturing.',
        department: departments.ME._id,
        laboratory: laboratories['ME-LAB-01']._id,
        modelNumber: 'NOMAD-3-CNC',
        manufacturer: 'Carbide 3D',
        quantity: 1,
        availableQuantity: 0,
        condition: 'Needs Maintenance',
        status: 'Under Maintenance',
        requiresTraining: true,
        maxBookingHours: 4,
      },
    ];

    const equipmentMap = {};
    for (const item of equipmentData) {
      equipmentMap[item.equipmentCode] = await Equipment.findOneAndUpdate(
        { equipmentCode: item.equipmentCode },
        { $set: item },
        { new: true, upsert: true, runValidators: true }
      );
    }
    console.log(`[Seed] Synced ${Object.keys(equipmentMap).length} mandatory equipment records.`);

    // 5. Sample Bookings (Idempotent creation)
    const bookingCount = await Booking.countDocuments();
    if (bookingCount === 0) {
      const now = new Date();
      await Booking.create([
        {
          user: users.student._id,
          equipment: equipmentMap['EQ-001']._id,
          department: departments.CSE._id,
          requestedQuantity: 1,
          startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          endTime: new Date(now.getTime() - 20 * 60 * 60 * 1000),
          purpose: 'IoT Environmental Sensor Array Senior Project',
          status: 'Completed',
          approvedBy: users.faculty._id,
          actualUsageHours: 4,
        },
        {
          user: users.student._id,
          equipment: equipmentMap['EQ-002']._id,
          department: departments.CSE._id,
          requestedQuantity: 1,
          startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
          endTime: new Date(now.getTime() + 6 * 60 * 60 * 1000),
          purpose: 'Deep Neural Network Model Validation',
          status: 'Approved',
          approvedBy: users.faculty._id,
        },
        {
          user: users.student._id,
          equipment: equipmentMap['EQ-004']._id,
          department: departments.ECE._id,
          requestedQuantity: 1,
          startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          endTime: new Date(now.getTime() + 27 * 60 * 60 * 1000),
          purpose: 'Harmonic Distortion Spectrum Measurement',
          status: 'Pending',
        },
      ]);
      console.log('[Seed] Created initial realistic booking reservations.');
    }

    // 6. Sample Maintenance Ticket (Idempotent creation)
    const maintCount = await Maintenance.countDocuments();
    if (maintCount === 0) {
      await Maintenance.create({
        equipment: equipmentMap['EQ-006']._id,
        reportedBy: users.faculty._id,
        assignedTo: users.technician._id,
        issue: 'Spindle Collet Misalignment & Excessive Vibration',
        description: 'Vibration detected during 10,000 RPM surfacing pass. Collet requires recalibration and spindle lubrication.',
        priority: 'High',
        status: 'In Progress',
        repairCost: 150,
      });
      console.log('[Seed] Created initial maintenance service order.');
    }

    // Verification step
    const finalCounts = {
      departments: await Department.countDocuments(),
      laboratories: await Laboratory.countDocuments(),
      equipment: await Equipment.countDocuments(),
      users: await User.countDocuments(),
      bookings: await Booking.countDocuments(),
      maintenance: await Maintenance.countDocuments(),
    };

    console.log('\n============================================================');
    console.log('   LABLOOP DATABASE INITIALIZATION VERIFIED (IDEMPOTENT)    ');
    console.log('============================================================');
    console.log(`Departments : ${finalCounts.departments}`);
    console.log(`Laboratories: ${finalCounts.laboratories}`);
    console.log(`Equipment   : ${finalCounts.equipment}`);
    console.log(`Users       : ${finalCounts.users}`);
    console.log(`Bookings    : ${finalCounts.bookings}`);
    console.log(`Maintenance : ${finalCounts.maintenance}`);
    console.log('------------------------------------------------------------');
    console.log('Role Credentials for Testing:');
    console.log('  Admin     : admin@labloop.edu       | Password@123');
    console.log('  Faculty   : faculty.cse@labloop.edu | Password@123');
    console.log('  Student   : student@labloop.edu     | Password@123');
    console.log('  Technician: technician@labloop.edu  | Password@123');
    console.log('============================================================\n');

    return finalCounts;
  } catch (error) {
    console.error('[Seed Error] Database seeding failed:', error.message);
    throw error;
  } finally {
    if (shouldDisconnect) {
      await mongoose.disconnect();
      console.log('[Seed] Database connection closed gracefully.');
    }
  }
};

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedDatabase;
