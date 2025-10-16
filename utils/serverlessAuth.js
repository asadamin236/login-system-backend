// Serverless authentication utilities
const bcrypt = require('bcrypt');
const { generateToken } = require('./jwtUtils');
const { initializeServerlessDatabase } = require('./serverlessDb');

// Simplified user registration for serverless
const registerUserServerless = async (username, email, password) => {
  try {
    console.log('🔄 Starting serverless user registration...');
    
    // Initialize database
    const pool = await initializeServerlessDatabase();
    
    // Validation
    if (!username || !email || !password) {
      throw new Error('Please provide username, email, and password');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please provide a valid email address');
    }

    // Password validation
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      throw new Error('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const userId = result.insertId;

    // Generate real JWT token
    const token = generateToken(userId, email);

    console.log('✅ User registered successfully in database');

    return {
      success: true,
      message: 'User registered successfully',
      data: {
        userId,
        username,
        email,
        token
      }
    };

  } catch (error) {
    console.error('❌ Serverless registration error:', error);
    throw error;
  }
};

// Simplified user login for serverless
const loginUserServerless = async (email, password) => {
  try {
    console.log('🔄 Starting serverless user login...');
    
    // Initialize database
    const pool = await initializeServerlessDatabase();
    
    // Validation
    if (!email || !password) {
      throw new Error('Please provide email and password');
    }

    // Find user by email
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate real JWT token
    const token = generateToken(user.id, user.email);

    console.log('✅ User logged in successfully');

    return {
      success: true,
      message: 'Login successful',
      data: {
        userId: user.id,
        username: user.username,
        email: user.email,
        token
      }
    };

  } catch (error) {
    console.error('❌ Serverless login error:', error);
    throw error;
  }
};

module.exports = {
  registerUserServerless,
  loginUserServerless
};
