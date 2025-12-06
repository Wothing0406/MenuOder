const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || `http://localhost:${process.env.PORT || 5002}/api`;
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'duyquang';

async function testBackendAPI() {
  console.log('🧪 Testing Backend API...\n');
  console.log('API URL:', API_URL);
  console.log('');

  const tests = [
    {
      name: '1. Health Check - Get all stores',
      method: 'GET',
      url: `${API_URL}/stores`,
      headers: {}
    },
    {
      name: '2. Admin - Get stores',
      method: 'GET',
      url: `${API_URL}/stores/admin`,
      headers: { 'X-Admin-Secret': ADMIN_SECRET }
    },
    {
      name: '3. Admin - Get vouchers',
      method: 'GET',
      url: `${API_URL}/vouchers/admin`,
      headers: { 'X-Admin-Secret': ADMIN_SECRET }
    },
    {
      name: '4. Validate address',
      method: 'POST',
      url: `${API_URL}/orders/validate-address`,
      data: { address: 'Hội An, Quảng Nam' },
      headers: {}
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n${test.name}...`);
      
      let response;
      if (test.method === 'GET') {
        response = await axios.get(test.url, { headers: test.headers });
      } else {
        response = await axios.post(test.url, test.data || {}, { headers: test.headers });
      }

      console.log('✅ Status:', response.status);
      console.log('✅ Success:', response.data.success);
      if (response.data.data) {
        const dataType = Array.isArray(response.data.data) ? 'array' : typeof response.data.data;
        const dataLength = Array.isArray(response.data.data) ? response.data.data.length : 'N/A';
        console.log('✅ Data type:', dataType, dataLength !== 'N/A' ? `(${dataLength} items)` : '');
      }
      passed++;
    } catch (error) {
      console.log('❌ Failed');
      if (error.code === 'ECONNREFUSED' || error.message.includes('connect')) {
        console.log('   ⚠️  Backend server is NOT running!');
        console.log('   💡 Solution: Start backend server with: npm start (or npm run dev)');
      } else if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data?.message || error.message);
      } else {
        console.log('   Error:', error.message);
      }
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log('\n💡 If backend server is not running:');
    console.log('   cd backend');
    console.log('   npm start');
    process.exit(1);
  } else {
    console.log('\n✨ All API tests passed!');
  }
}

testBackendAPI().catch(console.error);

