# Game Center 設定

App 端程式：`ios/App/App/GameCenterPlugin.swift`（原生外掛）、`src/gamecenter.js`（JS 介面）。
網頁版沒有 Game Center，相關按鈕會自動隱藏。

## Xcode

- `ios/App/App/App.entitlements` 已開啟 `com.apple.developer.game-center`，Debug／Release 都已設定 `CODE_SIGN_ENTITLEMENTS`。
- 第一次用 Xcode 開啟時，到 **Signing & Capabilities** 確認 Game Center 有出現；沒有的話按「+ Capability」加入 Game Center。

## App Store Connect：要建立的排行榜

已用 App Store Connect API 建好（2026-10-27，30 個，中英日韓名稱）：`scripts/gamecenter-setup.mjs`，在 GitHub Actions 跑（`.github/workflows/gamecenter.yml`，手動或 commit 訊息含 `[gamecenter]`；可重複執行，已存在的會略過）。新增星球時把 id 加進 levels 檔後重跑即可。

- API 限制：名稱最多 30 字（太長自動改成只放星球名稱）；循環長度要寫 `PT24H`（`P1D` 會被拒）。

| 排行榜 ID | 類型 | 分數格式 | 排序 | 說明 |
|---|---|---|---|---|
| `plf.daily` | 循環型（Recurring），每 1 天 | 經過時間（到 1/100 秒） | 由低到高 | 每日挑戰。開始時間設在 **00:00 UTC+8**（＝前一天 16:00 UTC），與遊戲換日一致 |
| `plf.stars` | 經典型（Classic） | 整數 | 由高到低 | 總星數（最多 84） |
| `plf.best.<星球 id>` | 經典型（Classic） | 經過時間（到 1/100 秒） | 由低到高 | 各星球最快時間，共 28 個（見下表） |

時間類分數一律以 **1/100 秒** 為單位上傳（例如 75 秒 → 7500）。

### 各星球最快時間

| # | 星球 | 排行榜 ID |
|---|---|---|
| 1 | 🌳 綠野星 | `plf.best.verdant` |
| 2 | 🌋 熔岩星 | `plf.best.ember` |
| 3 | 🌊 汪洋星 | `plf.best.aqua` |
| 4 | 🍭 糖果星 | `plf.best.candy` |
| 5 | ❄️ 冰晶星 | `plf.best.frost` |
| 6 | 🏜️ 沙丘星 | `plf.best.dune` |
| 7 | 🍄 蘑菇星 | `plf.best.spore` |
| 8 | ⚙️ 齒輪星 | `plf.best.gear` |
| 9 | 🏴‍☠️ 骷髏海盜灣 | `plf.best.pirate` |
| 10 | 🗿 巨人遺跡星 | `plf.best.giants` |
| 11 | 🚀 月球基地 | `plf.best.moonbase` |
| 12 | 🌃 霓虹機械城 | `plf.best.neon` |
| 13 | 🪄 魔法王國 | `plf.best.magic` |
| 14 | 🍎 七矮人森林 | `plf.best.snowwhite` |
| 15 | 🎩 奇境仙境 | `plf.best.wonderland` |
| 16 | 🦕 恐龍谷 | `plf.best.dino` |
| 17 | 🔱 亞特蘭提斯 | `plf.best.atlantis` |
| 18 | ☁️ 天空浮島 | `plf.best.sky` |
| 19 | 🐉 巨龍之巢 | `plf.best.dragon` |
| 20 | 🎃 南瓜鬼鎮 | `plf.best.halloween` |
| 21 | 🏮 東方仙山 | `plf.best.orient` |
| 22 | 🛡️ 維京峽灣 | `plf.best.viking` |
| 23 | 🎈 蒸汽飛船港 | `plf.best.steam` |
| 24 | 👾 外星蟲巢 | `plf.best.alien` |
| 25 | 🧸 玩具王國 | `plf.best.toys` |
| 26 | 💚 翡翠城 | `plf.best.emerald` |
| 27 | 🎄 聖誕北極星 | `plf.best.xmas` |
| 28 | 🐍 叢林神殿 | `plf.best.jungle` |
