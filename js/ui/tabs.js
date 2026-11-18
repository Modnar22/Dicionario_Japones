/* ===== Imports ===== */
import { renderAchievements } from '../ui/achievementsView.js';
import { renderAlphabets } from '../ui/alphabetGrid.js';
import { renderShop } from '../ui/shop.js';
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
  if (tabId === 'shop') renderShop();
}

export function clearForm(formId) {
  document.getElementById(formId).reset();
}

/* ===== Formulário "Mais opções" =====
   Revela/esconde os campos opcionais (JLPT, Categoria, Tags, Notas)
   do formulário "Adicionar Nova Palavra". */
export function toggleWordExtra() {
  const box = document.getElementById('word-extra-fields');
  const btn = document.getElementById('word-more-btn');
  if (!box || !btn) return;
  const open = box.hidden; // estava oculto → vai abrir
  box.hidden = !open;
  btn.setAttribute('aria-expanded', String(open));
  btn.classList.toggle('open', open);
}

/* ===== Pronúncia (TTS nativo no APK + Web Speech API + áudio local) =====
   Cadeia de fallback:
   0) kana curto → arquivo local assets/audio/kana/*.mp3 (offline);
   1) APK (Capacitor) → plugin NATIVO TextToSpeech (voz do Android, offline
      se o pacote de idioma japonês estiver instalado) — corrige o bug de
      voz muda no Android;
   2) speechSynthesis local (Electron/navegador) com voz japonesa;
   3) TTS online (Google, tl=ja) — exigido `referrer: no-referrer`;
   4) voz padrão do sistema (último recurso web).                        */
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

/* Plugin nativo (Android/Capacitor). Só existe no plataforma nativa —
   no Electron/navegador `isNativePlatform()` é false e retornamos null. */
let nativeTTS = null;
let nativeTTSChecked = false;
function getNativeTTS() {
  if (nativeTTSChecked) return nativeTTS;
  nativeTTSChecked = true;
  try {
    const cap = window.Capacitor;
    if (!cap) return null;
    if (typeof cap.isNativePlatform === 'function' && !cap.isNativePlatform()) return null;
    if (typeof cap.registerPlugin === 'function') {
      nativeTTS = cap.registerPlugin('TextToSpeech');
    } else if (cap.Plugins && cap.Plugins.TextToSpeech) {
      nativeTTS = cap.Plugins.TextToSpeech;
    }
  } catch (e) {
    nativeTTS = null;
  }
  return nativeTTS;
}

/* Aviso de "sem voz" — uma vez por sessão (evita toast a cada clique). */
let warnedNoVoice = false;
function warnNoVoice(detail) {
  if (warnedNoVoice) return;
  warnedNoVoice = true;
  showFlyout('wrong', 'Voz japonesa indisponível', detail,
    '<i class="fas fa-volume-mute"></i>');
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

/* TTS online (Google) — usado como fallback quando não há voz local.
   `onFail` é chamado se o áudio não puder tocar (offline/bloqueio). */
function playGoogleTTS(text, lang, onFail) {
  const tl = (lang || 'ja-JP').split('-')[0];
  const url = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl='
    + tl + '&q=' + encodeURIComponent(text);
  const audio = new Audio(url);
  currentAudio = audio;
  audio.play().catch(() => {
    if (currentAudio === audio) {
      currentAudio = null;
      if (onFail) onFail();
    }
  });
}

/* Falha do TTS nativo: quase sempre = pacote de voz japonês não instalado
   no Android. Orienta o usuário e tenta o TTS online como alívio.       */
function nativeSpeakFailed(text, lang) {
  const ntts = getNativeTTS();
  const fallbackOnline = () => playGoogleTTS(text, lang, () =>
    warnNoVoice('Instale o pacote de voz japonês nas configurações de TTS do Android ou conecte-se à internet para ouvir a pronúncia.'));
  if (ntts && typeof ntts.isLanguageSupported === 'function') {
    ntts.isLanguageSupported({ lang: lang || 'ja-JP' })
      .then((r) => {
        if (r && r.supported === false) {
          warnNoVoice('Instale o pacote de voz japonês nas configurações de TTS do Android (Configurar → Vozes → Japonês) ou conecte-se à internet.');
          if (typeof ntts.openInstall === 'function') ntts.openInstall().catch(() => {});
        }
        fallbackOnline();
      })
      .catch(fallbackOnline);
  } else {
    fallbackOnline();
  }
}

/* Cadeia de síntese para textos que não são kana curto (palavras/kanji). */
function speakFallback(text, lang) {
  // 1) APK: TTS NATIVO do Android (corrige voz muda no celular)
  const ntts = getNativeTTS();
  if (ntts && typeof ntts.speak === 'function') {
    ntts.speak({
      text, lang: lang || 'ja-JP',
      rate: 1.0, pitch: 1.0, volume: 1.0, queueStrategy: 0, // Flush: nova fala substitui
    }).catch(() => nativeSpeakFailed(text, lang));
    return;
  }

  // 2) Web (Electron/navegador) com speechSynthesis
  if ('speechSynthesis' in window) {
    const voice = findVoice(lang);
    if (voice) {
      speakWithVoice(text, lang, voice);
      return;
    }
    // Sem voz japonesa local → tenta online; se falhar, voz padrão
    playGoogleTTS(text, lang, () => speakWithVoice(text, lang, null));
    return;
  }

  // 3) BUG CORRIGIDO: WebView sem speechSynthesis retornava em silêncio
  //    sem tentar o TTS online — agora tenta (e avisa se não conseguir).
  playGoogleTTS(text, lang, () =>
    warnNoVoice('Não há síntese de voz neste dispositivo. Conecte-se à internet para ouvir a pronúncia.'));
}

export function speak(text, lang = 'ja-JP') {
  if (!text) return;

  // Cancela qualquer fala em andamento (web + nativo)
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  const ntts = getNativeTTS();
  if (ntts && typeof ntts.stop === 'function') ntts.stop().catch(() => {});

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
