const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'duyquang';

async function testVouchersAPI() {
  try {
    console.log('🧪 Testing Vouchers Admin API...');
    console.log('API URL:', API_URL);
    console.log('Admin Secret:', ADMIN_SECRET);
    console.log('');

    // Test 1: Get all vouchers
    console.log('1️⃣ Testing GET /vouchers/admin (all vouchers)...');
    const response1 = await axios.get(`${API_URL}/vouchers/admin`, {
      headers: {
        'X-Admin-Secret': ADMIN_SECRET
      }
    });

    console.log('✅ Status:', response1.status);
    console.log('✅ Success:', response1.data.success);
    console.log('✅ Data count:', response1.data.data?.length || 0);
    console.log('');

    // Test 2: Get vouchers for a specific store
    if (response1.data.data && response1.data.data.length > 0) {
      const firstStoreId = response1.data.data.find(v => v.storeId)?.storeId;
      if (firstStoreId) {
        console.log(`2️⃣ Testing GET /vouchers/admin?storeId=${firstStoreId}...`);
        const response2 = await axios.get(`${API_URL}/vouchers/admin`, {
          headers: {
            'X-Admin-Secret': ADMIN_SECRET
          },
          params: {
            storeId: firstStoreId
          }
        });
        console.log('✅ Status:', response2.status);
        console.log('✅ Success:', response2.data.success);
        console.log('✅ Data count:', response2.data.data?.length || 0);
        console.log('');
      }
    }

    // Test 3: Get global vouchers
    console.log('3️⃣ Testing GET /vouchers/admin?storeId=global...');
    const response3 = await axios.get(`${API_URL}/vouchers/admin`, {
      headers: {
        'X-Admin-Secret': ADMIN_SECRET
      },
      params: {
        storeId: 'global'
      }
    });
    console.log('✅ Status:', response3.status);
    console.log('✅ Success:', response3.data.success);
    console.log('✅ Data count:', response3.data.data?.length || 0);

    console.log('\n✨ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed!');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received. Is the backend server running?');
      console.error('Request config:', error.config?.url);
    }
    process.exit(1);
  }
}

testVouchersAPI();


