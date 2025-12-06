const { sequelize } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  try {
    console.log('🔄 Applying reviews migration...');

    // Read migration file
    const migrationPath = path.join(__dirname, '../../database/migration_add_reviews.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('USE'));

    for (const statement of statements) {
      if (statement) {
        try {
          await sequelize.query(statement, { raw: true });
          console.log('✅ Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          // Ignore "already exists" errors
          if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
            console.log('⚠️  Skipped (already exists):', statement.substring(0, 50) + '...');
          } else {
            console.error('❌ Error executing:', statement.substring(0, 50));
            console.error('Error:', error.message);
          }
        }
      }
    }

    console.log('✅ Reviews migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();


