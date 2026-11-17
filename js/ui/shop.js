/* ===== LOJA DE PACOTES (v4.9) =====
   Temas com 3 níveis progressivos. O conteúdo do nível atual é SECRETO
   (só "5 palavras secretas" antes de comprar), MAS as palavras que o
   usuário JÁ TEM no dicionário são reveladas (ele as conhece) e geram
   desconto proporcional: pagar = custo × (faltantes/5); se já tem as 5,
   fica GRÁTIS. Ao comprar, o próximo nível do mesmo tema aparece com
   palavras diferentes e custo maior de XP.                     */
import { checkAllAchievements } from '../achievementLogic.js';
import { WORD_PACKS, ownedTierOf } from '../data/wordPacks.js';
import { showFlyout } from '../notifications.js';
import { saveState, state } from '../state.js';
import { updateUI } from './stats.js';
import { esc, escJS } from '../utils.js';
import { spendXP } from '../xp.js';

const ROMAN = ['', 'I', 'II', 'III'];

/* Quanto custa este nível para o usuário atual:
   - `have`: palavras do pacote que já estão no dicionário (reveladas)
   - `cost`: preço final = base × (faltantes/5); 0 = grátis           */
function tierStatus(tier) {
    const ownedTexts = new Set(state.words.map(w => w.text));
    const have = tier.words.filter(w => ownedTexts.has(w.text)).length;
    const missing = tier.words.length - have;
    const cost = missing === 0 ? 0 : Math.round(tier.cost * missing / tier.words.length);
    const discount = cost >= tier.cost ? 0 : Math.round((1 - cost / tier.cost) * 100);
    return { have, missing, cost, discount };
}

function secretHTML(tier, st) {
    const tiles = tier.words.map(w => {
        if (st.have > 0 && state.words.some(ex => ex.text === w.text)) {
            // Palavra que o usuário JÁ TEM → revelada (não é segredo pra ele)
            return `<span class="tile-revealed" title="Você já tem: ${esc(w.text)} (${esc(w.reading)})">${esc(w.text)}</span>`;
        }
        return '<span>？</span>';
    }).join('');
    const hint = st.have > 0
        ? `🔒 ${st.missing} secreta(s) · <b>${st.have}/5 já no seu dicionário</b>`
        : '🔒 5 palavras secretas — compre para descobrir';
    return `
      <div class="pack-secret" title="Palavras secretas — compre para revelar">
        <div class="pack-secret-tiles" aria-hidden="true">${tiles}</div>
        <small>${hint}</small>
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
        const st = done ? null : tierStatus(tier);

        let body, actions;
        if (done) {
            body = `
          <p class="pack-meta"><i class="fas fa-check-circle"></i>
            ${pack.tiers.length}/${pack.tiers.length} níveis comprados</p>
          <p class="pack-done-note">Tema concluído! 🎉 Você já tem todas as palavras deste tema.</p>`;
            actions = `<button class="btn btn-success" disabled><i class="fas fa-check"></i> Concluído</button>`;
        } else {
            const price = st.cost === 0
                ? `<span class="pack-price pack-free">Grátis</span>
                   <small class="pack-free-hint">você já tem as 5!</small>`
                : `<span class="pack-price">${st.cost} XP</span>
                   ${st.discount > 0
                       ? ` <s class="pack-price-old">${tier.cost} XP</s>
                           <span class="pack-discount">−${st.discount}%</span>` : ''}`;

            body = `
          <p class="pack-meta"><i class="fas fa-layer-group"></i> 5 palavras novas · ${price}
            ${tierIdx > 0 ? `<span class="pack-tier">Nível ${tierIdx + 1}</span>` : ''}
            ${tier.jlpt !== 'None' ? `<span class="jlpt-tag">${esc(tier.jlpt)}</span>` : ''}
          </p>
          ${st.have > 0 ? `<p class="pack-owned-hint"><i class="fas fa-check-circle"></i>
            ${st.have}/5 palavras deste pacote já estão no seu dicionário — desconto aplicado!</p>` : ''}
          ${secretHTML(tier, st)}`;

            const falta = Math.max(0, st.cost - state.xp);
            if (st.missing === 0) {
                actions = `<button class="btn btn-success" onclick="buyPack('${escJS(pack.id)}')">
                    <i class="fas fa-gift"></i> Resgatar grátis</button>`;
            } else if (falta === 0) {
                actions = `<button class="btn btn-primary" onclick="buyPack('${escJS(pack.id)}')">
                    <i class="fas fa-shopping-cart"></i> Comprar por ${st.cost} XP</button>`;
            } else {
                actions = `<button class="btn btn-secondary" disabled title="Você precisa de ${st.cost} XP">
                    <i class="fas fa-lock"></i> Faltam ${falta} XP</button>`;
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
    const st = tierStatus(tier);

    if (st.cost > 0 && state.xp < st.cost) {
        showFlyout('wrong', 'XP insuficiente',
            `Faltam ${st.cost - state.xp} XP para comprar "${pack.name}"` +
            (st.discount > 0 ? ` (já com desconto de ${st.discount}%)` : '') +
            `. Ganhe XP estudando!`,
            '<i class="fas fa-star"></i>');
        return;
    }
    // Preço 0 (tudo já tem) → não passa pelo spendXP (que exige amount > 0)
    if (st.cost > 0 && !spendXP(st.cost)) return;

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

    const nome = `"${pack.name}" ${ROMAN[tierIdx + 1] || tierIdx + 1}`;
    if (st.cost === 0) {
        showFlyout('xp', 'Resgatar grátis! 🎁',
            `${nome}: você já tinha as 5 palavras — novo nível liberado sem custo.`,
            '<i class="fas fa-gift"></i>');
    } else if (st.have > 0) {
        showFlyout('xp', 'Pacote comprado com desconto! 🏷️',
            `${nome}: ${st.have}/5 já no dicionário → −${st.discount}%. ` +
            `Pago ${st.cost} XP (era ${tier.cost}); ${added} palavra(s) nova(s).`,
            '<i class="fas fa-tags"></i>');
    } else {
        showFlyout('xp', 'Pacote comprado! 🛍️',
            `${nome}: ${added} palavra(s) nova(s) revelada(s) no dicionário. −${st.cost} XP`,
            '<i class="fas fa-shopping-bag"></i>');
    }
}
