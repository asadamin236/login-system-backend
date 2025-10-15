// Vercel Serverless Function for Login with Real Database
const { loginUser } = require('../../controllers/userController');

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

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  // Check if database credentials are available
  const hasDatabase = process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD;

  if (hasDatabase) {
    // Use real database login
    try {
      await loginUser(req, res);
    } catch (error) {
      console.error('❌ Database login error:', error);
      res.status(500).json({
        success: false,
        message: "Database connection error during login"
      });
    }
  } else {
    // Fallback to mock login for demo
    try {
      console.log('📝 Login request received (MOCK MODE):', req.body);
      
      const { email, password } = req.body;
      
      // Basic validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide email and password"
        });
      }

      // Mock successful login
      res.status(200).json({
        success: true,
        message: "Login successful (MOCK MODE - No database connection)",
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
}
