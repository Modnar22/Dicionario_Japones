/* ===== Tema claro/escuro (v4.10) =====
   Três modos em `state.settings.theme`:
   - 'auto'  → segue o SO (prefers-color-scheme); sem data-theme no <html>
   - 'light' → data-theme="light" (força claro)
   - 'dark'  → data-theme="dark" (força escuro)
   O CSS faz: :root[data-theme="light"] + @media (prefers-color-scheme: light)
   aplicado quando NÃO há data-theme="dark".                              */
import { saveState, state } from './state.js';

const THEMES = ['auto', 'light', 'dark'];
const ICONS = { auto: 'fa-adjust', light: 'fa-sun', dark: 'fa-moon' };
const LABELS = { auto: 'automático', light: 'claro', dark: 'escuro' };

/* Aplica o tema do estado ao <html> e sincroniza a UI (rádios + botão). */
export function applyTheme() {
    const theme = THEMES.includes(state.settings.theme) ? state.settings.theme : 'auto';
    const root = document.documentElement;
    if (theme === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);

    // Rádios da seção "Aparência"
    document.querySelectorAll('input[name="theme-opt"]').forEach(r => {
        r.checked = r.value === theme;
    });

    // Botão rápido (ao lado do "?")
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.innerHTML = `<i class="fas ${ICONS[theme]}"></i>`;
        btn.title = `Tema: ${LABELS[theme]} (clique para trocar)`;
        btn.setAttribute('aria-label', `Tema ${LABELS[theme]} — clique para alternar`);
    }
}

export function setTheme(theme) {
    if (!THEMES.includes(theme)) return;
    state.settings.theme = theme;
    saveState();
    applyTheme();
}

/* Botão rápido: auto → claro → escuro → auto */
export function cycleTheme() {
    const cur = THEMES.includes(state.settings.theme) ? state.settings.theme : 'auto';
    setTheme(THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length]);
}
