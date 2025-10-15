const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Temporarily disable database for testing
// const { initializeDatabase } = require('./config/db');
// const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Temporarily disable auth routes for testing
// app.use('/api/auth', userRoutes);

// Test routes
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Authentication API is running!',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/auth/register', (req, res) => {
    res.json({
        success: true,
        message: 'Registration endpoint working (database disabled for testing)',
        data: {
            userId: 1,
            username: 'test_user',
            email: req.body.email || 'test@example.com',
            token: 'test_token_123'
        }
    });
});

app.post('/api/auth/login', (req, res) => {
    res.json({
        success: true,
        message: 'Login endpoint working (database disabled for testing)',
        data: {
            userId: 1,
            username: 'test_user',
            email: req.body.email || 'test@example.com',
            token: 'test_token_123'
        }
    });
});

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running successfully',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server without database for testing
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log('Available test endpoints:');
    console.log('  POST /api/auth/register - Test register');
    console.log('  POST /api/auth/login - Test login');
    console.log('  GET /api/health - Health check');
});