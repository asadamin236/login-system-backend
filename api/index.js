// Vercel Serverless Function Handler
module.exports = async (req, res) => {
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
    console.log('🗄️ VERCEL: Serverless function called');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    
    // Check if database credentials are available
    const hasDatabase = process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME;
    
    console.log('VERCEL Environment check:');
    console.log('DB_HOST:', process.env.DB_HOST ? 'SET' : 'MISSING');
    console.log('DB_USER:', process.env.DB_USER ? 'SET' : 'MISSING'); 
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'MISSING');
    console.log('DB_NAME:', process.env.DB_NAME ? 'SET' : 'MISSING');

    // Route handling
    if (req.url === '/' || req.url === '/api' || req.url.startsWith('/?')) {
      // Root route
      const dbStatus = hasDatabase ? "REAL DATABASE MODE" : "NO DATABASE CREDENTIALS";
      
      return res.status(200).json({
        success: true,
        message: `Vercel Authentication API is running! - ${dbStatus}`,
        mode: hasDatabase ? "database" : "no_database",
        environment: {
          DB_HOST: process.env.DB_HOST ? 'SET' : 'MISSING',
          DB_USER: process.env.DB_USER ? 'SET' : 'MISSING',
          DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'MISSING',
          DB_NAME: process.env.DB_NAME ? 'SET' : 'MISSING'
        },
        endpoints: [
          "POST /api/auth/register",
          "POST /api/auth/login", 
          "GET /api/auth/profile",
          "PUT /api/auth/profile",
          "GET /api/auth/users",
          "GET /api/health"
        ]
      });
    }

    if (req.url === '/api/health') {
      return res.status(200).json({
        success: true,
        message: "Vercel API is running successfully",
        timestamp: new Date().toISOString(),
      });
    }

    // Handle auth routes
    if (req.url.startsWith('/api/auth/')) {
      if (!hasDatabase) {
        return res.status(500).json({
          success: false,
          message: "Database credentials not configured in Vercel environment variables",
          environment: {
            DB_HOST: process.env.DB_HOST ? 'SET' : 'MISSING',
            DB_USER: process.env.DB_USER ? 'SET' : 'MISSING',
            DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'MISSING',
            DB_NAME: process.env.DB_NAME ? 'SET' : 'MISSING'
          }
        });
      }

      // Try to load and use database modules
      try {
        const { initializeDatabase } = require("../config/db");
        const { registerUser, loginUser, getUserProfile, updateUserProfile, getAllUsers, authenticateToken } = require("../controllers/userController");
        
        // Initialize database
        await initializeDatabase();
        
        // Route to appropriate controller
        if (req.url === '/api/auth/register' && req.method === 'POST') {
          return await registerUser(req, res);
        }
        
        if (req.url === '/api/auth/login' && req.method === 'POST') {
          return await loginUser(req, res);
        }
        
        if (req.url === '/api/auth/profile' && req.method === 'GET') {
          return authenticateToken(req, res, () => getUserProfile(req, res));
        }
        
        if (req.url === '/api/auth/profile' && req.method === 'PUT') {
          return authenticateToken(req, res, () => updateUserProfile(req, res));
        }
        
        if (req.url === '/api/auth/users' && req.method === 'GET') {
          return authenticateToken(req, res, () => getAllUsers(req, res));
        }
        
      } catch (dbError) {
        console.error('❌ VERCEL: Database error:', dbError);
        return res.status(500).json({
          success: false,
          message: "Database connection failed",
          error: dbError.message
        });
      }
    }

    // 404 for unknown routes
    return res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.url}`
    });

  } catch (error) {
    console.error('❌ VERCEL: Global error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
