const { sequelize } = require('../src/config/database');

async function addPaymentAccountIdToOrders() {
  try {
    console.log('🔌 Đang kết nối đến database...');
    
    // Retry connection với timeout dài hơn cho Render PostgreSQL
    let retries = 3;
    let connected = false;
    
    while (retries > 0 && !connected) {
      try {
        await sequelize.authenticate();
        connected = true;
        console.log('✅ Kết nối database thành công!\n');
      } catch (connError) {
        retries--;
        if (retries === 0) {
          throw connError;
        }
        console.log(`⚠️  Kết nối thất bại, thử lại... (${3 - retries}/3)`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Đợi 2 giây
      }
    }

    // Detect database type
    const dialect = sequelize.getDialect();
    const isPostgres = dialect === 'postgres';
    const isMySQL = dialect === 'mysql' || dialect === 'mariadb';
    
    console.log(`📊 Database type: ${dialect}\n`);

    // Check if column already exists
    let columnExists = false;
    
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
      throw new Error(`Unsupported database dialect: ${dialect}`);
    }

    if (columnExists) {
      console.log('✅ Cột paymentAccountId đã tồn tại trong bảng orders');
      process.exit(0);
    }

    // Add paymentAccountId column
    console.log('➕ Đang thêm cột paymentAccountId vào bảng orders...');
    
    if (isPostgres) {
      // PostgreSQL: Add column (PostgreSQL doesn't support AFTER clause)
      // Use IF NOT EXISTS for PostgreSQL 9.5+ (safe to run multiple times)
      try {
        await sequelize.query(`
          ALTER TABLE orders 
          ADD COLUMN IF NOT EXISTS "paymentAccountId" INTEGER NULL
        `);
        console.log('✅ Đã thêm cột paymentAccountId thành công!');
      } catch (error) {
        // Check if column already exists
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate column') ||
            error.message.includes('column "paymentAccountId" already exists')) {
          console.log('⏭️  Cột paymentAccountId đã tồn tại. Bỏ qua...');
        } else if (error.message.includes('syntax error') || error.message.includes('IF NOT EXISTS')) {
          // If IF NOT EXISTS not supported (PostgreSQL < 9.5), try without it
          try {
            await sequelize.query(`
              ALTER TABLE orders 
              ADD COLUMN "paymentAccountId" INTEGER NULL
            `);
            console.log('✅ Đã thêm cột paymentAccountId thành công!');
          } catch (addError) {
            if (addError.message.includes('already exists') || 
                addError.message.includes('duplicate column')) {
              console.log('⏭️  Cột paymentAccountId đã tồn tại. Bỏ qua...');
            } else {
              throw addError;
            }
          }
        } else {
          throw error;
        }
      }
      // Add comment separately for PostgreSQL (optional, may fail if no permission)
      try {
        await sequelize.query(`
          COMMENT ON COLUMN orders."paymentAccountId" IS 'ID of payment account used for this order (for QR payments)'
        `);
      } catch (commentError) {
        // Comment is optional, continue if it fails
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

    // Add foreign key constraint (optional)
    try {
      console.log('➕ Đang thêm foreign key constraint...');
      
      if (isPostgres) {
        await sequelize.query(`
          ALTER TABLE orders 
          ADD CONSTRAINT fk_orders_payment_account 
          FOREIGN KEY ("paymentAccountId") 
          REFERENCES payment_accounts(id) 
          ON DELETE SET NULL 
          ON UPDATE CASCADE
        `);
      } else if (isMySQL) {
        await sequelize.query(`
          ALTER TABLE orders 
          ADD CONSTRAINT fk_orders_payment_account 
          FOREIGN KEY (paymentAccountId) 
          REFERENCES payment_accounts(id) 
          ON DELETE SET NULL 
          ON UPDATE CASCADE
        `);
      }
      
      console.log('✅ Đã thêm foreign key constraint thành công!');
    } catch (fkError) {
      const errorMsg = fkError.message || '';
      if (errorMsg.includes('Duplicate key name') || 
          errorMsg.includes('already exists') ||
          errorMsg.includes('duplicate') ||
          errorMsg.includes('constraint') && errorMsg.includes('exists')) {
        console.log('⏭️  Foreign key đã tồn tại. Bỏ qua...');
      } else {
        console.log('⚠️  Không thể thêm foreign key (có thể bảng payment_accounts chưa tồn tại):', fkError.message);
      }
    }

    // Verify column was added
    let verify = [];
    
    if (isPostgres) {
      const [verifyResults] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'paymentAccountId'
      `);
      verify = verifyResults;
    } else if (isMySQL) {
      const [verifyResults] = await sequelize.query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'orders' 
        AND COLUMN_NAME = 'paymentAccountId'
      `);
      verify = verifyResults;
    }

    if (verify.length > 0) {
      console.log('\n✅ Xác nhận: Cột paymentAccountId đã được thêm!');
      console.log('   - Type:', verify[0].DATA_TYPE || verify[0].data_type);
      console.log('   - Nullable:', verify[0].IS_NULLABLE || verify[0].is_nullable);
      if (verify[0].COLUMN_COMMENT) {
        console.log('   - Comment:', verify[0].COLUMN_COMMENT);
      }
    }

    console.log('\n✨ Hoàn tất migration!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

addPaymentAccountIdToOrders();






