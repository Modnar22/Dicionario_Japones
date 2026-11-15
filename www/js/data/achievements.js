/* ===== Imports ===== */
import { HIRAGANA_CHARS_FULL, KATAKANA_CHARS_FULL } from '../data/alphabets.js';
export const ACHIEVEMENTS = [
    // Palavras (Type: word) - 5
    { id: 'word_10', name: 'Aprendiz de Palavras', desc: 'Adicione 10 palavras ao dicionário.', type: 'word', value: 10, current: 0, unlocked: false, icon: 'fas fa-feather' },
    { id: 'word_50', name: 'Vocabulário Básico', desc: 'Adicione 50 palavras ao dicionário.', type: 'word', value: 50, current: 0, unlocked: false, icon: 'fas fa-graduation-cap' },
    { id: 'word_100', name: 'Lexicógrafo Júnior', desc: 'Adicione 100 palavras ao dicionário.', type: 'word', value: 100, current: 0, unlocked: false, icon: 'fas fa-atlas' },
    { id: 'word_250', name: 'Ampliando o Léxico', desc: 'Adicione 250 palavras ao dicionário.', type: 'word', value: 250, current: 0, unlocked: false, icon: 'fas fa-globe-asia' },
    { id: 'word_500', name: 'Mestre Lexicógrafo', desc: 'Adicione 500 palavras ao dicionário.', type: 'word', value: 500, current: 0, unlocked: false, icon: 'fas fa-scroll' },

    // Nível de Usuário (Type: level) - 7
    { id: 'lvl_2', name: 'Começando a Jornada', desc: 'Alcance o nível 2.', type: 'level', value: 2, current: 0, unlocked: false, icon: 'fas fa-leaf' },
    { id: 'lvl_5', name: 'Nível Intermediário', desc: 'Alcance o nível 5.', type: 'level', value: 5, current: 0, unlocked: false, icon: 'fas fa-star-half-alt' },
    { id: 'lvl_10', name: 'Atingindo o Primeiro Marco', desc: 'Alcance o nível 10.', type: 'level', value: 10, current: 0, unlocked: false, icon: 'fas fa-star' },
    { id: 'lvl_20', name: 'Jornada Avançada', desc: 'Alcance o nível 20.', type: 'level', value: 20, current: 0, unlocked: false, icon: 'fas fa-route' },
    { id: 'lvl_30', name: 'Mestre Iniciante', desc: 'Alcance o nível 30.', type: 'level', value: 30, current: 0, unlocked: false, icon: 'fas fa-trophy' },
    { id: 'lvl_40', name: 'Desbravador Nível 40', desc: 'Alcance o nível 40.', type: 'level', value: 40, current: 0, unlocked: false, icon: 'fas fa-city' }, // NOVO
    { id: 'lvl_50', name: 'Meio-Caminho para o Mestre', desc: 'Alcance o nível 50.', type: 'level', value: 50, current: 0, unlocked: false, icon: 'fas fa-monument' }, // NOVO

    // Kanji (Type: kanji) - 5
    { id: 'kanji_1', name: 'Primeiro Símbolo', desc: 'Adicione 1 Kanji pessoal.', type: 'kanji', value: 1, current: 0, unlocked: false, icon: 'fas fa-pen-nib' },
    { id: 'kanji_5', name: 'Colecionador de Símbolos', desc: 'Adicione 5 Kanji pessoais.', type: 'kanji', value: 5, current: 0, unlocked: false, icon: 'fas fa-stream' },
    { id: 'kanji_10', name: 'Kanji Básico', desc: 'Adicione 10 Kanji pessoais.', type: 'kanji', value: 10, current: 0, unlocked: false, icon: 'fas fa-sign' },
    { id: 'kanji_20', name: 'Kanji Intermediário', desc: 'Adicione 20 Kanji pessoais.', type: 'kanji', value: 20, current: 0, unlocked: false, icon: 'fas fa-mountain' },
    { id: 'kanji_50', name: 'Kanji Avançado', desc: 'Adicione 50 Kanji pessoais.', type: 'kanji', value: 50, current: 0, unlocked: false, icon: 'fas fa-dragon' },

    // Quizzes (Type: quiz) - 5
    { id: 'quiz_10', name: 'Primeiro Teste', desc: 'Complete 10 quizzes (qualquer tipo).', type: 'quiz', value: 10, current: 0, unlocked: false, icon: 'fas fa-dice-one' },
    { id: 'quiz_50', name: 'Estudante Dedicado', desc: 'Complete 50 quizzes.', type: 'quiz', value: 50, current: 0, unlocked: false, icon: 'fas fa-laptop-code' },
    { id: 'quiz_100', name: 'Veterano do Quiz', desc: 'Complete 100 quizzes.', type: 'quiz', value: 100, current: 0, unlocked: false, icon: 'fas fa-brain' },
    { id: 'quiz_500', name: 'Maratonista de Estudo', desc: 'Complete 500 quizzes.', type: 'quiz', value: 500, current: 0, unlocked: false, icon: 'fas fa-running' },
    { id: 'quiz_1000', name: 'Mestre dos Quizzes', desc: 'Complete 1000 quizzes.', type: 'quiz', value: 1000, current: 0, unlocked: false, icon: 'fas fa-medal' },

    // Categorias Únicas (Type: category) - 2
    { id: 'category_1', name: 'Primeira Etiqueta', desc: 'Use 1 categoria única para uma palavra.', type: 'category', value: 1, current: 0, unlocked: false, icon: 'fas fa-tag' },
    { id: 'category_5', name: 'Organizador de Conteúdo', desc: 'Use 5 categorias únicas.', type: 'category', value: 5, current: 0, unlocked: false, icon: 'fas fa-tags' },

    // JLPT (Type: jlpt) - Adicionar N palavras de um determinado nível - 5
    { id: 'jlpt_n5', name: 'N5 Iniciante', desc: 'Adicione 5 palavras com o nível N5.', type: 'jlpt', value: 5, current: 0, unlocked: false, icon: 'fas fa-bicycle' },
    { id: 'jlpt_n4', name: 'Rumo ao N4', desc: 'Adicione 5 palavras com o nível N4.', type: 'jlpt', value: 5, current: 0, unlocked: false, icon: 'fas fa-bus' },
    { id: 'jlpt_n3', name: 'Desafiando o N3', desc: 'Adicione 5 palavras com o nível N3.', type: 'jlpt', value: 5, current: 0, unlocked: false, icon: 'fas fa-motorcycle' },
    { id: 'jlpt_n2', name: 'Rumo ao N2', desc: 'Adicione 5 palavras com o nível N2.', type: 'jlpt', value: 5, current: 0, unlocked: false, icon: 'fas fa-car-side' },
    { id: 'jlpt_n1', name: 'Quase Mestre', desc: 'Adicione 5 palavras com o nível N1.', type: 'jlpt', value: 5, current: 0, unlocked: false, icon: 'fas fa-plane' },

    // Alfabetos - Proficiência Ouro (Type: hira_gold / kata_gold) - 4
    { id: 'hira_10_gold', name: 'Hiragana Prata', desc: 'Obtenha proficiência Ouro em 10 caracteres Hiragana.', type: 'hira_gold', value: 10, current: 0, unlocked: false, icon: 'fas fa-star' },
    { id: 'kata_10_gold', name: 'Katakana Prata', desc: 'Obtenha proficiência Ouro em 10 caracteres Katakana.', type: 'kata_gold', value: 10, current: 0, unlocked: false, icon: 'fas fa-star' },
    { id: 'hira_30_gold', name: 'Hiragana Ouro', desc: 'Obtenha proficiência Ouro em 30 caracteres Hiragana.', type: 'hira_gold', value: 30, current: 0, unlocked: false, icon: 'fas fa-star-half-alt' },
    { id: 'kata_30_gold', name: 'Katakana Ouro', desc: 'Obtenha proficiência Ouro em 30 caracteres Katakana.', type: 'kata_gold', value: 30, current: 0, unlocked: false, icon: 'fas fa-star-half-alt' },

    /* === NOVAS CONQUISTAS DE PROFICIÊNCIA === */
    // Proficiência de Palavras (Type: word_gold) - 4
    { id: 'word_gold_10', name: 'Aprendiz Brilhante', desc: 'Obtenha Proficiência Ouro em 10 Palavras.', type: 'word_gold', value: 10, current: 0, unlocked: false, icon: 'fas fa-gem' },
    { id: 'word_gold_50', name: 'Vocabulário Consolidado', desc: 'Obtenha Proficiência Ouro em 50 Palavras.', type: 'word_gold', value: 50, current: 0, unlocked: false, icon: 'fas fa-star-of-life' },
    { id: 'word_gold_100', name: 'Mestre da Memorização', desc: 'Obtenha Proficiência Ouro em 100 Palavras.', type: 'word_gold', value: 100, current: 0, unlocked: false, icon: 'fas fa-lightbulb' },
    { id: 'word_gold_250', name: 'Enciclopédia Pessoal', desc: 'Obtenha Proficiência Ouro em 250 Palavras.', type: 'word_gold', value: 250, current: 0, unlocked: false, icon: 'fas fa-book-reader' },

    // Proficiência de Kanji (Type: kanji_gold) - 3
    { id: 'kanji_gold_5', name: 'Estrutura Dourada', desc: 'Obtenha Proficiência Ouro em 5 Kanji Pessoais.', type: 'kanji_gold', value: 5, current: 0, unlocked: false, icon: 'fas fa-solar-panel' },
    { id: 'kanji_gold_10', name: 'Dez Símbolos de Ouro', desc: 'Obtenha Proficiência Ouro em 10 Kanji Pessoais.', type: 'kanji_gold', value: 10, current: 0, unlocked: false, icon: 'fas fa-gavel' },
    { id: 'kanji_gold_25', name: 'Kanji Refinado', desc: 'Obtenha Proficiência Ouro em 25 Kanji Pessoais.', type: 'kanji_gold', value: 25, current: 0, unlocked: false, icon: 'fas fa-yin-yang' },
    
    // Domínio de Alfabeto (Mastery) - 2 (Requer que TODOS os caracteres estejam em Ouro)
    { id: 'hira_mastery', name: 'Hiragana Dominado', desc: 'Obtenha Proficiência Ouro em TODOS os caracteres Hiragana.', type: 'hira_mastery', value: 104, current: 0, unlocked: false, icon: 'fas fa-hand-spock' }, // O valor 104 deve corresponder a HIRAGANA_CHARS_FULL.length
    { id: 'kata_mastery', name: 'Katakana Dominado', desc: 'Obtenha Proficiência Ouro em TODOS os caracteres Katakana.', type: 'kata_mastery', value: 104, current: 0, unlocked: false, icon: 'fas fa-hand-rock' }, // O valor 104 deve corresponder a KATAKANA_CHARS_FULL.length

    /* === NOVAS CONQUISTAS DE CATEGORIA DE PALAVRA (cat_word_count) === */
    // Categoria: Animais (Existente) - 2
    { id: 'cat_anim_5', name: 'Amigo dos Animais', desc: 'Adicione 5 palavras com a categoria "Animais".', type: 'cat_word_count', value: 5, current: 0, unlocked: false, category_key: 'Animais', icon: 'fas fa-paw' },
    { id: 'cat_anim_10', name: 'Zoólogo Amador', desc: 'Adicione 10 palavras com a categoria "Animais".', type: 'cat_word_count', value: 10, current: 0, unlocked: false, category_key: 'Animais', icon: 'fas fa-hippo' },

    // Categoria: Cores - 2
    { id: 'cat_color_5', name: 'Mestre Cromo', desc: 'Adicione 5 palavras com a categoria "Cores".', type: 'cat_word_count', value: 5, current: 0, unlocked: false, category_key: 'Cores', icon: 'fas fa-palette' },
    { id: 'cat_color_10', name: 'Cromático Experiente', desc: 'Adicione 10 palavras com a categoria "Cores".', type: 'cat_word_count', value: 10, current: 0, unlocked: false, category_key: 'Cores', icon: 'fas fa-rainbow' },

    // Categoria: Comida - 2
    { id: 'cat_food_5', name: 'Apreciador de Sabores', desc: 'Adicione 5 palavras com a categoria "Comida".', type: 'cat_word_count', value: 5, current: 0, unlocked: false, category_key: 'Comida', icon: 'fas fa-utensils' },
    { id: 'cat_food_10', name: 'Gourmet Lexical', desc: 'Adicione 10 palavras com a categoria "Comida".', type: 'cat_word_count', value: 10, current: 0, unlocked: false, category_key: 'Comida', icon: 'fas fa-pizza-slice' },

    // Categoria: Lugares - 2
    { id: 'cat_place_5', name: 'Turista Lexical', desc: 'Adicione 5 palavras com a categoria "Lugares".', type: 'cat_word_count', value: 5, current: 0, unlocked: false, category_key: 'Lugares', icon: 'fas fa-map-marked-alt' },
    { id: 'cat_place_10', name: 'Geógrafo Amador', desc: 'Adicione 10 palavras com a categoria "Lugares".', type: 'cat_word_count', value: 10, current: 0, unlocked: false, category_key: 'Lugares', icon: 'fas fa-globe' },

    /* Total: 5 + 7 + 5 + 5 + 2 + 5 + 4 + 3 + 2 + 2 + 2 + 2 + 2 = 50 Conquistas */
];
// Fim de ACHIEVEMENTS 
