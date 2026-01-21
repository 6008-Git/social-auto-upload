// preload.cjs
const { contextBridge } = require('electron')


// const path = require('path');
// 示例：暴露版本信息给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
    nodeVersion: process.versions.node,
    chromeVersion: process.versions.chrome,
    electronVersion: process.versions.electron,
})



