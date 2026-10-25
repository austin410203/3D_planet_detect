# 星球失物招領所（3D_planet_detect）

Three.js + Vite 的 3D 星球解謎遊戲：讀線索、在星球上找出藏起來的物品，依時間給 1～3 星。部署在 Vercel。

## 慣例
- 所有說明、程式註解、文件一律使用**繁體中文**。
- 純 HTML + ES Module，不使用框架；模型全部用 Three.js 基本幾何體組合，沒有外部模型或貼圖檔。
- 各功能分檔撰寫，改動時維持模組化。
- 遊戲內支援四種語言（繁中／日本語／한국어／English）：玩家看得到的文字不可寫死在程式裡。
  - 介面文字：`src/locales/ui.js`（四種語言都要加），程式用 `t('key', vars)`；HTML 用 `data-i18n` / `data-i18n-aria`。
  - 關卡文字：繁中寫在 levels 檔，其他語言在 `src/locales/levels-{en,ja,ko}.js`（同一個關卡 id，物品與雜物依順序對應）。新增關卡時三個檔都要補。
  - 自動線索：`src/locales/clue-text.js`（模板、藏匿點名稱與說法、愛八卦的居民）。新增藏匿點種類時四種語言都要補。
  - 韓文助詞寫成「이(가)／을(를)／은(는)／(으)로」，`fixJosa()` 會依收尾子音換成正確的一個。
  - 字型：日文、韓文用 Noto Sans JP／KR 子集（`scripts/subset-fonts.mjs` 從 locales 收集字元），CSS 依 `<html lang>` 切換。
- 遊戲中的圖示用 Gemini 生成的低多邊形圖示取代 emoji：`public/icons/game/<emoji 碼位>.webp`，`src/icons.js` 會自動把畫面上的 emoji 換成圖片；沒有圖示的維持 emoji。流程：`scripts/icon-catalog.mjs` 產生清單 → Gemini 4×4 圖示表 → `python scripts/slice_icons.py <圖> <第幾張>` 切圖去背。

## 指令
- `npm install`、`npm run dev`（本地開發）、`npm run build`（輸出到 `dist/`，部署前必須無錯誤）
- 網址加 `?unlock=all` 可解鎖全部關卡測試（網頁版與開發模式有效，iOS App 正式版無效）。
- `npm run build` 前會自動跑 `scripts/subset-fonts.mjs`（prebuild），依程式中用到的字重新縮減字型到 `public/fonts/`。
- `npm run ios`：build 後同步到 `ios/`；`npm run ios:open` 用 Xcode 開啟（需要 Mac）。

## iOS App（Capacitor 8）
- 目標：上架 App Store，免費加內購——前 8 關免費，買斷「完整版」解鎖第 9～28 關。內購用自寫 StoreKit 2 外掛 `StorePlugin.swift`，設定與測試方式見 `docs/in-app-purchase.md`。
- 網頁版是否全部免費由 `src/store.js` 的 `WEB_FULL_ACCESS` 控制（App 上架前為 `true`）。
- `capacitor.config.json`：Bundle ID `com.austin410203.planetlostfound`，`webDir: dist`。
- `ios/`：Xcode 專案（SPM，不用 CocoaPods）。iPhone 鎖直式、iPad 四個方向；隱藏狀態列。`ios/App/App/public` 是同步產物，不進 git。
- 介面貼邊元素一律加上 `--sa-t/--sa-r/--sa-b/--sa-l`（safe-area-inset）避開瀏海與 Home 指示條。
- 不可依賴外部網路資源（字型、CDN），App 必須離線可玩。
- App 切到背景時 `main.js` 會停止渲染迴圈與音訊，計時不會繼續跑。
- Game Center 用自己寫的本地外掛 `ios/App/App/GameCenterPlugin.swift`（由 `MainViewController` 註冊；Capacitor 8 的根畫面是 `SceneDelegate.swift` 用程式建立的，不是 Main.storyboard，所以要在 SceneDelegate 改用 `MainViewController()`。CI 會檢查外掛真的有原生呼叫）。新增 Swift 檔時要手動登記到 `project.pbxproj`（PBXBuildFile、PBXFileReference、App 群組、Sources）。排行榜 ID 與 App Store Connect 設定見 `docs/game-center.md`。
- 網頁版沒有 Game Center 與震動：相關按鈕、設定列自動隱藏。

## 架構
- `main.js`：畫面流程（標題畫面 → 選關 → 委託 → 倒數 → 解謎 → 結算；第一次遊玩從標題直接進第一關並跑新手教學）、Renderer、Bloom、主題燈光、選關輪播（只建立選中星球前後兩顆預覽）。
- `src/levels.js`（第 1～8 關）、`src/levels-extra.js`（第 9～28 關）：關卡資料。每關 4 個地標、3～4 件物品、`spotPool`、`stars: [三星秒數, 二星秒數]`。
- `src/clues.js`：每局隨機把物品分配到地標與藏匿點，並以線索／傳說／八卦模板產生線索；隨機結果與關卡預設劇本相同時沿用手寫線索。
- `src/world.js`：`buildWorld(level, seed)` 依關卡擺放地標、藏匿點、裝飾（InstancedMesh）。
- `src/planet.js`：依主題生成地形、海面、大氣層；`getSurfaceRadius()`／`getBiome()` 以目前主題計算。
- `src/props.js`、`src/props-extra.js`：藏匿點（`SPOTS`）、地標（`LANDMARKS`）、裝飾（`DECOR`）模型庫。
- `src/game.js`：計時、搜尋、提示、線索手冊、評星。翻錯 +3 秒、提示 +15 秒。
- `src/progress.js`：進度存在 Capacitor Preferences（iOS 為 UserDefaults，網頁為 localStorage），啟動時需先 `await loadProgress()`；舊版 localStorage 進度會自動搬移。
- `src/settings.js`：配樂／音效／震動開關、語言、是否看過教學（Preferences）。
- `src/tutorial.js`：新手教學三步驟（拖曳旋轉 → 打開線索手冊 → 點地標旁的藏匿點），期間暫停計時、翻錯不加秒；設定裡可「再看一次」。
- `src/audio.js`：Web Audio 即時合成音效與配樂，不使用音檔。配樂依星球 id 產生固定的 8 小節循環，`MINOR` 清單裡的星球用小調；第一次觸控才解鎖發聲（iOS 規定）。
- `src/haptics.js`：觸覺回饋（只在原生 App）。按鈕的點擊音效與震動由 `main.js` 的 document click 統一處理，不用每顆按鈕各自加。
- `src/gamecenter.js`：Game Center 登入、上傳分數、開啟排行榜。時間以 1/100 秒上傳。
- `src/store.js`：完整版購買狀態（本地快取＋StoreKit 確認）、購買、恢復購買。`progress.lockReason()` 回傳 `'paid'`／`'stars'`／`null`，畫面依原因顯示不同鎖定提示。
- `src/daily.js`：每日挑戰。以 UTC+8 日期算出星球與 seed（全世界同一張地圖），只記錄當天第一次的成績、計算連續天數；不影響一般關卡進度與解鎖，也不受解鎖限制。

## 關卡設計規則
- 同一個地標旁的藏匿點種類不可重複，確保每條線索只有一個正確答案。
- 新增關卡時：在 levels 檔加資料；新模型加到 props 檔；線索必須同時提到地標名稱與藏匿點種類。
- 改完關卡或隨機化邏輯，請用多個 seed 呼叫 `buildWorld` 驗證：每件物品都有放到、位於對應地標附近、地標不在海裡。
