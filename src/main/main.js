import { app, BrowserWindow } from 'electron';
import path from 'path';
import windowManager from './window-manager.js';
import ptyManager from './pty-manager.js';
import { registerHandlers } from './ipc-handlers.js';

process.on('uncaughtException', (e) => {
  console.error('Uncaught exception:', e);
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#1e1e2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  windowManager.setMainWindow(mainWindow);
  registerHandlers(mainWindow);

  // In dev mode, load from Vite dev server; in prod, load the built file
  const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
  if (process.env.NODE_ENV === 'production') {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  } else {
    mainWindow.loadURL(devServerUrl);
  }

  mainWindow.maximize();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  ptyManager.destroyAll();
  windowManager.destroyAll();
  app.quit();
});

app.on('before-quit', () => {
  ptyManager.destroyAll();
});
