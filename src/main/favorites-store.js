import Store from 'electron-store';

const store = new Store({
  defaults: {
    favorites: [],
  },
});

export function getFavorites() {
  return store.get('favorites', []);
}

export function addFavorite(dirPath, label) {
  const favorites = store.get('favorites', []);
  if (!favorites.find((f) => f.path === dirPath)) {
    favorites.push({ path: dirPath, label: label || dirPath.split(/[\\/]/).pop() });
    store.set('favorites', favorites);
  }
  return favorites;
}

export function removeFavorite(dirPath) {
  const favorites = store.get('favorites', []).filter((f) => f.path !== dirPath);
  store.set('favorites', favorites);
  return favorites;
}
