/**
 * Script kiểm tra backend có lỗi không
 * Chạy: node scripts/check-backend.js
 */

require('dotenv').config();
const path = require('path');

console.log('🔍 Kiểm tra Backend...\n');

let hasError = false;

// 1. Kiểm tra các file quan trọng
console.log('1️⃣ Kiểm tra các file quan trọng...');
try {
  require('../src/utils/bankAccountVerification.js');
  console.log('   ✅ bankAccountVerification.js');
} catch (error) {
  console.error('   ❌ bankAccountVerification.js:', error.message);
  hasError = true;
}

try {
  require('../src/controllers/paymentAccountController.js');
  console.log('   ✅ paymentAccountController.js');
} catch (error) {
  console.error('   ❌ paymentAccountController.js:', error.message);
  hasError = true;
}

try {
  require('../src/controllers/bankTransferController.js');
  console.log('   ✅ bankTransferController.js');
} catch (error) {
  console.error('   ❌ bankTransferController.js:', error.message);
  hasError = true;
}

try {
  require('../src/routes/paymentAccountRoutes.js');
  console.log('   ✅ paymentAccountRoutes.js');
} catch (error) {
  console.error('   ❌ paymentAccountRoutes.js:', error.message);
  hasError = true;
}

try {
  require('../src/routes/publicPaymentRoutes.js');
  console.log('   ✅ publicPaymentRoutes.js');
} catch (error) {
  console.error('   ❌ publicPaymentRoutes.js:', error.message);
  hasError = true;
}

// 2. Kiểm tra dependencies
console.log('\n2️⃣ Kiểm tra dependencies...');
try {
  require('axios');
  console.log('   ✅ axios');
} catch (error) {
  console.error('   ❌ axios chưa được cài đặt. Chạy: npm install');
  hasError = true;
}

// 3. Kiểm tra biến môi trường
console.log('\n3️⃣ Kiểm tra biến môi trường...');
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const optionalEnvVars = ['VIETQR_API_ID', 'VIETQR_API_KEY'];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName}`);
  } else {
    console.log(`   ⚠️  ${varName} chưa được set (có thể dùng DATABASE_URL thay thế)`);
  }
});

optionalEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName} (optional)`);
  } else {
    console.log(`   ℹ️  ${varName} chưa được set (optional - không bắt buộc)`);
  }
});

// 4. Kiểm tra cấu trúc Express app
console.log('\n4️⃣ Kiểm tra Express app...');
try {
  const app = require('../src/index.js');
  console.log('   ✅ Express app được load thành công');
} catch (error) {
  console.error('   ❌ Lỗi khi load Express app:', error.message);
  console.error('   Stack:', error.stack);
  hasError = true;
}

// 5. Kiểm tra port
console.log('\n5️⃣ Kiểm tra port...');
const PORT = process.env.PORT || 5002;
console.log(`   Port: ${PORT}`);

// Kết quả
console.log('\n' + '='.repeat(50));
if (hasError) {
  console.log('❌ Có lỗi phát hiện được!');
  console.log('   Vui lòng sửa các lỗi trên trước khi chạy server.');
  process.exit(1);
} else {
  console.log('✅ Không có lỗi phát hiện được!');
  console.log('   Bạn có thể chạy server bằng: npm start');
  process.exit(0);
}


 * Script kiểm tra backend có lỗi không
 * Chạy: node scripts/check-backend.js
 */

require('dotenv').config();
const path = require('path');

console.log('🔍 Kiểm tra Backend...\n');

let hasError = false;

// 1. Kiểm tra các file quan trọng
console.log('1️⃣ Kiểm tra các file quan trọng...');
try {
  require('../src/utils/bankAccountVerification.js');
  console.log('   ✅ bankAccountVerification.js');
} catch (error) {
  console.error('   ❌ bankAccountVerification.js:', error.message);
  hasError = true;
}

try {
  require('../src/controllers/paymentAccountController.js');
  console.log('   ✅ paymentAccountController.js');
} catch (error) {
  console.error('   ❌ paymentAccountController.js:', error.message);
  hasError = true;
}

try {
  require('../src/controllers/bankTransferController.js');
  console.log('   ✅ bankTransferController.js');
} catch (error) {
  console.error('   ❌ bankTransferController.js:', error.message);
  hasError = true;
}

try {
  require('../src/routes/paymentAccountRoutes.js');
  console.log('   ✅ paymentAccountRoutes.js');
} catch (error) {
  console.error('   ❌ paymentAccountRoutes.js:', error.message);
  hasError = true;
}

try {
  require('../src/routes/publicPaymentRoutes.js');
  console.log('   ✅ publicPaymentRoutes.js');
} catch (error) {
  console.error('   ❌ publicPaymentRoutes.js:', error.message);
  hasError = true;
}

// 2. Kiểm tra dependencies
console.log('\n2️⃣ Kiểm tra dependencies...');
try {
  require('axios');
  console.log('   ✅ axios');
} catch (error) {
  console.error('   ❌ axios chưa được cài đặt. Chạy: npm install');
  hasError = true;
}

// 3. Kiểm tra biến môi trường
console.log('\n3️⃣ Kiểm tra biến môi trường...');
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const optionalEnvVars = ['VIETQR_API_ID', 'VIETQR_API_KEY'];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName}`);
  } else {
    console.log(`   ⚠️  ${varName} chưa được set (có thể dùng DATABASE_URL thay thế)`);
  }
});

optionalEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName} (optional)`);
  } else {
    console.log(`   ℹ️  ${varName} chưa được set (optional - không bắt buộc)`);
  }
});

// 4. Kiểm tra cấu trúc Express app
console.log('\n4️⃣ Kiểm tra Express app...');
try {
  const app = require('../src/index.js');
  console.log('   ✅ Express app được load thành công');
} catch (error) {
  console.error('   ❌ Lỗi khi load Express app:', error.message);
  console.error('   Stack:', error.stack);
  hasError = true;
}

// 5. Kiểm tra port
console.log('\n5️⃣ Kiểm tra port...');
const PORT = process.env.PORT || 5002;
console.log(`   Port: ${PORT}`);

// Kết quả
console.log('\n' + '='.repeat(50));
if (hasError) {
  console.log('❌ Có lỗi phát hiện được!');
  console.log('   Vui lòng sửa các lỗi trên trước khi chạy server.');
  process.exit(1);
} else {
  console.log('✅ Không có lỗi phát hiện được!');
  console.log('   Bạn có thể chạy server bằng: npm start');
  process.exit(0);
}





























