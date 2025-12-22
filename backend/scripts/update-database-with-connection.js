/**
 * Script to update database using provided connection string
 * Usage: node scripts/update-database-with-connection.js "postgresql://..."
 */

const { Sequelize } = require('sequelize');
const path = require('path');

// Get connection string from command line argument or environment
const connectionString = process.argv[2] || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Vui lòng cung cấp connection string!');
  console.error('   Cách 1: node scripts/update-database-with-connection.js "postgresql://..."');
  console.error('   Cách 2: Set DATABASE_URL environment variable');
  process.exit(1);
}

// Parse connection string
let sequelize;
try {
  const url = new URL(connectionString);
  
  sequelize = new Sequelize(connectionString, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
  
  console.log('📊 Database Info:');
  console.log(`   Host: ${url.hostname}`);
  console.log(`   Database: ${url.pathname.replace('/', '')}`);
  console.log(`   User: ${url.username}`);
  console.log('');
} catch (error) {
  console.error('❌ Connection string không hợp lệ:', error.message);
  process.exit(1);
}

async function updateDatabase() {
  try {
    console.log('🔌 Đang kết nối đến database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!\n');

    console.log('🚀 Bắt đầu cập nhật database...\n');
    console.log('='.repeat(60));

    const migrations = [
      {
        name: 'Add missing store columns',
        script: 'add-missing-store-columns.js'
      },
      {
        name: 'Add paymentAccountId to orders',
        script: 'add-paymentAccountId-to-orders.js'
      },
      {
        name: 'Add missing order columns',
        script: 'add-missing-order-columns.js'
      }
    ];

    const results = {
      success: [],
      skipped: [],
      errors: []
    };

    const { execSync } = require('child_process');

    for (const migration of migrations) {
      try {
        console.log(`\n📦 ${migration.name}...`);
        
        // Temporarily override sequelize in the migration script
        const scriptPath = path.join(__dirname, migration.script);
        
        // Set DATABASE_URL for the migration script
        const env = {
          ...process.env,
          DATABASE_URL: connectionString
        };
        
        execSync(`node "${scriptPath}"`, { 
          stdio: 'inherit',
          env: env
        });
        
        results.success.push(migration.name);
        console.log(`✅ ${migration.name} - Hoàn tất!`);
        
      } catch (error) {
        const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message || '';
        
        const isNonFatal = errorOutput.includes('đã tồn tại') || 
                          errorOutput.includes('already exists') ||
                          errorOutput.includes('Duplicate column') ||
                          errorOutput.includes('duplicate') ||
                          (errorOutput.includes('Cột') && errorOutput.includes('tồn tại'));
        
        if (isNonFatal) {
          results.skipped.push(migration.name);
          console.log(`⏭️  ${migration.name} - Đã tồn tại (bỏ qua)`);
        } else {
          results.errors.push({ name: migration.name, error: error.message });
          console.log(`❌ ${migration.name} - Lỗi: ${error.message}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 TỔNG KẾT');
    console.log('='.repeat(60));
    console.log(`✅ Thành công: ${results.success.length}`);
    console.log(`⏭️  Đã tồn tại: ${results.skipped.length}`);
    console.log(`❌ Lỗi: ${results.errors.length}`);
    console.log('='.repeat(60));

    // Verify paymentAccountId column
    console.log('\n🔍 Kiểm tra cột paymentAccountId...');
    try {
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'paymentAccountId'
      `);
      
      if (columns.length > 0) {
        console.log('✅ Cột paymentAccountId đã tồn tại!');
        console.log(`   Type: ${columns[0].data_type}`);
        console.log(`   Nullable: ${columns[0].is_nullable}`);
      } else {
        console.log('❌ Cột paymentAccountId chưa tồn tại!');
      }
    } catch (verifyError) {
      console.log('⚠️  Không thể kiểm tra:', verifyError.message);
    }

    await sequelize.close();
    
    if (results.errors.length === 0) {
      console.log('\n✨ Hoàn tất! Database đã được cập nhật.');
      process.exit(0);
    } else {
      console.log('\n⚠️  Có một số lỗi. Vui lòng kiểm tra lại.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    if (sequelize) {
      await sequelize.close();
    }
    process.exit(1);
  }
}

updateDatabase();





















