// ARRAYS DE ALFABETO CONSOLIDADOS (INCLUINDO COMBINAÇÕES - PONTO 4)
export const HIRAGANA_CHARS = [ 'あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ', 'た', 'ち', 'つ', 'て', 'と', 'な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ', 'ま', 'み', 'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'り', 'る', 'れ', 'ろ', 'わ', 'を', 'ん' ];
export const HIRAGANA_ROMANJI = [ 'a', 'i', 'u', 'e', 'o', 'ka', 'ki', 'ku', 'ke', 'ko', 'sa', 'shi', 'su', 'se', 'so', 'ta', 'chi', 'tsu', 'te', 'to', 'na', 'ni', 'nu', 'ne', 'no', 'ha', 'hi', 'fu', 'he', 'ho', 'ma', 'mi', 'mu', 'me', 'mo', 'ya', 'yu', 'yo', 'ra', 'ri', 'ru', 're', 'ro', 'wa', 'wo', 'n' ];
export const KATAKANA_CHARS = [ 'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ', 'サ', 'シ', 'ス', 'セ', 'ソ', 'タ', 'チ', 'ツ', 'テ', 'ト', 'ナ', 'ニ', 'ヌ', 'ネ', 'ノ', 'ハ', 'ヒ', 'フ', 'ヘ', 'ホ', 'マ', 'ミ', 'ム', 'メ', 'モ', 'ヤ', 'ユ', 'ヨ', 'ラ', 'リ', 'ル', 'レ', 'ロ', 'ワ', 'ヲ', 'ン' ];
export const KATAKANA_ROMANJI = [ 'a', 'i', 'u', 'e', 'o', 'ka', 'ki', 'ku', 'ke', 'ko', 'sa', 'shi', 'su', 'se', 'so', 'ta', 'chi', 'tsu', 'te', 'to', 'na', 'ni', 'nu', 'ne', 'no', 'ha', 'hi', 'fu', 'he', 'ho', 'ma', 'mi', 'mu', 'me', 'mo', 'ya', 'yu', 'yo', 'ra', 'ri', 'ru', 're', 'ro', 'wa', 'wo', 'n' ];
// Combinações (Dakuten, Handakuten, Yōon)
export const HIRA_COMBINATIONS_CHARS = [
    // Dakuten
    'が', 'ぎ', 'ぐ', 'げ', 'ご', 'ざ', 'じ', 'ず', 'ぜ', 'ぞ', 
    'だ', 'ぢ', 'づ', 'で', 'ど', 'ば', 'び', 'ぶ', 'べ', 'ぼ',
    // Handakuten
    'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ',
    // Yōon (Contracted)
    'きゃ', 'きゅ', 'きょ', 'しゃ', 'しゅ', 'しょ', 'ちゃ', 'ちゅ', 'ちょ', 
    'にゃ', 'にゅ', 'にょ', 'ひゃ', 'ひゅ', 'ひょ', 'みゃ', 'みゅ', 'みょ', 
    'りゃ', 'りゅ', 'りょ', 'ぎゃ', 'ぎゅ', 'ぎょ', 'じゃ', 'じゅ', 'じょ', 
   
 'びゃ', 'びゅ', 'びょ', 'ぴゃ', 'ぴゅ', 'ぴょ'
];
export const HIRA_COMBINATIONS_ROMANJI = [
    // Dakuten
    'ga', 'gi', 'gu', 'ge', 'go', 'za', 'ji', 'zu', 'ze', 'zo', 
    'da', 'ji/di', 'zu/du', 'de', 'do', 'ba', 'bi', 'bu', 'be', 'bo',
    // Handakuten
    'pa', 'pi', 'pu', 'pe', 'po',
    // Yōon (Contracted)
    'kya', 'kyu', 'kyo', 'sha', 'shu', 'sho', 'cha', 'chu', 'cho', 
    'nya', 'nyu', 'nyo', 'hya', 'hyu', 'hyo', 'mya', 'myu', 'myo', 
    'rya', 'ryu', 'ryo', 'gya', 'gyu', 'gyo', 'ja', 'ju', 'jo', 

    'bya', 'byu', 'byo', 'pya', 'pyu', 'pyo'
];
export const KATA_COMBINATIONS_CHARS = [
    // Dakuten
    'ガ', 'ギ', 'グ', 'ゲ', 'ゴ', 'ザ', 'ジ', 'ズ', 'ゼ', 'ゾ', 
    'ダ', 'ヂ', 'ヅ', 'デ', 'ド', 'バ', 'ビ', 'ブ', 'ベ', 'ボ',
    // Handakuten
    'パ', 'ピ', 'プ', 'ペ', 'ポ',
    // Yōon (Contracted)
    'キャ', 'キュ', 'キョ', 'シャ', 'シュ', 'ショ', 'チャ', 'チュ', 'チョ', 
    'ニャ', 'ニュ', 'ニョ', 'ヒャ', 'ヒュ', 'ヒョ', 'ミャ', 'ミュ', 'ミョ', 
    'リャ', 'リュ', 'リョ', 'ギャ', 'ギュ', 'ギョ', 'ジャ', 'ジュ', 'ジョ', 
    'ビャ', 'ビュ', 'ビョ', 
'ピャ', 'ピュ', 'ピョ'
];
export const KATA_COMBINATIONS_ROMANJI = [
    // Dakuten
    'ga', 'gi', 'gu', 'ge', 'go', 'za', 'ji', 'zu', 'ze', 'zo', 
    'da', 'ji/di', 'zu/du', 'de', 'do', 'ba', 'bi', 'bu', 'be', 'bo',
    // Handakuten
    'pa', 'pi', 'pu', 'pe', 'po',
    // Yōon (Contracted)
    'kya', 'kyu', 'kyo', 'sha', 'shu', 'sho', 'cha', 'chu', 'cho', 
    'nya', 'nyu', 'nyo', 'hya', 'hyu', 'hyo', 'mya', 'myu', 'myo', 
    'rya', 'ryu', 'ryo', 'gya', 'gyu', 'gyo', 'ja', 'ju', 'jo', 
    
'bya', 'byu', 'byo', 'pya', 'pyu', 'pyo'
];

// ARRAYS COMPLETOS DE ALFABETO
export const HIRAGANA_CHARS_FULL = HIRAGANA_CHARS.concat(HIRA_COMBINATIONS_CHARS);
export const HIRAGANA_ROMANJI_FULL = HIRAGANA_ROMANJI.concat(HIRA_COMBINATIONS_ROMANJI);
export const KATAKANA_CHARS_FULL = KATAKANA_CHARS.concat(KATA_COMBINATIONS_CHARS);
export const KATAKANA_ROMANJI_FULL = KATAKANA_ROMANJI.concat(KATA_COMBINATIONS_ROMANJI);

// KANJI DE EXEMPLO (PONTO 5)
export const KANJI_EXAMPLES = [
    { char: '一', meaning: 'um', on: 'イチ', kun: 'ひと', source: 'example' },
    { char: '二', meaning: 'dois', on: 'ニ', kun: 'ふた', source: 'example' },
    { char: '人', meaning: 'pessoa', on: 'ジン, ニン', kun: 'ひと', source: 'example' },
    { char: '日', meaning: 'dia, sol', on: 'ニチ, ジツ', kun: 'ひ, び', source: 'example' },
    { char: '本', meaning: 'livro, base', on: 'ホン', kun: 'もと', source: 'example' },
    
{ char: '山', meaning: 'montanha', on: 'サン', kun: 'やま', source: 'example' },
    { char: '川', meaning: 'rio', on: 'セン', kun: 'かわ', source: 'example' },
    { char: '土', meaning: 'terra, solo', on: 'ド, ト', kun: 'つち', source: 'example' },
];
