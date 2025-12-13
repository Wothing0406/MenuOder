const { sequelize } = require('../src/config/database');

/**
 * Check database schema to see which columns exist
 * Useful for verifying migrations on Render
 */
async function checkDatabaseSchema() {
  try {
    console.log('🔌 Đang kết nối đến database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!\n');

    // Check stores table
    console.log('📊 Kiểm tra bảng stores...');
    const [storeColumns] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'stores'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log(`   Tổng số cột: ${storeColumns.length}`);
    const requiredColumns = [
      'storeDetailedAddress',
      'storeGoogleMapLink',
      'zaloPayAppId',
      'zaloPayKey1',
      'zaloPayKey2',
      'zaloPayMerchantId',
      'zaloPayIsActive',
      'zaloPayLink',
      'bankAccountNumber',
      'bankAccountName',
      'bankName',
      'bankCode',
      'bankTransferQRIsActive'
    ];
    
    const existingColumns = storeColumns.map(col => col.COLUMN_NAME);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('   ✅ Tất cả các cột cần thiết đã tồn tại!');
    } else {
      console.log('   ⚠️  Các cột còn thiếu:');
      missingColumns.forEach(col => console.log(`      - ${col}`));
    }

    // Check orders table
    console.log('\n📊 Kiểm tra bảng orders...');
    const [orderColumns] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'orders'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log(`   Tổng số cột: ${orderColumns.length}`);
    const requiredOrderColumns = [
      'paymentAccountId',
      'zaloPayTransactionId',
      'zaloPayStatus',
      'zaloPayQrCode',
      'bankTransferQRCode',
      'voucherId',
      'voucherCode',
      'discountType',
      'discountValue',
      'discountAmount'
    ];
    
    const existingOrderColumns = orderColumns.map(col => col.COLUMN_NAME);
    const missingOrderColumns = requiredOrderColumns.filter(col => !existingOrderColumns.includes(col));
    
    if (missingOrderColumns.length === 0) {
      console.log('   ✅ Tất cả các cột cần thiết đã tồn tại!');
    } else {
      console.log('   ⚠️  Các cột còn thiếu:');
      missingOrderColumns.forEach(col => console.log(`      - ${col}`));
    }

    // Check payment_accounts table
    console.log('\n📊 Kiểm tra bảng payment_accounts...');
    const [paymentAccountColumns] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'payment_accounts'
      ORDER BY ORDINAL_POSITION
    `);
    
    if (paymentAccountColumns.length > 0) {
      console.log(`   ✅ Bảng payment_accounts tồn tại với ${paymentAccountColumns.length} cột`);
    } else {
      console.log('   ⚠️  Bảng payment_accounts chưa tồn tại!');
    }

    console.log('\n✨ Kiểm tra hoàn tất!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

checkDatabaseSchema();



/**
 * Check database schema to see which columns exist
 * Useful for verifying migrations on Render
 */
async function checkDatabaseSchema() {
  try {
    console.log('🔌 Đang kết nối đến database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!\n');

    // Check stores table
    console.log('📊 Kiểm tra bảng stores...');
    const [storeColumns] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'stores'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log(`   Tổng số cột: ${storeColumns.length}`);
    const requiredColumns = [
      'storeDetailedAddress',
      'storeGoogleMapLink',
      'zaloPayAppId',
      'zaloPayKey1',
      'zaloPayKey2',
      'zaloPayMerchantId',
      'zaloPayIsActive',
      'zaloPayLink',
      'bankAccountNumber',
      'bankAccountName',
      'bankName',
      'bankCode',
      'bankTransferQRIsActive'
    ];
    
    const existingColumns = storeColumns.map(col => col.COLUMN_NAME);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('   ✅ Tất cả các cột cần thiết đã tồn tại!');
    } else {
      console.log('   ⚠️  Các cột còn thiếu:');
      missingColumns.forEach(col => console.log(`      - ${col}`));
    }

    // Check orders table
    console.log('\n📊 Kiểm tra bảng orders...');
    const [orderColumns] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'orders'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log(`   Tổng số cột: ${orderColumns.length}`);
    const requiredOrderColumns = [
      'paymentAccountId',
      'zaloPayTransactionId',
      'zaloPayStatus',
      'zaloPayQrCode',
      'bankTransferQRCode',
      'voucherId',
      'voucherCode',
      'discountType',
      'discountValue',
      'discountAmount'
    ];
    
    const existingOrderColumns = orderColumns.map(col => col.COLUMN_NAME);
    const missingOrderColumns = requiredOrderColumns.filter(col => !existingOrderColumns.includes(col));
    
    if (missingOrderColumns.length === 0) {
      console.log('   ✅ Tất cả các cột cần thiết đã tồn tại!');
    } else {
      console.log('   ⚠️  Các cột còn thiếu:');
      missingOrderColumns.forEach(col => console.log(`      - ${col}`));
    }

    // Check payment_accounts table
    console.log('\n📊 Kiểm tra bảng payment_accounts...');
    const [paymentAccountColumns] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'payment_accounts'
      ORDER BY ORDINAL_POSITION
    `);
    
    if (paymentAccountColumns.length > 0) {
      console.log(`   ✅ Bảng payment_accounts tồn tại với ${paymentAccountColumns.length} cột`);
    } else {
      console.log('   ⚠️  Bảng payment_accounts chưa tồn tại!');
    }

    console.log('\n✨ Kiểm tra hoàn tất!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

checkDatabaseSchema();


