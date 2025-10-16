const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS middleware - allow all origins for maximum compatibility
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control', 'Pragma'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Additional CORS headers middleware for extra compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple request logging (after body parsing)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Force database connection - NO MOCK MODE
console.log('🗄️ FORCING real database connection - NO MOCK MODE');

// Check if database credentials are available
const hasDatabase = process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME;

console.log('Environment check:');
console.log('DB_HOST:', process.env.DB_HOST ? 'SET' : 'MISSING');
console.log('DB_USER:', process.env.DB_USER ? 'SET' : 'MISSING'); 
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'MISSING');
console.log('DB_NAME:', process.env.DB_NAME ? 'SET' : 'MISSING');

if (!hasDatabase) {
  console.error('❌ CRITICAL: Database credentials not found!');
  console.error('Please set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in environment variables');
  
  // In serverless environment, don't exit - just log error
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    console.error('❌ Running in production without database - this will cause errors');
  } else {
    process.exit(1); // Exit only in local development
  }
} else {
  try {
    const { initializeDatabase } = require("./config/db");
    const userRoutes = require("./routes/userRoutes");
    app.use("/api/auth", userRoutes);
    
    // Initialize database
    initializeDatabase().then(() => {
      console.log('✅ Database connected successfully - REAL MODE ACTIVE');
    }).catch(err => {
      console.error('❌ Database initialization failed:', err);
      console.error('❌ CRITICAL: Cannot start without database connection');
      
      // In serverless environment, don't exit - just log error
      if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
        process.exit(1); // Exit only in local development
      }
    });
  } catch (error) {
    console.error('❌ CRITICAL: Database modules not found:', error.message);
    
    // In serverless environment, don't exit - just log error
    if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
      process.exit(1); // Exit only in local development
    }
  }
}

// Mock endpoints removed - ONLY REAL DATABASE MODE

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running successfully",
    timestamp: new Date().toISOString(),
  });
});

// Root route for testing
app.get("/", (req, res) => {
  const dbStatus = hasDatabase ? "REAL DATABASE MODE" : "NO DATABASE CREDENTIALS";
  
  res.json({
    success: true,
    message: `Authentication API is running! - ${dbStatus}`,
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
});

// 404 handler (must be last)
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// Start server only in local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log("Available endpoints:");
    console.log("  POST /api/auth/register - Register new user");
    console.log("  POST /api/auth/login - Login user");
    console.log("  GET /api/auth/profile - Get user profile");
    console.log("  PUT /api/auth/profile - Update user profile");
    console.log("  GET /api/auth/users - Get all users");
    console.log("  GET /api/health - Health check");
  });
}

// Export for Vercel serverless function
module.exports = app;
module.exports.default = app;
