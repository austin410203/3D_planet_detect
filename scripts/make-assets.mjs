/**
 * make-assets.mjs — 產生 App 圖示與啟動畫面（iOS + Android）
 * --------------------------------------------------
 * 圖示畫面用 SVG 描述（黃底、粗描邊、硬陰影，與遊戲介面同風格）：
 *   一顆有紅頂小屋與樹的小星球，前面一支放大鏡，鏡片裡照出一封弄丟的信。
 * 以 resvg 輸出：
 *   - iOS：AppIcon 1024（不透明）、Splash 2732×2732 ×3
 *   - Android：各密度 ic_launcher / ic_launcher_round / 自適應圖示前景、直式與橫式啟動圖
 *   - design/：預覽用的圖示與啟動畫面
 * 用法：npm run assets
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FONT = join(root, 'node_modules', '@expo-google-fonts', 'noto-sans-tc', '900Black', 'NotoSansTC_900Black.ttf');

const INK = '#1d1b3a';
const YELLOW = '#ffd23a';
const NIGHT = '#070b1a';

/* ---------- 圖示主體（1024 座標系，不含背景） ---------- */
function sparkle(x, y, s, fill = '#fff') {
  const p = `M ${x} ${y - s} Q ${x} ${y} ${x + s} ${y} Q ${x} ${y} ${x} ${y + s} Q ${x} ${y} ${x - s} ${y} Q ${x} ${y} ${x} ${y - s} Z`;
  return `<path d="${p}" fill="${fill}" stroke="${INK}" stroke-width="${Math.max(6, s * 0.22)}" stroke-linejoin="round"/>`;
}

const ART = `
  <defs>
    <radialGradient id="sea" cx="38%" cy="32%" r="75%">
      <stop offset="0" stop-color="#7fe6f0"/><stop offset="1" stop-color="#2aa9c4"/>
    </radialGradient>
    <clipPath id="planetClip"><circle cx="430" cy="440" r="250"/></clipPath>
    <clipPath id="lensClip"><circle cx="655" cy="650" r="158"/></clipPath>
  </defs>

  <!-- 星球：硬陰影 → 海 → 陸地 → 冰帽 → 暗面 → 描邊 -->
  <circle cx="452" cy="466" r="250" fill="${INK}"/>
  <circle cx="430" cy="440" r="250" fill="url(#sea)"/>
  <g clip-path="url(#planetClip)">
    <path d="M 170 380 Q 230 300 330 320 Q 420 250 520 300 Q 600 330 640 420 Q 560 470 470 450 Q 400 520 300 500 Q 220 480 170 380 Z" fill="#8fd14f"/>
    <path d="M 300 330 Q 380 290 450 320 L 420 380 Q 350 400 300 330 Z" fill="#6dbb3c"/>
    <path d="M 420 600 Q 500 560 590 590 Q 640 640 600 700 Q 500 720 430 680 Q 390 640 420 600 Z" fill="#8fd14f"/>
    <path d="M 210 560 Q 260 540 300 580 Q 280 630 230 630 Q 190 600 210 560 Z" fill="#f2c76e"/>
    <ellipse cx="430" cy="196" rx="190" ry="60" fill="#f4f8ff"/>
    <path d="M 680 300 A 250 250 0 0 1 430 690 A 300 300 0 0 0 680 300 Z" fill="${INK}" opacity="0.18"/>
  </g>
  <circle cx="430" cy="440" r="250" fill="none" stroke="${INK}" stroke-width="22"/>
  <!-- 星球上的亮點 -->
  <ellipse cx="330" cy="300" rx="46" ry="22" fill="#fff" opacity="0.55" transform="rotate(-30 330 300)"/>

  <!-- 紅頂小屋與樹（站在星球頂端附近） -->
  <g transform="rotate(-24 430 440)">
    <rect x="398" y="152" width="64" height="52" fill="#fff8e7" stroke="${INK}" stroke-width="12" stroke-linejoin="round"/>
    <path d="M 384 158 L 430 112 L 476 158 Z" fill="#ff5a4e" stroke="${INK}" stroke-width="12" stroke-linejoin="round"/>
    <rect x="422" y="174" width="18" height="30" fill="${INK}"/>
  </g>
  <g transform="rotate(26 430 440)">
    <rect x="422" y="150" width="16" height="44" fill="#8a5a3c" stroke="${INK}" stroke-width="10"/>
    <circle cx="430" cy="138" r="34" fill="#4caf50" stroke="${INK}" stroke-width="12"/>
  </g>

  <!-- 放大鏡：硬陰影 → 握把 → 鏡框 → 鏡片內容 → 反光 -->
  <g transform="translate(16 20)" fill="${INK}">
    <rect x="752" y="770" width="190" height="78" rx="34" transform="rotate(45 752 770)"/>
    <circle cx="655" cy="650" r="186"/>
  </g>
  <rect x="752" y="770" width="190" height="78" rx="34" transform="rotate(45 752 770) translate(0 -39)" fill="#ff8a3c" stroke="${INK}" stroke-width="22" stroke-linejoin="round"/>
  <circle cx="655" cy="650" r="172" fill="${INK}"/>
  <circle cx="655" cy="650" r="158" fill="#eafcff"/>
  <g clip-path="url(#lensClip)">
    <circle cx="430" cy="440" r="330" fill="#c9f1f6"/>
    <g transform="rotate(-10 655 655)">
      <rect x="560" y="590" width="190" height="130" rx="14" fill="#fff" stroke="${INK}" stroke-width="13" stroke-linejoin="round"/>
      <path d="M 562 596 L 655 662 L 748 596" fill="none" stroke="${INK}" stroke-width="13" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="655" cy="664" r="20" fill="#ff6fa8" stroke="${INK}" stroke-width="9"/>
    </g>
    <path d="M 540 560 A 150 150 0 0 1 640 506" fill="none" stroke="#fff" stroke-width="26" stroke-linecap="round" opacity="0.9"/>
  </g>
  <circle cx="655" cy="650" r="165" fill="none" stroke="${YELLOW}" stroke-width="14"/>
  <circle cx="655" cy="650" r="179" fill="none" stroke="${INK}" stroke-width="16"/>

  ${sparkle(850, 230, 58)}
  ${sparkle(170, 830, 40, YELLOW)}
  ${sparkle(905, 470, 26)}
  ${sparkle(130, 170, 30)}
`;

/** 完整圖示（不透明背景）：bg 'yellow' 給 App Store／Android，'none' 給自適應前景 */
function iconSvg({ bg = 'yellow', scale = 1, round = false } = {}) {
  const back = bg === 'yellow' ? `
    <defs><radialGradient id="bg" cx="42%" cy="38%" r="80%">
      <stop offset="0" stop-color="#ffe783"/><stop offset="1" stop-color="#ffc21a"/>
    </radialGradient>${round ? '<clipPath id="r"><circle cx="512" cy="512" r="512"/></clipPath>' : ''}</defs>
    <rect width="1024" height="1024" fill="url(#bg)" ${round ? 'clip-path="url(#r)"' : ''}/>` : '';
  const t = scale === 1 ? '' : `transform="translate(${512 * (1 - scale)} ${512 * (1 - scale)}) scale(${scale})"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${back}<g ${t} ${round ? 'clip-path="url(#r)"' : ''}>${ART}</g></svg>`;
}

/** 啟動畫面：夜空背景 + 置中圖示主體 + 遊戲名稱 */
function splashSvg(w, h, { title = true } = {}) {
  const s = Math.min(w, h) * (title ? 0.42 : 0.5) / 1024;
  const cx = w / 2, cy = h / 2 - (title ? Math.min(w, h) * 0.06 : 0);
  let stars = '';
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < Math.round((w * h) / 60000); i++) {
    stars += `<circle cx="${(rnd() * w).toFixed(0)}" cy="${(rnd() * h).toFixed(0)}" r="${(0.8 + rnd() * 2.2) * Math.min(w, h) / 1000}" fill="#fff" opacity="${(0.3 + rnd() * 0.6).toFixed(2)}"/>`;
  }
  const fs = Math.min(w, h) * 0.055;
  const text = title ? `<text x="${cx}" y="${cy + 560 * s + fs * 1.2}" text-anchor="middle" font-family="Noto Sans TC" font-weight="900" font-size="${fs}" fill="${YELLOW}" letter-spacing="${fs * 0.08}">星球失物招領所</text>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="${NIGHT}"/>${stars}
    <g transform="translate(${cx - 512 * s} ${cy - 512 * s}) scale(${s})">${ART}</g>${text}</svg>`;
}

function render(svg, width, out) {
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { fontFiles: [FONT], loadSystemFonts: false, defaultFontFamily: 'Noto Sans TC' },
  }).render().asPng();
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, png);
}

/* ---------- iOS ---------- */
const IOS = join(root, 'ios', 'App', 'App', 'Assets.xcassets');
render(iconSvg(), 1024, join(IOS, 'AppIcon.appiconset', 'AppIcon-512@2x.png'));
const splash = splashSvg(2732, 2732);
for (const f of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) render(splash, 2732, join(IOS, 'Splash.imageset', f));

/* ---------- Android ---------- */
const RES = join(root, 'android', 'app', 'src', 'main', 'res');
const DENS = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [d, k] of Object.entries(DENS)) {
  render(iconSvg(), 48 * k, join(RES, `mipmap-${d}`, 'ic_launcher.png'));
  render(iconSvg({ round: true }), 48 * k, join(RES, `mipmap-${d}`, 'ic_launcher_round.png'));
  // 自適應圖示：108dp 畫布中只有中間 66% 一定看得到，主體縮到 62%
  render(iconSvg({ bg: 'none', scale: 0.62 }), 108 * k, join(RES, `mipmap-${d}`, 'ic_launcher_foreground.png'));
}
const SPLASH_SIZES = {
  drawable: [480, 320],
  'drawable-port-mdpi': [320, 480], 'drawable-port-hdpi': [480, 800], 'drawable-port-xhdpi': [720, 1280],
  'drawable-port-xxhdpi': [960, 1600], 'drawable-port-xxxhdpi': [1280, 1920],
  'drawable-land-mdpi': [480, 320], 'drawable-land-hdpi': [800, 480], 'drawable-land-xhdpi': [1280, 720],
  'drawable-land-xxhdpi': [1600, 960], 'drawable-land-xxxhdpi': [1920, 1280],
};
for (const [dir, [w, h]] of Object.entries(SPLASH_SIZES)) render(splashSvg(w, h), w, join(RES, dir, 'splash.png'));
writeFileSync(join(RES, 'values', 'ic_launcher_background.xml'),
  `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#FFD23A</color>\n</resources>\n`);

/* ---------- 網頁（分頁圖示、加入主畫面、PWA manifest） ---------- */
const WEB = join(root, 'public', 'icons');
render(iconSvg(), 32, join(WEB, 'favicon-32.png'));
render(iconSvg(), 180, join(WEB, 'apple-touch-icon.png'));   // iPhone「加入主畫面」
render(iconSvg(), 192, join(WEB, 'icon-192.png'));
render(iconSvg(), 512, join(WEB, 'icon-512.png'));
render(iconSvg({ bg: 'yellow', scale: 0.8 }), 512, join(WEB, 'icon-maskable-512.png')); // Android 會裁成圓形，主體縮小
writeFileSync(join(WEB, 'favicon.svg'), iconSvg());
writeFileSync(join(root, 'public', 'manifest.webmanifest'), JSON.stringify({
  name: '星球失物招領所',
  short_name: '星球失物招領所',
  description: '讀線索、翻星球，找回所有失物的 3D 解謎遊戲',
  lang: 'zh-Hant',
  start_url: '/',
  display: 'fullscreen',
  orientation: 'portrait',
  background_color: NIGHT,
  theme_color: NIGHT,
  icons: [
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}, null, 2) + '\n');

/* ---------- 預覽 ---------- */
const DESIGN = join(root, 'design');
render(iconSvg(), 1024, join(DESIGN, 'app-icon-1024.png'));
render(splashSvg(1290, 2796), 645, join(DESIGN, 'splash-iphone-preview.png'));
writeFileSync(join(DESIGN, 'app-icon.svg'), iconSvg());
console.log('圖示與啟動畫面已更新');
