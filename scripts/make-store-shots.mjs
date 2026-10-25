/**
 * make-store-shots.mjs — 把模擬器截圖合成 App Store 商店截圖
 * --------------------------------------------------
 * 輸入：store-shots/raw/<裝置>-<語言>-<畫面>.png（iOS CI 的 [shots] 截圖，各語言版本各拍一組，見 .github/workflows/ios.yml）
 * 輸出：store-shots/<裝置>/<語言>/NN-<畫面>.png，尺寸與原始截圖相同（App Store 規定的像素）
 * 標題字型：繁中與英文用 Noto Sans TC、日文 Noto Sans JP、韓文 Noto Sans KR（Black）
 * 版面：黃色背景、上方一行標題、下方是加了圓角描邊與硬陰影的遊戲畫面（與遊戲介面同風格）
 * 用法：npm run store-shots
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(root, 'store-shots', 'raw');
const fontFile = (lang, Lang) => join(root, 'node_modules', '@expo-google-fonts', `noto-sans-${lang}`, '900Black', `NotoSans${Lang}_900Black.ttf`);
const FONTS = [fontFile('tc', 'TC'), fontFile('jp', 'JP'), fontFile('kr', 'KR')];
const FAMILY = { zh: 'Noto Sans TC', en: 'Noto Sans TC', ja: 'Noto Sans JP', ko: 'Noto Sans KR' };
const INK = '#1d1b3a';

const DEVICES = ['iphone69', 'ipad13'];
const SCREENS = ['select', 'intro', 'play', 'result', 'daily'];
const CAPTIONS = {
  zh: {
    select: '28 顆主題星球等你探索',
    intro: '居民又弄丟東西了！',
    play: '讀懂線索，翻遍星球',
    result: '越快找齊，星星越多',
    daily: '每日挑戰，全世界同一張地圖',
  },
  en: {
    select: 'Explore 28 themed planets',
    intro: 'Help the locals find what they lost',
    play: 'Read the clues, search the planet',
    result: 'Find everything fast for 3 stars',
    daily: 'One map for the whole world, every day',
  },
  ja: {
    select: '28のテーマの星を探検しよう',
    intro: '住民がまた落とし物をしちゃった！',
    play: '手がかりを読んで、星じゅうを探そう',
    result: '早く見つけるほど星がふえる',
    daily: 'デイリーチャレンジは世界中で同じマップ',
  },
  ko: {
    select: '28개의 테마 행성을 탐험해요',
    intro: '주민들이 또 물건을 잃어버렸어요!',
    play: '단서를 읽고 행성을 샅샅이 뒤져요',
    result: '빨리 찾을수록 별이 늘어나요',
    daily: '데일리 챌린지, 전 세계가 같은 지도',
  },
};

const pngSize = (buf) => [buf.readUInt32BE(16), buf.readUInt32BE(20)];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function compose(rawBuf, caption, lang) {
  const [W, H] = pngSize(rawBuf);
  const top = H * 0.155;                 // 標題區高度
  const pad = W * 0.06;
  const scale = Math.min((W - pad * 2) / W, (H - top - pad) / H);
  const w = W * scale, h = H * scale;
  const x = (W - w) / 2, y = top;
  const r = W * 0.05;
  const stroke = W * 0.011;
  // 依字數估計寬度，讓標題一行放得下（中文字約 1em 寬，英文約 0.52em）
  const units = [...caption].reduce((n, c) => n + (c.codePointAt(0) > 0x2e80 ? 1 : 0.52), 0);
  const fs = Math.min(W * 0.072, (W * 0.9) / units);
  const data = `data:image/png;base64,${rawBuf.toString('base64')}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <radialGradient id="bg" cx="50%" cy="20%" r="90%"><stop offset="0" stop-color="#ffe783"/><stop offset="1" stop-color="#ffc21a"/></radialGradient>
      <clipPath id="clip"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <text x="${W / 2}" y="${top * 0.62}" text-anchor="middle" font-family="${FAMILY[lang]}" font-weight="900" font-size="${fs}" fill="${INK}" ${lang === 'en' ? '' : `letter-spacing="${fs * 0.04}"`}>${esc(caption)}</text>
    <rect x="${x + stroke * 1.6}" y="${y + stroke * 2.2}" width="${w}" height="${h}" rx="${r}" fill="${INK}"/>
    <image x="${x}" y="${y}" width="${w}" height="${h}" xlink:href="${data}" clip-path="url(#clip)" preserveAspectRatio="xMidYMid slice"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${INK}" stroke-width="${stroke}"/>
  </svg>`;
  return new Resvg(svg, {
    fitTo: { mode: 'original' },
    font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: FAMILY[lang] },
  }).render().asPng();
}

let count = 0;
for (const dev of DEVICES) {
  for (const lang of Object.keys(CAPTIONS)) {
    SCREENS.forEach((screen, i) => {
      const src = join(RAW, `${dev}-${lang}-${screen}.png`);
      if (!existsSync(src)) { console.warn(`找不到 ${src}，略過`); return; }
      const out = join(root, 'store-shots', dev, lang, `${String(i + 1).padStart(2, '0')}-${screen}.png`);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, compose(readFileSync(src), CAPTIONS[lang][screen], lang));
      count++;
    });
  }
}
console.log(`商店截圖已產生 ${count} 張`);
