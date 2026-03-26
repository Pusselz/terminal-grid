# Terminal Grid

A desktop app for running multiple AI coding CLI tools side by side. View 2, 3, 6, 8, or 10 terminals simultaneously in an auto-arranged grid — no window management needed.

Built for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and [Codex CLI](https://github.com/openai/codex), but works with any CLI tool.

![Terminal Grid](https://img.shields.io/badge/platform-windows-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Grid Layout** — Choose 2, 3, 6, 8, or 10 terminals. They auto-arrange to fill your screen.
- **One-Click CLI Launch** — Select a directory, pick Claude or Codex, hit Start.
- **Favorite Directories** — Save frequently used project paths for quick access.
- **Live Resizing** — Change the terminal count on the fly. Active terminals are preserved.
- **Pop-Out Windows** — When reducing the grid count, active terminals pop out into their own windows instead of being killed.
- **Real Terminal Emulation** — Full PTY support via node-pty. Colors, interactive prompts, everything works.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (for node-pty native compilation)
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (Windows, "Desktop development with C++" workload)

### Setup

```bash
git clone https://github.com/Pusselz/terminal-grid.git
cd terminal-grid
npm install
```

> **Note:** `node-pty` requires native compilation. If the postinstall rebuild fails, run manually:
> ```bash
> npx electron-rebuild -f -w node-pty
> ```
> On some Windows setups you may need to patch `node_modules/node-pty/deps/winpty/src/winpty.gyp` and `node_modules/node-pty/binding.gyp` to remove Spectre mitigation flags if the corresponding MSVC libraries aren't installed.

### Run

```bash
npm start
```

## Usage

1. Launch the app — you'll see a start screen asking how many terminals you want.
2. Pick a number (e.g. 6). Six equal-sized terminal panels appear.
3. In each panel:
   - Click **Durchsuchen** (Browse) to select a working directory, or pick from your favorites.
   - Choose **Claude** or **Codex**.
   - Click **Starten** (Start).
4. Use the toolbar buttons at the top to change the grid count at any time.

## Tech Stack

- **Electron** — Multi-window desktop app
- **node-pty** — Native PTY (pseudo-terminal) on Windows via ConPTY
- **xterm.js** — Terminal rendering (with WebGL acceleration)
- **electron-store** — Persistent favorite directories
- **esbuild** — Fast main process bundling
- **Vite** — Renderer dev server

## Project Structure

```
src/
  main/
    main.js              # Electron app entry
    pty-manager.js       # PTY lifecycle (spawn, write, resize, kill)
    window-manager.js    # Pop-out window management
    favorites-store.js   # Persistent directory favorites
    ipc-handlers.js      # All IPC channel handlers
  preload/
    preload.js           # Secure context bridge API
  renderer/
    index.html           # Main HTML
    app.js               # Renderer entry (grid + popout modes)
    styles/              # CSS
    components/
      start-screen.js    # Initial terminal count selector
      terminal-grid.js   # Grid layout engine
      terminal-panel.js  # Individual terminal panel
      directory-picker.js # Directory selection + favorites
      popout-terminal.js # Pop-out terminal renderer
```

## License

MIT
