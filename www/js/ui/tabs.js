/* ===== Imports ===== */
import { renderAchievements } from '../ui/achievementsView.js';
import { renderAlphabets } from '../ui/alphabetGrid.js';
import { renderList } from '../ui/wordList.js';

/* ===== Menu lateral (botão ☰ fixo) =====
   O sidebar é um drawer: começa fechado; o botão alterna `body.menu-open`.
   Fecha ao escolher uma aba, ao clicar no fundo ou no Esc. */
export function toggleMenu(force) {
  const open = typeof force === 'boolean'
    ? force
    : !document.body.classList.contains('menu-open');
  document.body.classList.toggle('menu-open', open);
  const btn = document.getElementById('menu-toggle');
  if (btn) {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    btn.innerHTML = open
      ? '<i class="fas fa-times"></i>'
      : '<i class="fas fa-bars"></i>';
  }
}

/* ===== Seletor de alfabeto (aba Alfabetos) =====
   Mostra apenas um "view" por vez: hiragana, katakana ou kanji. */
export function setAlphabetView(view) {
  document.querySelectorAll('.alpha-view').forEach(v => {
    v.hidden = (v.id !== 'alpha-view-' + view);
  });
  document.querySelectorAll('.alphabet-selector .alpha-tab').forEach(tab => {
    const active = tab.dataset.view === view;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  if (view === 'kanji') renderAlphabets(); // re-render com a busca atual
}

/* switchTab: MESCLAGEM DAS DUAS DEFINIÇÕES ORIGINAIS (bug nº1)
   - da 1ª versão: guarda `if (element)` — a 2ª lançava TypeError com
     element nulo (ex.: chamada programática por JS);
   - da 2ª versão: re-render ao trocar de aba, senão Estatísticas,
     Alfabetos e Dicionário ficavam desatualizados.
   No arquivo original havia 2 `function switchTab`; a última sobrescrevia
   a primeira e tinha o bug do element nulo. Aqui existe uma só.        */
export function switchTab(tabId, element) {
  toggleMenu(false); // fecha o drawer ao navegar
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

/* ===== Pronúncia (Web Speech API + áudio local) =====
   Problema anterior: `getVoices()` retorna [] na 1ª chamada (carregamento
   assíncrono) e, sem voz japonesa instalada no SO, o utterance não soa.
   Correção: cadeia em 4 níveis:
   1) kana curto → arquivo local assets/audio/kana/*.mp3 (offline);
   2) voz japonesa local (cache + voiceschanged);
   3) TTS online (Google, tl=ja) — exigido `referrer: no-referrer`;
   4) voz padrão do sistema.                                          */
let cachedVoices = [];

function refreshVoices() {
  if ('speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices() || [];
  }
}

if ('speechSynthesis' in window) {
  refreshVoices();
  window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
}

function findVoice(lang) {
  if (!cachedVoices.length) refreshVoices();
  const wanted = (lang || 'ja-JP').toLowerCase().replace('_', '-');
  const base = wanted.split('-')[0];
  return (
    // 1) correspondência exata (ex.: ja-JP)
    cachedVoices.find(v => (v.lang || '').toLowerCase().replace('_', '-') === wanted) ||
    // 2) qualquer voz do idioma (ex.: ja)
    cachedVoices.find(v => (v.lang || '').toLowerCase().replace('_', '-').startsWith(base)) ||
    // 3) nomes conhecidos de vozes japonesas (SAPI/Google)
    cachedVoices.find(v =>
      /japan|japon|nihon|nihongo|haruka|kaori|ayumi|kyoko|nanami|otoya|misaki|sakura|google.*日本/i.test(v.name || '')
    ) ||
    null
  );
}

function speakWithVoice(text, lang, voice) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  if (voice) utterance.voice = voice;
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

/* Áudio LOCAL dos kana: assets/audio/kana/<codepoints>.mp3
   Pré-baixado (208 arquivos) — pronúncia garantida 100% offline,
   sem depender de voz instalada no sistema. */
let currentAudio = null;

function kanaLocalPath(text) {
  const chars = [...text];
  if (chars.length < 1 || chars.length > 2) return null; // base + combinações (ex.: きゃ)
  const isKana = chars.every((ch) => {
    const cp = ch.codePointAt(0);
    return (cp >= 0x3040 && cp <= 0x309F)   // hiragana
        || (cp >= 0x30A0 && cp <= 0x30FF);  // katakana
  });
  if (!isKana) return null;
  return 'assets/audio/kana/'
    + chars.map((ch) => ch.codePointAt(0).toString(16)).join('-')
    + '.mp3';
}

/* Cadeia de fallback para textos que não são kana curto (palavras, kanji):
   1) voz japonesa local (speechSynthesis); 2) TTS online (Google, tl=ja);
   3) voz padrão do sistema. */
function speakFallback(text, lang) {
  if (!('speechSynthesis' in window)) return;
  const voice = findVoice(lang);
  if (voice) {
    speakWithVoice(text, lang, voice);
    return;
  }
  const url = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ja&q='
    + encodeURIComponent(text);
  const audio = new Audio(url);
  audio.play().catch(() => speakWithVoice(text, lang, null)); // último recurso
}

export function speak(text, lang = 'ja-JP') {
  if (!text) return;

  // Cancela qualquer fala em andamento
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }

  // 1) Kana → arquivo local (offline, sem voz do sistema)
  const local = kanaLocalPath(text);
  if (local) {
    const audio = new Audio(local);
    currentAudio = audio;
    audio.play().catch(() => {
      // arquivo ausente/erro → cai para a cadeia de síntese
      if (currentAudio === audio) speakFallback(text, lang);
    });
    return;
  }

  // 2) Palavras/kanji → cadeia de síntese
  speakFallback(text, lang);
}
