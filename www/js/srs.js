/* ===== Imports ===== */
import { SRS_INTERVALS } from './config.js';
import { shuffleArray } from './quiz.js';
import { state } from './state.js';
/* ===== SRS / DATAS (Mantido) ===== */
export function updateWordSRS(wordId, isCorrect) {
    const word = state.words.find(w => w.id === wordId);
if (!word) return;

    // Aumenta/diminui o nível SRS
    let currentLevel = word.stats.srs_level;
    let newLevel = currentLevel;
if (isCorrect) {
        newLevel = Math.min(6, currentLevel + 1);
} else {
        newLevel = Math.max(0, currentLevel - 1);
}

    word.stats.srs_level = newLevel;
    
    // Calcula a próxima data de revisão
    const intervalData = SRS_INTERVALS.find(i => i.level === newLevel);
if (intervalData) {
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + intervalData.days);
// Garante que a data seja de fato no futuro
        if(intervalData.days === 0 && new Date() > nextReview) {
             nextReview.setHours(nextReview.getHours() + 1);
// Se nível 0, reaparece em 1 hora
        }
        word.stats.next_review_date = nextReview.toISOString();
} else {
        word.stats.next_review_date = null;
// Nível máximo
    }
}

/**
 * Retorna palavras para o quiz de vocabulário, incluindo todas as "Não vistas"
 * e todas as palavras SRS com revisão pendente.
*/
export function getWordsForReview() {
    const now = new Date();
// 1. Palavras SRS (nível > 0 e data de revisão no passado)
    const srsReview = state.words.filter(w => 
        w.stats.srs_level > 0 && 
        w.stats.next_review_date && 
        new Date(w.stats.next_review_date) <= now
    );
// 2. Palavras NOVAS (Não vistas, que precisam ser quizadas pela primeira vez)
    const newWords = state.words.filter(w => !w.seen);
// Combina novos e SRS, garantindo que novos sempre sejam incluídos.
    let reviewList = srsReview.concat(newWords);
// Remove duplicatas
    const uniqueReviewList = Array.from(new Set(reviewList));
// Mistura a lista para dar uma chance igual a todos os itens urgentes e novos
    return shuffleArray(uniqueReviewList);
}
