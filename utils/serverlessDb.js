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
    console.log('📋 Checking environment variables...');
    console.log('DB_HOST:', process.env.DB_HOST ? 'SET' : 'MISSING');
    console.log('DB_USER:', process.env.DB_USER ? 'SET' : 'MISSING');
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'MISSING');
    console.log('DB_NAME:', process.env.DB_NAME ? 'SET' : 'MISSING');
    
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
      throw new Error(`Missing required database environment variables: 
        DB_HOST: ${process.env.DB_HOST ? 'SET' : 'MISSING'}
        DB_USER: ${process.env.DB_USER ? 'SET' : 'MISSING'}
        DB_PASSWORD: ${process.env.DB_PASSWORD ? 'SET' : 'MISSING'}
        DB_NAME: ${process.env.DB_NAME ? 'SET' : 'MISSING'}`);
    }
    
    console.log('🔗 Attempting to connect to database...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Database:', process.env.DB_NAME);
    console.log('User:', process.env.DB_USER);
    
    // Ensure database exists
    console.log('📦 Ensuring database exists...');
    const dbExists = await ensureDatabaseExists();
    if (!dbExists) {
      throw new Error('Failed to create/verify database');
    }
    
    // Create pool
    console.log('🏊 Creating connection pool...');
    const dbPool = createPool();
    
    // Test connection with timeout
    console.log('🧪 Testing database connection...');
    const connection = await Promise.race([
      dbPool.getConnection(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 10000)
      )
    ]);
    
    await connection.ping();
    connection.release();
    console.log('✅ Database connection successful');
    
    // Ensure tables exist
    console.log('📋 Ensuring tables exist...');
    const tablesExist = await ensureTablesExist(dbPool);
    if (!tablesExist) {
      throw new Error('Failed to create/verify tables');
    }
    
    console.log('✅ Serverless database initialized successfully');
    return dbPool;
  } catch (error) {
    console.error('❌ Serverless database initialization failed:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

module.exports = {
  initializeServerlessDatabase,
  createPool
};
