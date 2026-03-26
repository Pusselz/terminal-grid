import '@xterm/xterm/css/xterm.css';
import { initStartScreen } from './components/start-screen.js';
import { createTerminalGrid } from './components/terminal-grid.js';
import { createPopoutTerminal } from './components/popout-terminal.js';

const params = new URLSearchParams(window.location.search);
const popoutId = params.get('popout');

if (popoutId) {
  // Pop-out mode: single terminal
  document.getElementById('app').innerHTML = '<div id="popout-terminal" style="height:100%;width:100%"></div>';
  createPopoutTerminal(document.getElementById('popout-terminal'), popoutId);
} else {
  // Main mode: start screen + grid
  const COUNTS = [2, 3, 6, 8, 10];
  const startScreen = document.getElementById('start-screen');
  const toolbar = document.getElementById('toolbar');
  const gridContainer = document.getElementById('grid-container');
  const countButtonsContainer = document.getElementById('count-buttons');

  let grid = null;

  function showGrid(count) {
    startScreen.classList.add('hidden');
    toolbar.classList.remove('hidden');
    gridContainer.classList.remove('hidden');

    if (!grid) {
      grid = createTerminalGrid(gridContainer);
      initCountButtons();
    }

    grid.setCount(count);
    updateActiveCountButton(count);
  }

  function initCountButtons() {
    for (const count of COUNTS) {
      const btn = document.createElement('button');
      btn.className = 'count-btn';
      btn.textContent = count;
      btn.dataset.count = count;
      btn.addEventListener('click', () => {
        grid.setCount(count);
        updateActiveCountButton(count);
      });
      countButtonsContainer.appendChild(btn);
    }
  }

  function updateActiveCountButton(activeCount) {
    const buttons = countButtonsContainer.querySelectorAll('.count-btn');
    buttons.forEach((btn) => {
      btn.classList.toggle('active', parseInt(btn.dataset.count) === activeCount);
    });
  }

  initStartScreen(startScreen, showGrid);
}
