// Script này có thể paste vào browser console để test login
// Truy cập http://localhost:3000/login và mở F12 Console, paste đoạn code này:

async function testLogin() {
  console.log('🔍 Testing login from browser...');

  try {
    const response = await fetch('http://localhost:5005/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Id': 'test-device-browser'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: '123456'
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ Login successful!');
      console.log('📋 Response:', data);
      console.log('🔑 Token:', data.data.token);

      // Test API với token
      console.log('📊 Testing anti-spam API with token...');
      const statsResponse = await fetch('http://localhost:5005/api/anti-spam/stats', {
        headers: {
          'Authorization': `Bearer ${data.data.token}`,
          'X-Device-Id': 'test-device-browser'
        }
      });

      const statsData = await statsResponse.json();
      console.log('📈 Anti-spam stats:', statsData);

    } else {
      console.error('❌ Login failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Chạy test
testLogin();
