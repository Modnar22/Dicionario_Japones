/* ===== Imports ===== */
import { ALPHA_GOLD_THRESHOLD, ALPHA_SILVER_THRESHOLD } from '../config.js';
import { deleteKanji, openKanjiEditModal } from '../crud/kanji.js';
import { HIRAGANA_CHARS_FULL, HIRAGANA_ROMANJI_FULL, KANJI_EXAMPLES, KATAKANA_CHARS_FULL, KATAKANA_ROMANJI_FULL } from '../data/alphabets.js';
import { state } from '../state.js';
import { speak } from '../ui/tabs.js';
import { esc, escJS } from '../utils.js';
export function makeAlphaCharHTML(char, romaji, type) { 
    const charStats = state.alphaStats[char] ||
    { correct: 0 };
let proficiencyClass = '';
    if (charStats.correct >= ALPHA_GOLD_THRESHOLD) { 
        proficiencyClass = 'char-gold';
} else if (charStats.correct >= ALPHA_SILVER_THRESHOLD) { 
        proficiencyClass = 'char-silver';
} 
    return ` 
        <div class="char-container ${proficiencyClass}" data-char="${esc(char)}" onclick="speak('${escJS(char)}', 'ja-JP')"> 
            <div class="char-main">${esc(char)}</div> 
            <div class="char-romaji">${esc(romaji)}</div> 
        </div> `; 
} 

/**
 * Gera o HTML para o cartão Kanji.
 * Aplica o estilo de caractere solicitado.
(PONTO 5)
 */
export function makeKanjiCardHTML(kanji) { 
    const char = kanji.char;
    const charStats = state.kanjiStats[char] ||
{ correct: 0 }; 
    let proficiencyClass = '';
    if (charStats.correct >= ALPHA_GOLD_THRESHOLD) { 
        proficiencyClass = 'char-gold';
} else if (charStats.correct >= ALPHA_SILVER_THRESHOLD) { 
        proficiencyClass = 'char-silver';
} 
    const isUserKanji = kanji.id !== undefined && kanji.source !== 'example'; 
    let actionsHTML = '';
if (isUserKanji) { 
        actionsHTML = ` 
            <div style="margin-top: 10px; border-top: 1px solid var(--panel); padding-top: 8px;"> 
                <button onclick="openKanjiEditModal('${escJS(kanji.id)}')" title="Editar"><i class="fas fa-edit"></i></button>
                <button onclick="deleteKanji('${escJS(kanji.id)}')" style="color:var(--danger);"
title="Excluir"><i class="fas fa-trash-alt"></i></button>
            </div>`;
}

    return `
        <div class="kanji-card ${proficiencyClass}" data-kanji="${esc(char)}">
            <div class="kanji-char" onclick="speak('${escJS(char)}', 'ja-JP')" style="cursor: pointer; font-size: 2.5em; font-weight: 700; color: var(--accent2);">
                ${esc(char)} 
                <i class="fas fa-volume-up" style="font-size: 0.4em; margin-left: 5px; color: var(--accent1);"></i>
            </div>
        
    <div class="kanji-meaning" title="Significado">${esc(kanji.meaning)}</div>
            ${kanji.on ?
`<div class="char-romaji" title="Leitura On'yomi">On: ${esc(kanji.on)}</div>` : ''}
            ${kanji.kun ?
`<div class="char-romaji" title="Leitura Kun'yomi">Kun: ${esc(kanji.kun)}</div>` : ''}
            ${actionsHTML}
        </div>
    `;
}

export function renderAlphabets() {
    const searchInput = document.getElementById('kanji-search-input')?.value.toLowerCase().trim() || '';
// Render Hiragana (Usando o array FULL com combinações)
    const hiraGridEl = document.getElementById('hiragana-grid');
if (hiraGridEl) {
        hiraGridEl.innerHTML = HIRAGANA_CHARS_FULL.map((char, index) => 
            makeAlphaCharHTML(char, HIRAGANA_ROMANJI_FULL[index], 'hiragana')
        ).join('');
}

    // Render Katakana (Usando o array FULL com combinações)
    const kataGridEl = document.getElementById('katakana-grid');
if (kataGridEl) {
        kataGridEl.innerHTML = KATAKANA_CHARS_FULL.map((char, index) => 
            makeAlphaCharHTML(char, KATAKANA_ROMANJI_FULL[index], 'katakana')
        ).join('');
}

    // Render Kanji (Incluindo exemplos e Kanijs do usuário)
    const kanjiGridEl = document.getElementById('kanji-grid');
if (kanjiGridEl) {
        // Combina Kanji de exemplo e Kanji do usuário (usuário tem prioridade)
        let combinedKanji = [...KANJI_EXAMPLES, ...state.kanji];
// Remove duplicatas (se o usuário adicionar um kanji de exemplo, a versão dele prevalece)
        const uniqueKanjiMap = combinedKanji.reduce((map, kanji) => {
            if (!map.has(kanji.char) || kanji.id !== undefined) {
                 map.set(kanji.char, kanji);
            }
            return map;
        }, new Map());
let filteredKanji = Array.from(uniqueKanjiMap.values());

        if (searchInput) {
            filteredKanji = filteredKanji.filter(k => 
                k.char.includes(searchInput) ||
                k.meaning.toLowerCase().includes(searchInput) ||
                (k.on && k.on.toLowerCase().includes(searchInput)) ||
                (k.kun && k.kun.toLowerCase().includes(searchInput))
       
     );
        }
        document.getElementById('kanji-count').textContent = state.kanji.length;
        kanjiGridEl.innerHTML = filteredKanji.map(makeKanjiCardHTML).join('');
}
}

