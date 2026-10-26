/**
 * local-shots.mjs — 在本機用無頭 Chrome 拍商店截圖（不靠 GitHub 的模擬器）
 * --------------------------------------------------
 * App 內的畫面就是這個網頁，所以用相同的截圖展示模式（src/demo.js）與相同解析度直接拍。
 * 用法：node scripts/local-shots.mjs <裝置 iphone69|ipad13> <語言 zh|en|ja|ko>
 *   會自動建置截圖版（VITE_SCREENSHOT=1 VITE_SHOT_LANG=<語言>）、開本機伺服器、拍 5 個畫面，
 *   輸出到 store-shots/raw/<裝置>-<語言>-<畫面>.png（再用 npm run store-shots 合成）。
 * 流程：demo.js 每個畫面準備好會印 SHOT:<名稱>，這裡截圖後呼叫 window.__shotNext() 換下一個畫面。
 */
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [dev = 'ipad13', lang = 'zh'] = process.argv.slice(2);
const DEVICES = {
  ipad13: { width: 1032, height: 1376, dpr: 2, safe: { top: 0, bottom: 20 } },  // iPad Pro 13 吋 → 2064×2752
  iphone69: { width: 440, height: 956, dpr: 3, safe: { top: 62, bottom: 34 } }, // iPhone 6.9 吋 → 1320×2868（動態島與 Home 指示條）
};
const vp = DEVICES[dev];
if (!vp) throw new Error(`未知裝置 ${dev}`);
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const node = process.execPath;
const vite = join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const outDir = `dist-shots-${lang}`;
const PORT = 4300 + Object.keys(DEVICES).indexOf(dev) * 10 + ['zh', 'en', 'ja', 'ko'].indexOf(lang);
const DBG = PORT + 1000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 1. 建置截圖版
execFileSync(node, [vite, 'build', '--outDir', outDir, '--logLevel', 'warn'], {
  cwd: root, stdio: 'inherit', env: { ...process.env, VITE_SCREENSHOT: '1', VITE_SHOT_LANG: lang },
});
// 2. 本機伺服器與無頭 Chrome
const server = spawn(node, [vite, 'preview', '--outDir', outDir, '--port', String(PORT), '--strictPort'], { cwd: root, stdio: 'ignore' });
const profile = join(tmpdir(), `planet-shots-${dev}-${lang}`);
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${DBG}`, `--user-data-dir=${profile}`,
  '--hide-scrollbars', '--mute-audio', '--no-first-run', '--use-angle=d3d11', '--enable-gpu-rasterization',
  'about:blank',
], { stdio: 'ignore' });
const cleanup = () => { try { chrome.kill(); } catch {} try { server.kill(); } catch {} };
process.on('exit', cleanup);

let target = null;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(500);
  try { target = (await (await fetch(`http://127.0.0.1:${DBG}/json/list`)).json()).find((t) => t.type === 'page'); } catch {}
}
if (!target) throw new Error('Chrome 沒有啟動');

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0;
const pending = new Map();
const shots = [];
let wake = null;
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
  if (m.method === 'Runtime.consoleAPICalled') {
    const text = m.params.args.map((a) => a.value).join(' ');
    if (text.startsWith('SHOT:')) { shots.push(text.slice(5)); wake?.(); }
  }
  if (m.method === 'Runtime.exceptionThrown') console.error('頁面錯誤：', m.params.exceptionDetails.text, m.params.exceptionDetails.exception?.description?.slice(0, 200));
});
const send = (method, params = {}) => new Promise((resolve) => { const id = ++seq; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })); });

await send('Runtime.enable');
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: vp.dpr, mobile: true });
// 模擬瀏海／動態島的安全區域（env(safe-area-inset-*)），Chrome 太舊不支援時略過
const safe = await send('Emulation.setSafeAreaInsetsOverride', { insets: { top: vp.safe.top, bottom: vp.safe.bottom, left: 0, right: 0 } });
if (safe.error) console.warn('無法模擬安全區域：', safe.error.message);
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });

// 3. 依序截圖
mkdirSync(join(root, 'store-shots', 'raw'), { recursive: true });
const SCREENS = ['select', 'intro', 'play', 'result', 'daily'];
let taken = 0;
const deadline = Date.now() + 5 * 60e3;
while (taken < SCREENS.length && Date.now() < deadline) {
  if (shots.length <= taken) { await new Promise((r) => { wake = r; setTimeout(r, 1000); }); continue; }
  const name = shots[taken];
  if (name === 'done') break;
  await sleep(name === 'select' ? 2500 : 1500); // 等動畫與光柱停穩（選關星球的角度由 demo.js 固定）
  const { result } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  const file = join(root, 'store-shots', 'raw', `${dev}-${lang}-${name}.png`);
  writeFileSync(file, Buffer.from(result.data, 'base64'));
  console.log(`✔ ${dev}-${lang}-${name}`);
  taken++;
  await send('Runtime.evaluate', { expression: 'window.__shotNext && window.__shotNext()' });
}
ws.close();
cleanup();
try { rmSync(profile, { recursive: true, force: true }); } catch {}
rmSync(join(root, outDir), { recursive: true, force: true });
if (taken < SCREENS.length) { console.error(`只拍到 ${taken}／${SCREENS.length} 張`); process.exit(1); }
