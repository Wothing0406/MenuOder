/**
 * Script để chạy migrations khi server khởi động
 * Script này sẽ được gọi từ index.js nếu cần
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'menu_order_db',
  multipleStatements: true
};

async function runMigrations() {
  // Chỉ chạy migration cho MySQL, không chạy cho PostgreSQL
  // Vì PostgreSQL thường dùng migration tools khác (như Sequelize migrations)
  const hasPostgresUrl = process.env.DATABASE_URL && (
    process.env.DATABASE_URL.includes('postgresql://') || 
    process.env.DATABASE_URL.includes('postgres://')
  );
  
  if (hasPostgresUrl) {
    console.log('ℹ️  Skipping MySQL migrations (using PostgreSQL)');
    return;
  }

  let connection;
  
  try {
    console.log('🔄 Running database migrations...');
    connection = await mysql.createConnection(DB_CONFIG);
    
    // Chạy migration fix storeId nullable
    const migrationPath = path.join(__dirname, '../../database/migration_fix_voucher_storeId_nullable.sql');
    if (fs.existsSync(migrationPath)) {
      try {
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        await connection.query(migrationSql);
        console.log('✅ Migration fix_voucher_storeId_nullable applied');
      } catch (error) {
        // Ignore errors nếu migration đã được apply
        if (!error.message.includes('does not support') && !error.message.includes('Invalid use of NULL')) {
          console.log('ℹ️  Migration storeId nullable:', error.message);
        }
      }
    }
    
    console.log('✅ Migrations completed');
  } catch (error) {
    // Không throw error để không block server start
    // Chỉ log warning
    console.log('⚠️  Migration warning:', error.message);
    console.log('   Server will continue to start. You may need to run migrations manually.');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Export để có thể gọi từ index.js
module.exports = { runMigrations };

// Nếu chạy trực tiếp
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

