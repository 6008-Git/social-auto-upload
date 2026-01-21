// main.cjs
const { app, BrowserWindow, protocol} = require('electron')
const path = require('path')

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
        }
    })

    if (isDev) {
        // 开发模式下连接到 Vite 开发服务器
        win.loadURL('http://localhost:5173').then(r => (
            console.log("项目加载成功")
        )).catch(e => (
            console.log("项目加载失败", e)
        ));
        
        // 打开开发者工具
        win.webContents.openDevTools();
    } else {
        // 生产模式下加载构建好的文件
        win.loadFile(path.join(__dirname, '../dist/index.html')).then(r => (
            console.log("项目加载成功")
        )).catch(e => (
            console.log("项目加载失败", e)
        ))
    }

}

// 应用就绪后初始化
app.whenReady().then(()=>{
    createWindow()
})

// 关闭所有窗口时退出应用（macOS 除外）
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// macOS 点击 Dock 图标重新创建窗口
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})


