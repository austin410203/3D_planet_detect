// vite.config.js — Vite 建置設定
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',                 // Vercel 部署於網域根目錄
  build: {
    outDir: 'dist',          // 輸出至 /dist（與 vercel.json 一致）
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000, // three.js 體積較大，放寬警告門檻
    rollupOptions: {
      output: {
        // 將 three.js 拆成獨立 chunk，方便瀏覽器快取
        manualChunks(id) { if (id.includes('node_modules/three')) return 'three'; },
      },
    },
  },
  server: { host: true, port: 5173 }, // host: true 方便用手機連區網測試
});
