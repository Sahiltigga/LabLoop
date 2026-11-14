const path = require('path');
const dotenv = require('dotenv');

// Load environment variables before any other imports
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Middleware
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Access denied from this origin.'));
    },
    credentials: true,
  })
);

// Root & Health check endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'LabLoop API is running',
    version: '1.0.0',
    service: 'LabLoop REST API Engine',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'LabLoop REST API Engine',
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/laboratories', require('./routes/laboratoryRoutes'));
app.use('/api/equipment', require('./routes/equipmentRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server - Ensure database connection is established BEFORE accepting traffic
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if empty database
    try {
      const User = require('./models/User');
      const count = await User.countDocuments();
      if (count === 0) {
        console.log('[LabLoop Server] Empty database detected. Auto-seeding initial demonstration data...');
        const seedDatabase = require('./scripts/seed');
        await seedDatabase();
      }
    } catch (seedErr) {
      console.warn('[LabLoop Server] Auto-seed check notice:', seedErr.message);
    }

    const server = app.listen(PORT, () => {
      console.log(`[LabLoop Server] Running on port ${PORT}`);
      console.log(`[LabLoop API] Base URL: http://localhost:${PORT}/api`);
    });

    return server;
  } catch (error) {
    console.error(`[Server Error] Startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = app;
