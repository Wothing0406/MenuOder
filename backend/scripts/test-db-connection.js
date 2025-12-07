const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'menu_order_db',
};

async function testConnection() {
  console.log('🔍 Testing Database Connection...\n');
  console.log('Configuration:');
  console.log('  Host:', DB_CONFIG.host);
  console.log('  Port:', DB_CONFIG.port);
  console.log('  User:', DB_CONFIG.user);
  console.log('  Password:', DB_CONFIG.password ? '***' : '(empty)');
  console.log('  Database:', DB_CONFIG.database);
  console.log('');

  let connection;
  
  try {
    // Test 1: Connect without database (to check if MySQL is running)
    console.log('1️⃣ Testing MySQL server connection...');
    const testConnection = await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password
    });
    console.log('✅ MySQL server is running!\n');
    await testConnection.end();

    // Test 2: Check if database exists
    console.log('2️⃣ Checking if database exists...');
    const dbConnection = await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password
    });
    
    const [databases] = await dbConnection.query('SHOW DATABASES LIKE ?', [DB_CONFIG.database]);
    if (databases.length > 0) {
      console.log(`✅ Database "${DB_CONFIG.database}" exists!\n`);
    } else {
      console.log(`❌ Database "${DB_CONFIG.database}" does NOT exist!`);
      console.log('   Run: npm run reset-db\n');
      await dbConnection.end();
      process.exit(1);
    }
    await dbConnection.end();

    // Test 3: Connect to database
    console.log('3️⃣ Connecting to database...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to database successfully!\n');

    // Test 4: Check tables
    console.log('4️⃣ Checking tables...');
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log(`✅ Found ${tableNames.length} tables:`, tableNames.join(', '));
    console.log('');

    // Test 5: Check stores table
    console.log('5️⃣ Checking stores table...');
    const [stores] = await connection.query('SELECT COUNT(*) as count FROM stores');
    console.log(`✅ Stores table has ${stores[0].count} records`);
    
    // Test 6: Check users table
    console.log('6️⃣ Checking users table...');
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Users table has ${users[0].count} records`);
    
    // Test 7: Check vouchers table
    console.log('7️⃣ Checking vouchers table...');
    const [vouchers] = await connection.query('SELECT COUNT(*) as count FROM vouchers');
    console.log(`✅ Vouchers table has ${vouchers[0].count} records`);

    console.log('\n✨ All database tests passed!');
    
  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Solution:');
      console.error('   1. Make sure XAMPP MySQL is running');
      console.error('   2. Check if MySQL is running on port', DB_CONFIG.port);
      console.error('   3. In XAMPP Control Panel, click "Start" for MySQL');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Solution:');
      console.error('   1. Check username and password in .env file');
      console.error('   2. Default XAMPP MySQL: user=root, password=(empty)');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Solution:');
      console.error('   Database does not exist. Run: npm run reset-db');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection();





