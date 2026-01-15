const axios = require('axios');

async function testAPI() {
  const API_BASE = 'http://localhost:5005/api';

  console.log('🔍 Testing API endpoints...');

  try {
    // Test health (no auth required)
    console.log('\n📊 Testing /health...');
    const healthRes = await axios.get('http://localhost:5005/health');
    console.log('✅ Health check:', healthRes.data);

    // Test login
    console.log('\n🔐 Testing login...');
    let token;
    try {
      const loginRes = await axios.post(`${API_BASE}/auth/login`, {
        email: 'admin@example.com',
        password: '123456'
      });
      console.log('✅ Login successful');
      token = loginRes.data.data?.token;
      console.log('🔑 Token received:', token ? 'Yes' : 'No');
    } catch (loginError) {
      console.log('⚠️  Login failed, trying with test account creation...');

      // Try to create test account
      try {
        await axios.post(`${API_BASE}/auth/register`, {
          email: 'admin@example.com',
          password: '123456',
          storeName: 'Test Store',
          storeSlug: 'test-store',
          storeAddress: '123 Test Street, Test City',
          storePhone: '0123456789'
        });
        console.log('✅ Test account created, please login at frontend');
        console.log('📧 Email: admin@example.com');
        console.log('🔑 Password: 123456');
        console.log('🏪 Store: test-store');

        // Try login again
        const loginRes = await axios.post(`${API_BASE}/auth/login`, {
          email: 'admin@example.com',
          password: '123456'
        });
        console.log('✅ Login successful after registration');
        token = loginRes.data.data?.token;
      } catch (registerError) {
        console.log('❌ Could not create test account:', registerError.response?.data?.message);
        return;
      }
    }

    if (!token) {
      console.log('❌ No token available for API testing');
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'X-Device-Id': 'test-device-123'
    };

    // Test protected endpoints
    console.log('\n📈 Testing protected API /anti-spam/stats...');
    try {
      const statsRes = await axios.get(`${API_BASE}/anti-spam/stats`, { headers });
      console.log('✅ Anti-spam stats:', JSON.stringify(statsRes.data, null, 2));
    } catch (error) {
      console.log('❌ Anti-spam stats failed:', error.response?.data?.message);
    }

    console.log('\n📋 Testing /stores/my-store...');
    try {
      const storesRes = await axios.get(`${API_BASE}/stores/my-store`, { headers });
      console.log('✅ My store:', storesRes.data.data?.storeName);
    } catch (error) {
      console.log('❌ My store failed:', error.response?.data?.message);
    }

  } catch (error) {
    console.error('❌ API test failed:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testAPI();
