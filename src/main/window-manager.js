import { BrowserWindow } from 'electron';
import path from 'path';
import ptyManager from './pty-manager.js';

class WindowManager {
  constructor() {
    this.mainWindow = null;
    this.popouts = new Map();
  }

  setMainWindow(win) {
    this.mainWindow = win;
  }

  createPopout(terminalId, terminalInfo) {
    const popout = new BrowserWindow({
      width: 800,
      height: 600,
      title: `${terminalInfo.cli || 'Terminal'} - ${terminalInfo.cwd || ''}`,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
      backgroundColor: '#1e1e2e',
    });

    const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    if (process.env.NODE_ENV === 'production') {
      popout.loadFile(path.join(__dirname, '../renderer/index.html'), {
        query: { popout: terminalId },
      });
    } else {
      popout.loadURL(`${devServerUrl}?popout=${terminalId}`);
    }

    popout.webContents.once('did-finish-load', () => {
      ptyManager.setTarget(terminalId, popout.webContents);
    });

    popout.on('closed', () => {
      this.popouts.delete(terminalId);
      ptyManager.destroy(terminalId);
    });

    this.popouts.set(terminalId, popout);
    return popout;
  }

  destroyAll() {
    for (const [, win] of this.popouts) {
      if (!win.isDestroyed()) win.close();
    }
    this.popouts.clear();
  }
}

export default new WindowManager();
