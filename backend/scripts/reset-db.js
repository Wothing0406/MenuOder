const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

async function resetDatabase() {
  let connection;
  
  try {
    console.log('🔌 Đang kết nối đến MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    
    // Đọc file reset.sql
    const resetSqlPath = path.join(__dirname, '../../database/reset.sql');
    const resetSql = fs.readFileSync(resetSqlPath, 'utf8');
    
    console.log('🗑️  Đang xóa và tạo lại database...');
    await connection.query(resetSql);
    console.log('✅ Database đã được reset thành công!');
    
    // Đọc file seed.sql
    const seedSqlPath = path.join(__dirname, '../../database/seed.sql');
    const seedSql = fs.readFileSync(seedSqlPath, 'utf8');
    
    console.log('🌱 Đang thêm dữ liệu mẫu...');
    
    // Generate password hash
    const passwordHash = await bcrypt.hash('password123', 10);
    
    // Replace placeholder hash in seed SQL
    let seedSqlWithHash = seedSql.replace(
      /\$2a\$10\$[^\']+/,
      passwordHash
    );
    
    const [results] = await connection.query(seedSqlWithHash);
    console.log('✅ Dữ liệu mẫu đã được thêm thành công!');
    
    console.log('\n📊 Thông tin đăng nhập mẫu:');
    console.log('   Email: admin@restaurant.com');
    console.log('   Password: password123');
    console.log('   Store Slug: nha-hang-mau');
    console.log('   URL: http://localhost:3000/store/nha-hang-mau');
    console.log('\n✨ Hoàn tất!');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Chạy script
resetDatabase();

