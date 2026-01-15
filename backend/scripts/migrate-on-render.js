/**
 * Script để chạy migration trên môi trường Render
 * Deploy script này lên Render và gọi endpoint để chạy migration
 */

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

// Khởi tạo Sequelize với connection string của Render
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Đọc file migration
const migrationPath = path.join(__dirname, '..', '..', 'database', 'fix_missing_columns.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

async function runMigration() {
  try {
    console.log('🔄 Bắt đầu migration trên Render...');

    // Kết nối database
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công');

    // Chạy migration
    await sequelize.query(migrationSQL);
    console.log('✅ Migration hoàn thành thành công!');

    // Kiểm tra kết quả
    const [results] = await sequelize.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'stores' AND column_name = 'is_open'
    `);

    if (results.length > 0) {
      console.log('✅ Cột is_open đã được thêm thành công!');
    } else {
      console.log('❌ Cột is_open chưa được thêm');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi migration:', error.message);
    process.exit(1);
  }
}

// Nếu chạy trực tiếp
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };


