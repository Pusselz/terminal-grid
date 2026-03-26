const COUNTS = [2, 3, 6, 8, 10];

export function initStartScreen(container, onSelect) {
  const title = document.createElement('div');
  title.className = 'start-title';
  title.textContent = 'Terminal Grid';

  const subtitle = document.createElement('div');
  subtitle.className = 'start-subtitle';
  subtitle.textContent = 'Wie viele Terminals möchtest du öffnen?';

  const buttons = document.createElement('div');
  buttons.className = 'start-buttons';

  for (const count of COUNTS) {
    const btn = document.createElement('button');
    btn.className = 'start-btn';
    btn.textContent = count;
    btn.addEventListener('click', () => onSelect(count));
    buttons.appendChild(btn);
  }

  container.appendChild(title);
  container.appendChild(subtitle);
  container.appendChild(buttons);
}
