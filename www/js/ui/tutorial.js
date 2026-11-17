/* ===== TUTORIAL EM ETAPAS (v4.9) =====
   Destaca o elemento de cada etapa com um "spotlight" (anel + sombra
   gigante) e um balão explicativo. Inicia sozinho na 1ª execução e
   pode ser reaberto pelo botão "?" ao lado do ☰.                    */
import { showFlyout } from '../notifications.js';
import { saveState, state } from '../state.js';
import { switchTab, toggleMenu } from './tabs.js';

const STEPS = [
    {
        target: '#menu-toggle',
        title: 'Menu lateral',
        text: 'Clique no ☰ para abrir o menu com todas as abas: Dicionário, Loja, Alfabetos, Conquistas e mais. Ele fecha sozinho ao escolher uma aba.',
    },
    {
        target: '#add-word-form',
        title: 'Adicionar palavras',
        text: 'Cadastre palavras em japonês com leitura e tradução. Use "Mais opções" para JLPT, categoria, tags e notas — cadastrar palavras dá XP!',
    },
    {
        target: '#srs-status-card',
        title: 'Revisão espaçada (SRS)',
        text: 'Revise as palavras nas datas certas para fixar o vocabulário. Quanto maior o nível SRS, maior o intervalo entre revisões.',
    },
    {
        tab: 'alphabets',
        target: '.alphabet-selector',
        title: 'Alfabetos',
        text: 'Alterne entre Hiragana, Katakana e Kanji. Clique em qualquer letra para ouvir a pronúncia em japonês.',
    },
    {
        target: '#alpha-view-hiragana .btn-success',
        title: 'Quiz de alfabeto',
        text: 'Pratique com quizzes e marque "Focar em não dominadas" para treinar só o que você ainda não dominou: 3 acertos = prata ★, 5 acertos = DOMINADA 🏆.',
    },
    {
        tab: 'shop',
        target: '#shop',
        title: 'Loja de pacotes',
        text: 'Gaste o XP que você ganha estudando para comprar pacotes de 5 palavras temáticas (Animais, Comida, Cores...). As palavras são secretas — compre para descobrir! Ao comprar, um novo nível do mesmo tema aparece com palavras diferentes e custo maior.',
    },
];

let blocker = null;
let ring = null;
let bubble = null;
let current = 0;
let active = false;

function onResize() {
    if (active) showStep(current, true);
}
function onKey(ev) {
    if (!active) return;
    if (ev.key === 'Escape') { ev.preventDefault(); endTutorial(false); }
    else if (ev.key === 'ArrowRight' || ev.key === 'Enter') { ev.preventDefault(); nextStep(); }
    else if (ev.key === 'ArrowLeft') { ev.preventDefault(); prevStep(); }
}

export function startTutorial() {
    if (active) return;
    active = true;
    current = 0;
    toggleMenu(false); // fecha o drawer se estiver aberto

    blocker = document.createElement('div');
    blocker.className = 'tour-blocker';
    blocker.addEventListener('click', (e) => e.stopPropagation());

    ring = document.createElement('div');
    ring.className = 'tour-ring';

    bubble = document.createElement('div');
    bubble.className = 'tour-bubble';
    bubble.innerHTML = `
        <h4 class="tour-title"></h4>
        <p class="tour-text"></p>
        <div class="tour-progress"></div>
        <div class="tour-actions">
          <button type="button" class="btn btn-secondary" data-act="skip">Pular</button>
          <span style="display:flex;gap:8px;">
            <button type="button" class="btn btn-secondary" data-act="prev">Anterior</button>
            <button type="button" class="btn btn-primary" data-act="next">Próximo</button>
          </span>
        </div>`;
    bubble.addEventListener('click', (ev) => {
        const btn = ev.target.closest('button[data-act]');
        if (!btn) return;
        if (btn.dataset.act === 'next') nextStep();
        else if (btn.dataset.act === 'prev') prevStep();
        else endTutorial(false); // pular
    });

    document.body.append(blocker, ring, bubble);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', onResize);
    showStep(0);
}

function linkFor(tab) {
    return [...document.querySelectorAll('.sidebar-links a')]
        .find(a => (a.getAttribute('onclick') || '').includes(`switchTab('${tab}'`)) || null;
}

function showStep(i, repositionOnly = false) {
    if (i >= STEPS.length) { endTutorial(true); return; }
    const step = STEPS[i];

    if (!repositionOnly && step.tab) switchTab(step.tab, linkFor(step.tab));

    const target = document.querySelector(step.target);
    if (!target) { // alvo indisponível → tenta a próxima etapa
        if (repositionOnly) { endTutorial(true); return; }
        showStep(i + 1);
        return;
    }
    current = i;
    if (!repositionOnly) target.scrollIntoView({ block: 'center', behavior: 'auto' });

    const rect = target.getBoundingClientRect();
    const pad = 6;
    ring.style.top = `${Math.max(4, rect.top - pad)}px`;
    ring.style.left = `${Math.max(4, rect.left - pad)}px`;
    ring.style.width = `${rect.width + pad * 2}px`;
    ring.style.height = `${rect.height + pad * 2}px`;

    // Conteúdo do balão
    bubble.querySelector('.tour-title').textContent = step.title;
    bubble.querySelector('.tour-text').textContent = step.text;
    bubble.querySelector('.tour-progress').textContent = `Etapa ${i + 1} de ${STEPS.length}`;
    bubble.querySelector('[data-act="prev"]').style.visibility = i === 0 ? 'hidden' : 'visible';
    bubble.querySelector('[data-act="next"]').textContent = i === STEPS.length - 1 ? 'Concluir ✓' : 'Próximo';

    // Posiciona o balão: abaixo do alvo (ou acima se não couber)
    const bw = bubble.offsetWidth;
    const bh = bubble.offsetHeight;
    let top = rect.bottom + 14;
    if (top + bh > window.innerHeight - 10) top = rect.top - bh - 14;
    top = Math.max(10, Math.min(top, window.innerHeight - bh - 10));
    let left = rect.left + rect.width / 2 - bw / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - bw - 10));
    bubble.style.top = `${top}px`;
    bubble.style.left = `${left}px`;
}

function nextStep() { showStep(current + 1); }
function prevStep() { if (current > 0) showStep(current - 1); }

function endTutorial(completed) {
    if (!active) return;
    active = false;
    blocker?.remove(); ring?.remove(); bubble?.remove();
    blocker = ring = bubble = null;
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', onResize);

    state.settings.tutorialSeen = true;
    saveState();
    if (completed) {
        showFlyout('correct', 'Tutorial concluído! 🎓',
            'Clique em "?" ao lado do menu para rever quando quiser.',
            '<i class="fas fa-graduation-cap"></i>');
    }
}
