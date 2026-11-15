/* ===== Imports ===== */
import { renderAchievements } from '../ui/achievementsView.js';
import { renderAlphabets } from '../ui/alphabetGrid.js';
import { renderList } from '../ui/wordList.js';
/* switchTab: MESCLAGEM DAS DUAS DEFINIÇÕES ORIGINAIS (bug nº1)
   - da 1ª versão: guarda `if (element)` — a 2ª lançava TypeError com
     element nulo (ex.: chamada programática por JS);
   - da 2ª versão: re-render ao trocar de aba, senão Estatísticas,
     Alfabetos e Dicionário ficavam desatualizados.
   No arquivo original havia 2 `function switchTab`; a última sobrescrevia
   a primeira e tinha o bug do element nulo. Aqui existe uma só.        */
export function switchTab(tabId, element) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  document.querySelectorAll('.sidebar-links a').forEach(link => link.classList.remove('active'));
  if (element) {
    element.classList.add('active');
  }
  // Força a renderização ao trocar de aba (necessário para estatísticas/alfabetos)
  if (tabId === 'alphabets') renderAlphabets();
  if (tabId === 'achievements') renderAchievements();
  if (tabId === 'dict') renderList();
}

export function clearForm(formId) {
  document.getElementById(formId).reset();
}

/**
 * NOVO: Função para Pronúncia (Web Speech API)
 * CORRIGIDA a seleção de idioma para Chrome Mobile.
 * @param {string} text O texto (palavra) a ser pronunciado.
 */
export function speak(text, lang = 'ja-JP') {
    if (!('speechSynthesis' in window)) {
        console.warn("Speech Synthesis API não suportada neste navegador.");
return;
    }

    // Cancela qualquer fala em andamento
    window.speechSynthesis.cancel(); 

    const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = lang; 

    // Tenta encontrar uma voz específica para o idioma (melhora a qualidade)
    const voices = window.speechSynthesis.getVoices();
const specificVoice = voices.find(voice => voice.lang === lang || voice.name.includes(lang.split('-')[0]));
if (specificVoice) {
        utterance.voice = specificVoice;
} else {
        console.log(`Voz para ${lang} não encontrada, usando a voz padrão.`);
}
    
    // Configurações opcionais
    utterance.rate = 1.0; 
    utterance.pitch = 1.0;
window.speechSynthesis.speak(utterance);
}
