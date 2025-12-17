/**
 * Script để test query stats trực tiếp với database
 * Chạy: node backend/scripts/test-stats-query.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { sequelize, Sequelize } = require('../src/config/database');
const { Op } = Sequelize;

// Import models
const Store = require('../src/models/Store');
const Order = require('../src/models/Order');

async function testStatsQuery() {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Test: Lấy store đầu tiên
    console.log('📊 Testing Store query...');
    const store = await Store.findOne({ limit: 1 });
    if (!store) {
      console.log('❌ No store found in database');
      return;
    }
    console.log(`✅ Found store: ${store.storeName} (ID: ${store.id})\n`);

    // Test: Count total orders
    console.log('📊 Testing Order count queries...');
    const totalOrders = await Order.count({ where: { storeId: store.id } });
    console.log(`✅ Total orders: ${totalOrders}`);

    const pendingOrders = await Order.count({
      where: { storeId: store.id, status: 'pending' }
    });
    console.log(`✅ Pending orders: ${pendingOrders}`);

    const completedOrders = await Order.count({
      where: { storeId: store.id, status: 'completed' }
    });
    console.log(`✅ Completed orders: ${completedOrders}\n`);

    // Test: Revenue query
    console.log('📊 Testing Revenue queries...');
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    endOfToday.setHours(23, 59, 59, 999);

    console.log('Testing total revenue query...');
    const dbDialect = sequelize.getDialect();
    const isPostgres = dbDialect === 'postgres';
    const quote = isPostgres ? '"' : '`';
    const col = (name) => `${quote}${name}${quote}`;
    
    const totalRevenueResult = await Order.findAll({
      attributes: [
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('totalAmount')), 0), 'total'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.literal(`CASE 
          WHEN ${col('paymentMethod')} = 'cash' THEN ${col('totalAmount')} ELSE 0 END`)), 0), 'cashTotal'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.literal(`CASE 
          WHEN ${col('paymentMethod')} = 'bank_transfer' OR ${col('paymentMethod')} = 'bank_transfer_qr' THEN ${col('totalAmount')} ELSE 0 END`)), 0), 'bankTotal'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.literal(`CASE 
          WHEN ${col('paymentMethod')} = 'zalopay_qr' THEN ${col('totalAmount')} ELSE 0 END`)), 0), 'zaloTotal'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.literal(`CASE 
          WHEN ${col('paymentMethod')} NOT IN ('cash', 'bank_transfer', 'bank_transfer_qr', 'zalopay_qr') OR ${col('paymentMethod')} IS NULL THEN ${col('totalAmount')} ELSE 0 END`)), 0), 'otherTotal']
      ],
      where: { 
        storeId: store.id, 
        status: 'completed' 
      },
      raw: true
    });

    console.log('✅ Total revenue result:', JSON.stringify(totalRevenueResult, null, 2));

    // Test: Today revenue
    console.log('\nTesting today revenue query...');
    const todayRevenueResult = await Order.findAll({
      attributes: [[Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'total']],
      where: { 
        storeId: store.id, 
        status: 'completed',
        createdAt: {
          [Op.between]: [startOfToday, endOfToday]
        }
      },
      raw: true
    });
    console.log('✅ Today revenue result:', JSON.stringify(todayRevenueResult, null, 2));

    // Test: Check if there are any completed orders
    console.log('\n📊 Checking completed orders...');
    const completedOrdersList = await Order.findAll({
      where: { 
        storeId: store.id, 
        status: 'completed' 
      },
      limit: 5,
      attributes: ['id', 'orderCode', 'totalAmount', 'status', 'paymentMethod', 'createdAt']
    });
    console.log(`✅ Found ${completedOrdersList.length} completed orders (showing first 5):`);
    completedOrdersList.forEach(order => {
      console.log(`  - Order ${order.orderCode}: ${order.totalAmount} VND, Payment: ${order.paymentMethod || 'N/A'}, Date: ${order.createdAt}`);
    });

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    if (error.original) {
      console.error('Original error:', error.original.message);
    }
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testStatsQuery();

