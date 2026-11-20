/* ===== VERIFICAR ATUALIZAÇÕES (v4.11 → v4.12) =====
   Consulta a API do GitHub (CORS liberado — funciona no navegador,
   no Electron e no APK) e compara com a versão atual (APP_VERSION).
   - Na ENTRADA do app faz uma verificação automática silenciosa (v4.12):
     só notifica (flyout clicável → Configurações) se houver versão nova.
   - Download DENTRO do app (estilo update de aplicativo, v4.11.1/v4.12):
     * Electron → instalador em %TEMP%\JapDexUpdate (barra de progresso);
     * APK Android → plugin nativo "Updater" usa o DownloadManager do
       sistema: barra de progresso no app e a INSTALAÇÃO pela notificação
       padrão do Android (v4.12.1 — sem REQUEST_INSTALL_PACKAGES, que o
       Play Protect marcava como "potencialmente perigoso");
     * navegador → abre a página do release (não há como baixar sozinho). */
import { APP_VERSION } from './config.js';
import { showFlyout } from './notifications.js';

const REPO_API = 'https://api.github.com/repos/Modnar22/Dicionario_Japones/releases/latest';
const RELEASE_URL = 'https://github.com/Modnar22/Dicionario_Japones/releases';
/* Token pessoal do GitHub (repositório PRIVADO): fica numa chave própria do
   localStorage — NUNCA em `state`, para não vazar nos arquivos de backup. */
const TOKEN_KEY = 'jp_gh_token';

function getToken() {
    try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; }
}

export function saveGhToken() {
    const input = document.getElementById('gh-token-input');
    const val = (input?.value || '').trim();
    if (!val) { clearGhToken(); return; }
    try { localStorage.setItem(TOKEN_KEY, val); } catch (e) { /* ignore */ }
    if (input) input.value = '';
    showFlyout('xp', 'Token salvo ✅',
        'Ele será usado para verificar atualizações (só neste dispositivo).',
        '<i class="fas fa-key"></i>');
}

export function clearGhToken() {
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) { /* ignore */ }
    const input = document.getElementById('gh-token-input');
    if (input) input.value = '';
    showFlyout('wrong', 'Token removido', 'A verificação voltará a ser anônima.',
        '<i class="fas fa-eraser"></i>');
}

/* Comparação semver simples: -1 / 0 / 1 */
function cmpVer(a, b) {
    const pa = String(a).split('.').map(n => parseInt(n, 10) || 0);
    const pb = String(b).split('.').map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) < (pb[i] || 0) ? -1 : 1;
    }
    return 0;
}

function setResult(html) {
    const el = document.getElementById('update-result');
    if (!el) return;
    el.hidden = !html;
    el.innerHTML = html || '';
}

/* Escape mínimo para textos vindos de fora (nome da release/erros). */
function esc(s) {
    return String(s).replace(/[&<>"]/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/* Ponte nativa do Electron (preload) — ausente no navegador e no APK. */
function native() {
    return (typeof window !== 'undefined' && window.japdexNative) || null;
}

/* Plugin nativo do Android (registrado no MainActivity). Mesmo padrão do
   TextToSpeech: só existe na plataforma nativa — senão retorna null. */
function androidUpdater() {
    try {
        const cap = window.Capacitor;
        if (!cap) return null;
        if (typeof cap.isNativePlatform === 'function' && !cap.isNativePlatform()) return null;
        if (typeof cap.getPlatform === 'function' && cap.getPlatform() !== 'android') return null;
        if (typeof cap.registerPlugin === 'function') return cap.registerPlugin('Updater');
        if (cap.Plugins && cap.Plugins.Updater) return cap.Plugins.Updater;
    } catch (e) { /* ignore */ }
    return null;
}

/* 'electron' | 'android' | 'web' — define o comportamento do botão. */
function platformKind() {
    if (native()) return 'electron';
    if (androidUpdater()) return 'android';
    return 'web';
}

/* Release pendente de download (preenchida ao detectar versão nova). */
let pendingAsset = null;   // { url, name, releaseUrl }
let installedFile = null;  // caminho do instalador já baixado
let progressBound = false;

/* Escolhe o artefato certo da release para cada plataforma. */
function pickAsset(assets) {
    const kind = platformKind();
    if (kind === 'electron') {
        return assets.find(a => /instalador\.exe$/i.test(a.name))
            || assets.find(a => /portatil\.exe$/i.test(a.name))
            || null;
    }
    if (kind === 'android') {
        return assets.find(a => /\.apk$/i.test(a.name)) || null;
    }
    return null;
}

function releaseActions(url) {
    const openRel = `onclick="window.open('${String(url).replace(/'/g, '')}', '_blank')"`;
    if (pendingAsset) {
        return `
        <div class="update-actions">
          <button class="btn btn-primary" onclick="downloadAndInstallUpdate()">
            <i class="fas fa-download"></i> Baixar e atualizar</button>
          <button class="btn btn-secondary" ${openRel}>
            <i class="fas fa-external-link-alt"></i> Página do release</button>
        </div>`;
    }
    return `
        <div class="update-actions">
          <button class="btn btn-primary" ${openRel}>
            <i class="fas fa-download"></i> Ver notas e baixar</button>
        </div>`;
}

/* Caixa de download com barra de progresso (estilo update de aplicativo). */
function progressBoxHtml(name) {
    return `
      <div class="update-box">
        <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
        <div><strong>Baixando ${esc(name)}…</strong>
          <small id="update-progress-text">iniciando…</small>
          <div class="update-progress"><span id="update-progress-bar"></span></div>
        </div>
      </div>`;
}

function setProgress(pct) {
    const t = document.getElementById('update-progress-text');
    if (t) t.textContent = `${pct}% concluído`;
    const b = document.getElementById('update-progress-bar');
    if (b) b.style.width = `${Math.max(0, Math.min(100, pct))}%`;
}

/* Leva o usuário direto para a seção "Atualizações" (flyout clicável). */
function goToUpdateSection() {
    try {
        if (typeof window.switchTab === 'function') window.switchTab('settings');
        const el = document.getElementById('update-result');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const box = el.querySelector('.update-box');
            if (box) {
                box.classList.add('flash');
                setTimeout(() => box.classList.remove('flash'), 2500);
            }
        }
    } catch (e) { /* ignore */ }
}

/* Resultado do download. v4.12.1 (Android): a instalação NÃO é feita pelo
   nosso app (sinal de "dropper" no Play Protect) — o DownloadManager mostra
   a notificação padrão e o usuário toca nela para instalar. */
function showDownloadDone(res) {
    installedFile = res.path;
    const mb = ((res.bytes || 0) / (1024 * 1024)).toFixed(1);
    const android = platformKind() === 'android';
    const instrucao = android
        ? `${mb} MB salvos — toque na notificação <strong>"Download concluído"</strong> do Android para instalar.`
        : `${mb} MB salvos — clique em "Instalar agora" para atualizar.`;
    const acao = android ? '' : `
        <div class="update-actions">
          <button class="btn btn-primary" onclick="installDownloadedUpdate()">
            <i class="fas fa-play"></i> Instalar agora</button>
          <button class="btn btn-secondary"
            onclick="window.open('${(pendingAsset && pendingAsset.releaseUrl) || RELEASE_URL}', '_blank')">
            <i class="fas fa-external-link-alt"></i> Página do release</button>
        </div>`;
    setResult(`
      <div class="update-box has-update">
        <i class="fas fa-check-circle" aria-hidden="true"></i>
        <div><strong>Download concluído!</strong>
          <small>${instrucao}</small></div>
        ${acao}
      </div>`);
    showFlyout('xp', 'Download concluído ⬇️',
        android
            ? 'Toque na notificação do Android para instalar a atualização.'
            : 'Clique em "Instalar agora" para concluir a atualização.',
        '<i class="fas fa-download"></i>');
}

function showDownloadError(error) {
    const why = esc(error || 'falha desconhecida');
    setResult(`
      <div class="update-box error">
        <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
        <div><strong>Não foi possível baixar</strong>
          <small>${why} — você também pode baixar pela página do release.</small></div>
        <div class="update-actions">
          <button class="btn btn-secondary"
            onclick="window.open('${(pendingAsset && pendingAsset.releaseUrl) || RELEASE_URL}', '_blank')">
            <i class="fas fa-external-link-alt"></i> Página do release</button>
        </div>
      </div>`);
    showFlyout('wrong', 'Download falhou', why, '<i class="fas fa-wifi"></i>');
}

/* Baixa a atualização DENTRO do app e mostra "Instalar agora".
   Electron: instalador em %TEMP% (IPC). Android: plugin nativo "Updater". */
export async function downloadAndInstallUpdate() {
    if (!pendingAsset) return;
    const kind = platformKind();
    if (kind === 'web') return;
    setResult(progressBoxHtml(pendingAsset.name));

    let res = null;
    if (kind === 'electron') {
        const n = native();
        if (!progressBound) {
            progressBound = true;
            n.onUpdateProgress(setProgress);
        }
        res = await n.downloadUpdate(pendingAsset.url, pendingAsset.name, getToken());
    } else {
        const p = androidUpdater();
        if (!p) {
            showDownloadError('plugin de atualização indisponível');
            return;
        }
        let sub = null;
        try {
            sub = await p.addListener('progress', (d) => {
                if (d && d.total > 0) {
                    setProgress(Math.round((d.loaded / d.total) * 100));
                }
            });
        } catch (e) { /* listener é opcional */ }
        try {
            const r = await p.download({
                url: pendingAsset.url,
                fileName: pendingAsset.name,
                token: getToken() || undefined,
            });
            res = (r && r.path) ? { ok: true, path: r.path, bytes: r.bytes || 0 } : r;
        } catch (e) {
            res = { ok: false, error: String((e && e.message) || e) };
        } finally {
            if (sub && typeof sub.remove === 'function') sub.remove();
        }
    }

    if (!res || !res.ok) {
        showDownloadError(res && res.error);
        return;
    }
    showDownloadDone(res);
}

/* Abre o instalador já baixado (Electron: NSIS). v4.12.1: no Android a
   instalação é feita pela notificação do DownloadManager — por isso este
   botão não existe mais lá (removido junto com REQUEST_INSTALL_PACKAGES
   para o Play Protect não classificar o APK como "dropper"). */
export async function installDownloadedUpdate() {
    if (!installedFile) return;
    if (platformKind() !== 'electron') return;

    const res = await native().installUpdate(installedFile);

    if (res && res.ok) {
        const detalhe = 'Siga as instruções para fechar o Jap-Dex e concluir a atualização.';
        setResult(`
          <div class="update-box up-to-date">
            <i class="fas fa-magic" aria-hidden="true"></i>
            <div><strong>Instalador aberto!</strong>
              <small>${detalhe}</small></div>
          </div>`);
        showFlyout('xp', 'Instalador aberto 🔄', detalhe,
            '<i class="fas fa-magic"></i>');
    } else {
        const why = esc((res && res.error) || 'falha desconhecida');
        setResult(`
          <div class="update-box error">
            <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
            <div><strong>Não foi possível abrir o instalador</strong>
              <small>${why}</small></div>
          </div>`);
        showFlyout('wrong', 'Falha ao instalar', why, '<i class="fas fa-wifi"></i>');
    }
}

/* Verifica se há versão nova.
   opts.silent (v4.12): usada na ABERTURA do app — não mexe no botão, não
   mostra "está atualizado" nem erro se offline; só avisa se houver update. */
export async function checkForUpdates(opts = {}) {
    const silent = !!(opts && opts.silent);
    const btn = document.getElementById('check-updates-btn');
    if (btn && !silent) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando…';
    }
    const token = getToken();
    try {
        const headers = { Accept: 'application/vnd.github+json' };
        if (token) headers.Authorization = 'Bearer ' + token;
        const res = await fetch(REPO_API, { headers });
        if (!res.ok) {
            const err = new Error('HTTP ' + res.status);
            err.status = res.status;
            throw err;
        }
        const rel = await res.json();
        const latest = String(rel.tag_name || '').replace(/^v/i, '');
        if (!latest) throw new Error('release sem tag');

        if (cmpVer(latest, APP_VERSION) > 0) {
            const url = String(rel.html_url || RELEASE_URL);
            const assets = Array.isArray(rel.assets) ? rel.assets : [];
            const asset = pickAsset(assets);
            pendingAsset = asset
                ? { url: String(asset.url || ''), name: String(asset.name || ''), releaseUrl: url }
                : null;
            setResult(`
              <div class="update-box has-update">
                <i class="fas fa-arrow-circle-up" aria-hidden="true"></i>
                <div><strong>Nova versão: v${latest}</strong>
                  <small>você está na v${APP_VERSION}</small>
                  <p>${esc(String(rel.name || '').replace(/^v[\d.]+\s*[—-]?\s*/, '')) || 'Confira o que há de novo.'}</p>
                </div>
                ${releaseActions(url)}
              </div>`);
            if (silent) {
                // Verificação automática da entrada: avisa e leva ao botão
                showFlyout('xp', `Nova versão v${latest} disponível! 🔄`,
                    'Há uma atualização do Jap-Dex — clique aqui para baixar.',
                    '<i class="fas fa-cloud-download-alt"></i>',
                    goToUpdateSection);
            } else {
                showFlyout('xp', 'Atualização disponível! 🔄',
                    `O Jap-Dex v${latest} já está disponível (você está na v${APP_VERSION}).`,
                    '<i class="fas fa-cloud-download-alt"></i>');
            }
        } else {
            if (silent) return; // na entrada: não incomoda quem já está atualizado
            setResult(`
              <div class="update-box up-to-date">
                <i class="fas fa-check-circle" aria-hidden="true"></i>
                <div><strong>Você está atualizado!</strong>
                  <small>v${APP_VERSION} é a versão mais recente.</small></div>
              </div>`);
            showFlyout('xp', 'Tudo em dia ✅',
                `Você já está na versão mais recente (v${APP_VERSION}).`,
                '<i class="fas fa-check"></i>');
        }
    } catch (e) {
        if (silent) { console.warn('checkForUpdates (automática):', e); return; }
        console.error('checkForUpdates:', e);
        const status = e.status;
        if (status === 404 || status === 401 || status === 403) {
            setResult(`
              <div class="update-box error">
                <i class="fas fa-lock" aria-hidden="true"></i>
                <div><strong>Sem permissão para consultar</strong>
                  <small>${token ? 'Token inválido ou sem permissão — confira o token abaixo.' :
                    'O repositório é privado: adicione um token de acesso abaixo.'}</small></div>
              </div>`);
            showFlyout('wrong', 'Verificação bloqueada',
                'Repositório privado: configure um token de acesso (chave ao lado).',
                '<i class="fas fa-key"></i>');
            const det = document.getElementById('gh-token-details');
            if (det) det.open = true;
        } else {
            setResult(`
              <div class="update-box error">
                <i class="fas fa-wifi" aria-hidden="true"></i>
                <div><strong>Não foi possível verificar</strong>
                  <small>Verifique sua conexão com a internet e tente de novo.</small></div>
              </div>`);
            showFlyout('wrong', 'Falha na verificação',
                'Não foi possível consultar o GitHub. Cheque sua internet.',
                '<i class="fas fa-wifi"></i>');
        }
    } finally {
        if (btn && !silent) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Verificar atualizações';
        }
    }
}
