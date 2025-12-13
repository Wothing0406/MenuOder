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

    let addedCount = 0;
    let skippedCount = 0;

    for (const column of columnsToAdd) {
      try {
        // Kiểm tra xem cột đã tồn tại chưa
        let results = [];
        
        if (isPostgres) {
          const [postgresResults] = await sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'orders' 
            AND column_name = $1
          `, {
            bind: [column.name]
          });
          results = postgresResults;
        } else if (isMySQL) {
          const [mysqlResults] = await sequelize.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'orders' 
            AND COLUMN_NAME = ?
          `, {
            replacements: [column.name]
          });
          results = mysqlResults;
        } else {
          throw new Error(`Unsupported database dialect: ${dialect}`);
        }

        if (results.length > 0) {
          console.log(`⏭️  Cột ${column.name} đã tồn tại. Bỏ qua...`);
          skippedCount++;
          continue;
        }

        // Thêm cột
        let alterQuery = '';
        
        if (isPostgres) {
          // PostgreSQL: Convert MySQL types to PostgreSQL
          let pgDefinition = column.definition
            .replace(/VARCHAR\((\d+)\)/g, 'VARCHAR($1)')
            .replace(/INT/g, 'INTEGER')
            .replace(/ENUM\(([^)]+)\)/g, (match, values) => {
              // PostgreSQL ENUM needs to be created separately, use VARCHAR for now
              return 'VARCHAR(50)';
            });
          
          alterQuery = `ALTER TABLE orders ADD COLUMN IF NOT EXISTS "${column.name}" ${pgDefinition}`;
        } else if (isMySQL) {
          // MySQL: Add column with AFTER clause
          const afterClause = column.after ? `AFTER \`${column.after}\`` : '';
          const commentClause = column.comment ? `COMMENT '${column.comment.replace(/'/g, "''")}'` : '';
          
          alterQuery = `ALTER TABLE orders ADD COLUMN \`${column.name}\` ${column.definition}`;
          if (commentClause) {
            alterQuery += ` ${commentClause}`;
          }
          if (afterClause) {
            alterQuery += ` ${afterClause}`;
          }
        }

        console.log(`➕ Đang thêm cột ${column.name}...`);
        
        try {
          await sequelize.query(alterQuery);
          console.log(`✅ Đã thêm cột ${column.name} thành công!`);
          addedCount++;
        } catch (addError) {
          // Check if column already exists
          if (addError.message.includes('already exists') || 
              addError.message.includes('duplicate column') ||
              addError.message.includes('Duplicate column name') ||
              addError.message.includes('ER_DUP_FIELDNAME')) {
            console.log(`⏭️  Cột ${column.name} đã tồn tại. Bỏ qua...`);
            skippedCount++;
          } else {
            throw addError;
          }
        }
        
        // Add comment for PostgreSQL separately
        if (isPostgres && column.comment) {
          try {
            await sequelize.query(`
              COMMENT ON COLUMN orders."${column.name}" IS $1
            `, {
              bind: [column.comment]
            });
          } catch (commentError) {
            // Comment is optional
            console.log(`⚠️  Không thể thêm comment cho ${column.name} (không ảnh hưởng)`);
          }
        }

      } catch (error) {
        if (error.message.includes('Duplicate column name') || 
            error.message.includes('ER_DUP_FIELDNAME') ||
            error.message.includes('already exists') ||
            error.message.includes('duplicate column')) {
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
    let allColumns = [];
    
    if (isPostgres) {
      const [postgresColumns] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'orders'
        ORDER BY ordinal_position
      `);
      allColumns = postgresColumns.map(col => ({ COLUMN_NAME: col.column_name }));
    } else if (isMySQL) {
      const [mysqlColumns] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'orders'
        ORDER BY ORDINAL_POSITION
      `);
      allColumns = mysqlColumns;
    }

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

