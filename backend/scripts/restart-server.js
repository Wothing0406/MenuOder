#!/usr/bin/env node

// Script to restart backend server

const { exec } = require('child_process');
const net = require('net');

const PORT = process.env.PORT || 5000;

function killProcessOnPort(port) {
  return new Promise((resolve) => {
    if (process.platform === 'win32') {
      // Windows
      exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
        if (error || !stdout) {
          resolve(false);
          return;
        }
        
        const lines = stdout.trim().split('\n');
        const pids = new Set();
        
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length > 0) {
            const pid = parts[parts.length - 1];
            if (pid && !isNaN(pid)) {
              pids.add(pid);
            }
          }
        });
        
        if (pids.size === 0) {
          resolve(false);
          return;
        }
        
        console.log(`🔍 Found ${pids.size} process(es) on port ${port}`);
        
        let killed = 0;
        pids.forEach(pid => {
          exec(`taskkill /PID ${pid} /F`, (err) => {
            if (!err) {
              killed++;
              console.log(`✅ Killed process ${pid}`);
            }
            if (killed === pids.size) {
              setTimeout(() => resolve(true), 500);
            }
          });
        });
      });
    } else {
      // Linux/Mac
      exec(`lsof -ti:${port} | xargs kill -9`, (error) => {
        resolve(!error);
      });
    }
  });
}

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

async function main() {
  console.log('🔄 Restarting Backend Server...\n');
  
  // Check if port is in use
  const isAvailable = await checkPort(PORT);
  
  if (!isAvailable) {
    console.log(`⚠️  Port ${PORT} is in use. Attempting to free it...\n`);
    const killed = await killProcessOnPort(PORT);
    
    if (killed) {
      console.log('\n✅ Port freed. Waiting 1 second...\n');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log('\n⚠️  Could not free port. Please manually stop the process.\n');
    }
  }
  
  // Check again
  const nowAvailable = await checkPort(PORT);
  
  if (!nowAvailable) {
    console.log(`❌ Port ${PORT} is still in use.`);
    console.log('\n💡 Manual steps:');
    console.log('   1. Open Task Manager (Ctrl + Shift + Esc)');
    console.log('   2. Find "Node.js" process');
    console.log('   3. End Task');
    console.log('   4. Then run: npm start');
    process.exit(1);
  }
  
  console.log(`✅ Port ${PORT} is now available`);
  console.log('🚀 Starting backend server...\n');
  
  // Start server
  const { spawn } = require('child_process');
  const path = require('path');
  
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
    if (code !== 0 && code !== null) {
      console.error(`\n❌ Server exited with code ${code}`);
    }
  });
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping server...');
    backendProcess.kill('SIGINT');
    process.exit(0);
  });
}

main();




