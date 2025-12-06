const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

async function testValidateAddress() {
  const testAddresses = [
    '123 Nguyễn Huệ, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    'Hội An, Quảng Nam',
    'Đà Nẵng',
    '123 ABC Street, Invalid City' // Should fail
  ];

  console.log('🧪 Testing Address Validation API...');
  console.log('API URL:', API_URL);
  console.log('');

  for (let i = 0; i < testAddresses.length; i++) {
    const address = testAddresses[i];
    console.log(`${i + 1}️⃣ Testing address: "${address}"`);
    
    try {
      const response = await axios.post(`${API_URL}/orders/validate-address`, {
        address: address
      });

      console.log('✅ Status:', response.status);
      console.log('✅ Success:', response.data.success);
      if (response.data.success) {
        console.log('   Original:', response.data.data.originalAddress);
        console.log('   Validated:', response.data.data.validatedAddress);
        console.log('   Coordinates:', response.data.data.coordinates);
        console.log('   Has house number:', response.data.data.hasHouseNumber);
        console.log('   Similarity:', (response.data.data.similarity * 100).toFixed(1) + '%');
        if (response.data.data.warning) {
          console.log('   ⚠️  Warning:', response.data.data.warning);
        }
      }
    } catch (error) {
      console.log('❌ Failed');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data?.message || error.message);
      } else if (error.request) {
        console.log('   Network Error: No response received');
        console.log('   Is the backend server running?');
      } else {
        console.log('   Error:', error.message);
      }
    }
    
    console.log('');
    
    // Wait 1 second between requests to respect rate limit
    if (i < testAddresses.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('✨ Test completed!');
}

testValidateAddress().catch(console.error);




