import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations for local media
  selectMediaFolder: () => ipcRenderer.invoke('select-media-folder'),
  scanMediaFolder: (folderPath) => ipcRenderer.invoke('scan-media-folder', folderPath),
  readFileMetadata: (filePath) => ipcRenderer.invoke('read-file-metadata', filePath),

  // Check if running in Electron
  isElectron: true,

  // Platform info
  platform: process.platform
});
