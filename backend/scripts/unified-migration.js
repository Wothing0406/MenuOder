/**
 * Unified Migration System
 * 
 * Tự động chạy tất cả migrations khi deploy lên Render
 * - Tự động detect PostgreSQL/MySQL
 * - Chạy tất cả migrations theo thứ tự
 * - Không mất dữ liệu cũ
 * - Idempotent (có thể chạy nhiều lần an toàn)
 * 
 * Usage:
 *   node backend/scripts/unified-migration.js
 * 
 * Environment Variables:
 *   DATABASE_URL - PostgreSQL connection string
 *   hoặc DB_HOST, DB_USER, DB_PASSWORD, DB_NAME cho MySQL
 *   AUTO_MIGRATE=true - Tự động chạy khi server start
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { sequelize, Sequelize } = require('../src/config/database');

// Migration files theo thứ tự (chạy từ trên xuống)
const MIGRATION_FILES = [
  // Core migrations - chạy đầu tiên
  'migration_add_new_features_postgresql.sql',
  'migration_add_new_features.sql',
  
  // Status và fields
  'migration_add_completed_status_postgresql.sql',
  'migration_add_completed_status.sql',
  'migration_fix_customer_fields.sql',
  
  // Address và location
  'migration_add_detailed_address.sql',
  'migration_add_storeGoogleMapLink.sql',
  
  // Vouchers
  'migration_add_vouchers.sql',
  'migration_fix_voucher_storeId_nullable.sql',
  
  // Items
  'migration_fix_item_deletion_postgresql.sql',
  'migration_fix_item_deletion.sql',
  
  // Reviews
  'migration_add_reviews_postgresql.sql',
  'migration_add_reviews.sql',
  
  // Payment methods
  'migration_add_zalopay.sql',
  'migration_add_bank_transfer.sql',
  'migration_add_bank_transfer_qr_code_to_orders.sql',
  
  // Payment accounts
  'migration_add_payment_accounts_postgresql.sql',
  'migration_add_payment_accounts.sql',
  'migration_add_payment_account_to_orders_postgresql.sql',
  'migration_add_payment_account_to_orders.sql',
  'migration_verify_payment_accounts_postgresql.sql',
  'migration_verify_payment_accounts.sql'
];

const DB_DIR = path.join(__dirname, '..', '..', 'database');

/**
 * Check if migration file exists
 */
function fileExists(file) {
  return fs.existsSync(path.join(DB_DIR, file));
}

/**
 * Check if error is non-fatal (column/table already exists)
 */
function isNonFatalError(error) {
  if (!error) return false;
  
  const msg = (error.message || '').toLowerCase();
  const code = error.code || '';
  
  return (
    msg.includes('already exists') ||
    msg.includes('duplicate column') ||
    msg.includes('duplicate key') ||
    msg.includes('relation already exists') ||
    msg.includes('column') && msg.includes('already exists') ||
    code === '42P07' || // PostgreSQL: relation already exists
    code === '42701' || // PostgreSQL: duplicate column
    code === '23505'    // PostgreSQL: unique violation (non-fatal for migrations)
  );
}

/**
 * Execute SQL migration
 */
async function executeMigration(sql, filename) {
  const dbDialect = sequelize.getDialect();
  const isPostgres = dbDialect === 'postgres';
  
  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));
    
    for (const statement of statements) {
      if (statement) {
        await sequelize.query(statement, {
          type: Sequelize.QueryTypes.RAW
        });
      }
    }
    
    return { success: true };
  } catch (error) {
    if (isNonFatalError(error)) {
      return { success: true, skipped: true, reason: error.message };
    }
    throw error;
  }
}

/**
 * Run all migrations
 */
async function runMigrations() {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    
    const dbDialect = sequelize.getDialect();
    console.log(`✅ Connected to ${dbDialect.toUpperCase()} database\n`);
    
    // Filter migrations by database type
    const isPostgres = dbDialect === 'postgres';
    const relevantMigrations = MIGRATION_FILES.filter(file => {
      if (isPostgres) {
        // For PostgreSQL, prefer postgresql versions, but also run generic ones
        return fileExists(file);
      } else {
        // For MySQL, skip postgresql-specific files
        return fileExists(file) && !file.includes('postgresql');
      }
    });
    
    if (relevantMigrations.length === 0) {
      console.log('ℹ️  No migration files found');
      return;
    }
    
    console.log(`📦 Found ${relevantMigrations.length} migration(s) to apply\n`);
    
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const file of relevantMigrations) {
      const filePath = path.join(DB_DIR, file);
      
      try {
        console.log(`🛠  Applying: ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        const result = await executeMigration(sql, file);
        
        if (result.skipped) {
          console.log(`   ⏭️  Skipped (already applied): ${file}`);
          skippedCount++;
        } else {
          console.log(`   ✅ Applied: ${file}`);
          successCount++;
        }
      } catch (error) {
        if (isNonFatalError(error)) {
          console.log(`   ⏭️  Skipped (non-fatal): ${file} - ${error.message}`);
          skippedCount++;
        } else {
          console.error(`   ❌ Error: ${file}`);
          console.error(`      ${error.message}`);
          errorCount++;
          // Continue with other migrations
        }
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    if (errorCount > 0) {
      console.log(`   ❌ Errors: ${errorCount}`);
    }
    console.log('\n✨ Migration process completed!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migrations
if (require.main === module) {
  runMigrations().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { runMigrations };



