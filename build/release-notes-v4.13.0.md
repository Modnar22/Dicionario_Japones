# Jap-Dex v4.13.0

## 🛍️ 4 novos temas na loja (60 palavras novas)

Novos pacotes de palavras no mesmo formato da loja — cada tema com
**3 níveis progressivos × 5 palavras secretas** e desconto proporcional
para as palavras que você já tem no dicionário:

- 🌳 **Natureza** (50/90/140 XP) — 山, 川, 空, 海, 木, 花, 雨, 雪, 森, 湖, 星…
- 👕 **Roupas** (50/90/140 XP) — 服, 靴, 帽子, 眼鏡, シャツ, スカート, 帯, 雨傘…
- 🧍 **Corpo** (70/110/160 XP) — 頭, 手, 目, 耳, 鼻, 歯, 指, 肩, 膝, 首…
- 🏙️ **Cidades** (70/110/160 XP) — 駅, 病院, 公園, 銀行, 図書館, 空港, 寺, 城…

A loja agora tem **12 temas** no total.

## ⬇️ Testando o download no Android (v4.12.1)

Esta release serve para testar a correção do Play Protect: no APK (ou no
computador) abra **Configurações → Atualizações → Verificar
atualizações** e use **Baixar e atualizar** — o download roda **dentro do
app** com barra de progresso; no Android a instalação acontece pela
**notificação do sistema** ("Download concluído → toque para instalar").

## 📦 Artefatos

| Arquivo | Tamanho | SHA-256 |
|---|---:|---|
| `Jap-Dex-4.13.0-instalador.exe` | 134.302.778 | `FFCABA6669C6D38BB60638BE776DCE0E9727DA42C6F3A441D750FE5CC81BF2FA` |
| `Jap-Dex-4.13.0-portatil.exe` | 119.606.207 | `FFFAFAD8E1A32AA2DE8B3F1F670FE0ECD40A59CC09824855D7E87E43AD42897E` |
| `Jap-Dex-4.13.0.apk` | 5.249.588 | `A3401B5E56EA5640AE1734286260E79455DC324E2AD1BE02CCA6B231D779C262` |

- **Windows:** `Jap-Dex-4.13.0-instalador.exe` (NSIS) e
  `Jap-Dex-4.13.0-portatil.exe` (portátil).
- **Android:** `Jap-Dex-4.13.0.apk` (versionCode 497, sem
  `REQUEST_INSTALL_PACKAGES`).

> Nota de build: mantidos os 9 `vulns` high do `npm audit` (raiz
> `picomatch`, apenas em pacotes de desenvolvimento, sem correção
> upstream).
