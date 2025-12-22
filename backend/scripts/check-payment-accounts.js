const { sequelize } = require('../src/config/database');
const { PaymentAccount } = require('../src/models');

async function checkPaymentAccounts() {
  try {
    console.log('🔌 Đang kết nối đến database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!\n');

    // Lấy tất cả tài khoản
    const allAccounts = await PaymentAccount.findAll({
      order: [['storeId', 'ASC'], ['accountType', 'ASC'], ['createdAt', 'DESC']]
    });

    console.log(`📊 Tổng số tài khoản trong database: ${allAccounts.length}\n`);

    if (allAccounts.length === 0) {
      console.log('⚠️ Không có tài khoản nào trong database!');
      process.exit(0);
    }

    // Nhóm theo storeId
    const accountsByStore = {};
    allAccounts.forEach(acc => {
      if (!accountsByStore[acc.storeId]) {
        accountsByStore[acc.storeId] = [];
      }
      accountsByStore[acc.storeId].push(acc);
    });

    // Hiển thị chi tiết
    Object.keys(accountsByStore).forEach(storeId => {
      const storeAccounts = accountsByStore[storeId];
      console.log(`\n🏪 Store ID: ${storeId} - ${storeAccounts.length} tài khoản:`);
      console.log('─'.repeat(80));
      
      storeAccounts.forEach((acc, index) => {
        console.log(`\n  [${index + 1}] Account ID: ${acc.id}`);
        console.log(`      Tên: ${acc.accountName}`);
        console.log(`      Loại: ${acc.accountType}`);
        console.log(`      Active: ${acc.isActive ? '✅' : '❌'}`);
        console.log(`      Verified: ${acc.isVerified ? '✅' : '❌'}`);
        console.log(`      Default: ${acc.isDefault ? '✅' : '❌'}`);
        
        if (acc.accountType === 'bank_transfer') {
          console.log(`      Ngân hàng: ${acc.bankName}`);
          console.log(`      STK: ${acc.bankAccountNumber} (length: ${acc.bankAccountNumber?.length})`);
          console.log(`      Chủ TK: ${acc.bankAccountName}`);
        }
        
        console.log(`      Created: ${acc.createdAt}`);
      });
    });

    // Kiểm tra storeId cụ thể nếu được truyền vào
    const storeIdToCheck = process.argv[2];
    if (storeIdToCheck) {
      console.log(`\n\n🔍 Kiểm tra chi tiết cho Store ID: ${storeIdToCheck}`);
      const storeAccounts = accountsByStore[storeIdToCheck] || [];
      console.log(`   Tìm thấy: ${storeAccounts.length} tài khoản`);
      
      if (storeAccounts.length > 0) {
        console.log('\n   Chi tiết:');
        storeAccounts.forEach(acc => {
          console.log(`   - ${acc.accountName} (${acc.accountType}) - ID: ${acc.id}`);
        });
      }
    }

    console.log('\n✨ Hoàn tất!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

checkPaymentAccounts();


const { PaymentAccount } = require('../src/models');

async function checkPaymentAccounts() {
  try {
    console.log('🔌 Đang kết nối đến database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!\n');

    // Lấy tất cả tài khoản
    const allAccounts = await PaymentAccount.findAll({
      order: [['storeId', 'ASC'], ['accountType', 'ASC'], ['createdAt', 'DESC']]
    });

    console.log(`📊 Tổng số tài khoản trong database: ${allAccounts.length}\n`);

    if (allAccounts.length === 0) {
      console.log('⚠️ Không có tài khoản nào trong database!');
      process.exit(0);
    }

    // Nhóm theo storeId
    const accountsByStore = {};
    allAccounts.forEach(acc => {
      if (!accountsByStore[acc.storeId]) {
        accountsByStore[acc.storeId] = [];
      }
      accountsByStore[acc.storeId].push(acc);
    });

    // Hiển thị chi tiết
    Object.keys(accountsByStore).forEach(storeId => {
      const storeAccounts = accountsByStore[storeId];
      console.log(`\n🏪 Store ID: ${storeId} - ${storeAccounts.length} tài khoản:`);
      console.log('─'.repeat(80));
      
      storeAccounts.forEach((acc, index) => {
        console.log(`\n  [${index + 1}] Account ID: ${acc.id}`);
        console.log(`      Tên: ${acc.accountName}`);
        console.log(`      Loại: ${acc.accountType}`);
        console.log(`      Active: ${acc.isActive ? '✅' : '❌'}`);
        console.log(`      Verified: ${acc.isVerified ? '✅' : '❌'}`);
        console.log(`      Default: ${acc.isDefault ? '✅' : '❌'}`);
        
        if (acc.accountType === 'bank_transfer') {
          console.log(`      Ngân hàng: ${acc.bankName}`);
          console.log(`      STK: ${acc.bankAccountNumber} (length: ${acc.bankAccountNumber?.length})`);
          console.log(`      Chủ TK: ${acc.bankAccountName}`);
        }
        
        console.log(`      Created: ${acc.createdAt}`);
      });
    });

    // Kiểm tra storeId cụ thể nếu được truyền vào
    const storeIdToCheck = process.argv[2];
    if (storeIdToCheck) {
      console.log(`\n\n🔍 Kiểm tra chi tiết cho Store ID: ${storeIdToCheck}`);
      const storeAccounts = accountsByStore[storeIdToCheck] || [];
      console.log(`   Tìm thấy: ${storeAccounts.length} tài khoản`);
      
      if (storeAccounts.length > 0) {
        console.log('\n   Chi tiết:');
        storeAccounts.forEach(acc => {
          console.log(`   - ${acc.accountName} (${acc.accountType}) - ID: ${acc.id}`);
        });
      }
    }

    console.log('\n✨ Hoàn tất!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

checkPaymentAccounts();























