/* ===== Imports ===== */
import { LEVELS } from '../config.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { state } from '../state.js';
import { renderAchievements } from '../ui/achievementsView.js';
import { renderAlphabets } from '../ui/alphabetGrid.js';
import { renderList } from '../ui/wordList.js';
export function updateStats() { 
    const uniqueCategories = [...new Set(state.words.map(w => w.category ? w.category.trim() : '').filter(c => c))];
const unlockedCount = state.achievements.filter(a => a.unlocked).length;
    document.getElementById('stat-words').textContent = state.words.length; 
    document.getElementById('stat-kanji').textContent = state.kanji.length; 
    document.getElementById('stat-achievements').textContent = unlockedCount; 
    document.getElementById('stat-categories').textContent = uniqueCategories.length;
document.getElementById('stat-xp').textContent = state.xp;
} 

export function updateUI() { 
    const currentLevelData = LEVELS.find(l => l.level === state.level);
const nextLevelData = LEVELS.find(l => l.level === state.level + 1);
    document.getElementById('level-display').textContent = `Level ${state.level}`; 
    let xpRequired = nextLevelData ?
nextLevelData.xp - currentLevelData.xp : 0; 
    let xpGained = nextLevelData ? state.xp - currentLevelData.xp : state.xp - currentLevelData.xp;
let progress = nextLevelData ? (xpGained / xpRequired) * 100 : 100;
    document.getElementById('xp-progress').style.width = `${progress}%`; 
    document.getElementById('xp-label').textContent = nextLevelData ?
`${xpGained} XP / ${xpRequired} XP` : 'MAX LEVEL!'; 
    
    // Render Lists 
    renderList(); 
    renderAlphabets();
// Update Stats 
    updateStats();
    
    // Render Achievements
    renderAchievements();
// Atualiza a opção de som
    const soundSettingEl = document.getElementById('setting-sound');
if (soundSettingEl) {
        soundSettingEl.checked = !state.settings.sound;
// Invertido, checked = 'desativar sons'
    }
} 
