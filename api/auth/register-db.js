// Force database registration (no mock fallback) for debugging
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

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    console.log('🔄 FORCE DATABASE REGISTRATION - No mock fallback');
    console.log('📝 Register request received:', req.body);
    
    const { username, email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    // Check environment variables
    console.log('📋 Environment check:');
    console.log('DB_HOST:', process.env.DB_HOST ? 'SET' : 'MISSING');
    console.log('DB_USER:', process.env.DB_USER ? 'SET' : 'MISSING');
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'MISSING');
    console.log('DB_NAME:', process.env.DB_NAME ? 'SET' : 'MISSING');

    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
      return res.status(400).json({
        success: false,
        message: "Database environment variables not configured in Vercel",
        envCheck: {
          DB_HOST: process.env.DB_HOST ? 'SET' : 'MISSING',
          DB_USER: process.env.DB_USER ? 'SET' : 'MISSING',
          DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'MISSING',
          DB_NAME: process.env.DB_NAME ? 'SET' : 'MISSING'
        }
      });
    }

    // Force database registration - NO FALLBACK
    console.log('🗄️ Forcing database registration...');
    const { registerUserServerless } = require('../../utils/serverlessAuth');
    
    const result = await registerUserServerless(username, email, password);
    console.log('✅ Database registration successful:', result);
    
    return res.status(201).json(result);

  } catch (error) {
    console.error('❌ FORCED Registration error:', error);
    
    return res.status(500).json({
      success: false,
      message: "Database registration failed - NO MOCK FALLBACK",
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
