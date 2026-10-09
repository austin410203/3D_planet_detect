# 小星球探險 Tiny Planet Explorer

以 Three.js + Vite 打造的互動式 low-poly 3D 星球探索遊戲。拖曳旋轉星球、找出 16 個藏在草原、沙漠、雪地與海洋裡的互動物件。

## 功能一覽

| 項目 | 實作方式 |
|------|----------|
| 星球地形 | `SphereGeometry` 頂點位移 + 逐面上色（草地／沙漠／雪地／海洋／沙灘），low-poly 平面著色 |
| 海洋 | 半透明海面球殼，海床低於海平面 |
| 大氣層 | Fresnel ShaderMaterial（背面渲染 + 加法混合） |
| 視角控制 | OrbitControls：拖曳旋轉、滾輪／雙指縮放（8.5～24）、阻尼慣性、閒置 2.5 秒後自轉 |
| 互動物件 | 16 個幾何體組合模型（動物 4、建築 4、植物 4、道具 4），法線對齊球面 |
| 動畫 | idle 浮動、hover 放大 1.25 倍、點擊跳躍／旋轉／搖擺，另有專屬動畫（風車加速、寶箱開蓋、信箱舉旗、石碑發光、魚躍出水面…） |
| 標籤 | `CSS2DRenderer`，hover 時淡入；觸控點擊時短暫顯示 |
| 粒子 | 閃爍星空（自訂 shader）、點擊彩色粒子爆發（物件池重複使用） |
| 後處理 | `EffectComposer` + `UnrealBloomPass` + `OutputPass` |
| 裝飾 | `InstancedMesh` 散布約 100 棵樹、松樹、岩石、小仙人掌（少量 draw call） |
| 效能 | 行動裝置降低像素比／陰影解析度／星星數量；FPS 持續低於目標時自動降解析度 |

## 專案結構

```
planet-explorer/
├── index.html          # 頁面骨架與 UI 元素
├── main.js             # 進入點：場景、燈光、後處理、主迴圈
├── style.css           # UI 樣式（含 RWD）
├── src/
│   ├── planet.js       # 星球地形、海面、大氣層、球面座標工具
│   ├── objects.js      # 互動物件模型、貼附球面、動畫、裝飾與雲朵
│   ├── controls.js     # OrbitControls 與閒置自轉
│   ├── interactions.js # Raycaster hover / click（區分拖曳）
│   ├── particles.js    # 星空與粒子爆發
│   └── ui.js           # CSS2D 標籤、卡片彈窗、探索進度
├── assets/textures/    # 預留貼圖資料夾（目前地形為程式生成）
├── vite.config.js
├── vercel.json
└── package.json
```

## 本地開發

需要 Node.js 18 以上。

```bash
npm install
npm run dev        # http://localhost:5173（同網段手機可用區網 IP 測試）
npm run build      # 輸出至 dist/
npm run preview    # 預覽 build 結果
```

## 部署到 Vercel

**方法 A：GitHub 連動（推薦）**
1. 將專案推到 GitHub（`node_modules`、`dist` 已在 `.gitignore`）
2. 到 Vercel →「Add New… → Project」→ 匯入該 repo
3. Vercel 會讀取 `vercel.json`（Framework: Vite、Build: `npm run build`、Output: `dist`），直接按 Deploy
4. 之後每次 push 到 main 自動重新部署

**方法 B：Vercel CLI**
```bash
npm i -g vercel
vercel          # 第一次會引導連結專案，產生預覽網址
vercel --prod   # 部署到正式網址
```

## 自訂與擴充

- **新增物件**：在 `src/objects.js` 寫一個 `buildXxx()` 函式，並於 `OBJECT_DEFS` 加一筆（`lat`／`lon` 決定位置，`anim` 選 `jump`／`spin`／`wiggle`）。如需專屬動畫，在 `SPECIAL` 加上 `update`／`click`。
- **調整地形**：`src/planet.js` 的 `BIOME_CENTERS` 決定各生態區的中心位置，`PALETTE` 決定配色，`getSurfaceRadius()` 決定起伏高度。
- **換成 GLTF 模型**：用 `GLTFLoader` 載入後，把模型放進對應物件的 `pivot` 即可沿用所有動畫與互動。
- **Bloom 強度**：`main.js` 中 `UnrealBloomPass` 的強度／半徑／閾值。
