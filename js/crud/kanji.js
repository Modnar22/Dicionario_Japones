/* ===== Imports ===== */
import { checkAllAchievements } from '../achievementLogic.js';
import { showConfirm, showFlyout } from '../notifications.js';
import { saveState, state } from '../state.js';
import { updateUI } from '../ui/stats.js';
import { clearForm } from '../ui/tabs.js';
import { addXP } from '../xp.js';
export function getKanjiIndex(id) {
    return state.kanji.findIndex(k => k.id == id);
}

export function addKanji(e) {
    e.preventDefault();
    const form = e.target;
    const char = form['kanji-char'].value.trim();
if (state.kanji.some(k => k.char === char)) {
        /* BUG Nº6: alert() bloqueante → toast não-bloqueante */
        showFlyout('wrong', 'Kanji duplicado', `O Kanji "${char}" já existe na sua lista.`, '<i class="fas fa-times-circle"></i>');
        return;
    }

    const newKanji = {
        id: Date.now() + Math.random(),
        char: char,
        meaning: form['kanji-meaning'].value.trim(),
        on: form['kanji-reading-on'].value.trim(),
        kun: form['kanji-reading-kun'].value.trim(),
    };
state.kanji.push(newKanji);
    clearForm('add-kanji-form');
    checkAllAchievements();
    saveState();
    updateUI();
    addXP(15); // XP bônus por adicionar Kanji
}

export async function deleteKanji(id) {
    /* BUG Nº6: confirm() bloqueante → modal inline assíncrono */
    if (!(await showConfirm('Excluir Kanji', 'Tem certeza que deseja excluir este Kanji?', 'Excluir'))) return;
const index = getKanjiIndex(id);
    if (index !== -1) {
        // Também remove as estatísticas associadas ao caractere
        const char = state.kanji[index].char;
delete state.kanjiStats[char];
        state.kanji.splice(index, 1); 
        saveState();
        checkAllAchievements();
        updateUI();
    }
}

export function openKanjiEditModal(id) {
    const kanji = state.kanji.find(k => k.id == id);
if (!kanji) return;
    document.getElementById('edit-kanji-id').value = id;
    document.getElementById('edit-kanji-char').value = kanji.char;
    document.getElementById('edit-kanji-meaning').value = kanji.meaning;
    document.getElementById('edit-kanji-reading-on').value = kanji.on || '';
document.getElementById('edit-kanji-reading-kun').value = kanji.kun || '';
    document.getElementById('edit-kanji-modal').classList.add('active');
}

export function closeKanjiEditModal() {
    document.getElementById('edit-kanji-modal').classList.remove('active');
}

export function saveEditedKanji(e) {
    e.preventDefault();
const form = e.target;
    const id = form['edit-kanji-id'].value;
    const index = state.kanji.findIndex(k => k.id == id);
if (index === -1) return;

    const currentKanji = state.kanji[index];
    const oldChar = currentKanji.char;
    const newChar = form['edit-kanji-char'].value.trim();
// Se o caractere mudar, transfere as estatísticas de quiz
    if (oldChar !== newChar) {
        if (state.kanjiStats[oldChar]) {
            state.kanjiStats[newChar] = state.kanjiStats[oldChar];
delete state.kanjiStats[oldChar];
        }
    }

    currentKanji.char = newChar;
    currentKanji.meaning = form['edit-kanji-meaning'].value.trim();
    currentKanji.on = form['edit-kanji-reading-on'].value.trim();
currentKanji.kun = form['edit-kanji-reading-kun'].value.trim();

    saveState();
    updateUI();
    closeKanjiEditModal();
}
document.getElementById('add-kanji-form').onsubmit = addKanji;
document.getElementById('edit-kanji-form').onsubmit = saveEditedKanji;
