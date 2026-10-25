/**
 * subset-fonts.mjs — 產生打包在 App 內的字型（不依賴 Google Fonts，離線也能顯示）
 * --------------------------------------------------
 * - 繁中：掃描 index.html、main.js、style.css、src/**\/*.js、public/*.html，收集實際用到的字
 * - 日文、韓文：掃描 src/locales/ 的介面文字、線索模板與 levels-ja／levels-ko
 * - 縮減成只含這些字的 woff2：Noto Sans TC／JP／KR（500/700/900）、Baloo 2（600/800，英數）
 * - 輸出到 public/fonts/，並產生 public/fonts/fonts.css（瀏覽器只會下載畫面用到的字型）
 * 每次 npm run build 前會自動執行（prebuild），新增文字後字型會跟著更新。
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'public', 'fonts');
const pkg = (name) => join(root, 'node_modules', '@expo-google-fonts', name);
const noto = (lang, Lang) => [
  [500, '500Medium'], [700, '700Bold'], [900, '900Black'],
].map(([weight, dir]) => ({
  family: `Noto Sans ${Lang}`, weight, set: lang,
  src: join(pkg(`noto-sans-${lang}`), dir, `NotoSans${Lang}_${dir}.ttf`),
  file: `noto-sans-${lang}-${weight}.woff2`,
}));

const FONTS = [
  ...noto('tc', 'TC'),
  ...noto('jp', 'JP'),
  ...noto('kr', 'KR'),
  { family: 'Baloo 2', weight: 600, src: join(pkg('baloo-2'), '600SemiBold', 'Baloo2_600SemiBold.ttf'), file: 'baloo-2-600.woff2', set: 'latin' },
  { family: 'Baloo 2', weight: 800, src: join(pkg('baloo-2'), '800ExtraBold', 'Baloo2_800ExtraBold.ttf'), file: 'baloo-2-800.woff2', set: 'latin' },
];

/* ---------- 收集用到的字 ---------- */
const walk = (dir) => readdirSync(join(root, dir)).flatMap((f) => {
  const p = join(dir, f);
  return statSync(join(root, p)).isDirectory() ? walk(p) : [p];
});
const charsOf = (files, extra = '') => {
  const set = new Set(extra);
  for (let c = 0x20; c <= 0x7e; c++) set.add(String.fromCharCode(c)); // 英數與半形符號
  for (const f of files) for (const c of readFileSync(join(root, f), 'utf8')) if (c.codePointAt(0) >= 0x80) set.add(c);
  return set;
};
const PUNCT = '，。、！？：；「」『』（）《》〈〉…—～・＋－×％〜';
const L = 'src/locales/';
const SETS = {
  tc: charsOf([
    'index.html', 'main.js', 'style.css',
    ...walk('src').filter((f) => f.endsWith('.js') && !/levels-(en|ja|ko)\.js$/.test(f)),
    ...readdirSync(join(root, 'public')).filter((f) => f.endsWith('.html')).map((f) => join('public', f)), // 隱私權政策、支援頁
  ], PUNCT),
  jp: charsOf([`${L}ui.js`, `${L}clue-text.js`, `${L}levels-ja.js`], PUNCT),
  kr: charsOf([`${L}ui.js`, `${L}clue-text.js`, `${L}levels-ko.js`], PUNCT),
};
// 日文字型不需要韓文、韓文字型不需要假名，去掉可省不少空間
const isHangul = (c) => /[ᄀ-ᇿ㄰-㆏가-힯]/.test(c);
const isKana = (c) => /[぀-ヿ]/.test(c);
const textOf = {
  tc: [...SETS.tc].join(''),
  jp: [...SETS.jp].filter((c) => !isHangul(c)).join(''),
  kr: [...SETS.kr].filter((c) => !isKana(c)).join(''),
  latin: [...SETS.tc].filter((c) => c.codePointAt(0) < 0x2000).join(''),
};

/* ---------- 縮減並輸出 ---------- */
mkdirSync(OUT, { recursive: true });
let css = '/* 由 scripts/subset-fonts.mjs 自動產生，請勿手動修改 */\n';
for (const f of FONTS) {
  const out = await subsetFont(readFileSync(f.src), textOf[f.set], { targetFormat: 'woff2' });
  writeFileSync(join(OUT, f.file), out);
  css += `@font-face { font-family: "${f.family}"; font-weight: ${f.weight}; font-style: normal; font-display: swap; src: url("./${f.file}") format("woff2"); }\n`;
  console.log(`  ${f.file.padEnd(24)} ${(out.length / 1024).toFixed(0).padStart(5)} KB`);
}
writeFileSync(join(OUT, 'fonts.css'), css);
console.log(`字型已更新：繁中 ${textOf.tc.length}、日文 ${textOf.jp.length}、韓文 ${textOf.kr.length} 個字元`);
