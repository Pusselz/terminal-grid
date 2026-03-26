const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = __dirname;
const outDir = path.join(root, '.vite', 'build');
fs.mkdirSync(outDir, { recursive: true });

// Build main process with esbuild
console.log('[dev] Building main process...');
execSync(
  'npx esbuild src/main/main.js --bundle --platform=node --outfile=.vite/build/main.js --external:electron --external:node-pty --format=cjs',
  { stdio: 'inherit', cwd: root }
);

// Build preload
console.log('[dev] Building preload...');
execSync(
  'npx esbuild src/preload/preload.js --bundle --platform=node --outfile=.vite/build/preload.js --external:electron --format=cjs',
  { stdio: 'inherit', cwd: root }
);

// Start Vite dev server for renderer
console.log('[dev] Starting Vite dev server...');
const vite = spawn('npx', ['vite', '--config', 'vite.renderer.config.mjs', 'src/renderer', '--port', '5173', '--strictPort'], {
  stdio: 'inherit',
  shell: true,
  cwd: root,
});

// Give Vite time to start, then launch Electron
setTimeout(() => {
  console.log('[dev] Starting Electron...');
  const electronBin = path.join(root, 'node_modules', 'electron', 'dist', 'electron.exe');
  const electron = spawn(electronBin, [path.join(outDir, 'main.js')], {
    stdio: 'inherit',
    cwd: root,
  });

  electron.on('close', (code) => {
    console.log('[dev] Electron exited with code', code);
    vite.kill();
    process.exit(code);
  });
}, 3000);

process.on('SIGINT', () => {
  vite.kill();
  process.exit();
});
