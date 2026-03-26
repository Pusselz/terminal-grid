export const TERMINAL_COUNTS = [2, 3, 6, 8, 10];

export const GRID_LAYOUTS = {
  2:  { rows: 1, cols: 2 },
  3:  { rows: 1, cols: 3 },
  6:  { rows: 2, cols: 3 },
  8:  { rows: 2, cols: 4 },
  10: { rows: 2, cols: 5 },
};

export const CLI_TOOLS = {
  claude: { name: 'Claude', command: 'claude' },
  codex:  { name: 'Codex',  command: 'codex' },
};

export const IPC = {
  PTY_CREATE:      'pty:create',
  PTY_WRITE:       'pty:write',
  PTY_RESIZE:      'pty:resize',
  PTY_DESTROY:     'pty:destroy',
  PTY_DATA:        'pty:data',
  PTY_EXIT:        'pty:exit',
  DIALOG_SELECT:   'dialog:select-dir',
  FAVORITES_GET:   'favorites:get',
  FAVORITES_ADD:   'favorites:add',
  FAVORITES_REMOVE:'favorites:remove',
  TERMINAL_POPOUT: 'terminal:popout',
  GRID_SET_COUNT:  'grid:set-count',
};
