const { sequelize, Sequelize } = require('../src/config/database');

async function addItemRemainingStockColumn() {
  try {
    console.log('🔌 Connecting to database...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');

    // Add remainingStock column to items table
    console.log('➕ Adding remainingStock column to items table...');

    await sequelize.query(`
      ALTER TABLE items
      ADD COLUMN IF NOT EXISTS remainingStock INT NULL DEFAULT NULL COMMENT 'Số lượng tồn kho còn lại - null: không giới hạn, 0: hết hàng, >0: còn X phần'
      AFTER itemPrice;
    `);

    console.log('✅ Successfully added remainingStock column to items table!');

    // Verify the column was added
    const [results] = await sequelize.query(`
      DESCRIBE items;
    `);

    const remainingStockColumn = results.find(col => col.Field === 'remainingStock');
    if (remainingStockColumn) {
      console.log('✅ Column verification successful!');
      console.log('   Column: remainingStock');
      console.log('   Type:', remainingStockColumn.Type);
      console.log('   Null:', remainingStockColumn.Null);
      console.log('   Default:', remainingStockColumn.Default);
      console.log('   Comment:', remainingStockColumn.Comment || 'No comment');
    } else {
      console.log('❌ Column verification failed - remainingStock column not found');
    }

    console.log('✨ Migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

addItemRemainingStockColumn();


