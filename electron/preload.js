/* ===== Jap-Dex — ponte segura renderer ↔ main (v4.11.1) =====
   contextIsolation + sandbox ativos: o renderer só enxerga o que é
   exposto aqui (contextBridge). Usado pelo botão "Baixar e atualizar". */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('japdexNative', {
  isElectron: true,

  /* Baixa o instalador da release para %TEMP%\JapDexUpdate.
     Retorna { ok:true, path, bytes } ou { ok:false, error }. */
  downloadUpdate: (assetUrl, fileName, token) =>
    ipcRenderer.invoke('update:download', { assetUrl, fileName, token }),

  /* Abre o instalador baixado (o NSIS detecta o app em execução e pede
     para fechá-lo antes de atualizar). */
  installUpdate: (filePath) =>
    ipcRenderer.invoke('update:install', { filePath }),

  /* Assina o progresso do download (porcentagem inteira 0-100). */
  onUpdateProgress: (cb) => {
    ipcRenderer.on('update:progress', (_e, pct) => {
      try { cb(pct); } catch (err) { /* listener do usuário falhou — ignora */ }
    });
  },
});
