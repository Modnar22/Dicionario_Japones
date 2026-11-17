/* ===== PACOTES DE PALAVRAS DA LOJA (v4.9) =====
   Cada TEMA tem 3 níveis. O nível atual é secreto (o aluno não vê as
   palavras antes de comprar); ao comprar, o próximo nível do mesmo
   tema aparece com palavras diferentes e custo maior de XP.
   O id persistido em state.ownedPacks é `<tema>-<nível>` (ex.: cores-1). */
export const WORD_PACKS = [
    {
        id: 'cores', icon: '🎨', name: 'Cores', tiers: [
            {
                cost: 30, jlpt: 'N5',
                words: [
                    { text: '赤', reading: 'あか', translation: 'vermelho' },
                    { text: '青', reading: 'あおい', translation: 'azul' },
                    { text: '黄色', reading: 'きいろ', translation: 'amarelo' },
                    { text: '白', reading: 'しろ', translation: 'branco' },
                    { text: '黒', reading: 'くろ', translation: 'preto' },
                ],
            },
            {
                cost: 70, jlpt: 'N4',
                words: [
                    { text: '緑', reading: 'みどり', translation: 'verde' },
                    { text: '茶色', reading: 'ちゃいろ', translation: 'marrom' },
                    { text: '紫', reading: 'むらさき', translation: 'roxo' },
                    { text: '桃色', reading: 'ももいろ', translation: 'rosa' },
                    { text: '銀色', reading: 'ぎんいろ', translation: 'prata (cor)' },
                ],
            },
            {
                cost: 120, jlpt: 'None',
                words: [
                    { text: '萌黄色', reading: 'もえぎ', translation: 'verde-claro' },
                    { text: '群青', reading: 'ぐんじょう', translation: 'azul ultramar' },
                    { text: '藍色', reading: 'あいいろ', translation: 'índigo' },
                    { text: '柿色', reading: 'かきいろ', translation: 'laranja-escuro' },
                    { text: '灰色', reading: 'はいいろ', translation: 'cinza' },
                ],
            },
        ],
    },
    {
        id: 'cumprimentos', icon: '💬', name: 'Cumprimentos', tiers: [
            {
                cost: 30, jlpt: 'N5',
                words: [
                    { text: 'こんにちは', reading: 'こんにちは', translation: 'olá (bom dia/boa tarde)' },
                    { text: 'おはよう', reading: 'おはよう', translation: 'bom dia' },
                    { text: 'ありがとう', reading: 'ありがとう', translation: 'obrigado(a)' },
                    { text: 'すみません', reading: 'すみません', translation: 'desculpa / licença' },
                    { text: 'さようなら', reading: 'さようなら', translation: 'adeus' },
                ],
            },
            {
                cost: 70, jlpt: 'N4',
                words: [
                    { text: 'こんばんは', reading: 'こんばんは', translation: 'boa noite (saudação)' },
                    { text: 'おやすみなさい', reading: 'おやすみなさい', translation: 'boa noite (dormir)' },
                    { text: 'いただきます', reading: 'いただきます', translation: 'bom apetite (antes de comer)' },
                    { text: 'ごちそうさま', reading: 'ごちそうさま', translation: 'obrigado pela refeição' },
                    { text: 'はじめまして', reading: 'はじめまして', translation: 'prazer em conhecê-lo(a)' },
                ],
            },
            {
                cost: 120, jlpt: 'None',
                words: [
                    { text: 'おかえり', reading: 'おかえり', translation: 'bem-vindo de volta' },
                    { text: 'いってきます', reading: 'いってきます', translation: 'vou e volto' },
                    { text: 'ただいま', reading: 'ただいま', translation: 'eu cheguei' },
                    { text: 'おひさしぶり', reading: 'おひさしぶり', translation: 'quanto tempo!' },
                    { text: 'おつかれさま', reading: 'おつかれさま', translation: 'bom trabalho' },
                ],
            },
        ],
    },
    {
        id: 'familia', icon: '👨‍👩‍👧', name: 'Família', tiers: [
            {
                cost: 50, jlpt: 'N5',
                words: [
                    { text: '母', reading: 'はは', translation: 'mãe' },
                    { text: '父', reading: 'ちち', translation: 'pai' },
                    { text: '姉', reading: 'あね', translation: 'irmã mais velha' },
                    { text: '兄', reading: 'あに', translation: 'irmão mais velho' },
                    { text: '弟', reading: 'おとうと', translation: 'irmão mais novo' },
                ],
            },
            {
                cost: 90, jlpt: 'N4',
                words: [
                    { text: '両親', reading: 'りょうしん', translation: 'pais (ambos)' },
                    { text: '子供', reading: 'こども', translation: 'criança' },
                    { text: '娘', reading: 'むすめ', translation: 'filha' },
                    { text: '息子', reading: 'むすこ', translation: 'filho' },
                    { text: 'おじいさん', reading: 'おじいさん', translation: 'avô' },
                ],
            },
            {
                cost: 140, jlpt: 'None',
                words: [
                    { text: '家族', reading: 'かぞく', translation: 'família' },
                    { text: 'おばあさん', reading: 'おばあさん', translation: 'avó' },
                    { text: 'おじさん', reading: 'おじさん', translation: 'tio' },
                    { text: 'おばさん', reading: 'おばさん', translation: 'tia' },
                    { text: 'いとこ', reading: 'いとこ', translation: 'primo(a)' },
                ],
            },
        ],
    },
    {
        id: 'escola', icon: '🏫', name: 'Escola', tiers: [
            {
                cost: 50, jlpt: 'N5',
                words: [
                    { text: '先生', reading: 'せんせい', translation: 'professor(a)' },
                    { text: '学生', reading: 'がくせい', translation: 'aluno(a)' },
                    { text: '学校', reading: 'がっこう', translation: 'escola' },
                    { text: '本', reading: 'ほん', translation: 'livro' },
                    { text: '鉛筆', reading: 'えんぴつ', translation: 'lápis' },
                ],
            },
            {
                cost: 90, jlpt: 'N4',
                words: [
                    { text: 'ノート', reading: 'ノート', translation: 'caderno' },
                    { text: '消しゴム', reading: 'けしごむ', translation: 'borracha' },
                    { text: '辞書', reading: 'じしょ', translation: 'dicionário' },
                    { text: '黒板', reading: 'こくばん', translation: 'quadro-negro' },
                    { text: '定規', reading: 'じょうき', translation: 'régua' },
                ],
            },
            {
                cost: 140, jlpt: 'None',
                words: [
                    { text: '教室', reading: 'きょうしつ', translation: 'sala de aula' },
                    { text: '授業', reading: 'じゅぎょう', translation: 'aula' },
                    { text: '質問', reading: 'しつもん', translation: 'pergunta' },
                    { text: '宿題', reading: 'しゅくだい', translation: 'dever de casa' },
                    { text: '成績', reading: 'せいせき', translation: 'notas / resultados' },
                ],
            },
        ],
    },
    {
        id: 'casa', icon: '🏠', name: 'Casa', tiers: [
            {
                cost: 50, jlpt: 'N5',
                words: [
                    { text: '家', reading: 'いえ', translation: 'casa' },
                    { text: '部屋', reading: 'へや', translation: 'quarto' },
                    { text: '台所', reading: 'だいどころ', translation: 'cozinha' },
                    { text: '玄関', reading: 'げんかん', translation: 'entrada (da casa)' },
                    { text: '窓', reading: 'まど', translation: 'janela' },
                ],
            },
            {
                cost: 90, jlpt: 'N4',
                words: [
                    { text: 'トイレ', reading: 'トイレ', translation: 'banheiro' },
                    { text: 'ベッド', reading: 'ベッド', translation: 'cama' },
                    { text: '椅子', reading: 'いす', translation: 'cadeira' },
                    { text: '机', reading: 'つくえ', translation: 'mesa (de estudo)' },
                    { text: '風呂', reading: 'ふろ', translation: 'banheira / banho' },
                ],
            },
            {
                cost: 140, jlpt: 'None',
                words: [
                    { text: '階段', reading: 'かいだん', translation: 'escada' },
                    { text: '庭', reading: 'にわ', translation: 'jardim' },
                    { text: '電気', reading: 'でんき', translation: 'luz / eletricidade' },
                    { text: '絨毯', reading: 'じゅうたん', translation: 'tapete' },
                    { text: '棚', reading: 'たな', translation: 'prateleira' },
                ],
            },
        ],
    },
    {
        id: 'animais', icon: '🐾', name: 'Animais', tiers: [
            {
                cost: 70, jlpt: 'N5',
                words: [
                    { text: '犬', reading: 'いぬ', translation: 'cachorro' },
                    { text: '猫', reading: 'ねこ', translation: 'gato' },
                    { text: '鳥', reading: 'とり', translation: 'pássaro' },
                    { text: '魚', reading: 'さかな', translation: 'peixe' },
                    { text: '馬', reading: 'うま', translation: 'cavalo' },
                ],
            },
            {
                cost: 110, jlpt: 'N4',
                words: [
                    { text: '豚', reading: 'ぶた', translation: 'porco' },
                    { text: '牛', reading: 'うし', translation: 'vaca / boi' },
                    { text: '羊', reading: 'ひつじ', translation: 'ovelha' },
                    { text: '鶏', reading: 'にわとり', translation: 'galinha' },
                    { text: '兎', reading: 'うさぎ', translation: 'coelho' },
                ],
            },
            {
                cost: 160, jlpt: 'None',
                words: [
                    { text: '猿', reading: 'さる', translation: 'macaco' },
                    { text: '熊', reading: 'くま', translation: 'urso' },
                    { text: '象', reading: 'ぞう', translation: 'elefante' },
                    { text: '狼', reading: 'おおかみ', translation: 'lobo' },
                    { text: '虎', reading: 'とら', translation: 'tigre' },
                ],
            },
        ],
    },
    {
        id: 'comida', icon: '🍣', name: 'Comida', tiers: [
            {
                cost: 70, jlpt: 'N5',
                words: [
                    { text: 'ご飯', reading: 'ごはん', translation: 'arroz / refeição' },
                    { text: '肉', reading: 'にく', translation: 'carne' },
                    { text: '野菜', reading: 'やさい', translation: 'vegetais' },
                    { text: '卵', reading: 'たまご', translation: 'ovo' },
                    { text: '水', reading: 'みず', translation: 'água' },
                ],
            },
            {
                cost: 110, jlpt: 'N4',
                words: [
                    { text: '牛乳', reading: 'ぎゅうにゅう', translation: 'leite' },
                    { text: '果物', reading: 'くだもの', translation: 'fruta' },
                    { text: 'パン', reading: 'パン', translation: 'pão' },
                    { text: 'お茶', reading: 'おちゃ', translation: 'chá' },
                    { text: '菓子', reading: 'かし', translation: 'doces / confeitaria' },
                ],
            },
            {
                cost: 160, jlpt: 'None',
                words: [
                    { text: '弁当', reading: 'べんとう', translation: 'marmita / lanche-box' },
                    { text: '味噌', reading: 'みそ', translation: 'missō (pasta)' },
                    { text: '醤油', reading: 'しょうゆ', translation: 'molho de soja' },
                    { text: '箸', reading: 'はし', translation: 'hashis' },
                    { text: '茶碗', reading: 'ちゃわん', translation: 'tigela de arroz' },
                ],
            },
        ],
    },
    {
        id: 'acoes', icon: '🏃', name: 'Ações (Verbos)', tiers: [
            {
                cost: 90, jlpt: 'N5',
                words: [
                    { text: '食べる', reading: 'たべる', translation: 'comer' },
                    { text: '飲む', reading: 'のむ', translation: 'beber' },
                    { text: '見る', reading: 'みる', translation: 'ver' },
                    { text: '聞く', reading: 'きく', translation: 'ouvir / perguntar' },
                    { text: '書く', reading: 'かく', translation: 'escrever' },
                ],
            },
            {
                cost: 130, jlpt: 'N4',
                words: [
                    { text: '走る', reading: 'はしる', translation: 'correr' },
                    { text: '歩く', reading: 'あるく', translation: 'caminhar' },
                    { text: '泳ぐ', reading: 'およぐ', translation: 'nadar' },
                    { text: '飛ぶ', reading: 'とぶ', translation: 'voar' },
                    { text: '登る', reading: 'のぼる', translation: 'subir' },
                ],
            },
            {
                cost: 180, jlpt: 'None',
                words: [
                    { text: '読む', reading: 'よむ', translation: 'ler' },
                    { text: '話す', reading: 'はなす', translation: 'falar' },
                    { text: '作る', reading: 'つくる', translation: 'criar / fazer' },
                    { text: '買う', reading: 'かう', translation: 'comprar' },
                    { text: '売る', reading: 'うる', translation: 'vender' },
                ],
            },
        ],
    },
];

/* Nível atual de um tema: quantos pacotes dele já foram comprados.
   (Aceita também o formato antigo sem sufixo, ex.: 'animais'.) */
export function ownedTierOf(pack, ownedPacks) {
    return ownedPacks.filter(id => id === pack.id || id.startsWith(pack.id + '-')).length;
}
