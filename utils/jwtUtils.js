// JWT utilities for serverless environment
const jwt = require('jsonwebtoken');

// JWT Secret with fallback
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-for-demo';

// Generate JWT Token
const generateToken = (userId, email) => {
  try {
    return jwt.sign(
      { 
        userId: userId,
        email: email,
        iat: Math.floor(Date.now() / 1000)
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
  } catch (error) {
    console.error('JWT generation error:', error);
    // Fallback to mock token if JWT fails
    return `jwt_token_${Date.now()}_${userId}`;
  }
};

// Verify JWT Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  JWT_SECRET
};
