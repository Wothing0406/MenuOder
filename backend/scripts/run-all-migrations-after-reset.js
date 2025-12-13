const { sequelize } = require('../src/config/database');
const { execSync } = require('child_process');

async function runAllMigrations() {
  try {
    console.log('🔌 Đang kết nối đến database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!\n');

    console.log('🔄 Đang chạy tất cả migration...\n');

    // Chạy migration cho stores
    console.log('1️⃣  Migration cho bảng stores...');
    try {
      execSync('node scripts/add-missing-store-columns.js', { stdio: 'inherit' });
    } catch (error) {
      console.log('   ⚠️  Migration stores có thể đã chạy trước đó');
    }

    // Chạy migration cho orders
    console.log('\n2️⃣  Migration cho bảng orders...');
    try {
      execSync('node scripts/add-paymentAccountId-to-orders.js', { stdio: 'inherit' });
    } catch (error) {
      console.log('   ⚠️  Migration orders có thể đã chạy trước đó');
    }

    console.log('\n✅ Tất cả migration đã được chạy!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    process.exit(1);
  }
}

runAllMigrations();

