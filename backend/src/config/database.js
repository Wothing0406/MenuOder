const { Sequelize } = require('sequelize');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Debug: Log environment variables (không log password)
console.log('🔍 Database Configuration:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- DB_TYPE:', process.env.DB_TYPE || 'not set');
console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  // Log URL nhưng che password
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':***@');
  console.log('- DATABASE_URL:', maskedUrl);
  console.log('- Contains postgres:', dbUrl.includes('postgres'));
}

// Xác định loại database: PostgreSQL hoặc MySQL
// Render PostgreSQL thường dùng DATABASE_URL với format: postgresql://...
// Ưu tiên kiểm tra DATABASE_URL trước, sau đó mới kiểm tra DB_TYPE
const hasPostgresUrl = process.env.DATABASE_URL && (
  process.env.DATABASE_URL.includes('postgresql://') || 
  process.env.DATABASE_URL.includes('postgres://') ||
  process.env.DATABASE_URL.includes('postgres')
);

const dbType = process.env.DB_TYPE || (hasPostgresUrl ? 'postgres' : 'mysql');

let sequelize;
let currentDialect = 'mysql';

if (process.env.DATABASE_URL && hasPostgresUrl) {
  // Sử dụng PostgreSQL với connection string (Render PostgreSQL)
  currentDialect = 'postgres';
  const isProduction = process.env.NODE_ENV === 'production';
  
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: isProduction ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  });
  
  console.log('✅ Using PostgreSQL database (connection string)');
} else if (dbType === 'postgres') {
  // Sử dụng PostgreSQL với các biến riêng lẻ
  currentDialect = 'postgres';
  const isProduction = process.env.NODE_ENV === 'production';
  
  sequelize = new Sequelize(
    process.env.DB_NAME || 'menu_order_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      dialect: 'postgres',
      dialectOptions: {
        ssl: isProduction ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true
      }
    }
  );
  
  console.log('✅ Using PostgreSQL database (individual variables)');
} else {
  // Sử dụng MySQL (mặc định cho local development)
  // Nhưng trong production, nên dùng PostgreSQL
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL && !process.env.DB_HOST) {
    console.error('⚠️  WARNING: Running in production mode but no database configuration found!');
    console.error('    Please set DATABASE_URL (for PostgreSQL) or DB_HOST (for MySQL)');
    console.error('    On Render, link your PostgreSQL database to this service.');
  }
  
  currentDialect = 'mysql';
  
  sequelize = new Sequelize(
    process.env.DB_NAME || 'menu_order_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true
      }
    }
  );
  
  console.log('✅ Using MySQL database');
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  Note: Using MySQL in production. Consider using PostgreSQL for better performance.');
  }
}

// Test connection function (async, không block startup)
// Connection sẽ được test trong index.js trước khi sync
if (process.env.NODE_ENV === 'development') {
  sequelize.authenticate()
    .then(() => {
      console.log(`✅ Database connection test successful (${currentDialect})`);
    })
    .catch((error) => {
      console.error('⚠️  Database connection test failed:', error.message);
      console.error('   This is expected if database is not running locally.');
    });
}

module.exports = {
  sequelize,
  Sequelize
};
