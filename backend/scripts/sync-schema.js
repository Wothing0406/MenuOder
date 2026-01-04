/**
 * Sync database schema (create tables from Sequelize models)
 * Run this before running migrations for PostgreSQL
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { sequelize } = require('../src/config/database');
require('../src/models'); // Load models và associations

async function syncSchema() {
  try {
    console.log('🔌 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    console.log('🔄 Syncing database models (creating tables if not exist)...');
    await sequelize.sync({ 
      alter: false, // Don't alter existing tables
      force: false  // Never drop tables
    });
    console.log('✅ Database synchronized successfully');
    console.log('💡 Now you can run: npm run migrate:all');
  } catch (error) {
    console.error('❌ Failed to sync schema:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

syncSchema();











































