/* ===== Imports ===== */
import { ALPHA_GOLD_THRESHOLD, WORD_GOLD_THRESHOLD } from './config.js';
import { ACHIEVEMENTS } from './data/achievements.js';
import { HIRAGANA_CHARS_FULL, KATAKANA_CHARS_FULL } from './data/alphabets.js';
import { processNotifQueue } from './notifications.js';
import { notifQueue, saveState, state } from './state.js';
import { renderAchievements } from './ui/achievementsView.js';
import { updateUI } from './ui/stats.js';
export function unlockAchievement(id) { 
    const ach = state.achievements.find(a => a.id === id);
if (ach && !ach.unlocked) { 
        ach.unlocked = true; 
        saveState();
// Adiciona a conquista na fila
        notifQueue.push({ type: 'achievement', name: ach.name });
        processNotifQueue();
// Inicia (ou tenta iniciar) o processamento da fila 
        updateUI(); 
        return true;
} 
    return false;
} 

export function checkAchievements(newValue, type) {
    let achievementUnlocked = false;

    // Conquistas baseadas em contagem simples (word, level, kanji, quiz)
    state.achievements.filter(ach => 
        (ach.type === 'word' || ach.type === 'level' || ach.type === 'kanji' || ach.type === 'quiz') && !ach.unlocked
    ).forEach(ach => {
        if (ach.type === type) {
            if (newValue > ach.current) ach.current = newValue;
            if (ach.current >= ach.value) {
                unlockAchievement(ach.id);
                achievementUnlocked = true;
            }
        }
    });

    // Conquistas baseadas em contagem de categorias únicas (category)
    if (type === 'category') {
        const uniqueCategories = [...new Set(state.words.map(w => w.category ? w.category.trim() : '').filter(c => c))];
        state.achievements.filter(a => a.type === 'category' && !a.unlocked).forEach(ach => {
            ach.current = uniqueCategories.length;
            if (uniqueCategories.length >= ach.value) {
                unlockAchievement(ach.id);
                achievementUnlocked = true;
            }
        });
    }

    // Caso especial de contagem de palavras por Categoria E PROFICIÊNCIA DE PALAVRAS/KANJI
    if (type === 'word' || type === 'category' || type === 'word_correct' || type === 'kanji_correct') {
        
        // 1. Contagem de palavras por Categoria (cat_word_count)
        const wordCountsByCategory = state.words.reduce((acc, w) => {
            const cat = w.category ? w.category.trim() : '';
            if (cat) { acc[cat] = (acc[cat] || 0) + 1; }
            return acc;
        }, {});
        state.achievements.filter(a => a.type === 'cat_word_count' && !a.unlocked).forEach(ach => {
            const categoryToTrack = ach.category_key ? ach.category_key.trim() : '';
            if (!categoryToTrack) return;
            const currentCount = wordCountsByCategory[categoryToTrack] || 0;
            ach.current = currentCount;
            if (currentCount >= ach.value) {
                unlockAchievement(ach.id);
                achievementUnlocked = true;
            }
        });

        // 2. NOVO: Proficiência Ouro de Palavras (word_gold)
        if (type === 'word_correct') {
            const wordGoldCount = state.words.filter(w => (w.stats.correct || 0) >= WORD_GOLD_THRESHOLD).length;
            state.achievements.filter(a => a.type === 'word_gold' && !a.unlocked).forEach(ach => {
                ach.current = wordGoldCount;
                if (wordGoldCount >= ach.value) {
                    unlockAchievement(ach.id);
                    achievementUnlocked = true;
                }
            });
        }

        // 3. NOVO: Proficiência Ouro de Kanji (kanji_gold)
        if (type === 'kanji_correct') {
            const kanjiGoldCount = state.kanji.filter(k => (state.kanjiStats[k.char]?.correct || 0) >= ALPHA_GOLD_THRESHOLD).length;
            state.achievements.filter(a => a.type === 'kanji_gold' && !a.unlocked).forEach(ach => {
                ach.current = kanjiGoldCount;
                if (kanjiGoldCount >= ach.value) {
                    unlockAchievement(ach.id);
                    achievementUnlocked = true;
                }
            });
        }
    }


    // Casos especiais de Alfabeto (hira_correct, kata_correct)
    if (type === 'hira_correct' || type === 'kata_correct') {
        const stats = state.alphaStats;
        const charsFull = type === 'hira_correct' ? HIRAGANA_CHARS_FULL : KATAKANA_CHARS_FULL;
        const prefix = type === 'hira_correct' ? 'hira' : 'kata';
        
        const goldCount = charsFull.filter(char => (stats[char]?.correct || 0) >= ALPHA_GOLD_THRESHOLD).length;

        // 1. Conquistas de Contagem Ouro (hira_gold / kata_gold)
        state.achievements.filter(a => a.type === prefix + '_gold' && !a.unlocked).forEach(ach => {
            ach.current = goldCount;
            if (goldCount >= ach.value) {
                unlockAchievement(ach.id);
                achievementUnlocked = true;
            }
        });

        // 2. NOVO: Conquistas de Maestria (hira_mastery / kata_mastery)
        state.achievements.filter(a => a.type === prefix + '_mastery' && !a.unlocked).forEach(ach => {
            const totalChars = charsFull.length; 
            ach.current = goldCount; // Progresso é a contagem de ouro
            
            // Checa se todos os caracteres alcançaram a proficiência Ouro
            if (goldCount >= totalChars) {
                unlockAchievement(ach.id);
                achievementUnlocked = true;
            }
        });
    }

    // Checagem de Conquistas JLPT
    if (type === 'jlpt_add') { // Chamada em addWord se houver nível JLPT
        const jlptCounts = state.words.reduce((acc, w) => {
            if (w.jlpt && w.jlpt !== 'None') {
                acc[w.jlpt] = (acc[w.jlpt] || 0) + 1;
            }
            return acc;
        }, {});

        state.achievements.filter(a => a.type === 'jlpt' && !a.unlocked).forEach(ach => {
            const level = ach.id.split('_')[1].toUpperCase(); // Ex: N5
            const currentCount = jlptCounts[level] || 0;
            ach.current = currentCount;
            if (currentCount >= ach.value) {
                unlockAchievement(ach.id);
                achievementUnlocked = true;
            }
        });
    }


    if (achievementUnlocked) {
        renderAchievements();
        saveState();
    }
}

export function checkAllAchievements() {
    // 1. Check Word Count
    checkAchievements(state.words.length, 'word');
// 2. Check Kanji Count
    checkAchievements(state.kanji.length, 'kanji');
// 3. Check Level (se for chamado após o load)
    checkAchievements(state.level, 'level');
// 4. Check Unique Categories
    const uniqueCategories = [...new Set(state.words.map(w => w.category ? w.category.trim() : '').filter(c => c))];
checkAchievements(uniqueCategories, 'category');

    // 5. Check Hiragana/Katakana Gold
    checkAchievements(null, 'hira_correct');
    checkAchievements(null, 'kata_correct');
// 6. Check JLPT Achievements (Recalcula total)
    const jlptWordCounts = state.words.reduce((acc, w) => {
        const jlpt = w.jlpt || 'None';
        acc[jlpt] = (acc[jlpt] || 0) + 1;
        return acc;
    }, {});
state.achievements.filter(a => a.type === 'jlpt').forEach(ach => {
        const jlptLevel = ach.id.split('_')[1].toUpperCase();
        const currentCount = jlptWordCounts[jlptLevel] || 0;
        ach.current = currentCount;
        if (ach.current >= ach.value && !ach.unlocked) {
            unlockAchievement(ach.id);
        }
    });
// 7. Check Category Word Count Achievements (Recalcula total)
    const wordCountsByCategory = state.words.reduce((acc, w) => {
        const cat = w.category ? w.category.trim() : '';
        if (cat) {
            acc[cat] = (acc[cat] || 0) + 1;
        }
        return acc;
    }, {});
state.achievements.filter(a => a.type === 'cat_word_count').forEach(ach => {
        const categoryToTrack = ach.category_key ? ach.category_key.trim() : '';
        if (!categoryToTrack) return;
        const currentCount = wordCountsByCategory[categoryToTrack] || 0;
        ach.current = currentCount;
        if (currentCount >= ach.value && !ach.unlocked) {
            unlockAchievement(ach.id);
        }
    });
}
