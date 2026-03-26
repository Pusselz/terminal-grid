import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import { createDirectoryPicker } from './directory-picker.js';

let idCounter = 0;

export function createTerminalPanel() {
  const panelId = `term-${Date.now()}-${idCounter++}`;
  let selectedCli = null;
  let selectedDir = '';
  let isRunning = false;
  let terminal = null;
  let fitAddon = null;
  let dataCleanup = null;
  let exitCleanup = null;

  const panel = document.createElement('div');
  panel.className = 'terminal-panel';
  panel.dataset.panelId = panelId;

  // --- Setup Mode ---
  const setup = document.createElement('div');
  setup.className = 'panel-setup';

  const dirPicker = createDirectoryPicker((dir) => {
    selectedDir = dir;
    updateStartBtn();
  });

  const cliSection = document.createElement('div');
  cliSection.className = 'setup-section';

  const cliLabel = document.createElement('div');
  cliLabel.className = 'setup-label';
  cliLabel.textContent = 'CLI Tool';

  const cliRow = document.createElement('div');
  cliRow.className = 'setup-cli-row';

  const claudeBtn = document.createElement('button');
  claudeBtn.className = 'cli-btn claude';
  claudeBtn.textContent = 'Claude';
  claudeBtn.addEventListener('click', () => {
    selectedCli = 'claude';
    claudeBtn.classList.add('selected');
    codexBtn.classList.remove('selected');
    updateStartBtn();
  });

  const codexBtn = document.createElement('button');
  codexBtn.className = 'cli-btn codex';
  codexBtn.textContent = 'Codex';
  codexBtn.addEventListener('click', () => {
    selectedCli = 'codex';
    codexBtn.classList.add('selected');
    claudeBtn.classList.remove('selected');
    updateStartBtn();
  });

  cliRow.appendChild(claudeBtn);
  cliRow.appendChild(codexBtn);
  cliSection.appendChild(cliLabel);
  cliSection.appendChild(cliRow);

  const startBtn = document.createElement('button');
  startBtn.className = 'setup-start-btn';
  startBtn.textContent = 'Starten';
  startBtn.disabled = true;
  startBtn.addEventListener('click', () => startTerminal());

  function updateStartBtn() {
    startBtn.disabled = !selectedDir || !selectedCli;
  }

  setup.appendChild(dirPicker.element);
  setup.appendChild(cliSection);
  setup.appendChild(startBtn);

  // --- Terminal Mode ---
  const header = document.createElement('div');
  header.className = 'panel-header';
  header.style.display = 'none';

  const panelInfo = document.createElement('div');
  panelInfo.className = 'panel-info';

  const cliBadge = document.createElement('span');
  cliBadge.className = 'panel-cli-badge';

  const pathLabel = document.createElement('span');
  pathLabel.className = 'panel-path';

  panelInfo.appendChild(cliBadge);
  panelInfo.appendChild(pathLabel);

  const killBtn = document.createElement('button');
  killBtn.className = 'panel-btn';
  killBtn.textContent = '\u2715';
  killBtn.title = 'Terminal beenden';
  killBtn.addEventListener('click', () => stopTerminal());

  header.appendChild(panelInfo);
  header.appendChild(killBtn);

  const body = document.createElement('div');
  body.className = 'panel-body';
  body.style.display = 'none';

  panel.appendChild(header);
  panel.appendChild(body);
  panel.appendChild(setup);

  // --- Terminal Logic ---
  async function startTerminal() {
    isRunning = true;
    setup.style.display = 'none';
    header.style.display = 'flex';
    body.style.display = 'block';

    cliBadge.textContent = selectedCli;
    cliBadge.className = `panel-cli-badge ${selectedCli}`;
    pathLabel.textContent = selectedDir;

    terminal = new Terminal({
      fontSize: 13,
      fontFamily: "'Cascadia Code', 'Consolas', monospace",
      theme: {
        background: '#30302e',
        foreground: '#d4d4d0',
        cursor: '#f77a7b',
        cursorAccent: '#30302e',
        selectionBackground: '#f77a7b30',
        selectionForeground: '#d4d4d0',
        black: '#3a3a37',
        red: '#f77a7b',
        green: '#6cc9a1',
        yellow: '#e8a96c',
        blue: '#6ca7e8',
        magenta: '#b07ce8',
        cyan: '#6cc9c9',
        white: '#d4d4d0',
        brightBlack: '#6a6a65',
        brightRed: '#f99495',
        brightGreen: '#86d9b5',
        brightYellow: '#f0c086',
        brightBlue: '#86bdf0',
        brightMagenta: '#c496f0',
        brightCyan: '#86d9d9',
        brightWhite: '#e4e4e2',
      },
      cursorBlink: true,
      allowProposedApi: true,
    });

    fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(body);

    try {
      const webglAddon = new WebglAddon();
      terminal.loadAddon(webglAddon);
    } catch (e) {
      // WebGL not available, canvas renderer is fine
    }

    fitAddon.fit();

    // IPC
    terminal.onData((data) => {
      window.terminalAPI.writePty(panelId, data);
    });

    dataCleanup = window.terminalAPI.onPtyData(({ id, data }) => {
      if (id === panelId && terminal) {
        terminal.write(data);
      }
    });

    exitCleanup = window.terminalAPI.onPtyExit(({ id }) => {
      if (id === panelId) {
        stopTerminal();
      }
    });

    await window.terminalAPI.createPty(panelId, {
      cwd: selectedDir,
      cli: selectedCli,
    });

    // Resize on fit
    const resizeObserver = new ResizeObserver(() => {
      if (fitAddon && terminal) {
        try {
          fitAddon.fit();
          const { cols, rows } = terminal;
          window.terminalAPI.resizePty(panelId, cols, rows);
        } catch (e) { /* ignore */ }
      }
    });
    resizeObserver.observe(body);
    panel._resizeObserver = resizeObserver;
  }

  function stopTerminal() {
    isRunning = false;
    window.terminalAPI.destroyPty(panelId);
    if (dataCleanup) dataCleanup();
    if (exitCleanup) exitCleanup();
    if (terminal) terminal.dispose();
    if (panel._resizeObserver) panel._resizeObserver.disconnect();
    terminal = null;
    fitAddon = null;

    header.style.display = 'none';
    body.style.display = 'none';
    body.innerHTML = '';
    setup.style.display = 'flex';
  }

  return {
    element: panel,
    id: panelId,
    isRunning: () => isRunning,
    getInfo: () => ({ cli: selectedCli, cwd: selectedDir }),
    destroy: () => {
      if (isRunning) {
        window.terminalAPI.destroyPty(panelId);
        if (dataCleanup) dataCleanup();
        if (exitCleanup) exitCleanup();
        if (terminal) terminal.dispose();
      }
      if (panel._resizeObserver) panel._resizeObserver.disconnect();
    },
    popout: () => {
      // Detach from grid, PTY stays alive, pop-out window takes over
      if (isRunning) {
        if (dataCleanup) dataCleanup();
        if (exitCleanup) exitCleanup();
        if (terminal) terminal.dispose();
        if (panel._resizeObserver) panel._resizeObserver.disconnect();
        terminal = null;
        window.terminalAPI.popoutTerminal(panelId, selectedCli, selectedDir);
      }
    },
  };
}
