/* ===== Jap-Dex — processo principal do Electron ===== */
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// Ícone da janela (build/icon.ico) — só existe após gerar os assets
const windowIcon = path.join(__dirname, '..', 'build', 'icon.ico');
const iconPath = fs.existsSync(windowIcon) ? windowIcon : undefined;

function createWindow() {
  const win = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 960,
    minHeight: 620,
    backgroundColor: '#041025',
    title: 'Jap-Dex',
    ...(iconPath ? { icon: iconPath } : {}),
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

  /* Links externos (GitHub/releases) abrem no navegador do sistema —
     evita criar janelas soltas do Electron (v4.11: "Ver atualizações"). */
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (/^https?:\/\//.test(url)) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  win.once('ready-to-show', () => win.show());

  win.loadFile(path.join(__dirname, '..', 'index.html'));

  // Erros de renderização vão para o console do terminal (útil no dev)
  // Electron 45: props no objeto Event (evitar assinatura posicional — ela
  // dispara warning de deprecation; manter 1 parâmetro só).
  win.webContents.on('console-message', (e) => {
    const level = e && typeof e === 'object' ? e.level : undefined;
    if (level === 'error' || level === 3) {
      console.error(`[renderer] ${e.message} (${e.sourceId}:${e.line})`);
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
