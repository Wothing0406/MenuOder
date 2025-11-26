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

async function applyMigration() {
  let connection;
  
  try {
    console.log('🔌 Đang kết nối đến MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    
    console.log('📝 Đang apply migration...');
    
    // Apply migration for new features first
    try {
      const migrationPath = path.join(__dirname, '../../database/migration_add_new_features.sql');
      if (fs.existsSync(migrationPath)) {
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        await connection.query(migrationSql);
        console.log('✅ Migration mới đã được apply!');
      }
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Một số cột mới đã tồn tại. Bỏ qua...');
      } else {
        throw error;
      }
    }
    
    // Apply migration to fix customer fields
    try {
      const fixMigrationPath = path.join(__dirname, '../../database/migration_fix_customer_fields.sql');
      if (fs.existsSync(fixMigrationPath)) {
        const fixMigrationSql = fs.readFileSync(fixMigrationPath, 'utf8');
        await connection.query(fixMigrationSql);
        console.log('✅ Migration sửa customer fields đã được apply!');
      }
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME' || error.message.includes('Duplicate column')) {
        console.log('⚠️  Customer fields đã được cập nhật. Bỏ qua...');
      } else {
        throw error;
      }
    }
    
    // Apply migration to add detailed address
    try {
      const detailedAddressMigrationPath = path.join(__dirname, '../../database/migration_add_detailed_address.sql');
      if (fs.existsSync(detailedAddressMigrationPath)) {
        const detailedAddressMigrationSql = fs.readFileSync(detailedAddressMigrationPath, 'utf8');
        await connection.query(detailedAddressMigrationSql);
        console.log('✅ Migration thêm địa chỉ chi tiết đã được apply!');
      }
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME' || error.message.includes('Duplicate column name')) {
        console.log('⚠️  Cột storeDetailedAddress đã tồn tại. Bỏ qua...');
      } else {
        throw error;
      }
    }
    
    console.log('\n✅ Tất cả migration đã được apply thành công!');
    console.log('\n📊 Các thay đổi:');
    console.log('   - stores.storeGoogleMapLink');
    console.log('   - stores.storeDetailedAddress (địa chỉ chi tiết)');
    console.log('   - orders.orderType');
    console.log('   - orders.deliveryAddress');
    console.log('   - orders.deliveryDistance');
    console.log('   - orders.shippingFee');
    console.log('   - orders.customerName (cho phép NULL)');
    console.log('   - orders.customerPhone (cho phép NULL)');
    console.log('\n✨ Hoàn tất! Bạn có thể đặt hàng tại bàn ngay bây giờ.');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error('\n💡 Nếu lỗi do thiếu database, hãy chạy: npm run reset-db');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run script
applyMigration();


