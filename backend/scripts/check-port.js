const net = require('net');

const PORT = process.env.PORT || 5000;

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true); // Port is available
      });
      server.close();
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false); // Port is in use
      } else {
        resolve(true); // Other error, assume available
      }
    });
  });
}

async function main() {
  console.log(`🔍 Checking port ${PORT}...\n`);
  
  const isAvailable = await checkPort(PORT);
  
  if (isAvailable) {
    console.log(`✅ Port ${PORT} is available`);
    console.log('   Backend server is NOT running');
    console.log('\n💡 To start backend server:');
    console.log('   cd backend');
    console.log('   npm start');
    console.log('   or');
    console.log('   npm run dev');
  } else {
    console.log(`⚠️  Port ${PORT} is already in use`);
    console.log('   Backend server might be running');
    console.log('\n💡 Check if backend is running:');
    console.log('   Open browser: http://localhost:5000/api/stores');
    console.log('   Or check running processes');
  }
}

main();





