/* ===== Imports ===== */
import { checkAllAchievements } from '../achievementLogic.js';
import { XP_BY_JLPT } from '../config.js';
import { showConfirm, showFlyout } from '../notifications.js';
import { saveState, state } from '../state.js';
import { updateUI } from '../ui/stats.js';
import { clearForm } from '../ui/tabs.js';
import { renderList } from '../ui/wordList.js';
import { addXP } from '../xp.js';
export function getWordIndex(id) {
    // Garante que o ID é tratado como número (embora usemos string-id)
    return state.words.findIndex(w => w.id == id);
}

export function addWord(e) {
    e.preventDefault();
    const form = e.target;
    
    // 1. Obter os valores que serão verificados
    const textValue = form['word-text'].value.trim();
    const readingValue = form['word-reading'].value.trim();

    /* === V3.8.8: REGRA DE PREVENÇÃO DE DUPLICIDADE === */
    const isDuplicate = state.words.some(
        // Verifica se o texto OU a leitura já existem no dicionário
        w => (w.text === textValue || w.reading === readingValue)
    );

    if (isDuplicate) {
        /* BUG Nº6: alert() bloqueante → toast não-bloqueante */
        showFlyout('wrong', 'Palavra duplicada', `A palavra "${textValue}" ou a leitura "${readingValue}" já existe neste dicionário.`, '<i class="fas fa-times-circle"></i>');
        
        // Opcional: Limpar os campos do formulário após o alerta
        form.reset(); 
        
        return; 
    }
const newWord = {
        id: Date.now() + Math.random(), // ID único
        text: textValue, // Usa o valor já limpo
        reading: readingValue, // Usa o valor já limpo
        translation: form['word-translation'].value.trim(),
        jlpt: form['word-jlpt'].value,
        category: form['word-category'].value.trim(),
        tags: form['word-tags'].value.split(',').map(tag => tag.trim()).filter(tag => tag),
        notes: form['word-notes'].value.trim(),
        seen: false, 
        stats: { 
            correct: 0,
            wrong: 0,
            last: null,
            srs_level: 0,
            next_review_date: null,
        }
    };
state.words.push(newWord);
    clearForm('add-word-form');
    addXP(XP_BY_JLPT[newWord.jlpt]); // Adiciona XP ao adicionar a palavra
    checkAllAchievements();
// Verifica se alguma conquista foi desbloqueada
    saveState();
    updateUI();
}

export async function deleteWord(id) {
    /* BUG Nº6: confirm() bloqueante → modal inline assíncrono */
    if (!(await showConfirm('Excluir palavra', 'Tem certeza que deseja excluir esta palavra?', 'Excluir'))) return;
    const index = getWordIndex(id);
if (index !== -1) { 
        state.words.splice(index, 1); 
        saveState(); 
        checkAllAchievements(); 
        updateUI();
} 
} 

export function toggleWordSeen(id) { 
    const index = getWordIndex(id);
if (index !== -1) { 
        state.words[index].seen = !state.words[index].seen; 
        saveState(); 
        renderList();
} 
} 

/**
 * IMPLEMENTAÇÃO DA CORREÇÃO: Função para marcar/desmarcar todas as palavras como vistas.
* @param {boolean} seen - true para marcar como vista, false para desmarcar.
*/
export async function toggleAllWordsSeen(seen) {
    /* BUG Nº6: confirm() bloqueante → modal inline assíncrono */
    if (!(await showConfirm('Atualizar todas as palavras',
        `Tem certeza que deseja ${seen ? 'MARCAR' : 'DESMARCAR'} todas as ${state.words.length} palavras como vistas/não-revisadas?`,
        'Confirmar'))) return;
state.words.forEach(word => {
        word.seen = seen;
        // Se for desmarcar, zera o SRS para re-aprender
        if (!seen) {
            word.stats.srs_level = 0;
            word.stats.next_review_date = null;
        }
    });
saveState();
    renderList();
}


// Funções de Edição de Palavras 
export function openEditModal(id) { 
    const word = state.words.find(w => w.id == id);
if (!word) return; 
    document.getElementById('edit-word-id').value = id; 
    document.getElementById('edit-word-text').value = word.text; 
    document.getElementById('edit-word-reading').value = word.reading; 
    document.getElementById('edit-word-translation').value = word.translation; 
    document.getElementById('edit-word-jlpt').value = word.jlpt || 'None';
document.getElementById('edit-word-category').value = word.category || ''; 
    document.getElementById('edit-word-tags').value = word.tags ? word.tags.join(', ') : ''; 
    document.getElementById('edit-word-notes').value = word.notes || ''; 
    document.getElementById('edit-word-modal').classList.add('active');
} 

export function closeEditModal() { 
    document.getElementById('edit-word-modal').classList.remove('active'); 
} 

export function saveEditedWord(e) { 
    e.preventDefault();
const form = e.target;
    const id = form['edit-word-id'].value;
    const index = getWordIndex(id);
if (index !== -1) {
        // Guarda o antigo JLPT para re-check de XP
        const oldJlpt = state.words[index].jlpt;
state.words[index].text = form['edit-word-text'].value.trim();
        state.words[index].reading = form['edit-word-reading'].value.trim();
        state.words[index].translation = form['edit-word-translation'].value.trim();
        state.words[index].jlpt = form['edit-word-jlpt'].value;
        state.words[index].category = form['edit-word-category'].value.trim();
state.words[index].tags = form['edit-word-tags'].value.split(',').map(tag => tag.trim()).filter(tag => tag);
        state.words[index].notes = form['edit-word-notes'].value.trim();
// Se o JLPT mudou para um maior, adiciona XP, senão, apenas salva.
        const newJlpt = state.words[index].jlpt;
if (XP_BY_JLPT[newJlpt] > XP_BY_JLPT[oldJlpt]) {
             addXP(XP_BY_JLPT[newJlpt] - XP_BY_JLPT[oldJlpt]);
}
        
        saveState();
        checkAllAchievements();
        updateUI();
        closeEditModal();
}
}
document.getElementById('add-word-form').onsubmit = addWord;
document.getElementById('edit-word-form').onsubmit = saveEditedWord;
