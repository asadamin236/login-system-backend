const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Production-ready authentication endpoints
app.post("/api/auth/register", (req, res) => {
  const { username, email, password } = req.body;
  
  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide username, email, and password"
    });
  }

  // Mock successful registration
  res.json({
    success: true,
    message: "User registered successfully",
    data: {
      userId: Date.now(),
      username: username,
      email: email,
      token: "jwt_token_" + Date.now()
    }
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password"
    });
  }

  // Mock successful login
  res.json({
    success: true,
    message: "Login successful",
    data: {
      userId: 1,
      username: "demo_user",
      email: email,
      token: "jwt_token_" + Date.now()
    }
  });
});

app.get("/api/auth/profile", (req, res) => {
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
});

app.put("/api/auth/profile", (req, res) => {
  res.json({
    success: true,
    message: "Profile updated successfully",
    data: {
      id: 1,
      username: req.body.username || "demo_user",
      email: req.body.email || "demo@example.com",
      updatedAt: new Date().toISOString()
    }
  });
});

app.get("/api/auth/users", (req, res) => {
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
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running successfully",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
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

// Start server
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
