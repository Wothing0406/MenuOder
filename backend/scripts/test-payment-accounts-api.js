const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'menu_order_db'
};

async function testPaymentAccounts() {
  let connection;
  
  try {
    console.log('🔌 Đang kết nối đến database...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Kết nối thành công!\n');

    // Test 1: Kiểm tra bảng payment_accounts có tồn tại không
    console.log('📊 Test 1: Kiểm tra bảng payment_accounts...');
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'payment_accounts'
    `, [DB_CONFIG.database]);
    
    if (tables.length === 0) {
      console.error('❌ Bảng payment_accounts không tồn tại!');
      console.log('💡 Cần chạy migration hoặc sync database');
      return;
    }
    console.log('✅ Bảng payment_accounts tồn tại\n');

    // Test 2: Kiểm tra cấu trúc bảng
    console.log('📊 Test 2: Kiểm tra cấu trúc bảng...');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'payment_accounts'
      ORDER BY ORDINAL_POSITION
    `, [DB_CONFIG.database]);
    
    console.log(`✅ Bảng có ${columns.length} cột:`);
    columns.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}, nullable: ${col.IS_NULLABLE})`);
    });
    console.log('');

    // Test 3: Đếm số tài khoản
    console.log('📊 Test 3: Đếm số tài khoản...');
    const [countResult] = await connection.query(`
      SELECT COUNT(*) as total FROM payment_accounts
    `);
    const total = countResult[0].total;
    console.log(`✅ Tổng số tài khoản: ${total}\n`);

    // Test 4: Lấy tất cả tài khoản
    if (total > 0) {
      console.log('📊 Test 4: Lấy tất cả tài khoản...');
      const [accounts] = await connection.query(`
        SELECT * FROM payment_accounts 
        ORDER BY storeId, createdAt DESC
      `);
      
      console.log(`✅ Tìm thấy ${accounts.length} tài khoản:\n`);
      accounts.forEach((acc, index) => {
        console.log(`[${index + 1}] Account ID: ${acc.id}`);
        console.log(`    Store ID: ${acc.storeId}`);
        console.log(`    Tên: ${acc.accountName}`);
        console.log(`    Loại: ${acc.accountType}`);
        if (acc.accountType === 'bank_transfer') {
          console.log(`    Ngân hàng: ${acc.bankName || 'N/A'}`);
          console.log(`    STK: ${acc.bankAccountNumber || 'N/A'} (length: ${acc.bankAccountNumber?.length || 0})`);
          console.log(`    Chủ TK: ${acc.bankAccountName || 'N/A'}`);
        }
        console.log(`    Default: ${acc.isDefault ? '✅' : '❌'}`);
        console.log(`    Active: ${acc.isActive ? '✅' : '❌'}`);
        console.log(`    Verified: ${acc.isVerified ? '✅' : '❌'}`);
        console.log(`    Created: ${acc.createdAt}`);
        console.log('');
      });
    } else {
      console.log('⚠️  Không có tài khoản nào trong database\n');
    }

    // Test 5: Kiểm tra storeId cụ thể (storeId = 2 từ log)
    console.log('📊 Test 5: Kiểm tra tài khoản cho storeId = 2...');
    const [storeAccounts] = await connection.query(`
      SELECT * FROM payment_accounts 
      WHERE storeId = 2
      ORDER BY createdAt DESC
    `);
    
    console.log(`✅ Tìm thấy ${storeAccounts.length} tài khoản cho storeId = 2`);
    if (storeAccounts.length > 0) {
      storeAccounts.forEach((acc, index) => {
        console.log(`  [${index + 1}] ${acc.accountName} (${acc.accountType})`);
        if (acc.accountType === 'bank_transfer') {
          console.log(`      STK: ${acc.bankAccountNumber} - ${acc.bankName}`);
        }
      });
    }
    console.log('');

    // Test 6: Kiểm tra Sequelize model có thể query được không
    console.log('📊 Test 6: Kiểm tra Sequelize model...');
    try {
      const { PaymentAccount } = require('../src/models');
      const sequelizeAccounts = await PaymentAccount.findAll({
        where: { storeId: 2 },
        order: [['createdAt', 'DESC']]
      });
      console.log(`✅ Sequelize model query thành công: ${sequelizeAccounts.length} tài khoản`);
      sequelizeAccounts.forEach(acc => {
        console.log(`  - ${acc.accountName} (ID: ${acc.id})`);
      });
    } catch (modelError) {
      console.error('❌ Lỗi khi query với Sequelize:', modelError.message);
    }

    console.log('\n✨ Hoàn tất test!');
    
  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testPaymentAccounts();


require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'menu_order_db'
};

async function testPaymentAccounts() {
  let connection;
  
  try {
    console.log('🔌 Đang kết nối đến database...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Kết nối thành công!\n');

    // Test 1: Kiểm tra bảng payment_accounts có tồn tại không
    console.log('📊 Test 1: Kiểm tra bảng payment_accounts...');
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'payment_accounts'
    `, [DB_CONFIG.database]);
    
    if (tables.length === 0) {
      console.error('❌ Bảng payment_accounts không tồn tại!');
      console.log('💡 Cần chạy migration hoặc sync database');
      return;
    }
    console.log('✅ Bảng payment_accounts tồn tại\n');

    // Test 2: Kiểm tra cấu trúc bảng
    console.log('📊 Test 2: Kiểm tra cấu trúc bảng...');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'payment_accounts'
      ORDER BY ORDINAL_POSITION
    `, [DB_CONFIG.database]);
    
    console.log(`✅ Bảng có ${columns.length} cột:`);
    columns.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}, nullable: ${col.IS_NULLABLE})`);
    });
    console.log('');

    // Test 3: Đếm số tài khoản
    console.log('📊 Test 3: Đếm số tài khoản...');
    const [countResult] = await connection.query(`
      SELECT COUNT(*) as total FROM payment_accounts
    `);
    const total = countResult[0].total;
    console.log(`✅ Tổng số tài khoản: ${total}\n`);

    // Test 4: Lấy tất cả tài khoản
    if (total > 0) {
      console.log('📊 Test 4: Lấy tất cả tài khoản...');
      const [accounts] = await connection.query(`
        SELECT * FROM payment_accounts 
        ORDER BY storeId, createdAt DESC
      `);
      
      console.log(`✅ Tìm thấy ${accounts.length} tài khoản:\n`);
      accounts.forEach((acc, index) => {
        console.log(`[${index + 1}] Account ID: ${acc.id}`);
        console.log(`    Store ID: ${acc.storeId}`);
        console.log(`    Tên: ${acc.accountName}`);
        console.log(`    Loại: ${acc.accountType}`);
        if (acc.accountType === 'bank_transfer') {
          console.log(`    Ngân hàng: ${acc.bankName || 'N/A'}`);
          console.log(`    STK: ${acc.bankAccountNumber || 'N/A'} (length: ${acc.bankAccountNumber?.length || 0})`);
          console.log(`    Chủ TK: ${acc.bankAccountName || 'N/A'}`);
        }
        console.log(`    Default: ${acc.isDefault ? '✅' : '❌'}`);
        console.log(`    Active: ${acc.isActive ? '✅' : '❌'}`);
        console.log(`    Verified: ${acc.isVerified ? '✅' : '❌'}`);
        console.log(`    Created: ${acc.createdAt}`);
        console.log('');
      });
    } else {
      console.log('⚠️  Không có tài khoản nào trong database\n');
    }

    // Test 5: Kiểm tra storeId cụ thể (storeId = 2 từ log)
    console.log('📊 Test 5: Kiểm tra tài khoản cho storeId = 2...');
    const [storeAccounts] = await connection.query(`
      SELECT * FROM payment_accounts 
      WHERE storeId = 2
      ORDER BY createdAt DESC
    `);
    
    console.log(`✅ Tìm thấy ${storeAccounts.length} tài khoản cho storeId = 2`);
    if (storeAccounts.length > 0) {
      storeAccounts.forEach((acc, index) => {
        console.log(`  [${index + 1}] ${acc.accountName} (${acc.accountType})`);
        if (acc.accountType === 'bank_transfer') {
          console.log(`      STK: ${acc.bankAccountNumber} - ${acc.bankName}`);
        }
      });
    }
    console.log('');

    // Test 6: Kiểm tra Sequelize model có thể query được không
    console.log('📊 Test 6: Kiểm tra Sequelize model...');
    try {
      const { PaymentAccount } = require('../src/models');
      const sequelizeAccounts = await PaymentAccount.findAll({
        where: { storeId: 2 },
        order: [['createdAt', 'DESC']]
      });
      console.log(`✅ Sequelize model query thành công: ${sequelizeAccounts.length} tài khoản`);
      sequelizeAccounts.forEach(acc => {
        console.log(`  - ${acc.accountName} (ID: ${acc.id})`);
      });
    } catch (modelError) {
      console.error('❌ Lỗi khi query với Sequelize:', modelError.message);
    }

    console.log('\n✨ Hoàn tất test!');
    
  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testPaymentAccounts();

























