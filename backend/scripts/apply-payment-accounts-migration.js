const { sequelize } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function applyPaymentAccountsMigration() {
  try {
    console.log('🔄 Applying payment accounts migration...');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../../database/migration_add_payment_accounts.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      try {
        await sequelize.query(statement);
        console.log('✅ Executed:', statement.substring(0, 50) + '...');
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
          console.log('⚠️  Skipped (already exists):', statement.substring(0, 50) + '...');
        } else {
          console.error('❌ Error executing statement:', statement.substring(0, 50) + '...');
          console.error('Error:', error.message);
        }
      }
    }

    console.log('✅ Payment accounts migration completed successfully!');
    
    // Test the new table
    const testQuery = 'SELECT COUNT(*) as count FROM payment_accounts';
    const result = await sequelize.query(testQuery, { type: sequelize.QueryTypes.SELECT });
    console.log(`📊 Payment accounts table has ${result[0].count} records`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the migration
applyPaymentAccountsMigration();