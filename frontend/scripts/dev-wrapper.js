#!/usr/bin/env node

// Wrapper script to suppress Watchpack errors on Windows
// These are harmless warnings when Next.js file watcher tries to access system files

const { spawn } = require('child_process');
const path = require('path');

// Filter function to suppress Watchpack errors
function shouldSuppressLine(line) {
  const lineStr = line.toString();
  return lineStr.includes('Watchpack Error') && 
         (lineStr.includes('System Volume Information') ||
          lineStr.includes('System Repair') ||
          lineStr.includes('hiberfil.sys') ||
          lineStr.includes('pagefile.sys') ||
          lineStr.includes('swapfile.sys') ||
          lineStr.includes('DumpStack.log.tmp') ||
          lineStr.includes('EINVAL: invalid argument'));
}

// Spawn Next.js dev server
// Use cross-platform approach
const isWindows = process.platform === 'win32';
const nextBin = isWindows 
  ? path.join(__dirname, '../node_modules/.bin/next.cmd')
  : path.join(__dirname, '../node_modules/.bin/next');

const nextDev = spawn(isWindows ? nextBin : 'node', isWindows ? ['dev'] : [nextBin, 'dev'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: isWindows, // Use shell on Windows for .cmd files
  env: { ...process.env }
});

// Filter stdout
nextDev.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (!shouldSuppressLine(line) && line.trim()) {
      process.stdout.write(line + '\n');
    }
  });
});

// Filter stderr
nextDev.stderr.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (!shouldSuppressLine(line) && line.trim()) {
      process.stderr.write(line + '\n');
    }
  });
});

// Handle process exit
nextDev.on('close', (code) => {
  process.exit(code);
});

// Handle errors
nextDev.on('error', (error) => {
  console.error('Error starting Next.js dev server:', error);
  process.exit(1);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  nextDev.kill('SIGINT');
});

process.on('SIGTERM', () => {
  nextDev.kill('SIGTERM');
});

