const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('terminalAPI', {
  createPty: (id, opts) => ipcRenderer.invoke('pty:create', { id, ...opts }),
  writePty: (id, data) => ipcRenderer.send('pty:write', { id, data }),
  resizePty: (id, cols, rows) => ipcRenderer.invoke('pty:resize', { id, cols, rows }),
  destroyPty: (id) => ipcRenderer.invoke('pty:destroy', { id }),

  onPtyData: (callback) => {
    const handler = (event, payload) => callback(payload);
    ipcRenderer.on('pty:data', handler);
    return () => ipcRenderer.removeListener('pty:data', handler);
  },

  onPtyExit: (callback) => {
    const handler = (event, payload) => callback(payload);
    ipcRenderer.on('pty:exit', handler);
    return () => ipcRenderer.removeListener('pty:exit', handler);
  },

  selectDirectory: () => ipcRenderer.invoke('dialog:select-dir'),

  getFavorites: () => ipcRenderer.invoke('favorites:get'),
  addFavorite: (dirPath, label) => ipcRenderer.invoke('favorites:add', { path: dirPath, label }),
  removeFavorite: (dirPath) => ipcRenderer.invoke('favorites:remove', { path: dirPath }),

  popoutTerminal: (id, cli, cwd) => ipcRenderer.invoke('terminal:popout', { id, cli, cwd }),
});
