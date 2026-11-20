# Jap-Dex v4.12.1

## 🛡️ Correção do aviso do Play Protect

Na v4.12.0 o Play Protect passou a marcar o APK como *"potencialmente
perigoso"* ao instalar a atualização — algo que nunca tinha aparecido
antes. Motivo: aquela versão adicionou ao APK a permissão
`REQUEST_INSTALL_PACKAGES` e código que baixa e abre instaladores, um
padrão que o Play Protect associa a malware ("dropper").

## ⬇️ Como ficou (download mantido, instalação pelo sistema)

- O download **continua dentro do app**, com **barra de progresso**, agora
  pelo **DownloadManager** do Android (o gerenciador oficial de downloads
  do sistema).
- A **instalação** passa pela **notificação padrão do sistema**: ao
  concluir, toque em *"Download concluído"* na notificação e confirme —
  exatamente como ao baixar um APK no navegador.
- A permissão `REQUEST_INSTALL_PACKAGES` e o código de instalação do nosso
  app foram **removidos do APK** — os sinais que disparavam o aviso não
  existem mais.
- O aviso **não deve mais aparecer** ao instalar esta versão (a instalação
  da própria v4.12.1 pode pedir "Instalar mesmo assim" uma última vez, por
  ser o APK que ainda carregava a permissão).

## 📦 Artefatos

| Arquivo | Tamanho | SHA-256 |
|---|---:|---|
| `Jap-Dex-4.12.1-instalador.exe` | 134.301.809 | `FB3758744B8B0C0AC171A556738E7F0BA8DE87CB51C60289268001BFD89DEEC0` |
| `Jap-Dex-4.12.1-portatil.exe` | 119.604.260 | `E08683F74DD04E1177A0BD46F1DE7B91F2431C84FBE2D1C2DA68988561512256` |
| `Jap-Dex-4.12.1.apk` | 5.248.500 | `690EA2737AFC1C2297DD3C01A84567FDEF616E18CF2E12270BDCB247BEBEB87F` |

- **Windows:** `Jap-Dex-4.12.1-instalador.exe` (NSIS) e
  `Jap-Dex-4.12.1-portatil.exe` (portátil).
- **Android:** `Jap-Dex-4.12.1.apk` (versionCode 496, **sem**
  `REQUEST_INSTALL_PACKAGES`).

> Nota de build: mantidos os 9 `vulns` high do `npm audit` (raiz
> `picomatch`, apenas em pacotes de desenvolvimento, sem correção
> upstream).
