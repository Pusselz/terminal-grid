export function createDirectoryPicker(onDirChange) {
  let currentDir = '';
  let favorites = [];

  const container = document.createElement('div');
  container.className = 'setup-section';

  const label = document.createElement('div');
  label.className = 'setup-label';
  label.textContent = 'Arbeitsverzeichnis';

  const dirRow = document.createElement('div');
  dirRow.className = 'setup-dir-row';

  const input = document.createElement('input');
  input.className = 'setup-dir-input';
  input.placeholder = 'Ordner auswählen oder Pfad eingeben...';
  input.addEventListener('change', () => {
    currentDir = input.value;
    onDirChange(currentDir);
    updateFavBtn();
  });

  const browseBtn = document.createElement('button');
  browseBtn.className = 'setup-browse-btn';
  browseBtn.textContent = 'Durchsuchen';
  browseBtn.addEventListener('click', async () => {
    const dir = await window.terminalAPI.selectDirectory();
    if (dir) {
      currentDir = dir;
      input.value = dir;
      onDirChange(dir);
      updateFavBtn();
    }
  });

  const favBtn = document.createElement('button');
  favBtn.className = 'setup-fav-btn';
  favBtn.textContent = '\u2606';
  favBtn.title = 'Als Favorit speichern';
  favBtn.addEventListener('click', async () => {
    if (!currentDir) return;
    const isFav = favorites.some((f) => f.path === currentDir);
    if (isFav) {
      favorites = await window.terminalAPI.removeFavorite(currentDir);
    } else {
      favorites = await window.terminalAPI.addFavorite(currentDir);
    }
    updateFavBtn();
    renderFavorites();
  });

  dirRow.appendChild(input);
  dirRow.appendChild(browseBtn);
  dirRow.appendChild(favBtn);

  // Favorites section
  const favLabel = document.createElement('div');
  favLabel.className = 'setup-label';
  favLabel.textContent = 'Favoriten';
  favLabel.style.marginTop = '8px';

  const favList = document.createElement('div');
  favList.className = 'favorites-dropdown';

  function updateFavBtn() {
    const isFav = favorites.some((f) => f.path === currentDir);
    favBtn.textContent = isFav ? '\u2605' : '\u2606';
    favBtn.classList.toggle('is-fav', isFav);
  }

  function renderFavorites() {
    favList.innerHTML = '';
    if (favorites.length === 0) {
      const msg = document.createElement('div');
      msg.className = 'no-favs-msg';
      msg.textContent = 'Keine Favoriten gespeichert';
      favList.appendChild(msg);
      return;
    }
    for (const fav of favorites) {
      const item = document.createElement('div');
      item.className = 'fav-item';

      const pathEl = document.createElement('span');
      pathEl.className = 'fav-item-path';
      pathEl.textContent = fav.path;

      const labelEl = document.createElement('span');
      labelEl.className = 'fav-item-label';
      labelEl.textContent = fav.label;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'fav-remove-btn';
      removeBtn.textContent = '\u2715';
      removeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        favorites = await window.terminalAPI.removeFavorite(fav.path);
        updateFavBtn();
        renderFavorites();
      });

      item.appendChild(labelEl);
      item.appendChild(pathEl);
      item.appendChild(removeBtn);

      item.addEventListener('click', () => {
        currentDir = fav.path;
        input.value = fav.path;
        onDirChange(fav.path);
        updateFavBtn();
      });

      favList.appendChild(item);
    }
  }

  // Load favorites on init
  window.terminalAPI.getFavorites().then((favs) => {
    favorites = favs;
    renderFavorites();
  });

  container.appendChild(label);
  container.appendChild(dirRow);
  container.appendChild(favLabel);
  container.appendChild(favList);

  return {
    element: container,
    getDir: () => currentDir,
  };
}
