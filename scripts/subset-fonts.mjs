/**
 * subset-fonts.mjs — 產生打包在 App 內的字型（不依賴 Google Fonts，離線也能顯示）
 * --------------------------------------------------
 * - 掃描 index.html、main.js、style.css、src/*.js、public/*.html，收集實際用到的字
 * - 把 Noto Sans TC（500/700/900）與 Baloo 2（600/800）縮減成只含這些字的 woff2
 * - 輸出到 public/fonts/，並產生 public/fonts/fonts.css
 * 每次 npm run build 前會自動執行（prebuild），新增關卡文字後字型會跟著更新。
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'public', 'fonts');
const pkg = (name) => join(root, 'node_modules', '@expo-google-fonts', name);

const FONTS = [
  { family: 'Noto Sans TC', weight: 500, src: join(pkg('noto-sans-tc'), '500Medium', 'NotoSansTC_500Medium.ttf'), file: 'noto-sans-tc-500.woff2' },
  { family: 'Noto Sans TC', weight: 700, src: join(pkg('noto-sans-tc'), '700Bold', 'NotoSansTC_700Bold.ttf'), file: 'noto-sans-tc-700.woff2' },
  { family: 'Noto Sans TC', weight: 900, src: join(pkg('noto-sans-tc'), '900Black', 'NotoSansTC_900Black.ttf'), file: 'noto-sans-tc-900.woff2' },
  { family: 'Baloo 2', weight: 600, src: join(pkg('baloo-2'), '600SemiBold', 'Baloo2_600SemiBold.ttf'), file: 'baloo-2-600.woff2', latin: true },
  { family: 'Baloo 2', weight: 800, src: join(pkg('baloo-2'), '800ExtraBold', 'Baloo2_800ExtraBold.ttf'), file: 'baloo-2-800.woff2', latin: true },
];

/* ---------- 收集用到的字 ---------- */
const sources = [
  'index.html', 'main.js', 'style.css',
  ...readdirSync(join(root, 'src')).filter((f) => f.endsWith('.js')).map((f) => join('src', f)),
  ...readdirSync(join(root, 'public')).filter((f) => f.endsWith('.html')).map((f) => join('public', f)), // 隱私權政策、支援頁
];
const chars = new Set();
for (let c = 0x20; c <= 0x7e; c++) chars.add(String.fromCharCode(c));       // 英數與半形符號
for (const c of '，。、！？：；「」『』（）《》〈〉…—～・＋－×％') chars.add(c);  // 常用全形標點
for (const f of sources) for (const c of readFileSync(join(root, f), 'utf8')) if (c.codePointAt(0) >= 0x80) chars.add(c);
const text = [...chars].join('');
const latin = [...chars].filter((c) => c.codePointAt(0) < 0x2000).join('');

/* ---------- 縮減並輸出 ---------- */
mkdirSync(OUT, { recursive: true });
let css = '/* 由 scripts/subset-fonts.mjs 自動產生，請勿手動修改 */\n';
for (const f of FONTS) {
  const out = await subsetFont(readFileSync(f.src), f.latin ? latin : text, { targetFormat: 'woff2' });
  writeFileSync(join(OUT, f.file), out);
  css += `@font-face { font-family: "${f.family}"; font-weight: ${f.weight}; font-style: normal; font-display: swap; src: url("./${f.file}") format("woff2"); }\n`;
  console.log(`  ${f.file.padEnd(24)} ${(out.length / 1024).toFixed(0).padStart(5)} KB`);
}
writeFileSync(join(OUT, 'fonts.css'), css);
console.log(`字型已更新：共 ${chars.size} 個字元`);
