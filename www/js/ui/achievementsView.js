/* ===== Imports ===== */
import { checkAllAchievements } from '../achievementLogic.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { state } from '../state.js';
import { esc } from '../utils.js';
export function renderAchievements() {
    // Garante que todas as conquistas tenham o campo `current`
    checkAllAchievements();
const gridEl = document.getElementById('achievement-grid');
    if (!gridEl) return;

    gridEl.innerHTML = state.achievements.map(ach => {
        let progressText;
        if (ach.unlocked) {
            progressText = 'Conquistado!';
        } else if (ach.type === 'category') {
             progressText = `${ach.current} / ${ach.value} Categorias Únicas`; 
        } else if (ach.type === 'hira_gold' || ach.type === 'kata_gold') {
    
         // Usa a contagem total para as conquistas de 1/10
             progressText = `${ach.current} / ${ach.value} Caracteres Ouro`;
        } else if (ach.type === 'kanji_gold') {
             progressText = `${ach.current} / ${ach.value} Kanji Ouro`;
        } else if (ach.type === 'cat_word_count') { // Novo caso para categorias específicas
          
   progressText = `${ach.current} / ${ach.value} Palavras em ${ach.category_key}`;
        } else if (ach.type === 'jlpt') { // Novo caso para JLPT
             progressText = `${ach.current} / ${ach.value} Palavras JLPT`;
        
        /* === INÍCIO DA CORREÇÃO v3.8.1 (Atualizada) === */
        } else if (ach.type === 'word_gold') { 
             progressText = `${ach.current} / ${ach.value} Palavras Ouro`;
        } else if (ach.type === 'word') {
             progressText = `${ach.current} / ${ach.value} Palavras`;
        } else if (ach.type === 'level') {
             progressText = `${ach.current} / ${ach.value} Níveis`;
        } else if (ach.type === 'kanji') {
             progressText = `${ach.current} / ${ach.value} Kanjis`;
        } else if (ach.type === 'quiz') {
             progressText = `${ach.current} / ${ach.value} Quizzes`;
        } else if (ach.type === 'hira_mastery') { // Correção adicionada
             progressText = `${ach.current} / ${ach.value} Caracteres (Hiragana)`;
        } else if (ach.type === 'kata_mastery') { // Correção adicionada
             progressText = `${ach.current} / ${ach.value} Caracteres (Katakana)`;
        /* === FIM DA CORREÇÃO v3.8.1 === */
        
        } else {
            // Fallback (Mantido para segurança)
            progressText = `${ach.current} / ${ach.value} ${ach.type.charAt(0).toUpperCase() + ach.type.slice(1)}s`;
}

        return `<div class="achievement-card ${ach.unlocked ? 
            'unlocked' : ''}" title="${esc(ach.name)}: ${esc(ach.desc)}"> 
                <i class="${esc(ach.icon)}"></i> 
                <h4>${esc(ach.name)}</h4> 
                <p class="ach-desc">${esc(ach.desc)}</p> 
                <p 
class="ach-progress">${esc(progressText)}</p> 
            </div> `; 
    }).join('');
const unlockedCount = state.achievements.filter(a => a.unlocked).length;
    document.getElementById('unlocked-achievements-count').textContent = unlockedCount; 
    document.getElementById('total-achievements-count').textContent = state.achievements.length;
} 
