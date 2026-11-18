/* ===== Imports ===== */
import { SRS_INTERVALS, WORD_GOLD_THRESHOLD, WORD_SILVER_THRESHOLD } from '../config.js';
import { deleteWord, openEditModal, toggleWordSeen } from '../crud/words.js';
import { getWordsForReview } from '../srs.js';
import { state } from '../state.js';
import { speak } from '../ui/tabs.js';
import { esc, escJS } from '../utils.js';
export function makeWordItemHTML(word) {
    // === USANDO AS CONSTANTES GLOBAIS ===
    const jlptTag = word.jlpt !== 'None' ?
`<span class="jlpt-tag">${esc(word.jlpt)}</span>` : '';
    const categoryTag = word.category ? `<span class="cat-tag">${esc(word.category)}</span>` : '';
    /* Maestria: 5+ acertos = DOMINADA (chip visível; a borda já vem da classe) */
    const masteryTag = word.stats.correct >= WORD_GOLD_THRESHOLD
        ? `<span class="mastery-tag" title="Dominada (5+ acertos)">🏆 Dominada</span>` : '';
    /* BUG Nº7: srs_level pode vir corrompido de um backup importado —
       coercido para número antes de entrar em atributos/HTML.          */
    const srsLevel = Number(word.stats.srs_level) || 0;
const srsTag = `<span class="srs-level-tag srs-${srsLevel}" title="Nível SRS: ${srsLevel} (${SRS_INTERVALS.find(i => i.level === srsLevel)?.days || 60} dias)">SRS L${srsLevel}</span>`;
let proficiencyClass = '';
    if (word.stats.correct >= WORD_GOLD_THRESHOLD) {
        proficiencyClass = 'char-gold';
} else if (word.stats.correct >= WORD_SILVER_THRESHOLD) {
        proficiencyClass = 'char-silver';
}

    const seenClass = word.seen ? 'seen' : '';
// Formata a data da próxima revisão
    let reviewDateText = 'Pronto para Revisão';
if (srsLevel > 0 && word.stats.next_review_date) {
        const nextReview = new Date(word.stats.next_review_date);
const today = new Date();
        today.setHours(0,0,0,0);
        const reviewDay = new Date(nextReview);
        reviewDay.setHours(0,0,0,0);
if (reviewDay.getTime() <= today.getTime()) {
            reviewDateText = `Revisar! (L${srsLevel})`;
} else {
            const diffTime = Math.abs(reviewDay.getTime() - today.getTime());
const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
reviewDateText = `Revisão em ${diffDays} dia${diffDays !== 1 ? 's' : ''}`;
}
    } else if (srsLevel === 0 && !word.seen) {
        reviewDateText = 'Novo';
} else if (srsLevel === 6) {
        reviewDateText = 'Dominado! (L6)';
} else {
        reviewDateText = 'Visto';
}

    const correctBadge = word.stats.correct > 0 ? `<span style="color:var(--success); font-size: 0.9em; margin-left: 5px;" title="Acertos">${word.stats.correct}</span>` : '';
const wrongBadge = word.stats.wrong > 0 ? `<span style="color:var(--danger); font-size: 0.9em; margin-left: 5px;" title="Erros">${word.stats.wrong}</span>` : '';
return `
        <li class="word-item ${proficiencyClass} ${seenClass}" data-id="${esc(word.id)}">
            <div class="word-details">
                <div class="word-text">${esc(word.text)}</div>
                <div class="word-reading">${esc(word.reading)}</div>
                <div class="word-translation">${esc(word.translation)}</div>
                <div class="word-meta" style="margin-top: 5px;">
    
                ${srsTag}
                    ${jlptTag}
                    ${categoryTag}
                    ${masteryTag}
                    <span style="color:var(--muted); font-size:0.8em; margin-left:10px;">${reviewDateText}</span>
                    ${correctBadge}
 
                   ${wrongBadge}
                </div>
            </div>
            <div class="word-actions">
                <button onclick="openEditModal('${escJS(word.id)}')"><i class="fas fa-edit" title="Editar"></i></button>
                <button onclick="speak('${escJS(word.text)}', 'ja-JP')" title="Pronunciar 
Palavra">
                    <i class="fas fa-volume-up"></i>
                </button>
                <button onclick="toggleWordSeen('${escJS(word.id)}')">
                    <i class="fas ${word.seen ?
'fa-eye-slash' : 'fa-eye'}" title="${word.seen ? 'Desmarcar como Vista' : 'Marcar como Vista'}"></i>
                </button>
                <button onclick="deleteWord('${escJS(word.id)}')" style="color:var(--danger);"><i class="fas fa-trash-alt" title="Excluir"></i></button>
            </div>
        </li>
    `;
}

export function renderList() { 
    const listEl = document.getElementById('word-list');
    const searchInput = document.getElementById('search-input').value.toLowerCase().trim();
    const jlptFilter = document.getElementById('filter-jlpt').value;
    
const categoryFilter = document.getElementById('filter-category').value;

    /* ===== ESTADOS VAZIOS GUIADOS (v4.10) ===== */
    if (state.words.length === 0) {
        listEl.innerHTML = `
        <li class="empty-state">
          <i class="fas fa-seedling empty-icon" aria-hidden="true"></i>
          <h3>Comece seu dicionário!</h3>
          <p>Você ainda não anotou nenhuma palavra. Adicione uma acima ou
             clique em uma das <strong>palavras-primeiras</strong>:</p>
          <div class="empty-quick">
            <button class="btn btn-primary" onclick="quickAddWord('犬','いぬ','cachorro')">
              犬 <small>(いぬ · cachorro)</small></button>
            <button class="btn btn-primary" onclick="quickAddWord('ありがとう','ありがとう','obrigado(a)')">
              ありがとう <small>(obrigado)</small></button>
            <button class="btn btn-primary" onclick="quickAddWord('学校','がっこう','escola')">
              学校 <small>(がっこう)</small></button>
          </div>
          <div class="empty-actions">
            <button class="btn btn-secondary" onclick="switchTab('shop')">
              <i class="fas fa-store"></i> Comprar pacote na Loja</button>
            <button class="btn btn-secondary" onclick="startTutorial()">
              <i class="fas fa-route"></i> Fazer o tutorial</button>
          </div>
        </li>`;
        document.getElementById('word-count').textContent = 0;
        document.getElementById('srs-review-count').textContent = 0;
        document.getElementById('srs-review-count').style.color = 'var(--muted)';
        return;
    }

    let filteredWords = state.words;

    // 1. Filtering by Search
    if (searchInput) {
        filteredWords = filteredWords.filter(word => 
            word.text.toLowerCase().includes(searchInput) ||
            word.reading.toLowerCase().includes(searchInput) ||
            word.translation.toLowerCase().includes(searchInput)
        );
    }

    // 2. Filtering by JLPT
    if (jlptFilter) 
{
        filteredWords = filteredWords.filter(word => word.jlpt === jlptFilter);
}
    
    // 3. Filtering by Category
    if (categoryFilter) {
        filteredWords = filteredWords.filter(word => word.category && word.category.trim() === categoryFilter);
}
    
    listEl.innerHTML = filteredWords.length > 0
        ? filteredWords.map(makeWordItemHTML).join('')
        : `<li class="empty-state empty-no-results">
             <i class="fas fa-filter empty-icon" aria-hidden="true"></i>
             <h3>Nenhuma palavra encontrada</h3>
             <p>Nada bate com a busca ou os filtros ativos.</p>
             <button class="btn btn-primary" onclick="clearFilters()">
               <i class="fas fa-undo"></i> Limpar busca e filtros</button>
           </li>`;
    document.getElementById('word-count').textContent = filteredWords.length;
// Atualiza o contador de revisão
    const reviewCount = getWordsForReview().length;
    document.getElementById('srs-review-count').textContent = reviewCount;
document.getElementById('srs-review-count').style.color = reviewCount > 0 ? 'var(--gold1)' : 'var(--muted)';

    // Atualiza o filtro de categorias
    const uniqueCategories = [...new Set(state.words.map(w => w.category ? w.category.trim() : '').filter(c => c))].sort();
const categoryFilterEl = document.getElementById('filter-category');
    const currentCategory = categoryFilterEl.value;
    categoryFilterEl.innerHTML = '<option value="">Todas Categorias</option>' + 
                                  uniqueCategories.map(cat => 
                                      `<option value="${esc(cat)}" ${cat === currentCategory ? 'selected' : ''}>${esc(cat)}</option>`
    
                              ).join('');
} 

/* Limpa busca e filtros (usado pelo estado "nenhum resultado"). */
export function clearFilters() {
    const search = document.getElementById('search-input');
    if (search) search.value = '';
    const jlpt = document.getElementById('filter-jlpt');
    if (jlpt) jlpt.value = '';
    const cat = document.getElementById('filter-category');
    if (cat) cat.value = '';
    renderList();
}
