// Vercel Serverless Function for Register with Real Database

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
    console.log('Register request received:', req.body);
    
    const { username, email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    // Check if database credentials are available
    const hasDatabase = process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD;

    if (hasDatabase) {
      // Use real database registration
      try {
        // Dynamically import database modules only when needed
        const { registerUser } = require('../../controllers/userController');
        
        // Initialize database connection if needed
        const { initializeDatabase } = require('../../config/db');
        await initializeDatabase();
        
        // Call the registration function
        await registerUser(req, res);
        return; // Exit here as registerUser handles the response
      } catch (dbError) {
        console.error('Database registration error:', dbError);
        // Fall through to mock mode if database fails
      }
    }

    // Fallback to mock registration (either no DB credentials or DB error)
    const finalUsername = username || email.split('@')[0];

    res.status(200).json({
      success: true,
      message: hasDatabase ? 
        "User registered successfully (Database connection failed - using mock mode)" : 
        "User registered successfully (MOCK MODE - No database credentials)",
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
      message: "Internal server error during registration",
      error: error.message
    });
  }
}
