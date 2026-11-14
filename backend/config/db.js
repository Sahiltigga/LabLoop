const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  // Sanitize URI helper to never leak password/credentials in logs
  const getSanitizedHost = (uri) => {
    if (!uri) return 'unknown';
    try {
      const match = uri.match(/@([^/?]+)/);
      if (match) return match[1];
      const direct = uri.replace(/mongodb(\+srv)?:\/\//, '').split('/')[0];
      return direct.replace(/.*@/, '');
    } catch {
      return 'cluster-host';
    }
  };

  try {
    if (mongoUri && !mongoUri.includes('<db_password>') && !mongoUri.includes('<password>')) {
      try {
        const conn = await mongoose.connect(mongoUri, {
          dbName: 'labloop_db',
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`[Database] MongoDB Atlas Connected Successfully to: ${getSanitizedHost(mongoUri)}`);
        console.log(`[Database] Active Database: ${conn.connection.name}`);
        return conn;
      } catch (atlasErr) {
        console.warn(`[Database Warning] Atlas connection to ${getSanitizedHost(mongoUri)} failed (${atlasErr.message}).`);
      }
    } else if (mongoUri && (mongoUri.includes('<db_password>') || mongoUri.includes('<password>'))) {
      console.warn('[Database Notice] Atlas connection string in .env contains unreplaced template placeholder <db_password>.');
      console.warn('[Database Tip] Replace <db_password> with your MongoDB Atlas database user password in backend/.env to connect to your live Atlas cluster.');
    }

    // Attempt local MongoDB instance (127.0.0.1:27017/labloop_db)
    const localUri = 'mongodb://127.0.0.1:27017/labloop_db';
    try {
      const conn = await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`[Database] Connected to Local MongoDB: ${conn.connection.host}`);
      console.log(`[Database] Active Database: ${conn.connection.name}`);
      return conn;
    } catch (localErr) {
      console.warn(`[Database Warning] Local MongoDB on 27017 unavailable (${localErr.message}).`);
    }

    // In-memory fallback for zero-dependency execution
    console.warn('[Database Fallback] Starting MongoMemoryServer for immediate local execution...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create({
      binary: {
        version: process.env.MONGOMS_VERSION || '8.2.6',
      },
    });
    const memUri = mongod.getUri();
    const conn = await mongoose.connect(memUri, { dbName: 'labloop_db' });
    console.log(`[Database] Connected to In-Memory MongoDB at: ${memUri}`);
    console.log(`[Database] Active Database: ${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`[Database Error] Connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
