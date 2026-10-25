/**
 * demo.js — 商店截圖用的自動展示模式
 * --------------------------------------------------
 * 只有 VITE_SCREENSHOT=1 建置時才會打包（main.js 動態載入），正式版不包含。
 * 依序展示：選關 → 委託 → 遊戲中 → 結算 → 每日挑戰，每個畫面輸出 `SHOT:名稱` 到 console，
 * CI（.github/workflows/ios.yml）看到標記就用模擬器截圖。
 */
const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOLD = 7000; // 每個畫面停留時間：iPad 模擬器的紀錄輸出較慢，CI 看到標記可能晚好幾秒

async function shot(name) {
  console.log(`SHOT:${name}`);
  await sleep(HOLD);
}

/** 模擬點擊某個藏匿點：相機轉過去、投影到螢幕座標、送出觸控事件 */
async function tapSpot(spot, dist = 11) {
  const { world, camera, controls } = window.__dbg;
  camera.position.copy(spot.root.position).normalize().multiplyScalar(dist);
  controls.update();
  camera.updateMatrixWorld();
  world.group.updateMatrixWorld(true);
  await sleep(300);
  const p = spot.root.position.clone();
  world.group.localToWorld(p);
  p.project(camera);
  const canvas = document.querySelector('#app canvas');
  const o = { clientX: ((p.x + 1) / 2) * innerWidth, clientY: ((1 - p.y) / 2) * innerHeight, pointerType: 'touch', bubbles: true, buttons: 0 };
  controls.enabled = false; // 避免 OrbitControls 處理假的觸控事件
  canvas.dispatchEvent(new PointerEvent('pointerdown', o));
  canvas.dispatchEvent(new PointerEvent('pointerup', o));
  controls.enabled = true;
  await sleep(300);
}

export async function runDemo({ LEVELS, choose, startLevel, progress }) {
  await sleep(3000);
  // 假的進度：前 8 關有星星，畫面比較熱鬧
  [3, 3, 2, 3, 3, 2, 3, 1].forEach((s, i) => progress.save(LEVELS[i].id, s, 40 + i * 9));

  // 1. 選關（糖果星）
  choose(3);
  await sleep(2500);
  await shot('select');

  // 2. 委託（熔岩星）
  startLevel(1);
  await sleep(1500);
  await shot('intro');

  // 3. 遊戲中：打開線索手冊、找到一件、使用提示
  $('introGo').click();
  await sleep(3200);
  if ($('journal').classList.contains('closed')) $('journalTab').click();
  const targets = window.__dbg.world.spots.filter((s) => s.content?.target);
  await tapSpot(targets[0]);
  // 相機拉遠，畫面看得到整顆星球與地標名稱
  const { camera, controls } = window.__dbg;
  camera.position.setLength(17);
  controls.update();
  await sleep(1500);
  $('hintBtn').click();
  await sleep(500);
  await shot('play');

  // 4. 結算：找齊剩下的物品
  for (const s of targets.slice(1)) await tapSpot(s);
  await sleep(3500);
  await shot('result');

  // 5. 每日挑戰
  $('menuBtn').click();
  await sleep(1500);
  $('dailyBtn').click();
  await sleep(800);
  await shot('daily');

  console.log('SHOT:done');
}
