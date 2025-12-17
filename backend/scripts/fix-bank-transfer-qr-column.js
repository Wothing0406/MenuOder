/**
 * Quick fix script to add bankTransferQRCode column to orders table
 * Run: node scripts/fix-bank-transfer-qr-column.js
 */
require('dotenv').config();
const { sequelize } = require('../src/config/database');

async function fixBankTransferQRColumn() {
  try {
    console.log('🔧 Checking bankTransferQRCode column in orders table...');
    
    // Check if column exists
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_name = 'orders'
      AND table_schema = DATABASE()
      AND column_name = 'bankTransferQRCode'
    `);

    const columnExists = results[0].count > 0;

    if (columnExists) {
      console.log('✅ Column bankTransferQRCode already exists');
      return;
    }

    console.log('➕ Adding bankTransferQRCode column to orders table...');
    
    // Add column
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN bankTransferQRCode TEXT NULL 
      AFTER zaloPayQrCode
    `);

    console.log('✅ Successfully added bankTransferQRCode column');
    console.log('✨ Fix completed! Please restart your backend server.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('Duplicate column')) {
      console.log('ℹ️  Column already exists (duplicate error)');
    } else {
      throw error;
    }
  } finally {
    await sequelize.close();
  }
}

fixBankTransferQRColumn()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });


 * Quick fix script to add bankTransferQRCode column to orders table
 * Run: node scripts/fix-bank-transfer-qr-column.js
 */
require('dotenv').config();
const { sequelize } = require('../src/config/database');

async function fixBankTransferQRColumn() {
  try {
    console.log('🔧 Checking bankTransferQRCode column in orders table...');
    
    // Check if column exists
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_name = 'orders'
      AND table_schema = DATABASE()
      AND column_name = 'bankTransferQRCode'
    `);

    const columnExists = results[0].count > 0;

    if (columnExists) {
      console.log('✅ Column bankTransferQRCode already exists');
      return;
    }

    console.log('➕ Adding bankTransferQRCode column to orders table...');
    
    // Add column
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN bankTransferQRCode TEXT NULL 
      AFTER zaloPayQrCode
    `);

    console.log('✅ Successfully added bankTransferQRCode column');
    console.log('✨ Fix completed! Please restart your backend server.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('Duplicate column')) {
      console.log('ℹ️  Column already exists (duplicate error)');
    } else {
      throw error;
    }
  } finally {
    await sequelize.close();
  }
}

fixBankTransferQRColumn()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });


















