/* ===== Jap-Dex — bootstrap da aplicação =====
   Módulo de entrada: expõe as funções usadas pelos handlers inline
   (onclick/onchange/onkeyup) em `window` e inicializa a interface.  */

import { state, saveState } from './state.js';
import { updateUI } from './ui/stats.js';
import { checkAllAchievements } from './achievementLogic.js';
import { switchTab, clearForm, speak, toggleMenu, setAlphabetView, toggleWordExtra } from './ui/tabs.js';
import { renderList, clearFilters } from './ui/wordList.js';
import { renderAlphabets } from './ui/alphabetGrid.js';
import {
  addWord, deleteWord, toggleWordSeen, toggleAllWordsSeen,
  openEditModal, closeEditModal, saveEditedWord,
  quickAddWord,
} from './crud/words.js';
import {
  addKanji, deleteKanji, openKanjiEditModal,
  closeKanjiEditModal, saveEditedKanji,
} from './crud/kanji.js';
import {
  openQuizModal, closeQuizModal, checkModalAnswer, modalNext, setQuizFocus,
} from './quiz.js';
import { buyPack, renderShop } from './ui/shop.js';
import { startTutorial } from './ui/tutorial.js';
import { exportJSON, importJSON, resetProgress, autoBackup, restoreAutoBackup, renderBackupBanner } from './io/backup.js';
import { checkForUpdates, saveGhToken, clearGhToken,
  downloadAndInstallUpdate, installDownloadedUpdate } from './updateCheck.js';
import { applyTheme, cycleTheme, setTheme } from './theme.js';
import { claimDaily, ensureDaily } from './daily.js';

export function init() {
  try {
    // Garante que o estado importado tenha as novas estruturas e IDs (para palavras/kanji)
    state.words.forEach(w => {
      w.stats = w.stats || { correct: 0, wrong: 0, last: null, srs_level: 0, next_review_date: null };
      w.stats.srs_level = w.stats.srs_level || 0;
      w.stats.next_review_date = w.stats.next_review_date || null;
      if (typeof w.seen !== 'boolean') w.seen = false;
      if (w.id === undefined) w.id = Date.now() + Math.random();
    });
    state.kanji.forEach(k => {
      if (k.id === undefined) k.id = Date.now() + Math.random();
    });

    // Pré-carrega as vozes (boa prática)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }

    saveState();
    autoBackup(); // v4.11: slot de segurança a cada 24h
    updateUI();

    // Garante que a aba 'Dicionário' esteja ativa no início
    const dictLink = document.querySelector('.sidebar-links a[onclick*="switchTab(\'dict\', this)"]');
    if (dictLink) {
      switchTab('dict', dictLink);
    } else {
      // Fallback se o seletor falhar (usa o primeiro link)
      switchTab('dict', document.querySelector('.sidebar-links a'));
    }

    checkAllAchievements();

    // ===== Menu lateral (drawer) =====
    ensureDaily(); // missões diárias do dia (v4.10)
    document.getElementById('menu-toggle')
      ?.addEventListener('click', () => toggleMenu());
    document.getElementById('menu-backdrop')
      ?.addEventListener('click', () => toggleMenu(false));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') toggleMenu(false);
    });

    // ===== Tema rápido (v4.11.1: o botão não tinha listener — não fazia nada) =====
    document.getElementById('theme-toggle')
      ?.addEventListener('click', () => cycleTheme());

    // ===== Tutorial em etapas (1ª execução + botão "?") =====
    document.getElementById('help-btn')
      ?.addEventListener('click', () => startTutorial());
    if (!state.settings.tutorialSeen) {
      setTimeout(() => startTutorial(), 700);
    }
  } catch (e) {
    console.error('Erro fatal durante a inicialização.', e);
  }
}

/* ===== Exposição de funções essenciais - OBRIGATÓRIO PARA ONCLICK =====
   Módulos ES não colocam nada em `window` automaticamente, então cada
   função referenciada em um atributo inline precisa ser registrada aqui. */
Object.assign(window, {
  switchTab,
  clearForm,
  speak,
  toggleMenu,
  setAlphabetView,
  toggleWordExtra,
  renderList,
  renderAlphabets,
  renderShop,
  buyPack,
  startTutorial,
  setQuizFocus,
  addWord,
  deleteWord,
  toggleWordSeen,
  toggleAllWordsSeen,
  openEditModal,
  closeEditModal,
  saveEditedWord,
  quickAddWord,
  addKanji,
  deleteKanji,
  openKanjiEditModal,
  closeKanjiEditModal,
  saveEditedKanji,
  openQuizModal,
  closeQuizModal,
  checkModalAnswer,
  modalNext,
  exportJSON,
  importJSON,
  resetProgress,
  restoreAutoBackup,
  checkForUpdates,
  downloadAndInstallUpdate,
  installDownloadedUpdate,
  saveGhToken,
  clearGhToken,
  setTheme,
  cycleTheme,
  clearFilters,
  claimDaily,
  updateUI,
});

/* ===== Listeners globais ===== */
applyTheme(); // tema antes mesmo da 1ª renderização (evita flash)
document.addEventListener('DOMContentLoaded', init);

// Uma única fonte de verdade para o toggle de som
// (o original tinha ESTE listener duplicado em dois lugares)
document.getElementById('setting-sound').addEventListener('change', function () {
  state.settings.sound = !this.checked; // Invertido: checked = 'desativar sons'
  saveState();
});
