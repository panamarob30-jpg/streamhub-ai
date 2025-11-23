import { app, BrowserWindow, ipcMain, dialog, protocol } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;
let serverProcess;

// Start the Express server
function startServer() {
  const serverPath = join(__dirname, '..', 'server', 'index.js');
  serverProcess = spawn('node', [serverPath], {
    stdio: 'inherit',
    cwd: join(__dirname, '..', 'server')
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    backgroundColor: '#0f1115',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true, // Enable webview for streaming services
      partition: 'persist:streamhub' // Persist sessions for streaming logins
    },
    titleBarStyle: 'hiddenInset',
    frame: true,
    show: false
  });

  // Load the app
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for file system access
ipcMain.handle('select-media-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle('scan-media-folder', async (event, folderPath) => {
  try {
    const files = await scanDirectoryForMedia(folderPath);
    return files;
  } catch (error) {
    console.error('Error scanning folder:', error);
    return { error: error.message };
  }
});

ipcMain.handle('read-file-metadata', async (event, filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return {
      path: filePath,
      name: filePath.split('/').pop(),
      size: stats.size,
      modified: stats.mtime
    };
  } catch (error) {
    return { error: error.message };
  }
});

// Scan directory recursively for video files
async function scanDirectoryForMedia(dirPath, maxDepth = 3, currentDepth = 0) {
  const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v'];
  let mediaFiles = [];

  if (currentDepth > maxDepth) return mediaFiles;

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await scanDirectoryForMedia(fullPath, maxDepth, currentDepth + 1);
        mediaFiles = mediaFiles.concat(subFiles);
      } else if (entry.isFile()) {
        const ext = entry.name.toLowerCase().slice(entry.name.lastIndexOf('.'));
        if (videoExtensions.includes(ext)) {
          const stats = await fs.stat(fullPath);
          mediaFiles.push({
            path: fullPath,
            name: entry.name,
            size: stats.size,
            modified: stats.mtime,
            type: 'video'
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
  }

  return mediaFiles;
}

// Setup custom protocol for local files
app.whenReady().then(() => {
  // Register custom protocol for serving local video files
  protocol.registerFileProtocol('streamhub', (request, callback) => {
    const filePath = decodeURIComponent(request.url.replace('streamhub://', ''));
    callback({ path: filePath });
  });

  startServer();

  // Give server time to start
  setTimeout(() => {
    createWindow();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
