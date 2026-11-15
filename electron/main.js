/* ===== Jap-Dex — processo principal do Electron ===== */
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 960,
    minHeight: 620,
    backgroundColor: '#041025',
    title: 'Jap-Dex',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Remove a barra de menus padrão (F10 ainda abre, mas fica oculta)
  win.setMenuBarVisibility(false);

  win.once('ready-to-show', () => win.show());

  win.loadFile(path.join(__dirname, '..', 'index.html'));

  // Erros de renderização vão para o console do terminal (útil no dev)
  win.webContents.on('console-message', (_e, level, message, line, sourceId) => {
    if (level >= 3) {
      console.error(`[renderer] ${message} (${sourceId}:${line})`);
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // macOS: reabre a janela quando clica no ícone do dock
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
