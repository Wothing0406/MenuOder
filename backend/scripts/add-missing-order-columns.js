const { sequelize } = require('../src/config/database');

// Danh sách các cột cần thêm vào bảng orders
const columnsToAdd = [
  {
    name: 'zaloPayTransactionId',
    definition: 'VARCHAR(100) NULL',
    comment: 'ZaloPay transaction ID (app_trans_id)',
    after: 'isPaid'
  },
  {
    name: 'zaloPayStatus',
    definition: "ENUM('pending', 'success', 'failed') NULL",
    comment: 'ZaloPay transaction status',
    after: 'zaloPayTransactionId'
  },
  {
    name: 'zaloPayQrCode',
    definition: 'TEXT NULL',
    comment: 'ZaloPay QR code data (URL or image data)',
    after: 'zaloPayStatus'
  },
  {
    name: 'bankTransferQRCode',
    definition: 'TEXT NULL',
    comment: 'Bank Transfer QR code data (image data)',
    after: 'zaloPayQrCode'
  },
  {
    name: 'voucherId',
    definition: 'INT NULL',
    comment: 'Reference to voucher used in this order',
    after: 'bankTransferQRCode'
  },
  {
    name: 'voucherCode',
    definition: 'VARCHAR(100) NULL',
    comment: 'Voucher code used in this order',
    after: 'voucherId'
  },
  {
    name: 'discountType',
    definition: "ENUM('percentage', 'fixed') NULL",
    comment: 'Type of discount applied',
    after: 'voucherCode'
  },
  {
    name: 'discountValue',
    definition: 'DECIMAL(10, 2) NULL',
    comment: 'Discount value (percentage or fixed amount)',
    after: 'discountType'
  },
  {
    name: 'discountAmount',
    definition: 'DECIMAL(10, 2) DEFAULT 0',
    comment: 'Actual discount amount applied in VND',
    after: 'discountValue'
  }
];

async function addMissingOrderColumns() {
  try {
    console.log('🔌 Đang kết nối đến database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!\n');

    let addedCount = 0;
    let skippedCount = 0;

    for (const column of columnsToAdd) {
      try {
        // Kiểm tra xem cột đã tồn tại chưa
        const [results] = await sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'orders' 
          AND COLUMN_NAME = ?
        `, {
          replacements: [column.name]
        });

        if (results.length > 0) {
          console.log(`⏭️  Cột ${column.name} đã tồn tại. Bỏ qua...`);
          skippedCount++;
          continue;
        }

        // Thêm cột
        const afterClause = column.after ? `AFTER \`${column.after}\`` : '';
        const commentClause = column.comment ? `COMMENT '${column.comment.replace(/'/g, "''")}'` : '';
        
        let alterQuery = `ALTER TABLE orders ADD COLUMN \`${column.name}\` ${column.definition}`;
        if (commentClause) {
          alterQuery += ` ${commentClause}`;
        }
        if (afterClause) {
          alterQuery += ` ${afterClause}`;
        }

        console.log(`➕ Đang thêm cột ${column.name}...`);
        await sequelize.query(alterQuery);
        console.log(`✅ Đã thêm cột ${column.name} thành công!`);
        addedCount++;

      } catch (error) {
        if (error.message.includes('Duplicate column name') || error.message.includes('ER_DUP_FIELDNAME')) {
          console.log(`⏭️  Cột ${column.name} đã tồn tại. Bỏ qua...`);
          skippedCount++;
        } else {
          console.error(`❌ Lỗi khi thêm cột ${column.name}:`, error.message);
          throw error;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Tổng kết:');
    console.log(`   ✅ Đã thêm: ${addedCount} cột`);
    console.log(`   ⏭️  Đã bỏ qua: ${skippedCount} cột (đã tồn tại)`);
    console.log('='.repeat(60));

    // Xác nhận lại tất cả các cột
    console.log('\n🔍 Đang xác nhận các cột trong bảng orders...');
    const [allColumns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'orders'
      ORDER BY ORDINAL_POSITION
    `);

    const columnNames = allColumns.map(col => col.COLUMN_NAME);
    const missingColumns = columnsToAdd
      .map(col => col.name)
      .filter(name => !columnNames.includes(name));

    if (missingColumns.length === 0) {
      console.log('✅ Tất cả các cột đã được thêm thành công!');
    } else {
      console.log('⚠️  Các cột chưa được thêm:');
      missingColumns.forEach(col => console.log(`   - ${col}`));
    }

    console.log('\n✨ Hoàn tất migration!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

addMissingOrderColumns();

