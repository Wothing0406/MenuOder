const { sequelize } = require('../src/config/database');

/**
 * Run migrations using unified migration system
 * This is the function called automatically when server starts (with AUTO_MIGRATE=true)
 */
async function runSequentialMigrations() {
  try {
    // Use the new unified migration system
    const { runMigrations } = require('./unified-migration');
    await runMigrations();
  } catch (error) {
    // Fallback to old system if new one fails
    console.log('⚠️  Unified migration failed, trying legacy migrations...');
    
    const { execSync } = require('child_process');
    const path = require('path');

    const migrationScripts = [
      'add-missing-store-columns.js',
      'add-paymentAccountId-to-orders.js',
      'add-missing-order-columns.js'
    ];

    console.log('🚀 Running legacy migrations sequentially...\n');

    for (const script of migrationScripts) {
      try {
        console.log(`📦 Running: ${script}...`);
        const scriptPath = path.join(__dirname, script);
        execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
        console.log(`✅ ${script} completed\n`);
      } catch (error) {
        // Check if error is because column already exists (non-fatal)
        const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message || '';
        const isNonFatal = errorOutput.includes('đã tồn tại') || 
                          errorOutput.includes('already exists') ||
                          errorOutput.includes('Duplicate column') ||
                          errorOutput.includes('duplicate') ||
                          (errorOutput.includes('Cột') && errorOutput.includes('tồn tại'));
        
        if (isNonFatal) {
          console.log(`⚠️  ${script}: Column already exists (skipping - non-fatal)\n`);
        } else {
          console.error(`❌ Error running ${script}:`, error.message);
          // Don't throw - continue with other migrations
        }
      }
    }
  }
}

/**
 * Legacy function - kept for backward compatibility
 */
async function runDeployMigrations() {
  return runSequentialMigrations();
}

// If run directly (not imported)
if (require.main === module) {
  runSequentialMigrations().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

module.exports = { runDeployMigrations, runSequentialMigrations };






