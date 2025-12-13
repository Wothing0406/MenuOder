const { sequelize } = require('../src/config/database');

async function addPaymentAccountIdToOrders() {
  try {
    console.log('🔌 Đang kết nối đến database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!\n');

    // Kiểm tra xem cột đã tồn tại chưa
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'orders' 
      AND COLUMN_NAME = 'paymentAccountId'
    `);

    if (results.length > 0) {
      console.log('✅ Cột paymentAccountId đã tồn tại trong bảng orders');
      process.exit(0);
    }

    // Thêm cột paymentAccountId
    console.log('➕ Đang thêm cột paymentAccountId vào bảng orders...');
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN paymentAccountId INT NULL 
      COMMENT 'ID of payment account used for this order (for QR payments)'
      AFTER paymentMethod
    `);
    console.log('✅ Đã thêm cột paymentAccountId thành công!');

    // Thêm foreign key nếu cần (optional)
    try {
      console.log('➕ Đang thêm foreign key constraint...');
      await sequelize.query(`
        ALTER TABLE orders 
        ADD CONSTRAINT fk_orders_payment_account 
        FOREIGN KEY (paymentAccountId) 
        REFERENCES payment_accounts(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
      `);
      console.log('✅ Đã thêm foreign key constraint thành công!');
    } catch (fkError) {
      if (fkError.message.includes('Duplicate key name') || fkError.message.includes('already exists')) {
        console.log('⏭️  Foreign key đã tồn tại. Bỏ qua...');
      } else {
        console.log('⚠️  Không thể thêm foreign key (có thể bảng payment_accounts chưa tồn tại):', fkError.message);
      }
    }

    // Xác nhận
    const [verify] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'orders' 
      AND COLUMN_NAME = 'paymentAccountId'
    `);

    if (verify.length > 0) {
      console.log('\n✅ Xác nhận: Cột paymentAccountId đã được thêm!');
      console.log('   - Type:', verify[0].DATA_TYPE);
      console.log('   - Nullable:', verify[0].IS_NULLABLE);
      console.log('   - Comment:', verify[0].COLUMN_COMMENT);
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



async function addPaymentAccountIdToOrders() {
  try {
    console.log('🔌 Đang kết nối đến database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!\n');

    // Kiểm tra xem cột đã tồn tại chưa
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'orders' 
      AND COLUMN_NAME = 'paymentAccountId'
    `);

    if (results.length > 0) {
      console.log('✅ Cột paymentAccountId đã tồn tại trong bảng orders');
      process.exit(0);
    }

    // Thêm cột paymentAccountId
    console.log('➕ Đang thêm cột paymentAccountId vào bảng orders...');
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN paymentAccountId INT NULL 
      COMMENT 'ID of payment account used for this order (for QR payments)'
      AFTER paymentMethod
    `);
    console.log('✅ Đã thêm cột paymentAccountId thành công!');

    // Thêm foreign key nếu cần (optional)
    try {
      console.log('➕ Đang thêm foreign key constraint...');
      await sequelize.query(`
        ALTER TABLE orders 
        ADD CONSTRAINT fk_orders_payment_account 
        FOREIGN KEY (paymentAccountId) 
        REFERENCES payment_accounts(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
      `);
      console.log('✅ Đã thêm foreign key constraint thành công!');
    } catch (fkError) {
      if (fkError.message.includes('Duplicate key name') || fkError.message.includes('already exists')) {
        console.log('⏭️  Foreign key đã tồn tại. Bỏ qua...');
      } else {
        console.log('⚠️  Không thể thêm foreign key (có thể bảng payment_accounts chưa tồn tại):', fkError.message);
      }
    }

    // Xác nhận
    const [verify] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'orders' 
      AND COLUMN_NAME = 'paymentAccountId'
    `);

    if (verify.length > 0) {
      console.log('\n✅ Xác nhận: Cột paymentAccountId đã được thêm!');
      console.log('   - Type:', verify[0].DATA_TYPE);
      console.log('   - Nullable:', verify[0].IS_NULLABLE);
      console.log('   - Comment:', verify[0].COLUMN_COMMENT);
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

