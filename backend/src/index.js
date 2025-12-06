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
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
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
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'X-Admin-Secret',
    'x-admin-secret' // Also allow lowercase version
  ],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
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
app.use('/api/vouchers', require('./routes/voucherRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

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
    // Test database connection first với retry logic
    console.log('🔌 Testing database connection...');
    
    let retries = 5;
    let connected = false;
    
    while (retries > 0 && !connected) {
      try {
        await sequelize.authenticate();
        console.log('✅ Database connection established');
        connected = true;
      } catch (error) {
        retries--;
        if (retries === 0) {
          console.error('❌ Failed to connect to database after 5 attempts');
          console.error('Error:', error.message);
          
          // Hướng dẫn cụ thể cho Render
          if (error.message.includes('ECONNREFUSED') || error.message.includes('Connection refused')) {
            console.error('\n💡 Render Database Connection Issue:');
            console.error('   1. Check if database is "Running" in Render Dashboard');
            console.error('   2. Ensure database is linked to this service:');
            console.error('      - Go to Service → Connections → Link Database');
            console.error('   3. Verify DATABASE_URL in Environment Variables');
            console.error('   4. Wait a few minutes if database was just created');
            console.error('   5. Try restarting the service');
          }
          
          throw error;
        } else {
          console.log(`⚠️  Connection failed, retrying... (${retries} attempts left)`);
          console.log(`   Error: ${error.message}`);
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 2000 * (6 - retries)));
        }
      }
    }

    // Sync database (create tables if not exist, but don't alter existing)
    // Use { alter: false } to avoid modifying existing tables
    // Use { force: false } to avoid dropping tables
    console.log('🔄 Syncing database models...');
    
    // Detect if running on Render (or other cloud platforms)
    const isRender = process.env.RENDER || process.env.RENDER_EXTERNAL_URL || process.env.RENDER_SERVICE_NAME;
    const isProduction = process.env.NODE_ENV === 'production';
    const isCloudPlatform = isRender || process.env.VERCEL || process.env.RAILWAY_ENVIRONMENT || process.env.HEROKU;
    
    // Check if we're on Render or production - use alter: true to add missing columns
    const shouldAlter = isRender || isProduction;
    
    await sequelize.sync({ 
      alter: shouldAlter, // Auto-add missing columns on Render/production
      force: false // Never drop tables
    });
    console.log('✅ Database synchronized successfully');

    // Start server
    
    // Use 'localhost' for local development to avoid permission issues on Windows
    // Use '0.0.0.0' for cloud platforms (Render, Railway, Heroku, etc.) or production
    const HOST = process.env.HOST || (isCloudPlatform || isProduction ? '0.0.0.0' : 'localhost');
    
    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Host: ${HOST}`);
      
      if (HOST === '0.0.0.0') {
        console.log(`📡 Server accessible from all network interfaces`);
        if (process.env.RENDER_EXTERNAL_URL) {
          console.log(`📡 External URL: ${process.env.RENDER_EXTERNAL_URL}`);
        }
      } else {
        console.log(`📡 API URL: http://localhost:${PORT}/api`);
      }
      
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
    if (error.code === 'EACCES') {
      console.error(`\n⚠️  Permission denied on port ${PORT}.`);
      console.error('   Solutions:');
      console.error(`   1. Change PORT in your .env file to a different port (e.g., 5001, 5002, 3001)`);
      console.error(`   2. Or change HOST in your .env file to 'localhost' instead of '0.0.0.0'`);
      console.error(`   3. On Windows, you can try running PowerShell as administrator`);
      console.error(`   4. Recommended: Use port 5001 or higher (they don't require special permissions)`);
    } else if (error.code === 'EADDRINUSE') {
      console.error(`\n⚠️  Port ${PORT} is already in use.`);
      console.error('   Solutions:');
      console.error(`   1. Change PORT in your .env file to a different port (e.g., 5001, 5002, 3001)`);
      console.error(`   2. Stop the process using port ${PORT}`);
      console.error(`   3. Run: npm run restart (to automatically kill and restart)`);
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
