const { sequelize } = require('../src/config/database');
const Store = require('../src/models/Store');

async function addStoreDetailedAddress() {
  try {
    console.log('🔌 Đang kết nối đến database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!');

    // Check if column exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'stores' 
      AND COLUMN_NAME = 'storeDetailedAddress'
    `);

    if (results.length > 0) {
      console.log('✅ Cột storeDetailedAddress đã tồn tại!');
      process.exit(0);
    }

    console.log('➕ Đang thêm cột storeDetailedAddress...');
    await sequelize.query(`
      ALTER TABLE stores 
      ADD COLUMN storeDetailedAddress TEXT NULL 
      COMMENT 'Detailed address for display (does not affect distance calculation)'
    `);
    console.log('✅ Đã thêm cột storeDetailedAddress thành công!');

    // Verify
    const [verify] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'stores' 
      AND COLUMN_NAME = 'storeDetailedAddress'
    `);

    if (verify.length > 0) {
      console.log('✅ Xác nhận: Cột storeDetailedAddress đã được thêm!');
    } else {
      console.log('❌ Lỗi: Không thể xác nhận cột đã được thêm');
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

addStoreDetailedAddress();




