/* ===== Imports ===== */
import { checkAchievements } from './achievementLogic.js';
import { ALPHA_GOLD_THRESHOLD, ALPHA_SILVER_THRESHOLD, QUIZ_XP_BY_JLPT, WORD_GOLD_THRESHOLD, WORD_SILVER_THRESHOLD } from './config.js';
import { getWordIndex } from './crud/words.js';
import { HIRAGANA_CHARS_FULL, HIRAGANA_ROMANJI_FULL, KANJI_EXAMPLES, KATAKANA_CHARS_FULL, KATAKANA_ROMANJI_FULL } from './data/alphabets.js';
import { processNotifQueue, showFlyout } from './notifications.js';
import { getWordsForReview, updateWordSRS } from './srs.js';
import { notifQueue, saveState, state } from './state.js';
import { updateUI } from './ui/stats.js';
import { speak } from './ui/tabs.js';
import { addXP } from './xp.js';
/* ===== QUIZ LOGIC (Modificado: Proficiência) =====
   Módulo dono do quiz em andamento (`currentQuiz`).      */
export let currentQuiz = {
    type: 'voc',
    questions: [],
    index: 0,
    question: null,
    totalCorrect: 0,
};

export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
[array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function getQuizQuestion(type) { 
    if (type === 'voc') { 
        // Prioriza palavras "Não vistas" (!w.seen) e se não houver, usa as de revisão SRS.
let availableWords = state.words.filter(w => !w.seen);

        if (availableWords.length === 0) {
             // Fallback para a lista padrão de revisão (SRS L>0)
             availableWords = getWordsForReview().filter(w => w.seen);
// Exclui 'newWords' que já foram tratadas acima
        }

        if (availableWords.length === 0) return null;
const word = availableWords[Math.floor(Math.random() * availableWords.length)];

        // Pergunta: Kanji/Kana -> Tradução (70%) ou Tradução -> Kanji/Kana (30%)
        const questionType = Math.random() < 0.7 ?
'wordToTranslation' : 'translationToWord';
        let text, hint, answer, xpKey = word.jlpt;
if (questionType === 'wordToTranslation') {
            text = word.text + ' (' + word.reading + ')';
hint = 'Qual a tradução?';
            answer = word.translation;
        } else {
            text = word.translation;
hint = 'Qual a palavra em Japonês (Kanji/Kana)?';
            // Aceita tanto o Kanji/Kana quanto a leitura. Usa "/" para permitir ambos.
            answer = `${word.text}/${word.reading}`; 
        }

        return { type: 'voc', question: { word: word }, text: text, hint: hint, answer: answer, xpKey: xpKey };
} else if (type === 'hiragana' || type === 'katakana') { 
        // Usa os arrays FULL com combinações
        const chars = type === 'hiragana' ?
HIRAGANA_CHARS_FULL : KATAKANA_CHARS_FULL;
        const romanji = type === 'hiragana' ? HIRAGANA_ROMANJI_FULL : KATAKANA_ROMANJI_FULL;
        const stats = state.alphaStats;
        // "Focar em não dominadas": exclui caracteres já DOMINADOS (5+ acertos).
        // Se tudo estiver dominado, usa a lista completa (quiz nunca fica vazio).
        let indexes = chars.map((_, i) => i);
        if (state.settings.focusNonMastered) {
            const pending = indexes.filter(i => (stats[chars[i]]?.correct || 0) < ALPHA_GOLD_THRESHOLD);
            if (pending.length > 0) indexes = pending;
        }
// Seleção ponderada (mais erros = mais chances, menos acertos = mais chances)
        let weightedChars = [];
indexes.forEach(index => {
            const char = chars[index];
            const charStats = stats[char] || { correct: 0, wrong: 0 };
            // Peso: Inverso dos acertos (mínimo 1 para chars não vistos) + erros
            const weight = Math.max(1, ALPHA_GOLD_THRESHOLD - charStats.correct) + charStats.wrong * 2;
            for (let i = 0; i < weight; i++) {
        
        weightedChars.push({ char: char, romaji: romanji[index] });
            }
        });
if (weightedChars.length === 0) return null; 

        // Seleciona um caractere aleatório da lista ponderada 
        const selectedChar = weightedChars[Math.floor(Math.random() * weightedChars.length)];
// Força a pergunta a ser sempre Caractere -> Romaji
        const questionType = 'charToRomaji';
let text, hint, answer, xpKey = type;
        
        // Usa apenas a lógica Caractere -> Romaji
        text = selectedChar.char;
hint = 'Qual a leitura (romaji)?'; 
        answer = selectedChar.romaji; 
        
        return { type: type, question: { char: selectedChar.char }, text: text, hint: hint, answer: answer, xpKey: xpKey };
} else if (type === 'kanji') { 
        // === QUIZ DE KANJI FOCADO EM LEITURA ROMAJI (Mantido) ===
        const kanjiList = state.kanji.filter(k => k.on || k.kun);
// Filtra apenas Kanijs com leituras
        const stats = state.kanjiStats;
if (kanjiList.length === 0) {
             // Se não houver kanji pessoal, usa os exemplos (se tiver leituras)
             const exampleKanjiList = KANJI_EXAMPLES.filter(k => k.on || k.kun);
if (exampleKanjiList.length > 0) {
                 kanjiList.push(...exampleKanjiList);
}
        }
        
        if (kanjiList.length === 0) return null;
        // "Focar em não dominadas": exclui kanji já DOMINADOS (5+ acertos)
        if (state.settings.focusNonMastered) {
            const pending = kanjiList.filter(k => (stats[k.char]?.correct || 0) < ALPHA_GOLD_THRESHOLD);
            if (pending.length > 0) { kanjiList.length = 0; kanjiList.push(...pending); }
        }
// Seleção ponderada (mais erros = mais chances)
        let weightedKanji = [];
kanjiList.forEach(k => {
            const kStats = stats[k.char] || { correct: 0, wrong: 0 };
            const weight = Math.max(1, ALPHA_GOLD_THRESHOLD - kStats.correct) + kStats.wrong * 2;
            for (let i = 0; i < weight; i++) {
                weightedKanji.push(k);
            }
     
   });
        if (weightedKanji.length === 0) return null; 

        const selectedKanji = weightedKanji[Math.floor(Math.random() * weightedKanji.length)];
// Combina todas as leituras On e Kun em uma única string de resposta esperada, separadas por '/'.
const allReadings = [selectedKanji.on, selectedKanji.kun]
                            .filter(r => r && r.trim() !== '')
                            .join('/');
if (allReadings.length === 0) {
            return getQuizQuestion('kanji');
}

        const text = selectedKanji.char;
        const hint = `Qual(is) a(s) leitura(s) On/Kun?
(Ex: ${selectedKanji.meaning}). Digite em Romaji/Kana.`;
        
        return {
            type: 'kanji',
            question: { char: selectedKanji.char },
            text: text,
            hint: hint,
            answer: allReadings, 
            xpKey: 'kanji' 
        };
}
    return null;
} 

export function openQuizModal(type) { 
    currentQuiz.type = type;
    currentQuiz.totalCorrect = 0;
// O sistema de questões 'questions' é ignorado; usamos getQuizQuestion diretamente
    const question = getQuizQuestion(type);
if (!question) {
        /* BUG Nº6: alert() bloqueante → toast não-bloqueante */
        showFlyout('wrong', 'Quiz indisponível',
            type === 'voc'
                ? 'Você não tem palavras novas (Não vistas) ou pendentes de revisão SRS.'
                : 'Você não tem itens para quiz neste momento! Adicione mais itens ou complete todos os quizzes.',
            '<i class="fas fa-info-circle"></i>');
        return;
    }
    currentQuiz.question = question; 
    // Linha "Focar em não dominadas": só faz sentido em quizzes de itens
    const focusRow = document.getElementById('quiz-focus-row');
    if (focusRow) {
        focusRow.hidden = (type === 'voc');
        const focusCb = document.getElementById('quiz-focus-nonmastered');
        if (focusCb) focusCb.checked = !!state.settings.focusNonMastered;
    }
    document.getElementById('quiz-title').textContent = type === 'voc' ?
'Quiz de Vocabulário' : type === 'hiragana' ?
    'Quiz de Hiragana' : type === 'katakana' ?
'Quiz de Katakana' : 'Quiz de Kanji'; 
    document.getElementById('quiz-question-text').textContent = question.text;
    document.getElementById('quiz-translation-hint').textContent = question.hint; 
    document.getElementById('quiz-feedback').textContent = ''; 
    document.getElementById('quiz-answer-input').value = '';
document.getElementById('quiz-answer-input').disabled = false; 
    document.getElementById('quiz-submit-btn').style.display = 'inline-block'; 
    document.getElementById('quiz-next-btn').style.display = 'none'; 
    document.getElementById('quiz-modal').classList.add('active');
    setTimeout(() => document.getElementById('quiz-answer-input').focus(), 100);
// Auto-pronúncia para quizzes de caracteres/kanji
    if (type !== 'voc' && state.settings.sound) {
        speak(question.text, 'ja-JP');
}
} 

export function closeQuizModal() { 
    document.getElementById('quiz-modal').classList.remove('active'); 
    // Garante que o quiz completado conte para as conquistas
    if (currentQuiz.totalCorrect > 0) {
        checkAchievements(state.achievements.find(a => a.type === 'quiz')?.current + 1 || 1, 'quiz');
}
    updateUI(); 
} 

/* Preferência "Focar em não dominadas" (persiste em settings). */
export function setQuizFocus(checked) {
    state.settings.focusNonMastered = !!checked;
    saveState();
}

export function checkModalAnswer() { 
    const inputEl = document.getElementById('quiz-answer-input');
const feedbackEl = document.getElementById('quiz-feedback');
    const userAnswer = inputEl.value.trim().toLowerCase(); 
    
    // Usa a resposta completa (que pode conter / ou ;)
    const correctAnswerRaw = currentQuiz.question.answer.trim().toLowerCase();
// Aceita múltiplas respostas separadas por / ou ;
    const answers = correctAnswerRaw.split(/[\/;]/).map(a => a.trim().toLowerCase()).filter(a => a);
const isCorrect = answers.includes(userAnswer);

    if (isCorrect) { 
        feedbackEl.textContent = '✅ Correto!';
feedbackEl.style.color = 'var(--success)'; 
        currentQuiz.totalCorrect++; 
        const xpAmount = QUIZ_XP_BY_JLPT[currentQuiz.question.xpKey] ||
        0; 
        addXP(xpAmount);
// Atualiza estatísticas (Acerto) E CHECAGEM DE PROFICIÊNCIA (PONTO 3)
        if (currentQuiz.type === 'voc') { 
            const word = currentQuiz.question.question.word;
const index = getWordIndex(word.id);
            if (index !== -1) { 
                const oldCorrect = state.words[index].stats.correct;
state.words[index].stats.correct++;
                const newCorrect = state.words[index].stats.correct;

                // Checagem de Proficiência de Vocabulário
                if (oldCorrect < WORD_SILVER_THRESHOLD && newCorrect >= WORD_SILVER_THRESHOLD) {
                    notifQueue.push({ type: 'proficiency', tier: 'Prata', item: word.text });
} else if (oldCorrect < WORD_GOLD_THRESHOLD && newCorrect >= WORD_GOLD_THRESHOLD) {
                    notifQueue.push({ type: 'proficiency', tier: 'Ouro', item: word.text });
}

                state.words[index].stats.last = new Date().toISOString();
// Marca como vista se for a primeira vez
                state.words[index].seen = true;
updateWordSRS(word.id, true);
            } 
        } else if (currentQuiz.type === 'hiragana' || currentQuiz.type === 'katakana') { 
            const char = currentQuiz.question.question.char;
state.alphaStats[char] = state.alphaStats[char] || { correct: 0, wrong: 0 }; 
            const oldCorrect = state.alphaStats[char].correct;
            state.alphaStats[char].correct++;
            const newCorrect = state.alphaStats[char].correct;
// Checagem de Proficiência de Alfabeto
            const typeName = currentQuiz.type === 'hiragana' ?
'Hiragana' : 'Katakana';
            if (oldCorrect < ALPHA_SILVER_THRESHOLD && newCorrect >= ALPHA_SILVER_THRESHOLD) {
                notifQueue.push({ type: 'proficiency', tier: 'Prata', item: char, type_name: typeName });
} else if (oldCorrect < ALPHA_GOLD_THRESHOLD && newCorrect >= ALPHA_GOLD_THRESHOLD) {
                notifQueue.push({ type: 'proficiency', tier: 'Ouro', item: char, type_name: typeName });
}

            checkAchievements(null, currentQuiz.type === 'hiragana' ? 'hira_correct' : 'kata_correct');
} else if (currentQuiz.type === 'kanji') { 
            const char = currentQuiz.question.question.char;
state.kanjiStats[char] = state.kanjiStats[char] ||
            { correct: 0, wrong: 0 }; 
            const oldCorrect = state.kanjiStats[char].correct;
            state.kanjiStats[char].correct++;
            const newCorrect = state.kanjiStats[char].correct;
// Checagem de Proficiência de Kanji
            if (oldCorrect < ALPHA_SILVER_THRESHOLD && newCorrect >= ALPHA_SILVER_THRESHOLD) {
                notifQueue.push({ type: 'proficiency', tier: 'Prata', item: char, type_name: 'Kanji' });
} else if (oldCorrect < ALPHA_GOLD_THRESHOLD && newCorrect >= ALPHA_GOLD_THRESHOLD) {
                notifQueue.push({ type: 'proficiency', tier: 'Ouro', item: char, type_name: 'Kanji' });
}

            checkAchievements(null, 'kanji_correct');
} 

        // Processa a fila para mostrar as notificações
        processNotifQueue();
} else {
        feedbackEl.textContent = `❌ Incorreto! A resposta era: ${answers.join(' / ')}`;
feedbackEl.style.color = 'var(--danger)';

        // Atualiza estatísticas (Erro)
        if (currentQuiz.type === 'voc') { 
            const word = currentQuiz.question.question.word;
const index = getWordIndex(word.id);
            if (index !== -1) { 
                state.words[index].stats.wrong++;
state.words[index].stats.last = new Date().toISOString();
                // Se errou a revisão, o SRS é rebaixado
                updateWordSRS(word.id, false);
} 
        } else if (currentQuiz.type === 'hiragana' || currentQuiz.type === 'katakana') { 
            const char = currentQuiz.question.question.char;
state.alphaStats[char] = state.alphaStats[char] || { correct: 0, wrong: 0 }; 
            state.alphaStats[char].wrong++;
} else if (currentQuiz.type === 'kanji') { 
            const char = currentQuiz.question.question.char;
state.kanjiStats[char] = state.kanjiStats[char] ||
            { correct: 0, wrong: 0 }; 
            state.kanjiStats[char].wrong++;
} 
    } 
    
    document.getElementById('quiz-submit-btn').style.display = 'none'; 
    document.getElementById('quiz-next-btn').style.display = 'inline-block';
inputEl.disabled = true; 
    saveState(); 
} 

export function modalNext() { 
    const nextQuestion = getQuizQuestion(currentQuiz.type);
if (!nextQuestion) {
        /* BUG Nº5: alert() bloqueante substituído por toast não-bloqueante */
        showFlyout('xp', 'Quiz finalizado', `Você acertou ${currentQuiz.totalCorrect} questão(ões).`, '<i class="fas fa-flag-checkered"></i>');
        closeQuizModal();
        return;
}
    currentQuiz.question = nextQuestion; 
    document.getElementById('quiz-question-text').textContent = nextQuestion.text; 
    document.getElementById('quiz-translation-hint').textContent = nextQuestion.hint; 
    document.getElementById('quiz-feedback').textContent = ''; 
    document.getElementById('quiz-answer-input').value = '';
document.getElementById('quiz-answer-input').disabled = false;
    document.getElementById('quiz-submit-btn').style.display = 'inline-block'; 
    document.getElementById('quiz-next-btn').style.display = 'none'; 
    
    setTimeout(() => document.getElementById('quiz-answer-input').focus(), 100);
// Auto-pronúncia para quizzes de caracteres/kanji
    if (currentQuiz.type !== 'voc' && state.settings.sound) {
        speak(nextQuestion.text, 'ja-JP');
}
}
