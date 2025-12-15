const { sequelize } = require('../src/config/database');

/**
 * Run migrations sequentially using execSync
 * This is the function called automatically when server starts (with AUTO_MIGRATE=true)
 */
async function runSequentialMigrations() {
  const { execSync } = require('child_process');
  const path = require('path');

  const migrationScripts = [
    'add-missing-store-columns.js',
    'add-paymentAccountId-to-orders.js',
    'add-missing-order-columns.js'
  ];

  console.log('🚀 Running all migrations sequentially...\n');

  let hasErrors = false;

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
        hasErrors = true;
        // Don't throw - continue with other migrations
      }
    }
  }

  if (hasErrors) {
    console.log('⚠️  Some migrations had errors, but continuing...');
  } else {
    console.log('✨ All migrations completed successfully!');
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

