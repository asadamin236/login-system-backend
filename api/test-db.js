// Test database connection endpoint for debugging
module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('Testing database connection...');
    
    // Check environment variables
    const envCheck = {
      DB_HOST: process.env.DB_HOST ? 'SET' : 'MISSING',
      DB_USER: process.env.DB_USER ? 'SET' : 'MISSING', 
      DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'MISSING',
      DB_NAME: process.env.DB_NAME ? 'SET' : 'MISSING'
    };
    
    console.log('Environment variables:', envCheck);
    
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
      return res.status(400).json({
        success: false,
        message: 'Database environment variables not configured',
        envCheck
      });
    }
    
    // Try to initialize database
    const { initializeServerlessDatabase } = require('../utils/serverlessDb');
    const pool = await initializeServerlessDatabase();
    
    // Test a simple query
    const [result] = await pool.execute('SELECT 1 as test');
    
    res.status(200).json({
      success: true,
      message: 'Database connection successful!',
      envCheck,
      testQuery: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database test failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      stack: error.stack,
      envCheck: {
        DB_HOST: process.env.DB_HOST ? 'SET' : 'MISSING',
        DB_USER: process.env.DB_USER ? 'SET' : 'MISSING', 
        DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'MISSING',
        DB_NAME: process.env.DB_NAME ? 'SET' : 'MISSING'
      }
    });
  }
};
