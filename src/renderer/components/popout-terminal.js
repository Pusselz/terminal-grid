import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';

export function createPopoutTerminal(container, terminalId) {
  const terminal = new Terminal({
    fontSize: 14,
    fontFamily: "'Cascadia Code', 'Consolas', monospace",
    theme: {
      background: '#30302e',
      foreground: '#d4d4d0',
      cursor: '#f77a7b',
      cursorAccent: '#30302e',
      selectionBackground: '#f77a7b30',
      black: '#3a3a37',
      red: '#f77a7b',
      green: '#6cc9a1',
      yellow: '#e8a96c',
      blue: '#6ca7e8',
      magenta: '#b07ce8',
      cyan: '#6cc9c9',
      white: '#d4d4d0',
    },
    cursorBlink: true,
    allowProposedApi: true,
  });

  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.open(container);

  try {
    terminal.loadAddon(new WebglAddon());
  } catch (e) {}

  fitAddon.fit();

  terminal.onData((data) => {
    window.terminalAPI.writePty(terminalId, data);
  });

  window.terminalAPI.onPtyData(({ id, data }) => {
    if (id === terminalId) {
      terminal.write(data);
    }
  });

  window.addEventListener('resize', () => {
    fitAddon.fit();
    const { cols, rows } = terminal;
    window.terminalAPI.resizePty(terminalId, cols, rows);
  });
}
