// Vercel Serverless Function for Register
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

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    console.log('📝 Register request received:', req.body);
    
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
