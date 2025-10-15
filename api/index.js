// Vercel Serverless Function - Main API Handler with Real Database
const { registerUser, loginUser, getUserProfile, updateUserProfile, getAllUsers, authenticateToken } = require('../controllers/userController');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, method } = req;
  
  // Check if database credentials are available
  const hasDatabase = process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD;
  
  try {
    // Route handling with database support
    if (url === '/api/auth/login' && method === 'POST') {
      return hasDatabase ? await loginUser(req, res) : handleLogin(req, res);
    }
    
    if (url === '/api/auth/register' && method === 'POST') {
      return hasDatabase ? await registerUser(req, res) : handleRegister(req, res);
    }
    
    if (url === '/api/auth/profile' && method === 'GET') {
      if (hasDatabase) {
        return authenticateToken(req, res, () => getUserProfile(req, res));
      } else {
        return handleProfile(req, res);
      }
    }
    
    if (url === '/api/auth/profile' && method === 'PUT') {
      if (hasDatabase) {
        return authenticateToken(req, res, () => updateUserProfile(req, res));
      } else {
        return handleUpdateProfile(req, res);
      }
    }
    
    if (url === '/api/auth/users' && method === 'GET') {
      if (hasDatabase) {
        return authenticateToken(req, res, () => getAllUsers(req, res));
      } else {
        return handleGetUsers(req, res);
      }
    }
    
    if (url === '/api/health' && method === 'GET') {
      return handleHealth(req, res);
    }
    
    // Root route
    if (url === '/' || url === '/api' || !url.includes('/api/')) {
      return res.status(200).json({
        success: true,
        message: hasDatabase ? "Authentication API is running with database!" : "Authentication API is running in mock mode!",
        timestamp: new Date().toISOString(),
        mode: hasDatabase ? "database" : "mock",
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
    
    // 404 for unknown routes
    res.status(404).json({
      success: false,
      message: `Route not found: ${method} ${url}`
    });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

// Mock handlers for fallback when no database is available
function handleLogin(req, res) {
  try {
    console.log('📝 Login request received (MOCK MODE):', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful (MOCK MODE)",
      data: {
        userId: 1,
        username: email.split('@')[0],
        email: email,
        token: "jwt_token_" + Date.now()
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error during login"
    });
  }
}

function handleRegister(req, res) {
  try {
    console.log('📝 Register request received (MOCK MODE):', req.body);
    
    const { username, email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    const finalUsername = username || email.split('@')[0];

    res.status(200).json({
      success: true,
      message: "User registered successfully (MOCK MODE)",
      data: {
        userId: Date.now(),
        username: finalUsername,
        email: email,
        token: "jwt_token_" + Date.now()
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error during registration"
    });
  }
}

function handleProfile(req, res) {
  res.json({
    success: true,
    data: {
      id: 1,
      username: "demo_user",
      email: "demo@example.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });
}

function handleUpdateProfile(req, res) {
  res.json({
    success: true,
    message: "Profile updated successfully (MOCK MODE)",
    data: {
      id: 1,
      username: req.body.username || "demo_user",
      email: req.body.email || "demo@example.com",
      updatedAt: new Date().toISOString()
    }
  });
}

function handleGetUsers(req, res) {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        username: "demo_user",
        email: "demo@example.com",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    count: 1
  });
}

function handleHealth(req, res) {
  res.status(200).json({
    success: true,
    message: "Server is running successfully",
    timestamp: new Date().toISOString()
  });
}

