# 星球失物招領所（3D_planet_detect）

Three.js + Vite 的 3D 星球解謎遊戲：讀線索、在星球上找出藏起來的物品，依時間給 1～3 星。部署在 Vercel。

## 慣例
- 所有說明、程式註解、文件一律使用**繁體中文**。
- 純 HTML + ES Module，不使用框架；模型全部用 Three.js 基本幾何體組合，沒有外部模型或貼圖檔。
- 各功能分檔撰寫，改動時維持模組化。

## 指令
- `npm install`、`npm run dev`（本地開發）、`npm run build`（輸出到 `dist/`，部署前必須無錯誤）
- 網址加 `?unlock=all` 可解鎖全部關卡測試（網頁版與開發模式有效，iOS App 正式版無效）。
- `npm run build` 前會自動跑 `scripts/subset-fonts.mjs`（prebuild），依程式中用到的字重新縮減字型到 `public/fonts/`。
- `npm run ios`：build 後同步到 `ios/`；`npm run ios:open` 用 Xcode 開啟（需要 Mac）。

## iOS App（Capacitor 8）
- 目標：上架 App Store，免費加內購——前 8 關免費，買斷解鎖第 9～28 關（第 3 階段實作）。
- `capacitor.config.json`：Bundle ID `com.austin410203.planetlostfound`，`webDir: dist`。
- `ios/`：Xcode 專案（SPM，不用 CocoaPods）。iPhone 鎖直式、iPad 四個方向；隱藏狀態列。`ios/App/App/public` 是同步產物，不進 git。
- 介面貼邊元素一律加上 `--sa-t/--sa-r/--sa-b/--sa-l`（safe-area-inset）避開瀏海與 Home 指示條。
- 不可依賴外部網路資源（字型、CDN），App 必須離線可玩。
- App 切到背景時 `main.js` 會停止渲染迴圈，計時不會繼續跑。

## 架構
- `main.js`：畫面流程（選關 → 委託 → 倒數 → 解謎 → 結算）、Renderer、Bloom、主題燈光、選關輪播（只建立選中星球前後兩顆預覽）。
- `src/levels.js`（第 1～8 關）、`src/levels-extra.js`（第 9～28 關）：關卡資料。每關 4 個地標、3～4 件物品、`spotPool`、`stars: [三星秒數, 二星秒數]`。
- `src/clues.js`：每局隨機把物品分配到地標與藏匿點，並以線索／傳說／八卦模板產生線索；隨機結果與關卡預設劇本相同時沿用手寫線索。
- `src/world.js`：`buildWorld(level, seed)` 依關卡擺放地標、藏匿點、裝飾（InstancedMesh）。
- `src/planet.js`：依主題生成地形、海面、大氣層；`getSurfaceRadius()`／`getBiome()` 以目前主題計算。
- `src/props.js`、`src/props-extra.js`：藏匿點（`SPOTS`）、地標（`LANDMARKS`）、裝飾（`DECOR`）模型庫。
- `src/game.js`：計時、搜尋、提示、線索手冊、評星。翻錯 +3 秒、提示 +15 秒。
- `src/progress.js`：進度存在 Capacitor Preferences（iOS 為 UserDefaults，網頁為 localStorage），啟動時需先 `await loadProgress()`；舊版 localStorage 進度會自動搬移。

## 關卡設計規則
- 同一個地標旁的藏匿點種類不可重複，確保每條線索只有一個正確答案。
- 新增關卡時：在 levels 檔加資料；新模型加到 props 檔；線索必須同時提到地標名稱與藏匿點種類。
- 改完關卡或隨機化邏輯，請用多個 seed 呼叫 `buildWorld` 驗證：每件物品都有放到、位於對應地標附近、地標不在海裡。
