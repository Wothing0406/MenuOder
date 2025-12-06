#!/usr/bin/env node

// Quick start script to check and start backend server

const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

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
        resolve(true);
      }
    });
  });
}

async function main() {
  console.log('🚀 Quick Start - Backend Server\n');
  
  const isAvailable = await checkPort(PORT);
  
  if (!isAvailable) {
    console.log(`⚠️  Port ${PORT} is already in use`);
    console.log('   Backend server might already be running');
    console.log('\n💡 Test if backend is working:');
    console.log(`   Open: http://localhost:${PORT}/api/stores`);
    console.log('\n💡 If backend is not working, stop it first:');
    console.log('   On Windows: Find Node.js process in Task Manager and end it');
    console.log('   Or restart your terminal');
    return;
  }
  
  console.log(`✅ Port ${PORT} is available`);
  console.log('   Starting backend server...\n');
  
  const backendProcess = spawn('node', [path.join(__dirname, '../src/index.js')], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
  });
  
  backendProcess.on('error', (error) => {
    console.error('❌ Error starting server:', error.message);
    process.exit(1);
  });
  
  backendProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error(`\n❌ Server exited with code ${code}`);
    }
    process.exit(code);
  });
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping server...');
    backendProcess.kill('SIGINT');
    process.exit(0);
  });
}

main();




