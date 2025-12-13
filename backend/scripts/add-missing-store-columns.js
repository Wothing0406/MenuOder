const { sequelize } = require('../src/config/database');

// Danh sách các cột cần thêm vào bảng stores
const columnsToAdd = [
  {
    name: 'storeDetailedAddress',
    definition: 'TEXT NULL',
    comment: 'Detailed address for display (does not affect distance calculation)',
    after: 'storeAddress'
  },
  {
    name: 'storeGoogleMapLink',
    definition: 'VARCHAR(500) NULL',
    comment: 'Google Maps link for the store location',
    after: 'storeDetailedAddress'
  },
  {
    name: 'zaloPayAppId',
    definition: 'VARCHAR(100) NULL',
    comment: 'ZaloPay App ID',
    after: 'storeImage'
  },
  {
    name: 'zaloPayKey1',
    definition: 'VARCHAR(200) NULL',
    comment: 'ZaloPay Key 1',
    after: 'zaloPayAppId'
  },
  {
    name: 'zaloPayKey2',
    definition: 'VARCHAR(200) NULL',
    comment: 'ZaloPay Key 2',
    after: 'zaloPayKey1'
  },
  {
    name: 'zaloPayMerchantId',
    definition: 'VARCHAR(100) NULL',
    comment: 'ZaloPay Merchant ID (optional)',
    after: 'zaloPayKey2'
  },
  {
    name: 'zaloPayIsActive',
    definition: 'BOOLEAN DEFAULT FALSE',
    comment: 'Enable ZaloPay for this store',
    after: 'zaloPayMerchantId'
  },
  {
    name: 'zaloPayLink',
    definition: 'VARCHAR(500) NULL',
    comment: 'ZaloPay payment link (optional/manual)',
    after: 'zaloPayIsActive'
  },
  {
    name: 'bankAccountNumber',
    definition: 'VARCHAR(50) NULL',
    comment: 'Bank account number for QR transfer',
    after: 'zaloPayLink'
  },
  {
    name: 'bankAccountName',
    definition: 'VARCHAR(200) NULL',
    comment: 'Bank account holder name',
    after: 'bankAccountNumber'
  },
  {
    name: 'bankName',
    definition: 'VARCHAR(100) NULL',
    comment: 'Bank name (e.g., Vietcombank, Techcombank, etc.)',
    after: 'bankAccountName'
  },
  {
    name: 'bankCode',
    definition: 'VARCHAR(10) NULL',
    comment: 'VietQR bank code (BIN)',
    after: 'bankName'
  },
  {
    name: 'bankTransferQRIsActive',
    definition: 'BOOLEAN DEFAULT FALSE',
    comment: 'Enable Bank Transfer QR for this store',
    after: 'bankCode'
  }
];

async function addMissingColumns() {
  try {
    console.log('🔌 Đang kết nối đến database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!\n');

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
            WHERE table_name = 'stores' 
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
            AND TABLE_NAME = 'stores' 
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
          // PostgreSQL: Add column (PostgreSQL doesn't support AFTER clause)
          alterQuery = `ALTER TABLE stores ADD COLUMN IF NOT EXISTS "${column.name}" ${column.definition}`;
        } else if (isMySQL) {
          // MySQL: Add column with AFTER clause
          const afterClause = column.after ? `AFTER \`${column.after}\`` : '';
          const commentClause = column.comment ? `COMMENT '${column.comment.replace(/'/g, "''")}'` : '';
          
          alterQuery = `ALTER TABLE stores ADD COLUMN \`${column.name}\` ${column.definition}`;
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
          // Check if column already exists (PostgreSQL IF NOT EXISTS might not work in older versions)
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
              COMMENT ON COLUMN stores."${column.name}" IS $1
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
    console.log('\n🔍 Đang xác nhận các cột trong bảng stores...');
    let allColumns = [];
    
    if (isPostgres) {
      const [postgresColumns] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'stores'
        ORDER BY ordinal_position
      `);
      allColumns = postgresColumns.map(col => ({ COLUMN_NAME: col.column_name }));
    } else if (isMySQL) {
      const [mysqlColumns] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'stores'
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

addMissingColumns();

