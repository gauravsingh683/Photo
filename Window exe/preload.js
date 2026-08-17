const { contextBridge, ipcRenderer } = require('electron');

// Expose APIs to the renderer process
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', {
      getHardwareId: () => ipcRenderer.invoke('get-hardware-id'),
      getPrintersList: () => ipcRenderer.invoke('get-printers-list'),
      printSilent: (data) => ipcRenderer.send('print-silent', data),
      onPrintReply: (callback) => ipcRenderer.on('print-reply', (event, arg) => callback(arg)),
      onElectronLog: (callback) => ipcRenderer.on('electron-log', (event, arg) => callback(arg))
    });
  } catch (e) {
    console.error('Failed to expose context bridge:', e);
  }
} else {
  window.electronAPI = {
    getHardwareId: () => ipcRenderer.invoke('get-hardware-id'),
    getPrintersList: () => ipcRenderer.invoke('get-printers-list'),
    printSilent: (data) => ipcRenderer.send('print-silent', data),
    onPrintReply: (callback) => ipcRenderer.on('print-reply', (event, arg) => callback(arg)),
    onElectronLog: (callback) => ipcRenderer.on('electron-log', (event, arg) => callback(arg))
  };
}
