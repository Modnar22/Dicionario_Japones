/* ===== Jap-Dex — processo principal do Electron ===== */
const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

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
      preload: path.join(__dirname, 'preload.js'),
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

/* ===== Atualização (v4.11.1): download + instalação =====
   Sem electron-updater (binários unsigned + SAC em imposição): baixa o
   asset da release para %TEMP%\JapDexUpdate e abre o instalador — o NSIS
   avisa/fecha o app em execução antes de atualizar. */
const UPDATE_DIR = path.join(app.getPath('temp'), 'JapDexUpdate');

/* GET com seguimento manual de redirects (máx. 5). O token só é reenviado
   para o MESMO host (a URL assinada do GitHub não precisa de auth). */
function fetchToFile(url, headers, dest, redirectsLeft, onProgress) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('http:') ? http : https;
    const req = mod.get(url, { headers }, (res) => {
      const status = res.statusCode || 0;
      if (status >= 300 && status < 400 && res.headers.location) {
        res.resume();
        if (redirectsLeft <= 0) { reject(new Error('muitos redirecionamentos')); return; }
        const next = new URL(res.headers.location, url).toString();
        const nextHeaders = new URL(next).host === new URL(url).host ? headers : {};
        fetchToFile(next, nextHeaders, dest, redirectsLeft - 1, onProgress)
          .then(resolve, reject);
        return;
      }
      if (status !== 200) {
        res.resume();
        reject(new Error('HTTP ' + status));
        return;
      }
      const total = parseInt(res.headers['content-length'] || '0', 10);
      const out = fs.createWriteStream(dest);
      let done = 0;
      res.on('data', (chunk) => {
        done += chunk.length;
        if (total > 0 && typeof onProgress === 'function') {
          onProgress(Math.min(100, Math.round((done / total) * 100)));
        }
      });
      res.on('error', reject);
      out.on('error', reject);
      out.on('finish', () => out.close(() => resolve({ bytes: done })));
      res.pipe(out);
    });
    req.on('error', reject);
    req.setTimeout(60000, () => req.destroy(new Error('timeout')));
  });
}

ipcMain.handle('update:download', async (event, { assetUrl, fileName, token } = {}) => {
  try {
    // Só baixa de endpoints da API do GitHub (não é um "abrir URL" genérico)
    if (!/^https:\/\/api\.github\.com\//.test(String(assetUrl || ''))) {
      return { ok: false, error: 'URL de download inválida' };
    }
    const safeName = path.basename(String(fileName || 'Jap-Dex-atualizacao.exe'));
    fs.mkdirSync(UPDATE_DIR, { recursive: true });
    const dest = path.join(UPDATE_DIR, safeName);
    const headers = {
      'User-Agent': 'Jap-Dex-Updater',
      Accept: 'application/octet-stream',
    };
    if (token) headers.Authorization = 'Bearer ' + token;
    const sender = event.sender;
    const { bytes } = await fetchToFile(assetUrl, headers, dest, 5, (pct) => {
      if (!sender.isDestroyed()) sender.send('update:progress', pct);
    });
    return { ok: true, path: dest, bytes };
  } catch (err) {
    console.error('update:download:', err);
    return { ok: false, error: String((err && err.message) || err) };
  }
});

ipcMain.handle('update:install', async (_event, { filePath } = {}) => {
  // Só abre arquivos dentro da pasta de atualização (evita "abrir path" genérico)
  const resolved = path.resolve(String(filePath || ''));
  if (!resolved.toLowerCase().startsWith(path.resolve(UPDATE_DIR).toLowerCase())) {
    return { ok: false, error: 'arquivo fora da pasta de atualização' };
  }
  if (!fs.existsSync(resolved)) return { ok: false, error: 'arquivo não encontrado' };
  const err = await shell.openPath(resolved);
  return err ? { ok: false, error: String(err) } : { ok: true };
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
