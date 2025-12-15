const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
};

async function checkAllDatabases() {
  let connection;
  
  try {
    console.log('🔌 Đang kết nối đến MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Kết nối thành công!\n');

    // Lấy danh sách tất cả databases
    const [databases] = await connection.query('SHOW DATABASES');
    console.log(`📊 Tìm thấy ${databases.length} databases:\n`);
    
    const dbNames = databases.map(db => db.Database).filter(name => 
      !['information_schema', 'performance_schema', 'mysql', 'sys'].includes(name)
    );
    
    console.log('🔍 Đang kiểm tra các databases:');
    dbNames.forEach((dbName, index) => {
      console.log(`   [${index + 1}] ${dbName}`);
    });
    console.log('');

    // Kiểm tra từng database
    let foundAccounts = false;
    for (const dbName of dbNames) {
      try {
        await connection.query(`USE \`${dbName}\``);
        
        // Kiểm tra xem có bảng payment_accounts không
        const [tables] = await connection.query(`
          SELECT TABLE_NAME 
          FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_SCHEMA = ? 
          AND TABLE_NAME = 'payment_accounts'
        `, [dbName]);

        if (tables.length > 0) {
          // Đếm số tài khoản
          const [countResult] = await connection.query(`
            SELECT COUNT(*) as total FROM payment_accounts
          `);
          const total = countResult[0].total;
          
          if (total > 0) {
            foundAccounts = true;
            console.log(`\n✅ Tìm thấy ${total} tài khoản trong database: ${dbName}`);
            
            // Lấy chi tiết
            const [accounts] = await connection.query(`
              SELECT * FROM payment_accounts ORDER BY storeId, createdAt DESC
            `);
            
            console.log('\n📋 Chi tiết tài khoản:');
            accounts.forEach((acc, index) => {
              console.log(`\n[${index + 1}] Account ID: ${acc.id}`);
              console.log(`    Store ID: ${acc.storeId}`);
              console.log(`    Tên: ${acc.accountName}`);
              console.log(`    Loại: ${acc.accountType}`);
              if (acc.accountType === 'bank_transfer') {
                console.log(`    Ngân hàng: ${acc.bankName || 'N/A'}`);
                console.log(`    STK: ${acc.bankAccountNumber || 'N/A'} (length: ${acc.bankAccountNumber?.length || 0})`);
              }
              console.log(`    Default: ${acc.isDefault ? '✅' : '❌'}`);
              console.log(`    Verified: ${acc.isVerified ? '✅' : '❌'}`);
            });
          } else {
            console.log(`   ⚠️  Database ${dbName}: Bảng payment_accounts tồn tại nhưng không có dữ liệu`);
          }
        }
      } catch (error) {
        // Bỏ qua lỗi khi truy cập database
        if (!error.message.includes('Access denied')) {
          console.log(`   ⚠️  Không thể kiểm tra database ${dbName}: ${error.message}`);
        }
      }
    }

    if (!foundAccounts) {
      console.log('\n⚠️  Không tìm thấy tài khoản nào trong tất cả databases!');
    }

    // Kiểm tra database hiện tại được cấu hình
    const currentDb = process.env.DB_NAME || 'menu_order_db';
    console.log(`\n📌 Database hiện tại được cấu hình: ${currentDb}`);
    console.log(`   (Từ biến môi trường DB_NAME hoặc mặc định: menu_order_db)`);

    // Kiểm tra xem database hiện tại có tồn tại không
    const currentDbExists = dbNames.includes(currentDb);
    if (currentDbExists) {
      console.log(`   ✅ Database ${currentDb} tồn tại`);
    } else {
      console.log(`   ❌ Database ${currentDb} KHÔNG tồn tại!`);
      console.log(`   💡 Có thể cần tạo database hoặc cập nhật DB_NAME trong .env`);
    }

    console.log('\n✨ Hoàn tất!');
    
  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAllDatabases();


require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
};

async function checkAllDatabases() {
  let connection;
  
  try {
    console.log('🔌 Đang kết nối đến MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Kết nối thành công!\n');

    // Lấy danh sách tất cả databases
    const [databases] = await connection.query('SHOW DATABASES');
    console.log(`📊 Tìm thấy ${databases.length} databases:\n`);
    
    const dbNames = databases.map(db => db.Database).filter(name => 
      !['information_schema', 'performance_schema', 'mysql', 'sys'].includes(name)
    );
    
    console.log('🔍 Đang kiểm tra các databases:');
    dbNames.forEach((dbName, index) => {
      console.log(`   [${index + 1}] ${dbName}`);
    });
    console.log('');

    // Kiểm tra từng database
    let foundAccounts = false;
    for (const dbName of dbNames) {
      try {
        await connection.query(`USE \`${dbName}\``);
        
        // Kiểm tra xem có bảng payment_accounts không
        const [tables] = await connection.query(`
          SELECT TABLE_NAME 
          FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_SCHEMA = ? 
          AND TABLE_NAME = 'payment_accounts'
        `, [dbName]);

        if (tables.length > 0) {
          // Đếm số tài khoản
          const [countResult] = await connection.query(`
            SELECT COUNT(*) as total FROM payment_accounts
          `);
          const total = countResult[0].total;
          
          if (total > 0) {
            foundAccounts = true;
            console.log(`\n✅ Tìm thấy ${total} tài khoản trong database: ${dbName}`);
            
            // Lấy chi tiết
            const [accounts] = await connection.query(`
              SELECT * FROM payment_accounts ORDER BY storeId, createdAt DESC
            `);
            
            console.log('\n📋 Chi tiết tài khoản:');
            accounts.forEach((acc, index) => {
              console.log(`\n[${index + 1}] Account ID: ${acc.id}`);
              console.log(`    Store ID: ${acc.storeId}`);
              console.log(`    Tên: ${acc.accountName}`);
              console.log(`    Loại: ${acc.accountType}`);
              if (acc.accountType === 'bank_transfer') {
                console.log(`    Ngân hàng: ${acc.bankName || 'N/A'}`);
                console.log(`    STK: ${acc.bankAccountNumber || 'N/A'} (length: ${acc.bankAccountNumber?.length || 0})`);
              }
              console.log(`    Default: ${acc.isDefault ? '✅' : '❌'}`);
              console.log(`    Verified: ${acc.isVerified ? '✅' : '❌'}`);
            });
          } else {
            console.log(`   ⚠️  Database ${dbName}: Bảng payment_accounts tồn tại nhưng không có dữ liệu`);
          }
        }
      } catch (error) {
        // Bỏ qua lỗi khi truy cập database
        if (!error.message.includes('Access denied')) {
          console.log(`   ⚠️  Không thể kiểm tra database ${dbName}: ${error.message}`);
        }
      }
    }

    if (!foundAccounts) {
      console.log('\n⚠️  Không tìm thấy tài khoản nào trong tất cả databases!');
    }

    // Kiểm tra database hiện tại được cấu hình
    const currentDb = process.env.DB_NAME || 'menu_order_db';
    console.log(`\n📌 Database hiện tại được cấu hình: ${currentDb}`);
    console.log(`   (Từ biến môi trường DB_NAME hoặc mặc định: menu_order_db)`);

    // Kiểm tra xem database hiện tại có tồn tại không
    const currentDbExists = dbNames.includes(currentDb);
    if (currentDbExists) {
      console.log(`   ✅ Database ${currentDb} tồn tại`);
    } else {
      console.log(`   ❌ Database ${currentDb} KHÔNG tồn tại!`);
      console.log(`   💡 Có thể cần tạo database hoặc cập nhật DB_NAME trong .env`);
    }

    console.log('\n✨ Hoàn tất!');
    
  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAllDatabases();







