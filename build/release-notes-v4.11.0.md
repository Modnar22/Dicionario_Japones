## Novidades v4.11.0

- **Banner de backup inteligente:** aviso no topo indicando "nunca fez backup" ou "último backup há X dias" (dourado após 7 dias, vermelho após 30) com botão **Fazer backup agora**.
- **Auto-backup diário:** salva o progresso automaticamente a cada 24h (silencioso, com aviso no banner) e, se o navegador apagar os dados, oferece **Restaurar** o backup automático em 1 clique.
- **Verificar atualizações:** botão nas Configurações consulta a API do GitHub e mostra se há versão nova (com link para a release). Como o repositório é **privado**, você pode colar um **token pessoal** (scope `public_repo`) para autenticar — sem token a consulta anônima retorna 404 e é tratada com aviso.
- **Links externos no Electron:** agora abrem no navegador padrão do sistema (`shell.openExternal`) em vez de carregar dentro do app.
- **Manutenção:** Electron **33 → 45** e electron-builder **25 → 26**; `npm audit` de **21 → 9** vulnerabilidades (as 9 restantes são do `picomatch` em pacotes de **desenvolvimento**, sem correção upstream — nenhuma afeta o app empacotado).

## Artefatos

| Arquivo | Tamanho | SHA-256 |
| --- | --- | --- |
| `Jap-Dex-4.11.0-instalador.exe` | 134.297.522 bytes | `F3FA3541FC0626080B643EB65EC510F921CE5F73A67526E722F483D02DE290EF` |
| `Jap-Dex-4.11.0-portatil.exe` | 119.601.188 bytes | `037EA232AFB9C8C2E5E70D30D59DFACCB91BDA6DF207116DF1B8E06477375C85` |
| `Jap-Dex-4.11.0.apk` | 5.241.352 bytes | `16B19AE2BA60E2257C7353BA3DEDF6E6A21EB5C7EA8C99694EEAC8F8F309B946` |

- **Windows:** instalador NSIS (escolhe diretório/atalhos) ou executável portátil — Electron 45.
- **Android:** APK de release assinado, `versionCode 493` (atualize por cima da 4.10.0).
