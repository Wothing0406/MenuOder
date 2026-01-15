const { sequelize } = require('../src/config/database');

async function checkPaymentAccountsDetail() {
  try {
    console.log('🔌 Đang kết nối đến database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!\n');

    // Kiểm tra xem bảng có tồn tại không
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'payment_accounts'
    `);

    if (tables.length === 0) {
      console.log('❌ Bảng payment_accounts không tồn tại!');
      console.log('💡 Cần chạy migration để tạo bảng.');
      process.exit(1);
    }

    console.log('✅ Bảng payment_accounts tồn tại\n');

    // Kiểm tra cấu trúc bảng
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'payment_accounts'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('📋 Cấu trúc bảng payment_accounts:');
    console.log('─'.repeat(80));
    columns.forEach(col => {
      console.log(`  ${col.COLUMN_NAME.padEnd(25)} ${col.DATA_TYPE.padEnd(20)} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('─'.repeat(80));
    console.log(`Tổng số cột: ${columns.length}\n`);

    // Đếm số tài khoản
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as total FROM payment_accounts
    `);
    const totalAccounts = countResult[0].total;
    console.log(`📊 Tổng số tài khoản trong database: ${totalAccounts}\n`);

    if (totalAccounts === 0) {
      console.log('⚠️ Không có tài khoản nào trong database!');
      console.log('💡 Có thể:');
      console.log('   1. Tài khoản chưa được tạo');
      console.log('   2. Tài khoản được tạo nhưng không được lưu (có lỗi)');
      console.log('   3. Tài khoản được tạo với storeId khác');
      process.exit(0);
    }

    // Lấy tất cả tài khoản
    const [accounts] = await sequelize.query(`
      SELECT * FROM payment_accounts ORDER BY storeId, accountType, createdAt DESC
    `);

    console.log(`\n📋 Chi tiết ${accounts.length} tài khoản:\n`);
    accounts.forEach((acc, index) => {
      console.log(`[${index + 1}] Account ID: ${acc.id}`);
      console.log(`    Store ID: ${acc.storeId}`);
      console.log(`    Tên: ${acc.accountName}`);
      console.log(`    Loại: ${acc.accountType}`);
      console.log(`    Active: ${acc.isActive ? '✅' : '❌'}`);
      console.log(`    Verified: ${acc.isVerified ? '✅' : '❌'}`);
      console.log(`    Default: ${acc.isDefault ? '✅' : '❌'}`);
      
      if (acc.accountType === 'bank_transfer') {
        console.log(`    Ngân hàng: ${acc.bankName || 'N/A'}`);
        console.log(`    STK: ${acc.bankAccountNumber || 'N/A'} (length: ${acc.bankAccountNumber?.length || 0})`);
        console.log(`    Chủ TK: ${acc.bankAccountName || 'N/A'}`);
      }
      
      console.log(`    Created: ${acc.createdAt}`);
      console.log(`    Updated: ${acc.updatedAt}`);
      console.log('');
    });

    // Nhóm theo storeId
    const accountsByStore = {};
    accounts.forEach(acc => {
      if (!accountsByStore[acc.storeId]) {
        accountsByStore[acc.storeId] = [];
      }
      accountsByStore[acc.storeId].push(acc);
    });

    console.log('\n📊 Phân bổ theo Store ID:');
    Object.keys(accountsByStore).forEach(storeId => {
      console.log(`   Store ${storeId}: ${accountsByStore[storeId].length} tài khoản`);
    });

    console.log('\n✨ Hoàn tất!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

checkPaymentAccountsDetail();



async function checkPaymentAccountsDetail() {
  try {
    console.log('🔌 Đang kết nối đến database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!\n');

    // Kiểm tra xem bảng có tồn tại không
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'payment_accounts'
    `);

    if (tables.length === 0) {
      console.log('❌ Bảng payment_accounts không tồn tại!');
      console.log('💡 Cần chạy migration để tạo bảng.');
      process.exit(1);
    }

    console.log('✅ Bảng payment_accounts tồn tại\n');

    // Kiểm tra cấu trúc bảng
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'payment_accounts'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('📋 Cấu trúc bảng payment_accounts:');
    console.log('─'.repeat(80));
    columns.forEach(col => {
      console.log(`  ${col.COLUMN_NAME.padEnd(25)} ${col.DATA_TYPE.padEnd(20)} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('─'.repeat(80));
    console.log(`Tổng số cột: ${columns.length}\n`);

    // Đếm số tài khoản
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as total FROM payment_accounts
    `);
    const totalAccounts = countResult[0].total;
    console.log(`📊 Tổng số tài khoản trong database: ${totalAccounts}\n`);

    if (totalAccounts === 0) {
      console.log('⚠️ Không có tài khoản nào trong database!');
      console.log('💡 Có thể:');
      console.log('   1. Tài khoản chưa được tạo');
      console.log('   2. Tài khoản được tạo nhưng không được lưu (có lỗi)');
      console.log('   3. Tài khoản được tạo với storeId khác');
      process.exit(0);
    }

    // Lấy tất cả tài khoản
    const [accounts] = await sequelize.query(`
      SELECT * FROM payment_accounts ORDER BY storeId, accountType, createdAt DESC
    `);

    console.log(`\n📋 Chi tiết ${accounts.length} tài khoản:\n`);
    accounts.forEach((acc, index) => {
      console.log(`[${index + 1}] Account ID: ${acc.id}`);
      console.log(`    Store ID: ${acc.storeId}`);
      console.log(`    Tên: ${acc.accountName}`);
      console.log(`    Loại: ${acc.accountType}`);
      console.log(`    Active: ${acc.isActive ? '✅' : '❌'}`);
      console.log(`    Verified: ${acc.isVerified ? '✅' : '❌'}`);
      console.log(`    Default: ${acc.isDefault ? '✅' : '❌'}`);
      
      if (acc.accountType === 'bank_transfer') {
        console.log(`    Ngân hàng: ${acc.bankName || 'N/A'}`);
        console.log(`    STK: ${acc.bankAccountNumber || 'N/A'} (length: ${acc.bankAccountNumber?.length || 0})`);
        console.log(`    Chủ TK: ${acc.bankAccountName || 'N/A'}`);
      }
      
      console.log(`    Created: ${acc.createdAt}`);
      console.log(`    Updated: ${acc.updatedAt}`);
      console.log('');
    });

    // Nhóm theo storeId
    const accountsByStore = {};
    accounts.forEach(acc => {
      if (!accountsByStore[acc.storeId]) {
        accountsByStore[acc.storeId] = [];
      }
      accountsByStore[acc.storeId].push(acc);
    });

    console.log('\n📊 Phân bổ theo Store ID:');
    Object.keys(accountsByStore).forEach(storeId => {
      console.log(`   Store ${storeId}: ${accountsByStore[storeId].length} tài khoản`);
    });

    console.log('\n✨ Hoàn tất!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

checkPaymentAccountsDetail();


































