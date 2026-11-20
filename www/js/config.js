/* ===== CONSTANTS / DATA (ATUALIZADO PARA INCLUIR THRESHOLDS DE PALAVRAS) ===== */
/* BUG Nº9: a UI dizia v4.7 mas a chave era jp_app_v4_0 — unificado para
   v4_7. O antigo jp_app_v4_0 é migrado automaticamente em state.js.   */
export const STORAGE_KEY = 'jp_app_v4_7';
/* Versão atual do app (usada no "Verificar atualizações") — bumpar a cada
   release junto com package.json/index.html.                            */
export const APP_VERSION = '4.12.1';
export const ALPHA_SILVER_THRESHOLD = 3; 
export const ALPHA_GOLD_THRESHOLD = 5;   // 5 acertos = DOMINADA (maestria)
export const WORD_SILVER_THRESHOLD = 3; // Adicionado como constante global (Ponto 3)
export const WORD_GOLD_THRESHOLD = 5; // v4.9: alinhado a 5 = DOMINADA (era 6)

export const XP_BY_JLPT = { 'N5': 20, 'N4': 30, 'N3': 40, 'N2': 
50, 'N1': 60, 'None': 10 };
export const QUIZ_XP_BY_JLPT = { 'N5': 10, 'N4': 15, 'N3': 20, 'N2': 25, 'N1': 30, 'None': 5, 'hiragana': 2, 
'katakana': 2, 'kanji': 5 };

// INTERVALOS DE REVISÃO SRS (em dias)
export const SRS_INTERVALS = [
    { level: 0, days: 0 },   
    { level: 1, days: 1 }, 
    { level: 2, days: 3 },
    { level: 3, days: 7 },
    { level: 4, days: 15 },
    { level: 5, days: 30 },
    { level: 
6, days: 60 }, 
];
export const LEVELS = [
  { level: 1, xp: 0 }, { level: 2, xp: 100 }, { level: 3, xp: 250 }, { level: 4, xp: 450 }, { level: 5, xp: 700 },
  { level: 6, xp: 1000 }, { level: 7, xp: 1350 }, { level: 8, xp: 1750 }, { level: 9, xp: 2200 }, { level: 10, xp: 2700 },
  { level: 11, xp: 3300 }, { level: 12, xp: 4000 }, { level: 13, xp: 4800 }, { level: 14, xp: 5700 }, { level: 15, xp: 
6700 },
  { level: 16, xp: 7800 }, { level: 17, xp: 9000 }, { level: 18, xp: 10300 }, { level: 19, xp: 11700 }, { level: 20, xp: 13200 },
  { level: 21, xp: 14800 }, { level: 22, xp: 16500 }, { level: 23, xp: 18300 }, { level: 24, xp: 20200 }, { level: 25, xp: 22200 },
  { level: 26, xp: 24300 }, { level: 27, xp: 26500 }, { level: 28, xp: 28800 }, { level: 29, xp: 31200 }, { level: 30, xp: 33700 },
  /* BUG Nº4: o original terminava no nível 30, tornando as conquistas
     lvl_40/lvl_50 inalcançáveis. Curva mantida: +100 XP de incremento
     por nível (L30→31 = 2600, ..., L49→50 = 4500).                   */
  { level: 31, xp: 36300 }, { level: 32, xp: 39000 }, { level: 33, xp: 41800 }, { level: 34, xp: 44700 }, { level: 35, xp: 47700 },
  { level: 36, xp: 50800 }, { level: 37, xp: 54000 }, { level: 38, xp: 57300 }, { level: 39, xp: 60700 }, { level: 40, xp: 64200 },
  { level: 41, xp: 67800 }, { level: 42, xp: 71500 }, { level: 43, xp: 75300 }, { level: 44, xp: 79200 }, { level: 45, xp: 83200 },
  { level: 46, xp: 87300 }, { level: 47, xp: 91500 }, { level: 48, xp: 95800 }, { level: 49, xp: 100200 }, { level: 50, xp: 104700 },
];
