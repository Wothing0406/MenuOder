const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'menu_order_db',
};

async function checkStoresTable() {
  let connection;
  
  try {
    console.log('🔌 Đang kết nối đến MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    
    console.log('📋 Đang kiểm tra cấu trúc bảng stores...\n');
    
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE, COLUMN_DEFAULT
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'stores'
       ORDER BY ORDINAL_POSITION`,
      [DB_CONFIG.database]
    );
    
    console.log('Các cột trong bảng stores:');
    console.log('─'.repeat(80));
    columns.forEach(col => {
      const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
      const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultValue = col.COLUMN_DEFAULT ? ` DEFAULT ${col.COLUMN_DEFAULT}` : '';
      console.log(`  ${col.COLUMN_NAME.padEnd(25)} ${col.DATA_TYPE}${length} ${nullable}${defaultValue}`);
    });
    
    const hasGoogleMapLink = columns.some(col => col.COLUMN_NAME === 'storeGoogleMapLink');
    console.log('\n' + '─'.repeat(80));
    if (hasGoogleMapLink) {
      console.log('✅ Cột storeGoogleMapLink: ĐÃ TỒN TẠI');
    } else {
      console.log('❌ Cột storeGoogleMapLink: CHƯA TỒN TẠI');
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkStoresTable();





