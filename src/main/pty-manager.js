import * as pty from 'node-pty';

class PtyManager {
  constructor() {
    this.ptys = new Map();
    this.targets = new Map();
  }

  create(id, { cwd, cli }, webContents) {
    if (this.ptys.has(id)) {
      this.destroy(id);
    }

    const shell = process.env.COMSPEC || 'cmd.exe';

    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: cwd || process.env.USERPROFILE,
      env: {
        ...process.env,
        TERM: 'xterm-256color',
        COLORTERM: 'truecolor',
      },
    });

    this.ptys.set(id, { process: ptyProcess, cli, cwd });
    this.targets.set(id, webContents);

    // Single onData handler: forwards data AND launches CLI on first output
    let launched = !cli;
    ptyProcess.onData((data) => {
      if (!launched) {
        launched = true;
        ptyProcess.write(`${cli}\r`);
      }

      const target = this.targets.get(id);
      if (target && !target.isDestroyed()) {
        target.send('pty:data', { id, data });
      }
    });

    ptyProcess.onExit(({ exitCode }) => {
      const target = this.targets.get(id);
      if (target && !target.isDestroyed()) {
        target.send('pty:exit', { id, exitCode });
      }
      this.ptys.delete(id);
      this.targets.delete(id);
    });
  }

  write(id, data) {
    const entry = this.ptys.get(id);
    if (entry) entry.process.write(data);
  }

  resize(id, cols, rows) {
    const entry = this.ptys.get(id);
    if (entry) entry.process.resize(cols, rows);
  }

  destroy(id) {
    const entry = this.ptys.get(id);
    if (entry) {
      entry.process.kill();
      this.ptys.delete(id);
      this.targets.delete(id);
    }
  }

  setTarget(id, webContents) {
    this.targets.set(id, webContents);
  }

  destroyAll() {
    for (const [id] of this.ptys) {
      this.destroy(id);
    }
  }
}

export default new PtyManager();
