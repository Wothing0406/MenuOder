const { sequelize } = require('./src/config/database');

async function testConnection() {
  console.log('🔍 Testing database connection...');
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Test query
    const [results] = await sequelize.query('SELECT 1 as test');
    console.log('✅ Query test successful:', results);

  } catch (err) {
    console.error('❌ Database connection failed:');
    console.error('Error:', err.message);
    console.error('Code:', err.original?.code || 'Unknown');
    console.error('Port:', err.original?.port || 'Unknown');
    console.error('Host:', err.original?.host || 'Unknown');
    console.error('Address:', err.original?.address || 'Unknown');

    // Check for common issues
    if (err.original?.code === 'ECONNREFUSED') {
      console.error('\n🔧 TROUBLESHOOTING:');
      console.error('1. Make sure XAMPP MySQL is running');
      console.error('2. Check if port 3306 is available');
      console.error('3. Verify MySQL service is started in XAMPP control panel');
    } else if (err.original?.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n🔧 TROUBLESHOOTING:');
      console.error('1. Check MySQL username/password in .env file');
      console.error('2. Default XAMPP MySQL: user=root, password="" (empty)');
    } else if (err.original?.code === 'ER_BAD_DB_ERROR') {
      console.error('\n🔧 TROUBLESHOOTING:');
      console.error('1. Database "menu_order_db" does not exist');
      console.error('2. Create the database in phpMyAdmin or MySQL command line');
      console.error('3. Run: CREATE DATABASE menu_order_db;');
    }
  }
}

testConnection();
