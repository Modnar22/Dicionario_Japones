# Jap-Dex v4.12.0

## 🔍 Verificação automática de atualização

- Ao **abrir o app** é feita uma consulta silenciosa à API do GitHub:
  - se houver **versão nova**, aparece um **aviso clicável** que leva direto
    à seção *Atualizações* em Configurações (com destaque no box);
  - se já estiver atualizado ou **offline**: nada incomoda (sem pop-ups).
- A consulta roda uma vez por sessão, 6 segundos após a abertura.

## ⬇️ Download DENTRO do app (estilo update de aplicativo)

- **Electron (Windows):** *Baixar e atualizar* baixa o instalador para
  `%TEMP%\JapDexUpdate` com **barra de progresso** e mostra
  **Instalar agora** (o NSIS fecha o app em execução antes de atualizar).
- **APK Android (novo):** plugin nativo **Updater** faz o download do APK
  para o diretório do app **com barra de progresso** e abre o **instalador
  do sistema** — na primeira vez o Android pede a permissão
  *"instalar apps desconhecidos"* (o app já abre a tela de permissão;
  autorize, volte e toque em *Instalar agora* de novo).
- **Navegador:** continua abrindo a página da release (não há como baixar e
  instalar sozinho).

## 📦 Artefatos

| Arquivo | Tamanho | SHA-256 |
|---|---:|---|
| `Jap-Dex-4.12.0-instalador.exe` | 134.301.867 | `FB80FC1A9919B9E55ED085B04FF0D7B3297E0D25A0A478234358AD63CADA8813` |
| `Jap-Dex-4.12.0-portatil.exe` | 119.605.472 | `5646D195865ED2497EDEAD91C814D644EB747EC5A9E258F41A6AAF062F90D130` |
| `Jap-Dex-4.12.0.apk` | 5.247.396 | `7EF9C8A9BB0787A3EDC6DA76087FE75AE58D57085F6B9A53F6CAA4AAB4DFCB3E` |

- **Windows:** `Jap-Dex-4.12.0-instalador.exe` (NSIS) e
  `Jap-Dex-4.12.0-portatil.exe` (portátil).
- **Android:** `Jap-Dex-4.12.0.apk` (versionCode 495, com o novo plugin
  `Updater` + permissão `REQUEST_INSTALL_PACKAGES`).

> Nota de build: mantidos os 9 `vulns` high do `npm audit` (raiz `picomatch`,
> apenas em pacotes de desenvolvimento, sem correção upstream).
