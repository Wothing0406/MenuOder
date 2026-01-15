const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { sequelize } = require('./config/database');

// Import models to set up associations
require('./models');

// Import auto-block service
const autoBlockService = require('./utils/autoBlockService');

// Load environment variables
dotenv.config();

const app = express();

// Middleware - CORS configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'];

const corsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Admin-Secret',
    'x-admin-secret', // Also allow lowercase version
    'X-Device-Id'
  ],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// In production, use more restrictive CORS
if (process.env.NODE_ENV === 'production') {
  corsOptions.origin = function (origin, callback) {
    // Allow requests with no origin (file:// protocol, mobile apps, Postman, etc.)
    if (!origin || origin === 'null') return callback(null, true);

    // Allow all Vercel domains (*.vercel.app)
    if (origin && origin.includes('.vercel.app')) {
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
  };
}

app.use(cors(corsOptions));
console.log('✅ CORS middleware configured with options:', {
  origin: corsOptions.origin,
  credentials: corsOptions.credentials,
  methods: corsOptions.methods,
  allowedHeaders: corsOptions.allowedHeaders
});

// Manual CORS headers as fallback
app.use((req, res, next) => {
  console.log(`🌐 CORS middleware: ${req.method} ${req.path} from origin: ${req.headers.origin || 'none'}`);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Admin-Secret, x-admin-secret, X-Device-Id');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request');
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check route (before other routes for faster response)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

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
app.use('/api/zalopay', require('./routes/zaloPayRoutes'));
app.use('/api/bank-transfer', require('./routes/bankTransferRoutes'));
app.use('/api/payment-accounts', require('./routes/paymentAccountRoutes'));
app.use('/api/payment', require('./routes/publicPaymentRoutes'));
app.use('/api/anti-spam', require('./routes/antiSpamRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Server configuration
const PORT = process.env.PORT || 5002;
const HOST = process.env.HOST || '0.0.0.0';
const isVercel = process.env.VERCEL === '1';

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    console.log('🔌 Attempting to connect to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Run migrations automatically in production (Render)
    if (process.env.NODE_ENV === 'production' && process.env.AUTO_MIGRATE !== 'false') {
      console.log('🔄 Running automatic migrations in production...');
      try {
        const { runSequentialMigrations } = require('../scripts/deploy-migrations');
        await runSequentialMigrations();
        console.log('✅ Migrations completed');
      } catch (migrationError) {
        // Check if it's a non-fatal error (column already exists)
        const errorMsg = migrationError.message || '';
        const isNonFatal = errorMsg.includes('đã tồn tại') || 
                          errorMsg.includes('already exists') ||
                          errorMsg.includes('Duplicate column');
        
        if (isNonFatal) {
          console.log('⚠️  Some migrations skipped (columns may already exist)');
        } else {
          console.error('⚠️  Migration error (non-fatal):', migrationError.message);
        }
        // Continue even if migrations fail (columns might already exist)
      }
    }

    // Sync database (don't force in production)
    await sequelize.sync({ alter: false, force: false });
    console.log('✅ Database synchronized');

    // Start auto-block service
    autoBlockService.start();

    if (!isVercel) {
      // Start HTTP server
      const server = app.listen(PORT, HOST, () => {
        console.log(`🚀 Server running on http://${HOST}:${PORT}`);
        console.log(`📱 Frontend should connect to: http://localhost:${PORT}/api`);
        console.log(`🔗 Health check: http://localhost:${PORT}/health`);
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
    } else {
      console.log('✅ Running on Vercel - serverless mode');
    }
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
    
    if (!isVercel) {
      process.exit(1);
    }
  }
};

// Only start server if not on Vercel (Vercel will handle requests via serverless function)
if (!isVercel) {
  startServer();
} else {
  // On Vercel, just initialize database connection
  (async () => {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection established (Vercel)');
      await sequelize.sync({ alter: false, force: false });
      console.log('✅ Database synchronized (Vercel)');
    } catch (error) {
      console.error('❌ Database initialization error:', error.message);
    }
  })();
}

module.exports = app;