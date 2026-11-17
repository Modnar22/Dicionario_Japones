/* ===== LOJA DE PACOTES (v4.9) =====
   Temas com 3 níveis progressivos. O conteúdo do nível atual é SECRETO
   (o aluno vê só "5 palavras secretas" e fica curioso). Ao comprar,
   o próximo nível do mesmo tema aparece com palavras diferentes e
   custo maior de XP. Comprado, o pacote vai direto ao dicionário.   */
import { checkAllAchievements } from '../achievementLogic.js';
import { WORD_PACKS, ownedTierOf } from '../data/wordPacks.js';
import { showFlyout } from '../notifications.js';
import { saveState, state } from '../state.js';
import { updateUI } from './stats.js';
import { esc, escJS } from '../utils.js';
import { spendXP } from '../xp.js';

const ROMAN = ['', 'I', 'II', 'III'];

function secretHTML() {
    const tiles = Array.from({ length: 5 },
        () => '<span>？</span>').join('');
    return `
      <div class="pack-secret" title="Palavras secretas — compre para revelar">
        <div class="pack-secret-tiles" aria-hidden="true">${tiles}</div>
        <small>🔒 5 palavras secretas — compre para descobrir</small>
      </div>`;
}

export function renderShop() {
    const grid = document.getElementById('shop-grid');
    if (!grid) return;
    state.ownedPacks = Array.isArray(state.ownedPacks) ? state.ownedPacks : [];

    const xpEl = document.getElementById('shop-xp');
    if (xpEl) xpEl.textContent = state.xp;

    grid.innerHTML = WORD_PACKS.map(pack => {
        const tierIdx = ownedTierOf(pack, state.ownedPacks);
        const done = tierIdx >= pack.tiers.length;
        const tier = done ? null : pack.tiers[tierIdx];
        const missing = done ? 0 : Math.max(0, tier.cost - state.xp);

        let body, actions;
        if (done) {
            body = `
          <p class="pack-meta"><i class="fas fa-check-circle"></i>
            ${pack.tiers.length}/${pack.tiers.length} níveis comprados</p>
          <p class="pack-done-note">Tema concluído! 🎉 Você já tem todas as palavras deste tema.</p>`;
            actions = `<button class="btn btn-success" disabled><i class="fas fa-check"></i> Concluído</button>`;
        } else {
            body = `
          <p class="pack-meta"><i class="fas fa-layer-group"></i> 5 palavras novas ·
            <span class="pack-price">${tier.cost} XP</span>
            ${tierIdx > 0 ? `<span class="pack-tier">Nível ${tierIdx + 1}</span>` : ''}
            ${tier.jlpt !== 'None' ? `<span class="jlpt-tag">${esc(tier.jlpt)}</span>` : ''}
          </p>
          ${secretHTML()}`;
            if (missing === 0) {
                actions = `<button class="btn btn-primary" onclick="buyPack('${escJS(pack.id)}')">
                    <i class="fas fa-shopping-cart"></i> Comprar por ${tier.cost} XP</button>`;
            } else {
                actions = `<button class="btn btn-secondary" disabled title="Você precisa de ${tier.cost} XP">
                    <i class="fas fa-lock"></i> Faltam ${missing} XP</button>`;
            }
        }

        return `
        <div class="pack-card ${done ? 'pack-done' : ''} ${done ? 'owned' : ''}">
          <div class="pack-head">
            <span class="pack-icon" aria-hidden="true">${pack.icon}</span>
            <h3>${esc(pack.name)}</h3>
          </div>
          ${body}
          <div class="pack-actions">${actions}</div>
        </div>`;
    }).join('');
}

export function buyPack(packId) {
    const pack = WORD_PACKS.find(p => p.id === packId);
    if (!pack) return;
    state.ownedPacks = Array.isArray(state.ownedPacks) ? state.ownedPacks : [];

    const tierIdx = ownedTierOf(pack, state.ownedPacks);
    if (tierIdx >= pack.tiers.length) {
        showFlyout('wrong', 'Tema concluído',
            `Você já comprou todos os níveis de "${pack.name}".`,
            '<i class="fas fa-check-circle"></i>');
        return;
    }
    const tier = pack.tiers[tierIdx];
    if (state.xp < tier.cost) {
        showFlyout('wrong', 'XP insuficiente',
            `Faltam ${tier.cost - state.xp} XP para comprar "${pack.name}". Ganhe XP estudando!`,
            '<i class="fas fa-star"></i>');
        return;
    }
    if (!spendXP(tier.cost)) return;

    // Adiciona as palavras (pula duplicatas que o usuário já cadastrou)
    let added = 0;
    tier.words.forEach(w => {
        if (state.words.some(ex => ex.text === w.text)) return;
        state.words.push({
            id: Date.now() + Math.random(),
            text: w.text,
            reading: w.reading,
            translation: w.translation,
            jlpt: tier.jlpt || 'N5',
            category: pack.name,
            tags: [],
            notes: `Pacote: ${pack.icon} ${pack.name} · Nível ${tierIdx + 1}`,
            seen: false,
            stats: { correct: 0, wrong: 0, last: null, srs_level: 0, next_review_date: null },
        });
        added++;
    });

    state.ownedPacks.push(`${pack.id}-${tierIdx + 1}`);
    saveState();
    checkAllAchievements(); // palavras compradas contam nas conquistas
    updateUI();
    renderShop();
    showFlyout('xp', 'Pacote comprado! 🛍️',
        `"${pack.name}" ${ROMAN[tierIdx + 1] || tierIdx + 1}: ${added} palavra(s) nova(s) revelada(s) no dicionário. −${tier.cost} XP`,
        '<i class="fas fa-shopping-bag"></i>');
}
