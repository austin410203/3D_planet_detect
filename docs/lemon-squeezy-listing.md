# Lemon Squeezy 商品設定：星球失物招領所 完整版（網頁版）

> 商店：Empty Office（Store ID 507523，目前測試模式，幣別 TWD）。欄位順序照 Lemon Squeezy「New product」頁面。
> 網頁版的序號**不能**在 iOS App 內使用（審查指南 3.1.1），App 版另走 App Store 內購（`docs/in-app-purchase.md`）。

## 1. 基本資料

| 欄位 | 填寫 |
|---|---|
| **Name** | `星球失物招領所 完整版 Lost & Found in Space Full Version` |
| **Pricing** | Single payment |
| **Price** | `90`（NT$90，約 US$2.99；與 iOS 內購建議價相同） |
| **Tax category** | Video games（沒有就選 Digital goods or services） |
| **Files** | 留空（賣的是序號） |
| **Variants** | 不用加 |

### Description（直接複製）
```
免費就能玩前 8 顆星球和每日挑戰；買一次「完整版」，解鎖第 9～28 顆星球，共 28 顆，一次付費、永久使用，沒有訂閱、沒有廣告。

・閱讀線索手冊，在低多邊形的 3D 星球上找出居民遺失的物品
・20 顆新星球：骷髏海盜灣、月球基地、恐龍谷、亞特蘭提斯、巨龍之巢、南瓜鬼鎮、玩具王國……每顆都有自己的委託人、地標與配樂
・支援繁體中文、日本語、English、한국어
・付款後會收到一組序號，在遊戲裡輸入即可解鎖；同一組序號最多可在 5 個裝置或瀏覽器使用

---

The first 8 planets and the Daily Challenge are free. Buy the Full Version once to unlock planets 9–28 — 28 planets in all. One-time purchase: no subscription, no ads.

・Read the clue notebook and find lost items on low-poly 3D planets
・20 more planets — Skull Pirate Cove, Moon Base, Dinosaur Valley, Atlantis, Dragon's Lair, Pumpkin Ghost Town, Toy Kingdom and more — each with its own client, landmarks and music
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

## 6. 建好之後交給 Claude
- **Product ID**（商品網址裡的數字）
- **Checkout 連結**（商品 → Share）
- Store ID 已知：507523

Claude 接著要做的程式（沿用月台圖鑑 `TrainPlatform/src/store.js`、`worker/index.js` 的 `license()`、`#unlock` 解鎖頁）：
1. `wrangler.jsonc` 加 `main`（Worker）與 `vars`：`LS_STORE_ID`、`LS_PRODUCT_ID`；Worker 提供 `/api/license/activate|validate`，代呼叫 Lemon Squeezy 授權 API。
2. `src/store.js`：網頁版 `WEB_FULL_ACCESS` 改為 `false`，第 9～28 顆上鎖；序號啟用、每 7 天重新驗證，退款後重新上鎖；`?lstest` 測試開關。
3. 網頁版完整版視窗：價格、內容、「前往購買」（開 Checkout 連結）、序號輸入；**只在網頁版顯示**，App 內維持 StoreKit。
4. 條款頁：`scripts/legal_gen.py` 的完整版介紹、退款、隱私權頁改成「網頁版 NT$90、Lemon Squeezy 序號」的正式版本，重新產生。
5. 先在 Lemon Squeezy 測試模式用測試卡 `4242 4242 4242 4242` 走一次：付款 → 拿到序號 → 輸入 → 解鎖 → 退款 → 重新上鎖。
