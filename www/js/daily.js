/* ===== MISSÕES DIÁRIAS (v4.10) =====
   3 missões por dia, escolhidas DETERMINISTICAMENTE pela data (mesmo dia =
   mesmas missões para todos os aparelhos — útil quando houver sync).
   Contadores são zerados automaticamente quando a data muda (ensureDaily).
   Recompensa em XP: botão "Resgatar" habilita quando a meta é atingida. */
import { showFlyout } from './notifications.js';
import { saveState, state } from './state.js';
import { addXP } from './xp.js';

export const DAILY_POOL = [
    { id: 'voc_answered', icon: 'fa-book-open', name: 'Leitor Ávido',
      desc: 'Responda 10 perguntas de vocabulário', goal: 10, reward: 30 },
    { id: 'quiz_correct', icon: 'fa-check-double', name: 'Mão na Massa',
      desc: 'Acerte 5 perguntas em qualquer quiz', goal: 5, reward: 30 },
    { id: 'alpha_correct', icon: 'fa-font', name: 'Kana em Dia',
      desc: 'Acerte 8 letras (Hiragana, Katakana ou Kanji)', goal: 8, reward: 25 },
    { id: 'words_added', icon: 'fa-plus-circle', name: 'Novas Palavras',
      desc: 'Adicione 2 palavras ao dicionário', goal: 2, reward: 25 },
    { id: 'xp_gained', icon: 'fa-star', name: 'Caçador de XP',
      desc: 'Ganhe 60 XP hoje (qualquer fonte)', goal: 60, reward: 40 },
];
const PICK_COUNT = 3;

/* Data local "YYYY-MM-DD" (não usar toISOString: é UTC e pula o dia). */
function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* Hash simples e estável da data → mesma seleção no PC e no celular. */
function seedFrom(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    return h;
}

function pickQuests(dateStr) {
    const seed = seedFrom(dateStr);
    return DAILY_POOL
        .map((q, i) => ({ q, k: (seed + (i + 1) * 2654435761) % 1000003 }))
        .sort((a, b) => a.k - b.k)
        .slice(0, PICK_COUNT)
        .map(x => x.q.id);
}

/* Garante o estado do dia (cria/reseta quando a data muda). */
export function ensureDaily() {
    const today = todayKey();
    if (!state.daily || state.daily.date !== today) {
        state.daily = {
            date: today,
            quests: pickQuests(today),
            counters: {},
            claimed: [],
        };
        saveState();
        return;
    }
    if (!state.daily.counters) state.daily.counters = {};
    if (!Array.isArray(state.daily.claimed)) state.daily.claimed = [];
    if (!Array.isArray(state.daily.quests) || state.daily.quests.length === 0) {
        state.daily.quests = pickQuests(today);
    }
}

/* Registra progresso (chamado por quiz.js, xp.js, words.js). */
export function bumpDaily(key, amount = 1) {
    if (!amount || amount <= 0) return;
    ensureDaily();
    const c = state.daily.counters;
    c[key] = (c[key] || 0) + amount;
    saveState();
}

export function dailyProgress(quest) {
    ensureDaily();
    return Math.min(state.daily.counters[quest.id] || 0, quest.goal);
}

export function claimDaily(id) {
    ensureDaily();
    const q = DAILY_POOL.find(x => x.id === id);
    if (!q) return;
    if (state.daily.claimed.includes(id)) return;
    const prog = state.daily.counters[id] || 0;
    if (prog < q.goal) {
        showFlyout('wrong', 'Missão ainda em andamento',
            `${q.name}: ${prog}/${q.goal} — continue estudando!`,
            '<i class="fas fa-hourglass-half"></i>');
        return;
    }
    state.daily.claimed.push(id);
    saveState();
    showFlyout('xp', 'Missão concluída! 🎯',
        `${q.name}: recompensa de ${q.reward} XP resgatada.`,
        '<i class="fas fa-award"></i>');
    addXP(q.reward); // dispara updateUI → renderDaily
}

/* Card de missões (chamado por updateUI). */
export function renderDaily() {
    const body = document.getElementById('daily-body');
    if (!body) return;
    ensureDaily();

    const quests = state.daily.quests
        .map(id => DAILY_POOL.find(q => q.id === id))
        .filter(Boolean);
    const claimed = state.daily.claimed;
    const allDone = quests.length > 0 && quests.every(q => claimed.includes(q.id));

    body.innerHTML = `
      <div class="daily-head">
        <small><i class="fas fa-sync-alt"></i> Renova à meia-noite ·
          <strong>${quests.filter(q => claimed.includes(q.id)).length}/${quests.length}</strong> resgatadas</small>
        ${allDone ? '<span class="daily-all-done">Tudo concluído hoje! 🎉</span>' : ''}
      </div>
      <div class="daily-grid">
        ${quests.map(q => {
            const prog = dailyProgress(q);
            const done = prog >= q.goal;
            const isClaimed = claimed.includes(q.id);
            const pct = Math.round((prog / q.goal) * 100);
            return `
            <div class="daily-quest ${isClaimed ? 'claimed' : done ? 'ready' : ''}">
              <div class="daily-q-head">
                <i class="fas ${q.icon}" aria-hidden="true"></i>
                <strong>${q.name}</strong>
                <span class="daily-reward">+${q.reward} XP</span>
              </div>
              <p>${q.desc}</p>
              <div class="daily-bar" role="progressbar" aria-valuenow="${prog}" aria-valuemin="0" aria-valuemax="${q.goal}">
                <div class="daily-bar-fill" style="width:${pct}%"></div>
              </div>
              <div class="daily-q-foot">
                <span class="daily-count ${done ? 'done' : ''}">${prog}/${q.goal}</span>
                ${isClaimed
                    ? '<button class="btn btn-success" disabled><i class="fas fa-check"></i> Resgatada</button>'
                    : done
                        ? `<button class="btn btn-primary" onclick="claimDaily('${q.id}')"><i class="fas fa-gift"></i> Resgatar</button>`
                        : '<button class="btn btn-secondary" disabled>Em andamento</button>'}
              </div>
            </div>`;
        }).join('')}
      </div>`;
}
