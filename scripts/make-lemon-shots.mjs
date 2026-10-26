/**
 * make-lemon-shots.mjs — Lemon Squeezy 商品圖（1600×1200，3 張）
 * --------------------------------------------------
 * 輸入：store-shots/raw/ipad13-zh-<畫面>.png（iOS CI 的 [shots] 截圖）
 * 輸出：store-shots/lemon/NN-<名稱>.png
 * 版面與商店截圖同風格：黃色背景、左邊中英標題、右邊加圓角描邊與硬陰影的 iPad 畫面
 * 用法：node scripts/make-lemon-shots.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(root, 'store-shots', 'raw');
const OUT = join(root, 'store-shots', 'lemon');
const FONT = join(root, 'node_modules', '@expo-google-fonts', 'noto-sans-tc', '900Black', 'NotoSansTC_900Black.ttf');
const INK = '#1d1b3a';
const W = 1600, H = 1200;

const SHOTS = [
  { file: 'select', out: '01-planets', zh: ['28 顆主題星球', '前 4 顆免費玩'], en: ['28 themed planets —', 'the first 4 are free'] },
  { file: 'play', out: '02-play', zh: ['讀懂線索', '翻遍星球找失物'], en: ['Read the clues,', 'search the planet'] },
  { file: 'result', out: '03-result', zh: ['越快找齊', '星星越多'], en: ['Find everything fast', 'for 3 stars'] },
];

const pngSize = (buf) => [buf.readUInt32BE(16), buf.readUInt32BE(20)];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function compose(rawBuf, s) {
  const [rw, rh] = pngSize(rawBuf);
  const h = H - 150, w = h * (rw / rh);   // 右邊的 iPad 畫面
  const x = W - w - 90, y = 70;
  const r = w * 0.05, stroke = 9;
  const tx = 90;                           // 左邊文字區
  const data = `data:image/png;base64,${rawBuf.toString('base64')}`;
  const lines = [
    ...s.zh.map((t, i) => `<text x="${tx}" y="${440 + i * 100}" font-size="78" letter-spacing="3" fill="${INK}">${esc(t)}</text>`),
    ...s.en.map((t, i) => `<text x="${tx}" y="${700 + i * 58}" font-size="42" fill="${INK}" opacity=".78">${esc(t)}</text>`),
  ].join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <radialGradient id="bg" cx="30%" cy="20%" r="100%"><stop offset="0" stop-color="#ffe783"/><stop offset="1" stop-color="#ffc21a"/></radialGradient>
      <clipPath id="clip"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g font-family="Noto Sans TC" font-weight="900">
      <rect x="${tx}" y="180" width="430" height="92" rx="22" fill="${INK}"/>
      <text x="${tx + 32}" y="243" font-size="52" letter-spacing="3" fill="#ffd23a">星球失物招領所</text>
      <text x="${tx}" y="330" font-size="34" fill="${INK}" opacity=".7">Lost &amp; Found in Space</text>
      ${lines}
      <text x="${tx}" y="${H - 130}" font-size="34" fill="${INK}">planet.emptyoffice.app</text>
    </g>
    <rect x="${x + 14}" y="${y + 20}" width="${w}" height="${h}" rx="${r}" fill="${INK}"/>
    <image x="${x}" y="${y}" width="${w}" height="${h}" xlink:href="${data}" clip-path="url(#clip)" preserveAspectRatio="xMidYMid slice"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${INK}" stroke-width="${stroke}"/>
  </svg>`;
  return new Resvg(svg, {
    fitTo: { mode: 'original' },
    font: { fontFiles: [FONT], loadSystemFonts: false, defaultFontFamily: 'Noto Sans TC' },
  }).render().asPng();
}

mkdirSync(OUT, { recursive: true });
for (const s of SHOTS) {
  writeFileSync(join(OUT, `${s.out}.png`), compose(readFileSync(join(RAW, `ipad13-zh-${s.file}.png`)), s));
}
console.log(`Lemon Squeezy 商品圖已產生 ${SHOTS.length} 張：${OUT}`);
