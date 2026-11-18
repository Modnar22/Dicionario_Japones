/* ===== Imports ===== */
import { STORAGE_KEY } from './config.js';
import { ACHIEVEMENTS } from './data/achievements.js';

/* Chaves antigas do localStorage que ainda podem existir em instalações
   antigas — migradas automaticamente para STORAGE_KEY no loadState().  */
const LEGACY_STORAGE_KEYS = ['jp_app_v4_0'];
/* ===== STATE MANAGEMENT =====
   Módulo dono do estado global.
   NOTA: ES modules não permitem reatribuir um `let` importado de outro
   módulo, por isso `replaceState()` e `resetState()` são expostos para
   quem precisa trocar o objeto inteiro (io/backup.js).            */
export let state = loadState();

export let notifQueue = [];
export function replaceState(newState) { state = newState; }
export function resetState() { state = defaultState(); }

export function defaultState() {
    return { 
        xp: 0, 
        level: 1, 
        words: [], 
        kanji: [], 
        alphaStats: {}, 
        kanjiStats: {}, 
        ownedPacks: [], // Loja: ids dos pacotes comprados
        achievements: JSON.parse(JSON.stringify(ACHIEVEMENTS)), 
        settings: { 
           
 sound: true, 
            tutorialSeen: false,   // tutorial em etapas já foi concluído?
            focusNonMastered: false, // quiz: focar em não dominadas?
            theme: 'auto',          // 'auto' | 'light' | 'dark' (v4.10)
        }, 
    };
} 

export function loadState() { 
    let stored = localStorage.getItem(STORAGE_KEY);
    /* BUG Nº9: migração automática — se a chave nova não existir mas uma
       legada sim, copia para a chave nova e remove a antiga.            */
    if (!stored) {
        for (const legacyKey of LEGACY_STORAGE_KEYS) {
            const legacy = localStorage.getItem(legacyKey);
            if (legacy) {
                stored = legacy;
                localStorage.setItem(STORAGE_KEY, legacy);
                localStorage.removeItem(legacyKey);
                break;
            }
        }
    }
if (stored) { 
        let loadedState = JSON.parse(stored);
// Mesclagem de conquistas 
        const defaultAchievementsMap = new Map(ACHIEVEMENTS.map(a => [a.id, a]));
if (loadedState.achievements) {
            loadedState.achievements = loadedState.achievements.map(ach => {
                // Preencher com o default se a conquista for nova
                return { ...defaultAchievementsMap.get(ach.id), ...ach };
            });
// Adicionar conquistas novas que não existiam no save
            ACHIEVEMENTS.filter(a => !loadedState.achievements.find(la => la.id === a.id))
                        .forEach(newAch => loadedState.achievements.push(JSON.parse(JSON.stringify(newAch))));
} else {
            loadedState.achievements = JSON.parse(JSON.stringify(ACHIEVEMENTS));
}
        
        // Garante que as palavras e kanji tenham os novos campos de estatísticas
        loadedState.words = loadedState.words.map(w => ({
            ...w,
            id: w.id || Date.now() + Math.random(), // Garante ID
            seen: w.seen !== undefined ? w.seen : false, // Garante campo 'seen'
     
       stats: {
                correct: w.stats?.correct || 0,
                wrong: w.stats?.wrong || 0,
                last: w.stats?.last || null,
                srs_level: w.stats?.srs_level || 0,
                
next_review_date: w.stats?.next_review_date || null,
            }
        }));
loadedState.kanji = loadedState.kanji.map(k => ({
            ...k,
            id: k.id || Date.now() + Math.random(), // Garante ID
        }));
// Garante o objeto settings (mescla chaves novas em saves antigos)
        loadedState.settings = { ...defaultState().settings, ...(loadedState.settings || {}) };

        // Loja: garante a lista de pacotes comprados (saves antigos)
        loadedState.ownedPacks = Array.isArray(loadedState.ownedPacks) ? loadedState.ownedPacks : [];

        return loadedState;
} 
    return defaultState();
} 

export function saveState() { 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
