const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'duyquang';

async function testAdminAPI() {
  try {
    console.log('🧪 Testing Admin API...');
    console.log('API URL:', API_URL);
    console.log('Admin Secret:', ADMIN_SECRET);
    console.log('');

    // Test 1: Check if endpoint exists
    console.log('1️⃣ Testing GET /stores/admin...');
    const response = await axios.get(`${API_URL}/stores/admin`, {
      headers: {
        'X-Admin-Secret': ADMIN_SECRET
      }
    });

    console.log('✅ Status:', response.status);
    console.log('✅ Success:', response.data.success);
    console.log('✅ Data count:', response.data.data?.length || 0);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('\n📊 Sample store data:');
      const firstStore = response.data.data[0];
      console.log('  - ID:', firstStore.id);
      console.log('  - Name:', firstStore.storeName);
      console.log('  - Slug:', firstStore.storeSlug);
      console.log('  - Owner:', firstStore.owner ? `${firstStore.owner.email} (${firstStore.owner.storeName})` : 'No owner');
      console.log('  - Active:', firstStore.isActive);
    }

    console.log('\n✨ Test completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed!');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

testAdminAPI();





