const { app, BrowserWindow, protocol } = require('electron')
const path = require('path')
const fs = require('fs')

// ========== 解决中文乱码核心配置 ==========
// 1. 设置Node.js控制台编码为UTF-8
process.env.LANG = 'zh_CN.UTF-8'
process.env.LC_ALL = 'zh_CN.UTF-8'
// 2. 修复Windows下文件路径中文解析问题
app.commandLine.appendSwitch('disable-encoding-detection')

// 检查是否为开发模式
const isDev = !app.isPackaged;

// 创建窗口函数
function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false, // 安全设置
            contextIsolation: true,
            enableRemoteModule: true,
            // 3. 强制网页内容编码为UTF-8
            webSecurity: false, // 仅开发环境，避免静态资源跨域+编码问题
            defaultEncoding: 'utf-8'
        },
        autoHideMenuBar: true, // 自动隐藏菜单栏（按Alt键才会临时显示）
    })

    // 4. 统一日志输出编码（转义中文）
    const logSuccess = (msg) => {
        console.log(Buffer.from(msg, 'utf-8').toString('utf-8'));
    }
    const logError = (msg, e) => {
        const errorMsg = e ? `${msg}：${e.toString()}` : msg;
        console.error(Buffer.from(errorMsg, 'utf-8').toString('utf-8'));
    }

    if (isDev) {
        // 开发模式下连接到 Vite 开发服务器
        win.loadURL('http://localhost:5173')
            .then(() => logSuccess("项目加载成功"))
            .catch((e) => logError("项目加载失败", e));

        // 打开开发者工具
        // win.webContents.openDevTools();
    } else {
        // 生产模式下加载构建好的文件（强制UTF-8读取）
        const htmlPath = path.join(__dirname, '../dist/index.html');
        // 验证文件存在并强制编码读取
        fs.readFile(htmlPath, 'utf8', (err) => {
            if (err) logError("读取dist文件失败", err);
        });

        win.loadFile(htmlPath, { encoding: 'utf-8' })
            .then(() => logSuccess("项目加载成功"))
            .catch((e) => logError("项目加载失败", e));
    }

}

// 应用就绪后初始化
app.whenReady().then(createWindow)

// 关闭所有窗口时退出应用（macOS 除外）
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// macOS 点击 Dock 图标重新创建窗口
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})