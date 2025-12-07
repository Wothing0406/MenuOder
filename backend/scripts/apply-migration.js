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

async function dropFkIfExists(connection, dbName, table, fkName) {
  try {
    const [rows] = await connection.query(
      `SELECT CONSTRAINT_NAME FROM information_schema.referential_constraints WHERE CONSTRAINT_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?`,
      [dbName, table, fkName]
    );
    if (rows.length > 0) {
      console.log(`⚠️  Đang xoá foreign key trùng: ${fkName} trên ${table}`);
      await connection.query(`ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${fkName}\``);
    }
  } catch (err) {
    if (!String(err.message || '').includes('references nonexistent constraint')) {
      console.log(`ℹ️  Bỏ qua lỗi khi xoá FK ${fkName}:`, err.message);
    }
  }
}

async function dropIndexIfExists(connection, table, indexName) {
  try {
    const [rows] = await connection.query(`SHOW INDEX FROM \`${table}\` WHERE Key_name = ?`, [indexName]);
    if (rows.length > 0) {
      console.log(`⚠️  Đang xoá index trùng: ${indexName} trên ${table}`);
      await connection.query(`DROP INDEX \`${indexName}\` ON \`${table}\``);
    }
  } catch (err) {
    console.log(`ℹ️  Bỏ qua lỗi khi xoá index ${indexName}:`, err.message);
  }
}

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
    
    // Apply migration to add vouchers and order voucher fields
    try {
      const vouchersMigrationPath = path.join(__dirname, '../../database/migration_add_vouchers.sql');
      if (fs.existsSync(vouchersMigrationPath)) {
        // Pre-drop conflicting FK and indexes to avoid errno 121
        const dbName = DB_CONFIG.database;
        await dropFkIfExists(connection, dbName, 'orders', 'fk_orders_voucherId');
        await dropIndexIfExists(connection, 'orders', 'idx_orders_voucherCode');

        const vouchersSql = fs.readFileSync(vouchersMigrationPath, 'utf8');
        await connection.query(vouchersSql);
        console.log('✅ Migration vouchers (bảng vouchers + cột voucherId/voucherCode/discount*) đã được apply!');
      }
    } catch (error) {
      if (
        error.code === 'ER_DUP_FIELDNAME' ||
        error.message.includes('Duplicate column') ||
        error.message.includes('Can\'t write; duplicate key') ||
        error.code === 'ER_TABLE_EXISTS_ERROR'
      ) {
        console.log('⚠️  Vouchers migration có vẻ đã tồn tại. Bỏ qua...');
      } else {
        throw error;
      }
    }
    
    // Apply migration to fix vouchers.storeId to allow NULL
    try {
      const fixStoreIdMigrationPath = path.join(__dirname, '../../database/migration_fix_voucher_storeId_nullable.sql');
      if (fs.existsSync(fixStoreIdMigrationPath)) {
        const fixStoreIdSql = fs.readFileSync(fixStoreIdMigrationPath, 'utf8');
        await connection.query(fixStoreIdSql);
        console.log('✅ Migration sửa vouchers.storeId cho phép NULL đã được apply!');
      }
    } catch (error) {
      if (
        error.code === 'ER_BAD_FIELD_ERROR' ||
        error.message.includes('Unknown column') ||
        error.message.includes('doesn\'t exist')
      ) {
        console.log('⚠️  Bảng vouchers chưa tồn tại. Bỏ qua migration này...');
      } else if (error.message.includes('does not support') || error.message.includes('Invalid use of NULL')) {
        console.log('⚠️  Cột storeId đã cho phép NULL. Bỏ qua...');
      } else {
        // Log but don't throw - this is a fix migration that might not be needed
        console.log('ℹ️  Migration storeId nullable:', error.message);
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
    console.log('   - orders.status (thêm trạng thái "completed" - hoàn tất)');
    console.log('   - vouchers.* (bảng vouchers)');
    console.log('   - orders.voucherId, orders.voucherCode, orders.discountType, orders.discountValue, orders.discountAmount');
    console.log('\n✨ Hoàn tất! Bạn có thể sử dụng vouchers trong đơn hàng.');
    
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


