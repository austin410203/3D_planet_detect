# 星球失物招領所（3D_planet_detect）

Three.js + Vite 的 3D 星球解謎遊戲：讀線索、在星球上找出藏起來的物品，依時間給 1～3 星。部署在 Vercel。

## 慣例
- 所有說明、程式註解、文件一律使用**繁體中文**。
- 純 HTML + ES Module，不使用框架；模型全部用 Three.js 基本幾何體組合，沒有外部模型或貼圖檔。
- 各功能分檔撰寫，改動時維持模組化。

## 指令
- `npm install`、`npm run dev`（本地開發）、`npm run build`（輸出到 `dist/`，部署前必須無錯誤）
- 網址加 `?unlock=all` 可解鎖全部關卡測試。

## 架構
- `main.js`：畫面流程（選關 → 委託 → 倒數 → 解謎 → 結算）、Renderer、Bloom、主題燈光、選關輪播（只建立選中星球前後兩顆預覽）。
- `src/levels.js`（第 1～8 關）、`src/levels-extra.js`（第 9～28 關）：關卡資料。每關 4 個地標、3～4 件物品、`spotPool`、`stars: [三星秒數, 二星秒數]`。
- `src/clues.js`：每局隨機把物品分配到地標與藏匿點，並以線索／傳說／八卦模板產生線索；隨機結果與關卡預設劇本相同時沿用手寫線索。
- `src/world.js`：`buildWorld(level, seed)` 依關卡擺放地標、藏匿點、裝飾（InstancedMesh）。
- `src/planet.js`：依主題生成地形、海面、大氣層；`getSurfaceRadius()`／`getBiome()` 以目前主題計算。
- `src/props.js`、`src/props-extra.js`：藏匿點（`SPOTS`）、地標（`LANDMARKS`）、裝飾（`DECOR`）模型庫。
- `src/game.js`：計時、搜尋、提示、線索手冊、評星。翻錯 +3 秒、提示 +15 秒。
- `src/progress.js`：進度存在 localStorage。

## 關卡設計規則
- 同一個地標旁的藏匿點種類不可重複，確保每條線索只有一個正確答案。
- 新增關卡時：在 levels 檔加資料；新模型加到 props 檔；線索必須同時提到地標名稱與藏匿點種類。
- 改完關卡或隨機化邏輯，請用多個 seed 呼叫 `buildWorld` 驗證：每件物品都有放到、位於對應地標附近、地標不在海裡。
