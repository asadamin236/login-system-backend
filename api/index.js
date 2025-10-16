// Vercel API Handler - Real Database Only
const express = require("express");
const cors = require("cors");

// Create Express app
const app = express();

// CORS middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control', 'Pragma'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Force database connection - NO MOCK MODE
console.log('🗄️ VERCEL: FORCING real database connection - NO MOCK MODE');

// Check if database credentials are available
const hasDatabase = process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME;

console.log('VERCEL Environment check:');
console.log('DB_HOST:', process.env.DB_HOST ? 'SET' : 'MISSING');
console.log('DB_USER:', process.env.DB_USER ? 'SET' : 'MISSING'); 
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'MISSING');
console.log('DB_NAME:', process.env.DB_NAME ? 'SET' : 'MISSING');

if (!hasDatabase) {
  console.error('❌ VERCEL CRITICAL: Database credentials not found!');
  console.error('Please set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in Vercel environment variables');
} else {
  try {
    const { initializeDatabase } = require("../config/db");
    const userRoutes = require("../routes/userRoutes");
    app.use("/api/auth", userRoutes);
    
    // Initialize database
    initializeDatabase().then(() => {
      console.log('✅ VERCEL: Database connected successfully - REAL MODE ACTIVE');
    }).catch(err => {
      console.error('❌ VERCEL: Database initialization failed:', err);
    });
  } catch (error) {
    console.error('❌ VERCEL CRITICAL: Database modules not found:', error.message);
  }
}

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Vercel API is running successfully",
    timestamp: new Date().toISOString(),
  });
});

// Root route for testing
app.get("/", (req, res) => {
  const dbStatus = hasDatabase ? "REAL DATABASE MODE" : "NO DATABASE CREDENTIALS";
  
  res.json({
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
});

// 404 handler
app.use((req, res) => {
  console.log(`VERCEL 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("VERCEL Global error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message
  });
});

// Export for Vercel
module.exports = app;
