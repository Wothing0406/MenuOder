const { Sequelize } = require('sequelize');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Xác định loại database: PostgreSQL hoặc MySQL
// Kiểm tra DATABASE_URL trước (Render PostgreSQL thường dùng cách này)
const dbType = process.env.DB_TYPE || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgres') ? 'postgres' : 'mysql');

let sequelize;
let currentDialect = 'mysql';

if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgres')) {
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
}

// Test connection function
sequelize.authenticate()
  .then(() => {
    console.log(`✅ Database connection established successfully (${currentDialect})`);
  })
  .catch((error) => {
    console.error('❌ Unable to connect to database:', error.message);
  });

module.exports = {
  sequelize,
  Sequelize
};
