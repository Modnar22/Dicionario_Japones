/* ===== VERIFICAR ATUALIZAÇÕES (v4.11) =====
   Consulta a API pública do GitHub (CORS liberado — funciona no navegador,
   no Electron e no APK) e compara com a versão atual (APP_VERSION).
   Sem electron-updater: no Electron o botão baixa o instalador para %TEMP%
   e o "Instalar atual" inicia a atualização (binários unsigned + SAC em
   imposição pedem confirmação do usuário); no navegador/APK o botão abre
   a página do release para baixar manualmente.                     */
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

/* Release pendente de download (preenchida ao detectar versão nova). */
let pendingAsset = null;   // { url, name }
let installedFile = null;  // caminho do instalador já baixado
let progressBound = false;

function releaseActions(url) {
    const openRel = `onclick="window.open('${String(url).replace(/'/g, '')}', '_blank')"`;
    const n = native();
    if (n && pendingAsset) {
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

/* Electron: baixa o instalador da release para %TEMP% e mostra o botão
   "Instalar agora" (o NSIS fecha o app antes de atualizar). */
export async function downloadAndInstallUpdate() {
    const n = native();
    if (!n || !pendingAsset) return;
    setResult(`
      <div class="update-box">
        <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
        <div><strong>Baixando ${esc(pendingAsset.name)}…</strong>
          <small id="update-progress-text">iniciando…</small></div>
      </div>`);
    if (!progressBound) {
        progressBound = true;
        n.onUpdateProgress((pct) => {
            const t = document.getElementById('update-progress-text');
            if (t) t.textContent = `${pct}% concluído`;
        });
    }
    const res = await n.downloadUpdate(pendingAsset.url, pendingAsset.name, getToken());
    if (!res || !res.ok) {
        const why = esc((res && res.error) || 'falha desconhecida');
        setResult(`
          <div class="update-box error">
            <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
            <div><strong>Não foi possível baixar</strong>
              <small>${why} — você também pode baixar pela página do release.</small></div>
            <div class="update-actions">
              <button class="btn btn-secondary"
                onclick="window.open('${pendingAsset.releaseUrl || RELEASE_URL}', '_blank')">
                <i class="fas fa-external-link-alt"></i> Página do release</button>
            </div>
          </div>`);
        showFlyout('wrong', 'Download falhou', why, '<i class="fas fa-wifi"></i>');
        return;
    }
    installedFile = res.path;
    const mb = (res.bytes / (1024 * 1024)).toFixed(1);
    setResult(`
      <div class="update-box has-update">
        <i class="fas fa-check-circle" aria-hidden="true"></i>
        <div><strong>Download concluído!</strong>
          <small>${mb} MB salvos — clique em "Instalar agora" para atualizar.</small></div>
        <div class="update-actions">
          <button class="btn btn-primary" onclick="installDownloadedUpdate()">
            <i class="fas fa-play"></i> Instalar agora</button>
          <button class="btn btn-secondary"
            onclick="window.open('${pendingAsset.releaseUrl || RELEASE_URL}', '_blank')">
            <i class="fas fa-external-link-alt"></i> Página do release</button>
        </div>
      </div>`);
    showFlyout('xp', 'Download concluído ⬇️',
        'Clique em "Instalar agora" para concluir a atualização.',
        '<i class="fas fa-download"></i>');
}

/* Electron: abre o instalador já baixado. */
export async function installDownloadedUpdate() {
    const n = native();
    if (!n || !installedFile) return;
    const res = await n.installUpdate(installedFile);
    if (res && res.ok) {
        setResult(`
          <div class="update-box up-to-date">
            <i class="fas fa-magic" aria-hidden="true"></i>
            <div><strong>Instalador aberto!</strong>
              <small>Siga as instruções para fechar o Jap-Dex e concluir a atualização.</small></div>
          </div>`);
        showFlyout('xp', 'Instalador aberto 🔄',
            'Confirme o fechamento do app para concluir a atualização.',
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

export async function checkForUpdates() {
    const btn = document.getElementById('check-updates-btn');
    if (btn) {
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
            const exe = assets.find(a => /instalador\.exe$/i.test(a.name))
                || assets.find(a => /portatil\.exe$/i.test(a.name));
            pendingAsset = (native() && exe)
                ? { url: String(exe.url || ''), name: String(exe.name || ''), releaseUrl: url }
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
            showFlyout('xp', 'Atualização disponível! 🔄',
                `O Jap-Dex v${latest} já está disponível (você está na v${APP_VERSION}).`,
                '<i class="fas fa-cloud-download-alt"></i>');
        } else {
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
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Verificar atualizações';
        }
    }
}
