// Serverless-optimized database utilities
const mysql = require('mysql2/promise');

// Create a connection pool that works in serverless environment
let pool = null;

const createPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 5, // Lower limit for serverless
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
    });
  }
  return pool;
};

const ensureDatabaseExists = async () => {
  try {
    // Create connection without database first
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.end();
    
    return true;
  } catch (error) {
    console.error('Error ensuring database exists:', error);
    return false;
  }
};

const ensureTablesExist = async (pool) => {
  try {
    const connection = await pool.getConnection();
    
    // Create users table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('Error ensuring tables exist:', error);
    return false;
  }
};

const initializeServerlessDatabase = async () => {
  try {
    console.log('🔄 Initializing serverless database connection...');
    
    // Check if we have required environment variables
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
      throw new Error('Missing required database environment variables');
    }
    
    // Ensure database exists
    const dbExists = await ensureDatabaseExists();
    if (!dbExists) {
      throw new Error('Failed to create/verify database');
    }
    
    // Create pool
    const dbPool = createPool();
    
    // Test connection
    const connection = await dbPool.getConnection();
    await connection.ping();
    connection.release();
    
    // Ensure tables exist
    const tablesExist = await ensureTablesExist(dbPool);
    if (!tablesExist) {
      throw new Error('Failed to create/verify tables');
    }
    
    console.log('✅ Serverless database initialized successfully');
    return dbPool;
  } catch (error) {
    console.error('❌ Serverless database initialization failed:', error);
    throw error;
  }
};

module.exports = {
  initializeServerlessDatabase,
  createPool
};
