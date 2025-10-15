// Vercel Serverless Function for Register with Real Database
const { registerUser } = require('../../controllers/userController');

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
    // Use real database registration
    try {
      await registerUser(req, res);
    } catch (error) {
      console.error('❌ Database registration error:', error);
      res.status(500).json({
        success: false,
        message: "Database connection error during registration"
      });
    }
  } else {
    // Fallback to mock registration for demo
    try {
      console.log('📝 Register request received (MOCK MODE):', req.body);
      
      const { username, email, password } = req.body;
      
      // Basic validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide email and password"
        });
      }

      // Use provided username or create one from email
      const finalUsername = username || email.split('@')[0];

      // Mock successful registration
      res.status(200).json({
        success: true,
        message: "User registered successfully (MOCK MODE - No database connection)",
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
}
