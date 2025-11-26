const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { sequelize } = require('./config/database');

// Import models to set up associations
require('./models');

// Load environment variables
dotenv.config();

const app = express();

// Middleware - CORS configuration
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // Allow all Vercel domains (*.vercel.app)
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      console.warn(`   Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/stores', require('./routes/storeRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/items', require('./routes/accompanimentRoutes'));
app.use('/api/item-options', require('./routes/itemOptionRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/qr', require('./routes/qrRoutes'));
app.use('/api/utils', require('./routes/utilsRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Initialize database and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection first
    console.log('🔌 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync database (create tables if not exist, but don't alter existing)
    // Use { alter: false } to avoid modifying existing tables
    // Use { force: false } to avoid dropping tables
    console.log('🔄 Syncing database models...');
    await sequelize.sync({ 
      alter: false,
      force: false 
    });
    console.log('✅ Database synchronized successfully');

    // Start server
    // Use '0.0.0.0' to listen on all network interfaces (IPv4 and IPv6)
    // This ensures compatibility with both localhost and network access
    const HOST = process.env.HOST || '0.0.0.0';
    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API URL: http://localhost:${PORT}/api`);
      console.log(`📡 Network API URL: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/api`);
      if (process.env.FRONTEND_URL) {
        console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
      } else {
        console.log(`🔗 Frontend URL: http://localhost:3000`);
      }
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error('   Please stop the process using this port or change PORT in .env');
      } else {
        console.error('❌ Server error:', error);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Check for port conflict errors
    if (error.code === 'EACCES' || error.code === 'EADDRINUSE') {
      console.error(`\n⚠️  Port ${PORT} is already in use or requires elevated permissions.`);
      console.error('   Solutions:');
      console.error(`   1. Change PORT in your .env file to a different port (e.g., 5000, 5002, 3001)`);
      console.error(`   2. Stop the process using port ${PORT}`);
      console.error(`   3. On Windows, try running as administrator if needed`);
    }
    
    // More detailed error logging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
    }
    
    process.exit(1);
  }
};

startServer();

module.exports = app;
