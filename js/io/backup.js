/* ===== Imports ===== */
import { checkAllAchievements } from '../achievementLogic.js';
import { LEVELS, STORAGE_KEY } from '../config.js';
import { showConfirm, showFlyout } from '../notifications.js';
import { defaultState, replaceState, resetState, saveState, state } from '../state.js';
import { updateUI } from '../ui/stats.js';
export function exportJSON() {
    saveState();
// Garante o estado mais recente
    const dataStr = JSON.stringify(state, null, 2);
const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
a.download = `jap-dex_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    /* BUG Nº6: alert() bloqueante → toast não-bloqueante */
    showFlyout('xp', 'Exportado!', 'Dados exportados com sucesso.', '<i class="fas fa-download"></i>');
}

export function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    /* BUG Nº6: onload agora é async para usar o modal inline de confirmação */
    reader.onload = async function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            /* BUG Nº3: `!importedData.xp` rejeitava backups válidos com XP 0
               (0 é falsy). Agora valida o TIPO, não a veracidade.          */
            if (!importedData || typeof importedData !== 'object' ||
                !Array.isArray(importedData.words) || typeof importedData.xp !== 'number') {
                showFlyout('wrong', 'Erro na importação', 'O arquivo JSON parece estar corrompido ou não é um backup válido do Jap-Dex.', '<i class="fas fa-times-circle"></i>');
                return;
            }

            const merge = await showConfirm(
                'Importar backup',
                'Deseja MESCLAR os dados importados com o progresso atual? Clique em "Cancelar" para SUBSTITUIR completamente.',
                'Mesclar',
                'Substituir'
            );
            if (merge) {
                // Mesclar (Lógica de Mesclagem)
                // 1. XP/Level: Usa o maior XP
                state.xp = Math.max(state.xp, importedData.xp || 0);
// 2. Palavras: Adiciona palavras novas, atualiza as existentes com base no ID
                const importedWordsMap = new Map(importedData.words.map(w => [w.id, w]));
const currentWordsMap = new Map(state.words.map(w => [w.id, w]));
                
                importedWordsMap.forEach((impWord, id) => {
                    const currentWord = currentWordsMap.get(id);
                    if (currentWord) {
                        // Mescla, priorizando o progresso (acertos/erros/srs) mais alto
             
           currentWord.text = impWord.text;
                        currentWord.reading = impWord.reading;
                        currentWord.translation = impWord.translation;
                        currentWord.jlpt = impWord.jlpt;
         
               currentWord.category = impWord.category;
                        currentWord.tags = impWord.tags;
                        currentWord.notes = impWord.notes;
                        currentWord.seen = currentWord.seen || impWord.seen;
   
                     currentWord.stats.correct = Math.max(currentWord.stats.correct, impWord.stats?.correct || 0);
                        currentWord.stats.wrong = Math.max(currentWord.stats.wrong, impWord.stats?.wrong || 0);
                        currentWord.stats.srs_level = Math.max(currentWord.stats.srs_level, impWord.stats?.srs_level ||
0);
                        // A data de revisão é mais complexa, manter a mais antiga (mais próxima)
                        if (!currentWord.stats.next_review_date || (impWord.stats?.next_review_date && new Date(impWord.stats.next_review_date) < new Date(currentWord.stats.next_review_date))) {
                            currentWord.stats.next_review_date = impWord.stats.next_review_date;
}

                    } else {
                        // Nova palavra
                        state.words.push(impWord);
}
                });
// 3. Kanji: Mesclagem similar (simples, prioriza a versão do save)
                const importedKanjiMap = new Map(importedData.kanji.map(k => [k.id, k]));
const currentKanjiMap = new Map(state.kanji.map(k => [k.id, k]));
                
                importedKanjiMap.forEach((impKanji, id) => {
                    if (!currentKanjiMap.has(id)) {
                        state.kanji.push(impKanji);
                    }
                });
// 4. Estatísticas de Alfabeto/Kanji (usa o maior valor)
                Object.keys(importedData.alphaStats || {}).forEach(char => {
                    state.alphaStats[char] = state.alphaStats[char] || { correct: 0, wrong: 0 };
                    state.alphaStats[char].correct = Math.max(state.alphaStats[char].correct, importedData.alphaStats[char].correct || 0);
                  
  state.alphaStats[char].wrong = Math.max(state.alphaStats[char].wrong, importedData.alphaStats[char].wrong || 0);
                });
Object.keys(importedData.kanjiStats || {}).forEach(char => {
                    state.kanjiStats[char] = state.kanjiStats[char] || { correct: 0, wrong: 0 };
                    state.kanjiStats[char].correct = Math.max(state.kanjiStats[char].correct, importedData.kanjiStats[char].correct || 0);
                    state.kanjiStats[char].wrong = Math.max(state.kanjiStats[char].wrong, importedData.kanjiStats[char].wrong || 0);
                });
// 5. Conquistas: Mescla (mantém unlocked=true se em qualquer um estiver true)
                const importedAchMap = new Map((importedData.achievements || []).map(a => [a.id, a]));
state.achievements = state.achievements.map(localAch => { 
                    const importedAch = importedAchMap.get(localAch.id); 
                    if (importedAch) { 
                        localAch.current = Math.max(localAch.current, importedAch.current); 
                    
    localAch.unlocked = localAch.unlocked || importedAch.unlocked; 
                    } 
                    return localAch; 
                });
} else { 
                // Substituir 
                replaceState(importedData);
} 
            
            // Garante que o estado importado tenha as novas estruturas e IDs (para palavras/kanji) 
            state.words.forEach(w=> { 
                w.stats = w.stats || {correct:0,wrong:0,last:null,srs_level:0,next_review_date:null}; 
                w.stats.srs_level = w.stats.srs_level || 0; 
     
           w.stats.next_review_date = w.stats.next_review_date || null; 
                if(typeof w.seen !== 'boolean') w.seen = false; 
                if(w.id === undefined) w.id = Date.now() + Math.random(); 
            });
state.kanji.forEach(k => {
                 if(k.id === undefined) k.id = Date.now() + Math.random();
            });
// Revalida o nível de XP
            let newLevel = 1;
for (let i = LEVELS.length - 1; i >= 0; i--) {
                if (state.xp >= LEVELS[i].xp) {
                    newLevel = LEVELS[i].level;
break;
                }
            }
            state.level = newLevel;
saveState();
            checkAllAchievements();
            updateUI();
            /* BUG Nº6: alert() → toast */
            showFlyout('xp', 'Importado!', 'Dados importados e mesclados/substituídos com sucesso!', '<i class="fas fa-check"></i>');

        } catch (e) {
            console.error(e);
            showFlyout('wrong', 'Erro ao importar', 'Erro ao processar o arquivo JSON. Verifique o console para mais detalhes.', '<i class="fas fa-times-circle"></i>');
        }
    };
    reader.readAsText(file);
}

export async function resetProgress() {
    /* BUG Nº6: confirm()/alert() bloqueantes → modal inline + toast.
       O reload é adiado 1.5s para o usuário ver a confirmação.        */
    const ok = await showConfirm(
        'Resetar progresso',
        'ATENÇÃO: Esta ação é irreversível e apagará TODO o seu progresso (palavras, kanji, XP, etc.). Tem certeza?',
        'Apagar tudo'
    );
    if (ok) {
        localStorage.removeItem(STORAGE_KEY);
        resetState();
        saveState();
        updateUI();
        showFlyout('xp', 'Progresso resetado', 'Recarregando a página...', '<i class="fas fa-trash"></i>');
        setTimeout(() => window.location.reload(), 1500);
    }
}
