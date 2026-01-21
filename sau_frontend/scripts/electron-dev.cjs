const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Vite server and Electron app...');

// 启动 Vite 开发服务器
const viteProcess = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

// 等待 Vite 服务器启动
setTimeout(() => {
  // 启动 Electron 应用
  const electronProcess = spawn('npm', ['run', 'electron:serve'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    shell: true
  });

  electronProcess.on('close', (code) => {
    console.log(`Electron process exited with code ${code}`);
    process.exit(code);
  });
}, 3000); // 等待3秒让Vite服务器启动

viteProcess.on('close', (code) => {
  console.log(`Vite process exited with code ${code}`);
});