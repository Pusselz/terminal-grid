import { ipcMain, dialog } from 'electron';
import ptyManager from './pty-manager.js';
import windowManager from './window-manager.js';
import { getFavorites, addFavorite, removeFavorite } from './favorites-store.js';

export function registerHandlers(mainWindow) {
  ipcMain.handle('pty:create', (event, { id, cwd, cli, yolo }) => {
    ptyManager.create(id, { cwd, cli, yolo }, mainWindow.webContents);
  });

  ipcMain.on('pty:write', (event, { id, data }) => {
    ptyManager.write(id, data);
  });

  ipcMain.handle('pty:resize', (event, { id, cols, rows }) => {
    ptyManager.resize(id, cols, rows);
  });

  ipcMain.handle('pty:destroy', (event, { id }) => {
    ptyManager.destroy(id);
  });

  ipcMain.handle('dialog:select-dir', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    });
    if (result.canceled) return null;
    return result.filePaths[0];
  });

  ipcMain.handle('favorites:get', () => getFavorites());
  ipcMain.handle('favorites:add', (event, { path, label }) => addFavorite(path, label));
  ipcMain.handle('favorites:remove', (event, { path }) => removeFavorite(path));

  ipcMain.handle('terminal:popout', (event, { id, cli, cwd }) => {
    windowManager.createPopout(id, { cli, cwd });
  });
}
