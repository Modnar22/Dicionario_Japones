# 📱 Jap-Dex — v4.7

Aplicativo de estudo de japonês: **vocabulário, kanji, alfabetos (hiragana/katakana),
SRS (revisão espaçada), quizzes, XP/níveis e 50 conquistas** — 100% offline.

Original: arquivo único `3.8.7.html` (2345 linhas) → reestruturado em módulos
HTML + CSS + JS (ES modules), com correção de bugs e sanitização de HTML.

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
- `Jap-Dex-4.7.0-instalador.exe` — instalador NSIS (escolhe diretório, atalhos)
- `Jap-Dex-4.7.0-portatil.exe` — executável portátil

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
