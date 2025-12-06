const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'menu_order_db',
  multipleStatements: true
};

async function addStoreGoogleMapLink() {
  let connection;
  
  try {
    console.log('🔌 Đang kết nối đến MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    
    console.log('📝 Đang kiểm tra và thêm cột storeGoogleMapLink...');
    
    // Check if column exists
    const [columns] = await connection.query(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'stores' AND COLUMN_NAME = 'storeGoogleMapLink'`,
      [DB_CONFIG.database]
    );
    
    if (columns[0].count > 0) {
      console.log('✅ Cột storeGoogleMapLink đã tồn tại trong bảng stores');
    } else {
      console.log('➕ Đang thêm cột storeGoogleMapLink vào bảng stores...');
      await connection.query(
        `ALTER TABLE stores ADD COLUMN storeGoogleMapLink VARCHAR(500) NULL AFTER storeAddress`
      );
      console.log('✅ Đã thêm cột storeGoogleMapLink thành công!');
    }
    
    console.log('\n✨ Hoàn tất!');
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ Cột storeGoogleMapLink đã tồn tại');
    } else {
      console.error('❌ Lỗi:', error.message);
      console.error('\n💡 Đảm bảo MySQL đang chạy và thông tin kết nối trong .env đúng');
      process.exit(1);
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run script
addStoreGoogleMapLink();


