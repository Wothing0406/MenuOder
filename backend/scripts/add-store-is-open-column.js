const { sequelize, Sequelize } = require('../src/config/database');

async function addStoreIsOpenColumn() {
  try {
    console.log('🔌 Connecting to database...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');

    // Add is_open column to stores table
    console.log('➕ Adding is_open column to stores table...');

    await sequelize.query(`
      ALTER TABLE stores
      ADD COLUMN IF NOT EXISTS \`is_open\` BOOLEAN DEFAULT true COMMENT 'Trạng thái mở/đóng của quán - true: mở, false: đóng'
      AFTER zaloPayLink;
    `);

    console.log('✅ Successfully added is_open column to stores table!');

    // Verify the column was added
    const [results] = await sequelize.query(`
      DESCRIBE stores;
    `);

    const isOpenColumn = results.find(col => col.Field === 'is_open');
    if (isOpenColumn) {
      console.log('✅ Column verification successful!');
      console.log('   Column: is_open');
      console.log('   Type:', isOpenColumn.Type);
      console.log('   Default:', isOpenColumn.Default);
      console.log('   Comment:', isOpenColumn.Comment || 'No comment');
    } else {
      console.log('❌ Column verification failed - is_open column not found');
    }

    console.log('✨ Migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

addStoreIsOpenColumn();
