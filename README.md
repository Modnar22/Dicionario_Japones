# 📱 Jap-Dex — v4.12.0

Aplicativo de estudo de japonês: **vocabulário, kanji, alfabetos (hiragana/katakana),
SRS (revisão espaçada), quizzes, XP/níveis e 50 conquistas** — 100% offline.

Original: arquivo único `3.8.7.html` (2345 linhas) → reestruturado em módulos
HTML + CSS + JS (ES modules), com correção de bugs e sanitização de HTML.

### Novidades v4.12.0

- **Verificação automática de atualização:** ao abrir o app é feita uma
  consulta silenciosa à API do GitHub — se houver versão nova aparece um
  **aviso clicável** que leva direto à seção *Atualizações* em Configurações
  (com destaque no box). Sem versão nova ou offline: nada incomoda.
- **Download DENTRO do app (estilo update de aplicativo):**
  - **Electron:** *Baixar e atualizar* baixa o instalador para
    `%TEMP%\JapDexUpdate` com **barra de progresso** e mostra *Instalar agora*;
  - **APK Android (novo):** plugin nativo **Updater** baixa o APK para o
    diretório do app (com barra de progresso) e abre o **instalador do
    sistema** — na 1ª vez o Android pede a permissão *"instalar apps
    desconhecidos"* e o app já abre a tela de permissão;
  - **Navegador:** continua abrindo a página da release (não há como baixar
    e instalar sozinho).
- O repositório está **público**: a verificação funciona sem token (o campo
  de token segue disponível caso volte a ser privado).

### Novidades v4.11.1

- **Botão de tema corrigido:** o botão de tema do topo agora alterna mesmo o
  tema (auto → claro → escuro) ao ser clicado — antes ele não tinha listener e
  não fazia nada (só funcionava pelas opções em Configurações).
- **Layout mobile corrigido:** em telas até 768px os botões do card
  (Exportar/Importar JSON, Verificar atualizações, Resetar) empilham cheios e
  alinhados, sem a indentação e o encostamento que apareciam na versão mobile.
- **Atualização com download no Electron:** o botão **Baixar e atualizar**
  baixa o instalador da release para `%TEMP%\JapDexUpdate` (com progresso) e o
  botão **Instalar agora** inicia a atualização (o NSIS detecta o app em
  execução e pede para fechá-lo); no navegador/APK continua abrindo a página
  da release. O repositório agora é **público** — a verificação funciona sem
  token (o campo de token segue disponível caso volte a ser privado).

### Novidades v4.11.0

- **Banner de backup inteligente:** aviso no topo indicando "nunca fez backup"
  ou "último backup há X dias" (fica dourado após 7 dias, vermelho após 30) com
  botão **Fazer backup agora**. **Auto-backup diário**: salva o progresso
  automaticamente a cada 24h (silencioso, com aviso no banner) e, se o
  navegador apagar os dados, oferece **Restaurar** o backup automático em 1 clique.
- **Verificar atualizações:** botão nas Configurações consulta a API do GitHub
  e mostra se há versão nova (com link para a release); como o repositório é
  **privado**, você pode colar um **token pessoal** (scope `public_repo`) para
  autenticar — sem token a consulta anônima retorna 404 e é tratada com aviso.
- **Links externos no Electron:** agora abrem no navegador padrão do sistema
  (`shell.openExternal`) em vez de carregar dentro do app.
- **Manutenção:** Electron **33 → 45** e electron-builder **25 → 26**;
  `npm audit` de **21 → 9** vulnerabilidades (as 9 restantes são do
  `picomatch` em pacotes de **desenvolvimento**, sem correção upstream;
  `minimatch` fixado via `overrides` sem quebrar o `glob@7` do empacotamento).

### Novidades v4.10.0

- **Voz japonesa no APK (correção):** o Android agora usa o **plugin nativo
  TextToSpeech** como 1ª opção (voz do sistema, offline com o pacote de idioma
  japonês instalado) e orienta o usuário se a voz JP não estiver disponível;
  corrigido também o caso em que o WebView sem `speechSynthesis` ficava mudo
  sem tentar o TTS online.
- **Tema claro:** `prefers-color-scheme` (Auto segue o sistema) + botão
  claro/escuro no topo e seção **Aparência** nas Configurações (Auto/Claro/Escuro).
- **Missões diárias:** 3 missões por dia (escolhidas pela data), barra de
  progresso e botão **Resgatar** dando XP bônus; zera sozinho à meia-noite.
- **Filtro "Focar em não dominadas" no vocabulário:** agora aparece também no
  quiz de palavras (exclui as já Dominadas; se tudo estiver dominado, usa a
  lista completa).
- **Estados vazios guiados:** dicionário vazio sugere 3 **palavras-primeiras**
  (犬, ありがとう, 学校) com 1 clique + atalhos para Loja/tutorial; busca sem
  resultado oferece "Limpar busca e filtros".
- **Conquistas novas (50 → 53):** `shop_10` Colecionador de Temas (10 pacotes
  comprados), `tutorial_done` Guia do Aprendiz e `word_gold_25` Memória de Aço
  (25 palavras Dominadas).

### Novidades v4.9.1

- **Desconto na Loja:** as palavras do pacote que você **já tem no dicionário**
  aparecem **reveladas** (o restante continua secreto) e dão desconto
  proporcional — pagar = custo × (faltantes/5). Ex.: 1 de 5 → −20%;
  **5 de 5 → grátis** (o nível é resgatado sem custo e libera o próximo).

### Novidades v4.9.0

- **Maestria "Dominada":** 3 acertos = borda prateada ★, 5 acertos = dourada 🏆
  com chip **"Dominada"** na lista de palavras e tooltip em chars/kanji.
- **Quiz "Focar em não dominadas":** opção no modal do quiz (hiragana, katakana e
  kanji) que sortea só os itens com menos de 5 acertos — se tudo estiver dominado,
  volta à lista completa.
- **Loja de pacotes:** 8 temas (Cores, Cumprimentos, Família, Escola, Casa,
  Animais, Comida, Ações) com **3 níveis cada**. O conteúdo é **secreto** (só
  "5 palavras secretas" antes de comprar), **exceto as palavras que você já tem
  no dicionário** — essas aparecem reveladas e dão **desconto proporcional**
  (pagar = custo × faltantes/5; 5/5 = **grátis**). Cada nível comprado libera
  o próximo do mesmo tema com palavras diferentes e custo maior de XP.
- **Tutorial em etapas:** tour guiado de 6 etapas com spotlight que inicia na
  1ª execução; botão **"?"** ao lado do ☰ reabre (Esc pula, setas navegam).

### Melhorias v4.8

- **Menu lateral:** todos os menus (Alfabetos, Configurações etc.) em um botão
  ☰ fixo — abre um drawer com as abas (fecha ao escolher aba, no Esc ou no fundo).
- **Voz japonesa:** letras do alfabeto emitem som em japonês. Cadeia em 4 níveis:
  áudio local dos kana (208 MP3s em `assets/audio/kana/`, offline) → voz ja-JP do
  sistema → TTS online (Google, exige a meta `referrer: no-referrer`) → voz padrão.
- **Seletor de alfabetos:** a aba Alfabetos mostra Hiragana, Katakana ou Kanji
  por vez (um por clique), em vez de tudo empilhado.
- **Ícone do projeto:** `favicon.ico` + `assets/icon.png` (degradê navy, hinomaru,
  glifo あ) → janela do Electron, ícones Android (`@capacitor/assets`) e PWA.

### Correções v4.8.1

- **Espaço gigante no fim da página / conteúdo cortado ao rolar:** `html,body`
  tinham `height:100%` + `overflow-x:hidden`, criando **dois** contextos de
  rolagem (o body recortava o conteúdo na borda da janela e a viewport rolava
  um espaço fantasma vazio). Agora só a viewport rola (`html`), sem corte.
- **Barra de rolagem invisível:** `scrollbar-width:none` + `::-webkit-scrollbar`
  oculto — rolagem silenciosa estilo app (wheel/teclado/toque OK).
- **Formulário "Adicionar Nova Palavra" enxuto:** só Palavra, Leitura e Tradução
  ficam visíveis; JLPT, Categoria, Tags e Notas aparecem com **"Mais opções"**.

## Estrutura

```
JapDex/
├── index.html              # HTML único (234 linhas), sem JS inline além dos handlers
├── css/
│   ├── base.css            # tema, reset, tipografia, utilitários (.sr-only)
│   ├── layout.css          # sidebar, conteúdo, abas
│   ├── components.css      # cards, listas, modais, quiz, notificações, confetti
│   └── responsive.css      # ajustes mobile
├── js/
│   ├── main.js             # bootstrap: expõe handlers em window + init
│   ├── config.js           # STORAGE_KEY, thresholds, XP, SRS, LEVELS (1–50)
│   ├── state.js            # estado global + migração de chave legada
│   ├── utils.js            # esc() / escJS() — sanitização HTML
│   ├── notifications.js    # fila de notificações, showFlyout, showConfirm
│   ├── xp.js               # addXP / level up
│   ├── srs.js              # revisão espaçada
│   ├── audio.js            # sons e confetti
│   ├── achievementLogic.js # desbloqueio de conquistas
│   ├── quiz.js             # 4 tipos de quiz
│   ├── data/               # conquistas e alfabetos (dados estáticos)
│   ├── ui/                 # abas, listas, grids, estatísticas, conquistas
│   ├── crud/               # palavras e kanji (CRUD)
│   └── io/backup.js        # exportar/importar/resetar (JSON)
├── assets/icons/fa/        # Font Awesome 6.5.1 local (offline)
├── electron/main.js        # processo principal do Electron
├── build/
│   └── installer-custom.nsi # script NSIS custom (fase única, contorna SAC)
├── www/                    # cópia web para o Capacitor (webDir)
├── android/                # projeto Android gerado pelo Capacitor
├── reference/              # 3.8.7-original.html (fonte preservada)
└── package.json            # scripts + config do electron-builder
```

## Desenvolvimento

```bash
# servidor local com cache desativado (use porta nova se o navegador cachear)
python C:\Users\PC\AppData\Local\Temp\opencode\japdex_server.py   # porta 8767

# app Electron
npm.cmd start
```

## Build — Windows (Electron)

```bash
npm.cmd install          # instala electron + electron-builder
npm.cmd run dist         # gera instalador NSIS + portátil em dist/
```

Saída em `dist/`:
- `Jap-Dex-4.11.0-instalador.exe` — instalador NSIS (escolhe diretório, atalhos)
- `Jap-Dex-4.11.0-portatil.exe` — executável portátil
- `Jap-Dex-4.11.0.apk` — APK de release (assinado com o keystore do projeto)

> **Windows:** usar `npm.cmd` (o `npm.ps1` é bloqueado pela ExecutionPolicy).

> **Smart App Control (SAC):** esta máquina tem o SAC em modo imposição,
> que bloqueia a execução de binários não assinados — o fluxo padrão do
> electron-builder (que executa um "stub" para extrair o desinstalador)
> falha com `spawn UNKNOWN`. Solução: `nsis.script: "installer-custom.nsi"`
> compila em **fase única** (o desinstalador é gerado no tempo de instalação
> com `WriteUninstaller`); nada é executado durante o build.

## Build — Android (Capacitor)

```bash
npm.cmd install                  # inclui @capacitor/core|cli|android
npx.cmd cap init "Jap-Dex" com.modnar22.japdex --web-dir www   # já feito
npx.cmd cap add android          # já feito (gera android/)
npx.cmd cap sync android         # copia www/ → android/app/src/main/assets/public

# build do APK (JAVA_HOME precisa ser JDK ≤ 24 — Gradle 8.14 não roda com Java 25)
set JAVA_HOME=%LOCALAPPDATA%\Java\jdk-21
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
cd android && gradlew.bat assembleDebug
# APK: android\app\build\outputs\apk\debug\app-debug.apk
```

- **JDK 21 (Temurin)** instalado em `%LOCALAPPDATA%\Java\jdk-21`
  (o JBR do Android Studio é Java 25 → `Unsupported class file major version 69`).
- `www/` é a fonte web do app mobile: `index.html` + `css/` + `js/` + `assets/`.

## Correções aplicadas (vs. 3.8.7.html)

| # | Bug | Correção |
|---|-----|----------|
| 1 | `switchTab` declarada 2× (a 2ª sobrescrevia a 1ª e quebrava com `element` nulo) | mesclada em `js/ui/tabs.js` |
| 2 | `clearForm` duplicada | verificado: só 1 definição |
| 3 | Import rejeitava backup válido com XP 0 (`!xp` é falsy) | valida tipos (`typeof xp === 'number'`) |
| 4 | Conquistas `lvl_40`/`lvl_50` inalcançáveis (LEVELS acabava no 30) | curva estendida até o nível 50 |
| 5 | `alert()` bloqueante no fim do quiz | toast via `showFlyout` |
| 6 | 13 `alert`/`confirm` bloqueantes | toasts + modal inline `showConfirm()` (Esc/fundo/Enter) |
| 7 | XSS via `innerHTML` com dados do usuário | `esc()`/`escJS()` em listas, cards, conquistas, toasts e filtros |
| 8 | `<link>` do Font Awesome dentro do `<body>` | movido para `<head>` + arquivo local |
| 9 | UI dizia v4.7 mas chave era `jp_app_v4_0` | `jp_app_v4_7` + migração automática da chave antiga |

Extras: 5 `<label class="sr-only">` para acessibilidade; zero `var` (já era `let/const`).
