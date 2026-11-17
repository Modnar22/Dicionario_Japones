/* ===== Imports ===== */
import { launchConfetti, playAchievementTone, playLevelUpTone, playProficiencySound, playXPBlip } from './audio.js';
import { LEVELS } from './config.js';
import { notifQueue, state } from './state.js';
import { esc } from './utils.js';
/* ===== XP / LEVEL UP / NOTIFICATIONS =====
   Módulo dono do sinalizador `isNotifShowing` — ele só é reatribuído
   AQUI, por isso precisa viver neste módulo (um binding importado não
   pode ser reatribuído em ES modules).
   `notifQueue` continua vindo de state.js: os demais módulos apenas
   empilham itens na fila, o que é mutação e sempre é permitida.  */
export let isNotifShowing = false;

export function calculateLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      return LEVELS[i].level;
    }
  }
  return 1;
}

// v3.7.9 showFlyout (Modificado)
export function showFlyout(type, title, message, icon) {
    if (!state.settings.sound && type !== 'xp' && type !== 'correct' && type !== 'wrong') return;
const container = document.getElementById('notif-container');
    const flyout = document.createElement('div');
    flyout.className = `xp-flyout ${type}`;
flyout.innerHTML = `<div class="icon">${icon}</div>
                        <div class="content">
                            <div class="title">${esc(title)}</div>
                            <div class="message">${esc(message)}</div>
              
          </div>`;
    
    container.prepend(flyout);
// Força reflow para animação
    flyout.offsetHeight; 
    flyout.classList.add('active');
if (type === 'level-up' || type === 'achievement') {
        launchConfetti(5000, 100); // <- CORRIGIDO para usar launchConfetti
}

    // Oculta após 4 segundos
    setTimeout(() => {
        flyout.classList.remove('active');
        // Remove após a transição
        setTimeout(() => {
            flyout.remove();
            isNotifShowing = false;
            processNotifQueue(); // Tenta processar o próximo item
        }, 500); 
  
  }, 5000);

    isNotifShowing = true;
}

export function processNotifQueue() {
    if (isNotifShowing || notifQueue.length === 0) {
        return;
}

    const notif = notifQueue.shift();
    if (notif.type === 'xp') {
        playXPBlip();
// Toca o som de XP Blip (v3.7.3)
        showFlyout('xp', 'XP Ganho!', `+${notif.amount} XP`, '<i class="fas fa-star"></i>');
} else if (notif.type === 'level-up') {
        playLevelUpTone(); // <- CORRIGIDO para usar v3.7.3
// Toca o som de Level Up
        showFlyout('level-up', 'LEVEL UP!', `Você alcançou o Nível ${notif.level}!`, '<i class="fas fa-chart-line"></i>');
} else if (notif.type === 'achievement') {
        playAchievementTone(); // <- CORRIGIDO para usar v3.7.3
// Toca o som de Conquista
        showFlyout('achievement', 'CONQUISTA DESBLOQUEADA!', notif.name, '<i class="fas fa-trophy"></i>');
} else if (notif.type === 'proficiency') { // Novo tipo (PONTO 3)
        playProficiencySound(); // <- CORRIGIDO para usar novo som v3.7.3
const isAlpha = notif.type_name === 'Hiragana' || notif.type_name === 'Katakana';
        const typeName = notif.type_name || 'Palavra';
const title = notif.tier === 'Ouro' ? 'DOMINADA! 🏆' : `Proficiência ${notif.tier} 🎉`;
        const message = notif.tier === 'Ouro'
            ? `${typeName} "${notif.item}" está DOMINADA! (5+ acertos = Ouro)`
            : `${typeName} "${notif.item}" alcançou o nível ${notif.tier}.`;
const icon = notif.tier === 'Ouro' ? '<i class="fas fa-medal" style="color:var(--gold1);"></i>' : '<i class="fas fa-certificate" style="color:#c0c0c0;"></i>';
        showFlyout('proficiency', title, message, icon);
}
}

/* ===== BUG Nº6: substituto moderno do confirm() bloqueante =====
   Abre um modal inline (reutiliza .modal-overlay/.modal-content do CSS)
   e devolve uma Promise<boolean>: true = confirmar, false = cancelar.
   Aceita também: Esc, clique no fundo e a tecla Enter.            */
export function showConfirm(title, message, okLabel = 'Confirmar', cancelLabel = 'Cancelar') {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.innerHTML = `<div class="modal-content">
            <h3>${esc(title)}</h3>
            <p style="line-height:1.5;">${esc(message)}</p>
            <div style="text-align:right;margin-top:20px;display:flex;gap:10px;justify-content:flex-end;">
                <button class="btn btn-secondary" data-act="cancel">${esc(cancelLabel)}</button>
                <button class="btn btn-primary" data-act="ok">${esc(okLabel)}</button>
            </div>
        </div>`;

        function close(result) {
            overlay.remove();
            document.removeEventListener('keydown', onKey, true);
            resolve(result);
        }
        function onKey(ev) {
            if (ev.key === 'Escape') { ev.preventDefault(); close(false); }
            if (ev.key === 'Enter') { ev.preventDefault(); close(true); }
        }
        overlay.addEventListener('click', (ev) => {
            if (ev.target === overlay) return close(false); // clique no fundo = cancelar
            const btn = ev.target.closest('button[data-act]');
            if (btn) close(btn.dataset.act === 'ok');
        });
        document.addEventListener('keydown', onKey, true);
        document.body.appendChild(overlay);
        overlay.querySelector('button[data-act="ok"]').focus();
    });
}
