import { createTerminalPanel } from './terminal-panel.js';

const GRID_LAYOUTS = {
  2:  { rows: 1, cols: 2 },
  3:  { rows: 1, cols: 3 },
  6:  { rows: 2, cols: 3 },
  8:  { rows: 2, cols: 4 },
  10: { rows: 2, cols: 5 },
};

export function createTerminalGrid(container) {
  let panels = [];
  let currentCount = 0;

  function applyGridLayout(count) {
    const layout = GRID_LAYOUTS[count];
    if (!layout) return;
    container.style.gridTemplateColumns = `repeat(${layout.cols}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${layout.rows}, 1fr)`;
  }

  function setCount(count) {
    if (count === currentCount) return;

    if (count > currentCount) {
      // Add new panels
      const toAdd = count - currentCount;
      for (let i = 0; i < toAdd; i++) {
        const panel = createTerminalPanel();
        panels.push(panel);
        container.appendChild(panel.element);
      }
    } else {
      // Remove panels from the end
      const toRemove = currentCount - count;
      for (let i = 0; i < toRemove; i++) {
        const panel = panels.pop();
        if (panel.isRunning()) {
          // Pop out active terminals
          panel.popout();
        } else {
          panel.destroy();
        }
        container.removeChild(panel.element);
      }
    }

    currentCount = count;
    applyGridLayout(count);
  }

  return {
    setCount,
    getCount: () => currentCount,
    getPanels: () => panels,
  };
}
