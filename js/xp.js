/* ===== Imports ===== */
import { checkAchievements } from './achievementLogic.js';
import { LEVELS } from './config.js';
import { calculateLevel, processNotifQueue } from './notifications.js';
import { notifQueue, saveState, state } from './state.js';
import { bumpDaily } from './daily.js';
import { updateUI } from './ui/stats.js';
export function addXP(amount) {
    if (amount > 0) bumpDaily('xp_gained', amount); // missão "Caçador de XP"
    const oldLevel = state.level;
    state.xp += amount;
// Calcula novo nível
    let newLevel = state.level;
for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (state.xp >= LEVELS[i].xp) {
            newLevel = LEVELS[i].level;
break;
        }
    }
    
    // Se o nível mudou, notifica
    if (newLevel > oldLevel) {
        state.level = newLevel;
// Adiciona o Level Up na fila
        notifQueue.push({ type: 'level-up', level: state.level });
checkAchievements(state.level, 'level');
    } else {
        // Adiciona o ganho de XP na fila
        // O som do XP Blip é chamado DENTRO de processNotifQueue agora
        notifQueue.push({ type: 'xp', amount: amount });
}
    saveState();
    updateUI();
    processNotifQueue(); // Inicia (ou tenta iniciar) o processamento da fila
}

/* ===== Loja: gastar XP =====
   Recalcula o nível a partir do XP restante (pode diminuir — o XP é a
   moeda da loja). Devolve false se não houver XP suficiente.          */
export function spendXP(amount) {
    if (!amount || amount <= 0 || state.xp < amount) return false;
    state.xp -= amount;
    state.level = calculateLevel(state.xp);
    saveState();
    updateUI();
    return true;
}
