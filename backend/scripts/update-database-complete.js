/**
 * Script to update all missing columns and tables in PostgreSQL database
 * This script will run all necessary migrations
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { sequelize } = require('../src/config/database');

async function updateDatabaseComplete() {
  try {
    console.log('🔌 Đang kết nối đến database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!\n');

    // Detect database type
    const dialect = sequelize.getDialect();
    console.log(`📊 Database type: ${dialect}\n`);

    if (dialect !== 'postgres') {
      console.log('⚠️  Script này được tối ưu cho PostgreSQL');
      console.log('   Database hiện tại:', dialect);
    }

    console.log('🚀 Bắt đầu cập nhật database...\n');
    console.log('='.repeat(60));

    const migrations = [
      {
        name: 'Add missing store columns',
        script: 'add-missing-store-columns.js',
        description: 'Thêm các cột còn thiếu vào bảng stores'
      },
      {
        name: 'Add paymentAccountId to orders',
        script: 'add-paymentAccountId-to-orders.js',
        description: 'Thêm cột paymentAccountId vào bảng orders'
      },
      {
        name: 'Add missing order columns',
        script: 'add-missing-order-columns.js',
        description: 'Thêm các cột còn thiếu vào bảng orders'
      }
    ];

    const results = {
      success: [],
      skipped: [],
      errors: []
    };

    const { execSync } = require('child_process');
    const path = require('path');

    for (const migration of migrations) {
      try {
        console.log(`\n📦 ${migration.name}...`);
        console.log(`   ${migration.description}`);
        
        const scriptPath = path.join(__dirname, migration.script);
        execSync(`node "${scriptPath}"`, { 
          stdio: 'inherit',
          env: process.env
        });
        
        results.success.push(migration.name);
        console.log(`✅ ${migration.name} - Hoàn tất!`);
        
      } catch (error) {
        const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message || '';
        
        // Check if it's a non-fatal error (column already exists)
        const isNonFatal = errorOutput.includes('đã tồn tại') || 
                          errorOutput.includes('already exists') ||
                          errorOutput.includes('Duplicate column') ||
                          errorOutput.includes('duplicate') ||
                          (errorOutput.includes('Cột') && errorOutput.includes('tồn tại')) ||
                          errorOutput.includes('IF NOT EXISTS');
        
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
    console.log('📊 TỔNG KẾT CẬP NHẬT DATABASE');
    console.log('='.repeat(60));
    console.log(`✅ Thành công: ${results.success.length}`);
    if (results.success.length > 0) {
      results.success.forEach(name => console.log(`   - ${name}`));
    }
    
    console.log(`\n⏭️  Đã tồn tại (bỏ qua): ${results.skipped.length}`);
    if (results.skipped.length > 0) {
      results.skipped.forEach(name => console.log(`   - ${name}`));
    }
    
    console.log(`\n❌ Lỗi: ${results.errors.length}`);
    if (results.errors.length > 0) {
      results.errors.forEach(({ name, error }) => {
        console.log(`   - ${name}: ${error}`);
      });
    }
    console.log('='.repeat(60));

    if (results.errors.length === 0) {
      console.log('\n✨ Cập nhật database hoàn tất!');
      console.log('   Tất cả các cột và bảng cần thiết đã được thêm.');
    } else {
      console.log('\n⚠️  Một số migrations có lỗi. Vui lòng kiểm tra lại.');
    }

    // Verify critical columns
    console.log('\n🔍 Kiểm tra các cột quan trọng...');
    try {
      const [columns] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name IN ('paymentAccountId', 'orderType', 'deliveryAddress', 'shippingFee')
        ORDER BY column_name
      `);
      
      const foundColumns = columns.map(c => c.column_name);
      const requiredColumns = ['paymentAccountId', 'orderType', 'deliveryAddress', 'shippingFee'];
      const missingColumns = requiredColumns.filter(col => !foundColumns.includes(col));
      
      if (missingColumns.length === 0) {
        console.log('✅ Tất cả các cột quan trọng đã có!');
        console.log('   - paymentAccountId');
        console.log('   - orderType');
        console.log('   - deliveryAddress');
        console.log('   - shippingFee');
      } else {
        console.log('⚠️  Các cột còn thiếu:');
        missingColumns.forEach(col => console.log(`   - ${col}`));
      }
    } catch (verifyError) {
      console.log('⚠️  Không thể kiểm tra cột:', verifyError.message);
    }

    process.exit(results.errors.length === 0 ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Lỗi không mong đợi:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  updateDatabaseComplete();
}

module.exports = { updateDatabaseComplete };









