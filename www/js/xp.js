/* ===== Imports ===== */
import { checkAchievements } from './achievementLogic.js';
import { LEVELS } from './config.js';
import { processNotifQueue } from './notifications.js';
import { notifQueue, saveState, state } from './state.js';
import { updateUI } from './ui/stats.js';
export function addXP(amount) {
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
