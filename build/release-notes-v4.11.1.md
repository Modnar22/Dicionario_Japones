# Jap-Dex v4.11.1

## 🎯 Correções

- **Botão de tema agora funciona:** o botão no topo (ao lado do "?") alterna
  **auto → claro → escuro** ao ser clicado — antes ele não respondia ao clique
  (só funcionava pela seção *Aparência* em Configurações).
- **Layout mobile corrigido:** em telas até 768px os botões do card de
  Configurações (Exportar/Importar JSON, Verificar atualizações, Resetar)
  empilham em **largura total e alinhados**, sem a indentação e o encostamento
  da versão anterior.

## ⬆️ Atualização com download (Electron)

- Ao detectar uma versão nova, o botão **Baixar e atualizar** baixa o
  instalador para `%TEMP%\JapDexUpdate` **com barra de progresso** e então
  mostra **Instalar agora**, que inicia a atualização (o instalador detecta o
  Jap-Dex em execução e pede para fechá-lo antes de atualizar).
- No navegador e no APK o botão continua abrindo a **página da release**
  (instalador/portátil/APK) para download manual.
- O repositório agora é **público**: a verificação funciona **sem token**
  (o campo de token segue disponível caso o repo volte a ser privado).

## 📦 Artefatos

| Arquivo | Tamanho | SHA-256 |
|---|---:|---|
| `Jap-Dex-4.11.1-instalador.exe` | 134.300.057 | `7F472F6647242B7A4F89E5A77111CE7AE2ABD412DE562580551BC64596AF6F16` |
| `Jap-Dex-4.11.1-portatil.exe` | 119.601.899 | `944AC705E00B326DBEF7B05F2949224ECF7C77437EAFEC299FB568BB75FEDC55` |
| `Jap-Dex-4.11.1.apk` | 5.243.072 | `32D203C530C51B393E7459F6B4C3981093DEC41E7FC821752BC3F70AFEB6B274` |

- **Windows:** `Jap-Dex-4.11.1-instalador.exe` (NSIS) e
  `Jap-Dex-4.11.1-portatil.exe` (portátil).
- **Android:** `Jap-Dex-4.11.1.apk` (versionCode 494).

> Nota de build: mantidos os 9 `vulns` high do `npm audit` (raiz `picomatch`,
> apenas em pacotes de desenvolvimento, sem correção upstream).
