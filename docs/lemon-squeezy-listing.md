# Lemon Squeezy 商品設定：星球失物招領所 完整版（網頁版）

> 商店：Empty Office（Store ID 507523，目前測試模式，幣別 TWD）。欄位順序照 Lemon Squeezy「New product」頁面。
> 網頁版的序號**不能**在 iOS App 內使用（審查指南 3.1.1），App 版另走 App Store 內購（`docs/in-app-purchase.md`）。

## 1. 基本資料

| 欄位 | 填寫 |
|---|---|
| **Name** | `星球失物招領所 完整版 Lost & Found in Space Full Version` |
| **Pricing** | Single payment |
| **Price** | `90`（NT$90，約 US$2.99；與 iOS 內購建議價相同；老闆 2026-10-26 確認） |
| **Tax category** | Video games（沒有就選 Digital goods or services） |
| **Files** | 留空（賣的是序號） |
| **Variants** | 不用加 |

### Description（直接複製）
```
免費就能玩前 4 顆星球和每日挑戰；買一次「完整版」，解鎖第 5～28 顆星球，共 28 顆，不用依序過關，一次付費、永久使用，沒有訂閱、沒有廣告。

・閱讀線索手冊，在低多邊形的 3D 星球上找出居民遺失的物品
・24 顆新星球：骷髏海盜灣、月球基地、恐龍谷、亞特蘭提斯、巨龍之巢、南瓜鬼鎮、玩具王國……每顆都有自己的委託人、地標與配樂
・支援繁體中文、日本語、English、한국어
・付款後會收到一組序號，在遊戲裡輸入即可解鎖；同一組序號最多可在 5 個裝置或瀏覽器使用

---

The first 4 planets and the Daily Challenge are free. Buy the Full Version once to unlock planets 5–28 — 28 planets in all, playable in any order. One-time purchase: no subscription, no ads.

・Read the clue notebook and find lost items on low-poly 3D planets
・24 more planets — Skull Pirate Cove, Moon Base, Dinosaur Valley, Atlantis, Dragon's Lair, Pumpkin Ghost Town, Toy Kingdom and more — each with its own client, landmarks and music
・Available in English, 繁體中文, 日本語 and 한국어
・You'll receive a licence key after payment; enter it in the game to unlock. One key works on up to 5 devices or browsers.

※ This licence is for the web version at planet.emptyoffice.app. It cannot be used in the iOS app, which offers its own in-app purchase.
```

### Media（2～3 張，1600×1200）
我會用最新商店截圖合成，放在 `store-shots/lemon/`：
1. `01-planets.png`：選關畫面（28 顆星球）
2. `02-play.png`：遊戲中（線索手冊 + 星球）
3. `03-result.png`：結算畫面

## 2. Links（商品頁按鈕）

| 欄位 | 填寫 |
|---|---|
| Link label | `開啟星球失物招領所並輸入序號 / Open Lost & Found in Space` |
| URL | `https://planet.emptyoffice.app/` |

## 3. Settings

| 欄位 | 填寫 |
|---|---|
| **Generate license keys** | 開啟 |
| Activation limit | `5` |
| License length | Never expires（永久） |

## 4. Confirmation modal（付款完成視窗）

| 欄位 | 填寫 |
|---|---|
| Title | `感謝購買！Thanks for your order!` |
| Button text | `回到星球失物招領所 Open Lost & Found in Space` |
| Button link | `https://planet.emptyoffice.app/` |

### Message（直接複製）
```
你的序號在上方，也會寄到你的 email。
啟用方式：開啟星球失物招領所 → 點鎖住的星球或「⚙️ 設定 → 完整版」→ 輸入序號 → 按「啟用」。同一組序號最多可在 5 個裝置使用。

Your licence key is shown above and in your email.
To activate: open Lost & Found in Space → tap a locked planet or ⚙️ Settings → Full Version → enter the key → press "Activate". One key works on up to 5 devices.
```

## 5. Email receipt（收據 email）
確認收據裡會顯示序號（預設會顯示），並在「Additional message」貼上和 Confirmation modal 相同的啟用說明，再加一行：
```
有問題請來信 / Questions: hello@emptyoffice.app ・ 14 天內不論原因全額退款 / Full refund within 14 days: https://planet.emptyoffice.app/refund
```

## 6. 目前狀態（2026-10-26）
- 商品已建立：**Product ID 1474126**（`wrangler.jsonc` 的 `vars`），Store ID 507523，`LS_LIVE` 為 `"0"`（測試模式）。
- 網頁版已上鎖：第 5～28 顆需要完整版，不用依序過關（`src/store.js` 的 `FREE_LEVELS = 4`）。
- Worker `worker/index.js`：`/api/license/activate|validate` 代呼叫 Lemon Squeezy 授權 API，並確認序號屬於這個商品。
- 完整版視窗（網頁版）：購買 NT$90（開結帳頁）、序號輸入與啟用、完整版說明連結；App 內不顯示。
- 結帳連結：`src/store.js` 的 `CHECKOUT`（emptyofficex.lemonsqueezy.com）。商店測試模式期間只有網址加 `?lstest` 才會開結帳頁，一般訪客看到「付款頁面即將開放」。
- 測試：測試模式用測試卡 `4242 4242 4242 4242` 走一次：付款 → 拿到序號 → 輸入 → 解鎖 → 退款 → 重新上鎖（重新驗證每 7 天一次，測退款時可清掉 localStorage 的 `planetLostFound.pass` 的 `checked`）。
- 正式收款：Lemon Squeezy 商店啟用後，把 `src/store.js` 的 `LIVE` 改成 `true`、`wrangler.jsonc` 的 `LS_LIVE` 改成 `"1"`。
