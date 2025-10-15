// Vercel Serverless Function - Main API Handler
export default function handler(req, res) {
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
  
  try {
    // Route handling
    if (url === '/api/auth/login' && method === 'POST') {
      return handleLogin(req, res);
    }
    
    if (url === '/api/auth/register' && method === 'POST') {
      return handleRegister(req, res);
    }
    
    if (url === '/api/health' && method === 'GET') {
      return handleHealth(req, res);
    }
    
    // Root route
    if (url === '/' || url === '/api' || !url.includes('/api/')) {
      return res.status(200).json({
        success: true,
        message: "Authentication API is running!",
        timestamp: new Date().toISOString(),
        endpoints: [
          "POST /api/auth/register",
          "POST /api/auth/login", 
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

// Login handler
function handleLogin(req, res) {
  try {
    console.log('📝 Login request received:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
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

// Register handler
function handleRegister(req, res) {
  try {
    console.log('📝 Register request received:', req.body);
    
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
      message: "User registered successfully",
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

// Health check handler
function handleHealth(req, res) {
  res.status(200).json({
    success: true,
    message: "Server is running successfully",
    timestamp: new Date().toISOString()
  });
}
