/* ===== VERIFICAR ATUALIZAÇÕES (v4.11) =====
   Consulta a API pública do GitHub (CORS liberado — funciona no navegador,
   no Electron e no APK) e compara com a versão atual (APP_VERSION).
   Sem electron-updater: o download leva ao release (binários unsigned +
   SAC em imposição pedem confirmação do usuário).                     */
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
            setResult(`
              <div class="update-box has-update">
                <i class="fas fa-arrow-circle-up" aria-hidden="true"></i>
                <div><strong>Nova versão: v${latest}</strong>
                  <small>você está na v${APP_VERSION}</small>
                  <p>${String(rel.name || '').replace(/^v[\d.]+\s*[—-]?\s*/, '') || 'Confira o que há de novo.'}</p>
                </div>
                <button class="btn btn-primary" onclick="window.open('${url.replace(/'/g, '')}', '_blank')">
                  <i class="fas fa-download"></i> Ver notas e baixar</button>
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
