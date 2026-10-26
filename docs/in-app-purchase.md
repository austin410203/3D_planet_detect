# App 內購買：完整版

前 4 顆星球免費（不用依序過關），買斷「完整版」解鎖第 5～28 關。每日挑戰不受限制，免費玩家也會玩到付費星球，可以當作試玩。

- 原生端：`ios/App/App/StorePlugin.swift`（StoreKit 2，交易在裝置上驗證，不需要伺服器或第三方服務）
- JS 端：`src/store.js`；鎖定邏輯在 `src/progress.js` 的 `lockReason()`
- 網頁版：改用 Lemon Squeezy 序號（NT$90），設定見 `docs/lemon-squeezy-listing.md`；App 內不可出現序號或外部付款連結

## 商品

| 項目 | 設定 |
|---|---|
| 類型 | 非消耗性項目（Non-Consumable） |
| 產品 ID | `com.austin410203.planetlostfound.fullunlock` |
| 參考名稱 | Full Unlock |
| 顯示名稱（繁中） | 完整版 |
| 描述（繁中） | 解鎖第 5～28 關，再多 24 顆主題星球。 |
| 建議價格 | NT$90（約 US$2.99 的價格等級），可自行調整 |
| 家人共享 | 建議開啟（`Products.storekit` 已開啟） |

## App Store Connect 步驟

1. **協議、稅務和銀行業務**：先簽署「付費 App 協議」，並填好銀行與稅務資料。沒有完成的話，商品不會出現，App 裡的價格也查不到。
2. **App 內購買項目** → 新增「非消耗性項目」，依上表填寫，並加上繁中（及英文）在地化資訊。
3. **審查資訊**：上傳一張購買畫面的截圖（完整版視窗），並在備註說明「第 5 關以後的星球需要購買完整版；設定 → 恢復購買」。
4. 第一個內購項目必須**和 App 版本一起送審**：在版本頁面的「App 內購買項目和訂閱項目」區塊把它加進去。

## 在 Mac 上測試

- **本機（不用連 App Store Connect）**：Xcode → Product → Scheme → Edit Scheme → Run → Options → **StoreKit Configuration** 選 `Products.storekit`。在模擬器或實機執行時，購買會走本機測試流程，也可以在 Xcode 的 Debug → StoreKit → Manage Transactions 裡退款或刪除交易，測試退款後重新鎖定。
- **沙盒（Sandbox）**：把 StoreKit Configuration 設回 None，在 App Store Connect 的「使用者與存取權限 → 沙盒」建立測試帳號，在 iPhone 的「設定 → App Store → 沙盒帳號」登入。
- **TestFlight**：TestFlight 裡的購買不會真的扣款，適合最後確認整個流程。

## 審核規則重點

- 一定要有「恢復購買」：完整版視窗下方，以及「設定 → 完整版 → 恢復購買」。
- 價格一律顯示 StoreKit 回傳的 `displayPrice`（依各國貨幣），不要把價格寫死在程式裡。
- 不要在 App 裡引導玩家到 App 以外的地方付款。
