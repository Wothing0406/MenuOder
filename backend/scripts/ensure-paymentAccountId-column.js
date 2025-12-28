/**
 * Script to ensure paymentAccountId column exists in orders table
 * This script will be called automatically or can be run manually
 * Supports both MySQL and PostgreSQL
 */

const { sequelize } = require('../src/config/database');

async function ensurePaymentAccountIdColumn() {
  try {
    console.log('🔌 Đang kết nối đến database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!\n');

    // Detect database type
    const dialect = sequelize.getDialect();
    const isPostgres = dialect === 'postgres';
    const isMySQL = dialect === 'mysql' || dialect === 'mariadb';
    
    console.log(`📊 Database type: ${dialect}\n`);

    // Check if column already exists
    let columnExists = false;
    
    try {
      if (isPostgres) {
        // PostgreSQL query
        const [results] = await sequelize.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'orders' 
          AND column_name = 'paymentAccountId'
        `);
        columnExists = results.length > 0;
      } else if (isMySQL) {
        // MySQL query
        const [results] = await sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'orders' 
          AND COLUMN_NAME = 'paymentAccountId'
        `);
        columnExists = results.length > 0;
      } else {
        console.log(`⚠️  Unsupported database dialect: ${dialect}`);
        return false;
      }
    } catch (checkError) {
      console.error('❌ Lỗi khi kiểm tra cột:', checkError.message);
      return false;
    }

    if (columnExists) {
      console.log('✅ Cột paymentAccountId đã tồn tại trong bảng orders');
      return true;
    }

    // Add paymentAccountId column
    console.log('➕ Đang thêm cột paymentAccountId vào bảng orders...');
    
    try {
      if (isPostgres) {
        // PostgreSQL: Add column (PostgreSQL doesn't support AFTER clause)
        await sequelize.query(`
          ALTER TABLE orders 
          ADD COLUMN IF NOT EXISTS "paymentAccountId" INTEGER NULL
        `);
        // Add comment separately for PostgreSQL
        try {
          await sequelize.query(`
            COMMENT ON COLUMN orders."paymentAccountId" IS 'ID of payment account used for this order (for QR payments)'
          `);
        } catch (commentError) {
          // Comment might fail, but column is added - that's OK
          console.log('⚠️  Không thể thêm comment (không ảnh hưởng):', commentError.message);
        }
      } else if (isMySQL) {
        // MySQL: Add column with AFTER clause
        await sequelize.query(`
          ALTER TABLE orders 
          ADD COLUMN paymentAccountId INT NULL 
          COMMENT 'ID of payment account used for this order (for QR payments)'
          AFTER paymentMethod
        `);
      }
      
      console.log('✅ Đã thêm cột paymentAccountId thành công!');
      return true;
    } catch (addError) {
      if (addError.message.includes('Duplicate column') || 
          addError.message.includes('already exists') ||
          addError.message.includes('duplicate')) {
        console.log('✅ Cột paymentAccountId đã tồn tại (phát hiện sau khi thêm)');
        return true;
      } else {
        console.error('❌ Lỗi khi thêm cột:', addError.message);
        return false;
      }
    }

  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack:', error.stack);
    }
    return false;
  }
}

// If run directly (not imported)
if (require.main === module) {
  ensurePaymentAccountIdColumn()
    .then(success => {
      if (success) {
        console.log('\n✨ Hoàn tất!');
        process.exit(0);
      } else {
        console.log('\n❌ Migration thất bại!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n❌ Lỗi không mong đợi:', error);
      process.exit(1);
    });
}

module.exports = { ensurePaymentAccountIdColumn };

























