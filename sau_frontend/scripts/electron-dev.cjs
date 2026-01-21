const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Vite server and Electron app...');

// 解决Windows中文乱码的核心配置
const spawnOptions = {
  cwd: __dirname,
  stdio: 'pipe', // 先接管输出，再转码
  shell: true,
  // 设置环境变量，强制使用UTF-8编码
  env: {
    ...process.env,
    LANG: 'zh_CN.UTF-8',
    LC_ALL: 'zh_CN.UTF-8',
    PYTHONIOENCODING: 'UTF-8',
    NODE_ENV: process.env.NODE_ENV || 'development'
  }
};

// 启动 Vite 开发服务器
const viteProcess = spawn('npm', ['run', 'dev'], spawnOptions);

// 处理Vite进程的输出转码
viteProcess.stdout.on('data', (data) => {
  // 将GBK(GB2312)编码转为UTF-8
  const output = Buffer.from(data, 'binary').toString('utf8');
  console.log(output);
});

viteProcess.stderr.on('data', (data) => {
  const error = Buffer.from(data, 'binary').toString('utf8');
  console.error(error);
});

// 等待 Vite 服务器启动
setTimeout(() => {
  // 启动 Electron 应用的配置（继承编码配置）
  const electronSpawnOptions = {
    ...spawnOptions,
    cwd: path.resolve(__dirname, '..')
  };

  // 启动 Electron 应用
  const electronProcess = spawn('npm', ['run', 'electron:serve'], electronSpawnOptions);

  // 处理Electron进程的输出转码
  electronProcess.stdout.on('data', (data) => {
    const output = Buffer.from(data, 'binary').toString('utf8');
    console.log(output);
  });

  electronProcess.stderr.on('data', (data) => {
    const error = Buffer.from(data, 'binary').toString('utf8');
    console.error(error);
  });

  electronProcess.on('close', (code) => {
    console.log(`Electron process exited with code ${code}`);
    // 关闭Vite进程
    viteProcess.kill();
    process.exit(code);
  });
}, 3000); // 等待3秒让Vite服务器启动

viteProcess.on('close', (code) => {
  console.log(`Vite process exited with code ${code}`);
});

// 捕获进程退出信号，确保子进程都被关闭
process.on('SIGINT', () => {
  viteProcess.kill();
  process.exit(0);
});