# 上架 App Store 步驟（星球失物招領所 v1.0）

> 沒有 Mac：編譯、簽章、上傳都在 GitHub Actions 的 macOS 機器上做（`.github/workflows/testflight.yml`）。
> 公司通用流程見 `Company/playbooks/ios-app-store-release.md` 第 1、7、8 節。

## 目前狀態（2026-10-27）
- ✅ Bundle ID `com.austin410203.planetlostfound` 已註冊（Game Center、In-App Purchase），Team ID `M3FNV67WZ3`
- ✅ App 記錄：星球失物招領所，Apple ID **6827234202**，SKU `planet-lost-found-001`，主要語言繁中
- ✅ 價格免費（基準國家台灣）；供應 148 國，**排除歐盟 27 國**（DSA 申報為非交易者）
- ✅ 內購「完整版」Apple ID **6827238278**：NT$90、148 國、家人共享、中英日韓名稱與描述、審查備註；還缺審查截圖
- ❌ 付費 App 協議已過期，要重新簽；銀行帳戶要補持有人地址與類型（老闆）
- ❌ GitHub secrets 還沒設定；Game Center 排行榜等 API 金鑰後用 API 批次建立

## A. 一次性準備（老闆）

1. **加入 Apple Developer Program**：developer.apple.com/programs/enroll，用**個人**身分、本名，年費 US$99。付款後審核約 1～2 天。
2. **協議、稅務和銀行業務**（App Store Connect）：簽「付費 App 協議」（有內購就必須簽）、填 W-8BEN 與台灣銀行帳戶（SWIFT）。沒完成的話內購商品抓不到價格。
3. **申請 App Store Small Business Program**：抽成從 30% 降到 15%。
4. **建立 App**：App Store Connect → App → ＋ → 新增 App
   - 平台 iOS、名稱「星球失物招領所」、主要語言繁體中文、Bundle ID `com.austin410203.planetlostfound`（第一次上傳 build 時 Xcode 也會自動註冊；清單裡沒有就先到 developer.apple.com → Identifiers 新增，勾 Game Center、In-App Purchase）、SKU `planet-lost-found-001`、完整存取權。
5. **App Store Connect API 金鑰**：使用者與存取權限 → 整合 → App Store Connect API → 產生金鑰，角色「App 管理」。記下 Issuer ID、Key ID，下載 `.p8`（只能下載一次，存到密碼管理器）。
6. **把 4 個值存成 GitHub repo secrets**（repo → Settings → Secrets and variables → Actions → New repository secret）：
   | 名稱 | 內容 |
   |---|---|
   | `ASC_ISSUER_ID` | Issuer ID |
   | `ASC_KEY_ID` | Key ID |
   | `ASC_KEY_P8` | `.p8` 檔用記事本打開後的**完整內容**（含 BEGIN／END 兩行） |
   | `APPLE_TEAM_ID` | developer.apple.com → Account → Membership details 的 Team ID（10 碼） |

## A2. 廣告帳號（老闆，詳見 Company/playbooks/ads-monetization.md 第 2 節）
1. **Google AdMob**：建立帳號（台灣、W-8BEN、銀行 SWIFT）→ 新增應用程式「星球失物招領所」（iOS）→ 建立兩個廣告單元：**獎勵廣告**、**插頁廣告**。把 App ID（`ca-app-pub-…~…`）和兩個廣告單元 ID（`ca-app-pub-…/…`）交給 Claude。
2. AdMob「隱私權與訊息」：建立歐盟／英國的 GDPR 同意訊息（App 用 Google UMP 顯示）。
3. **app-ads.txt**：`https://emptyoffice.app/app-ads.txt` 已上線（目前是 AdSense 那一行，AdMob 開好後確認同一個發布商 ID 即可）；App Store Connect 的「行銷網址／開發者網站」填 `https://emptyoffice.app`。
4. **Google AdSense**（網頁版）：✅ 2026-10-27 已用 `emptyoffice.app` 送審（發布商 ID `ca-pub-4390142574700801`，`ads.txt`／`app-ads.txt` 已上線，進度見 `Company/outbox/2026-10-27_C_adsense-signup.md`）。還要另外通過「H5 遊戲廣告」才填進 `src/ads.js` 的 `WEB_AD_CLIENT`；在那之前網頁版播自家推廣廣告。
5. Claude 收到 ID 後：`src/ads.js` 填入並把 `ADMOB_LIVE` 改成 `true`、Info.plist 的 `GADApplicationIdentifier` 換成正式 App ID、`WEB_AD_CLIENT` 填入發布商 ID。**正式 ID 不要自己點廣告測試**，測試一律用測試 ID。

## B. 內購與 Game Center（老闆在 App Store Connect 操作，Claude 提供內容）
- 內購「完整版」：照 `docs/in-app-purchase.md` 建立（非消耗型，Product ID `com.austin410203.planetlostfound.fullunlock`，四語系名稱與描述、審查截圖）。
- Game Center 排行榜：照 `docs/game-center.md` 建立。

## C. 上傳 TestFlight（Claude）
1. GitHub → Actions →「TestFlight 上傳」→ Run workflow（或 commit 訊息含 `[testflight]`）。
2. 約 15 分鐘上傳完成，App Store Connect 處理約 10～30 分鐘後出現在 TestFlight。
3. 第一次上傳後在 TestFlight 頁面回答出口合規（Info.plist 已設 `ITSAppUsesNonExemptEncryption = false`，通常不會再問）。

## D. 實機測試（老闆，用 iPhone 的 TestFlight App）
- [ ] 冷啟動、標題畫面、新手教學
- [ ] 第 1～4 顆可玩，第 5 顆以後顯示完整版
- [ ] 沙盒帳號購買完整版 → 全部解鎖；刪掉 App 重裝 →「恢復購買」
- [ ] Game Center 登入、過關送分、每日挑戰排行
- [ ] 切到背景再回來、飛航模式（離線）、靜音開關
- [ ] 設定裡的條款連結：只有服務條款、隱私權、聯絡（App 內不可出現網頁付款或序號）
- [ ] 廣告（免費版）：鎖住的星球按「看廣告試玩一次」→ 看完進入該星球、中途關閉不給試玩、每天 5 次；過 2 關且開始玩 3 分鐘後，離開結算畫面會跳插頁廣告；買完整版／恢復購買後完全沒有廣告；飛航模式下不卡住
- [ ] iPad 直向／橫向

## E. 送審（老闆按送出，Claude 準備內容）
- 商店頁文案、關鍵字、年齡分級、隱私權標籤、審查備註：`docs/app-store-listing.md`
- 截圖：`store-shots/iphone69/<語言>/`（6.9 吋）、`store-shots/ipad13/<語言>/`（13 吋），各 5 張
- 版本頁勾選內購「完整版」一起送審；發布方式選「手動發布」
- 審查聯絡 email：hello@emptyoffice.app
