/**
 * main.js — 程式進入點與畫面流程
 * --------------------------------------------------
 * 流程：選關（星球輪播） → 委託說明 → 3-2-1 倒數 → 解謎 → 結算（1~3 星）
 * 共用：Renderer、Bloom 後處理、星空、燈光（依星球主題變色）、OrbitControls
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

import { LEVELS } from './src/levels.js';
import { createPlanet, getSurfaceRadius, latLonToDir, disposeGroup } from './src/planet.js';
import { LANDMARKS } from './src/props.js';
import { buildWorld, placeOnSurface } from './src/world.js';
import { createGame } from './src/game.js';
import { createStarfield, ParticleBurst } from './src/particles.js';
import { progress, fmtTime, loadProgress } from './src/progress.js';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { settings, loadSettings, setSetting } from './src/settings.js';
import { sfx, playMusic, setAudioPaused } from './src/audio.js';
import { haptic, hasHaptics } from './src/haptics.js';
import { hasGameCenter, signInGameCenter, showLeaderboard, submitTime, submitScore, LEADERBOARD } from './src/gamecenter.js';
import { daily, loadDaily, dailyPick, todayKey } from './src/daily.js';
import { store, hasStore, loadStore, purchaseFull, restorePurchases, onStoreChange } from './src/store.js';

const $ = (id) => document.getElementById(id);
const isMobile = matchMedia('(pointer: coarse)').matches || innerWidth < 768;

/** 解析度倍率：手機最多 1.5 倍，且總像素不超過約 260 萬（iPad 大螢幕才不會發燙） */
function pixelRatio() {
  if (!isMobile) return Math.min(devicePixelRatio, 2);
  return Math.min(devicePixelRatio, 1.5, Math.sqrt(2.6e6 / (innerWidth * innerHeight)));
}

/* =========================================================
 * Renderer / Scene / Camera
 * ======================================================= */
const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: 'high-performance' });
renderer.setPixelRatio(pixelRatio());
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
$('app').appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(innerWidth, innerHeight);
Object.assign(labelRenderer.domElement.style, { position: 'fixed', inset: '0', pointerEvents: 'none' });
$('app').appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#070b1a');
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 500);

/* ---------- 燈光（依主題調整顏色） ---------- */
const ambient = new THREE.AmbientLight('#b8c4ff', 0.35);
const hemi = new THREE.HemisphereLight('#dff3ff', '#3a2f5a', 0.9);
const sun = new THREE.DirectionalLight('#fff1d6', 2.6);
sun.castShadow = true;
sun.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -7.5, right: 7.5, top: 7.5, bottom: -7.5, near: 1, far: 50 });
sun.shadow.normalBias = 0.03;
scene.add(ambient, hemi, sun, sun.target);

const stars = createStarfield(isMobile ? 1500 : 2800);
scene.add(stars);
const particles = new ParticleBurst(scene);

/* ---------- Bloom 後處理 ---------- */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.5, 0.5, 0.85);
composer.addPass(bloom);
if (isMobile) {
  // 手機上 Bloom 用一半解析度計算，光暈看起來差不多，GPU 負擔少很多
  const setBloomSize = bloom.setSize.bind(bloom);
  bloom.setSize = (w, h) => setBloomSize(Math.ceil(w / 2), Math.ceil(h / 2));
  bloom.setSize(innerWidth * renderer.getPixelRatio(), innerHeight * renderer.getPixelRatio());
}
composer.addPass(new OutputPass());

/* ---------- 視角控制（解謎時使用） ---------- */
const controls = new OrbitControls(camera, renderer.domElement);
Object.assign(controls, { enableDamping: true, dampingFactor: 0.08, enablePan: false, minDistance: 7.5, maxDistance: 22, rotateSpeed: 0.6, zoomSpeed: 0.8 });
controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE };
controls.enabled = false;

/* =========================================================
 * 主題燈光（平滑過渡）
 * ======================================================= */
const themeTarget = { bg: new THREE.Color(), amb: new THREE.Color(), sky: new THREE.Color(), ground: new THREE.Color(), sun: 2.6 };
function applyTheme(theme, instant = false) {
  const L = theme.light;
  themeTarget.bg.set(theme.background);
  themeTarget.amb.set(L.ambient);
  themeTarget.sky.set(L.sky);
  themeTarget.ground.set(L.ground);
  themeTarget.sun = L.sun;
  if (instant) lerpTheme(1);
}
function lerpTheme(k) {
  scene.background.lerp(themeTarget.bg, k);
  ambient.color.lerp(themeTarget.amb, k);
  hemi.color.lerp(themeTarget.sky, k);
  hemi.groundColor.lerp(themeTarget.ground, k);
  sun.intensity += (themeTarget.sun - sun.intensity) * k;
}

/* =========================================================
 * 選關：星球輪播
 * ======================================================= */
const SPACING = 18;
const previews = new THREE.Group();
scene.add(previews);
/** 選關預覽只建立「目前選中星球的前後兩顆」，28 顆星球也不會拖慢載入 */
const previewCache = new Map();
function buildPreview(i) {
  const lv = LEVELS[i];
  const { group } = createPlanet(lv.theme, { detail: 0.55 });
  // 預覽也放上地標，讓每顆星球一眼就有特色
  for (const lm of lv.landmarks) {
    const d = latLonToDir(lm.lat, lm.lon);
    const g = new THREE.Group();
    LANDMARKS[lm.model](g);
    placeOnSurface(g, d, getSurfaceRadius(d) - 0.03);
    g.scale.setScalar(1.6);
    group.add(g);
  }
  group.position.x = i * SPACING;
  group.rotation.x = 0.35;
  group.scale.setScalar(0.7);
  group.userData.index = i;
  previews.add(group);
  previewCache.set(i, group);
}
function ensurePreviews(center) {
  for (let i = center - 2; i <= center + 2; i++) if (i >= 0 && i < LEVELS.length && !previewCache.has(i)) buildPreview(i);
  // 離太遠的預覽釋放掉，節省記憶體
  for (const [i, g] of previewCache) {
    if (Math.abs(i - center) > 4) { previews.remove(g); disposeGroup(g); previewCache.delete(i); }
  }
}

let selected = 0;
function renderSelectCard() {
  ensurePreviews(selected);
  const lv = LEVELS[selected];
  const p = progress.get(lv.id);
  const lock = progress.lockReason(LEVELS, selected);
  $('pcNum').textContent = selected + 1;
  $('pcEmoji').textContent = lv.emoji;
  $('pcName').textContent = lv.name;
  $('pcSub').textContent = lv.subtitle;
  $('pcStars').innerHTML = [1, 2, 3].map((n) => `<span class="${p.stars >= n ? '' : 'off'}">⭐</span>`).join('');
  $('pcItems').textContent = `${lv.targets.length} 件`;
  $('pcBest').textContent = p.best !== null ? fmtTime(p.best) : '--';
  $('pcGoal').textContent = `${lv.stars[0]} 秒`;
  $('planetCard').classList.toggle('locked', !!lock);
  $('pcLock').hidden = lock !== 'stars';
  $('pcPaid').hidden = lock !== 'paid';
  $('unlockBtn').textContent = store.price ? `🔓 解鎖完整版 ${store.price}` : '🔓 解鎖完整版';
  $('planetDots').innerHTML = LEVELS.map((_, i) => `<span class="${i === selected ? 'on' : ''}" data-i="${i}"></span>`).join('');
  $('totalStars').textContent = progress.totalStars(LEVELS);
  $('maxStars').textContent = LEVELS.length * 3;
  applyTheme(lv.theme);
}
function choose(i) {
  selected = (i + LEVELS.length) % LEVELS.length;
  renderSelectCard();
}
$('prevPlanet').onclick = () => choose(selected - 1);
$('nextPlanet').onclick = () => choose(selected + 1);
$('planetDots').onclick = (e) => { if (e.target.dataset.i) { sfx.swipe(); choose(Number(e.target.dataset.i)); } };
$('startBtn').onclick = () => startLevel(selected);
addEventListener('keydown', (e) => {
  if (mode !== 'select' || !$('daily').hidden || !$('settings').hidden || !$('store').hidden) return;
  if (e.key === 'ArrowLeft') { sfx.swipe(); choose(selected - 1); }
  if (e.key === 'ArrowRight') { sfx.swipe(); choose(selected + 1); }
  if (e.key === 'Enter' && progress.isUnlocked(LEVELS, selected)) startLevel(selected);
});

/* =========================================================
 * 畫面流程
 * ======================================================= */
let mode = 'select';   // select | intro | play | result
let world = null;
let game = null;
let levelIndex = 0;
let dailyRun = null; // 每日挑戰進行中：{ key（日期）, first（是否為當天第一次） }

/* ---------- 按鈕音效與震動（所有按鈕共用） ---------- */
document.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  if (b.classList.contains('nav')) sfx.swipe(); else sfx.tap();
  haptic.tap();
});

function showSelect() {
  teardown();
  mode = 'select';
  dailyRun = null;
  playMusic('menu');
  $('dailyBtn').classList.toggle('done', !!daily.result());
  $('select').hidden = false;
  $('hud').hidden = true;
  $('intro').hidden = true;
  $('result').hidden = true;
  previews.visible = true;
  controls.enabled = false;
  camera.up.set(0, 1, 0);
  renderSelectCard();
}

function teardown() {
  game?.dispose();
  game = null;
  if (world) { scene.remove(world.group); disposeGroup(world.group); world = null; }
}

/**
 * 開始關卡
 * @param {string|null} dailyKey 每日挑戰的日期；有值時用當天固定的 seed，且不受解鎖限制
 */
function startLevel(i, dailyKey = null) {
  if (!dailyKey && !progress.isUnlocked(LEVELS, i)) return;
  teardown();
  levelIndex = i;
  const lv = LEVELS[i];
  mode = 'intro';
  $('select').hidden = true;
  $('result').hidden = true;
  previews.visible = false;
  applyTheme(lv.theme, true);
  playMusic(lv);

  dailyRun = dailyKey ? { key: dailyKey, first: !daily.result(dailyKey) } : null;
  $('introDaily').hidden = !dailyRun;
  if (dailyRun) $('introDaily').textContent = dailyRun.first ? '📅 每日挑戰・只有這一次會記錄成績' : '📅 每日挑戰・練習模式（不記錄成績）';

  world = buildWorld(lv, dailyKey ? dailyPick(LEVELS, dailyKey).seed : undefined);
  scene.add(world.group);
  game = createGame({
    level: lv, world, camera, domElement: renderer.domElement, particles,
    onFinish: (r) => showResult(r),
  });
  window.__dbg = { world, game, camera, controls }; // 除錯用

  // 相機從第一個地標的方向看過去
  const first = world.landmarks.values().next().value.dir;
  camera.position.copy(first).multiplyScalar(14).add(new THREE.Vector3(0, 3, 0));
  camera.up.set(0, 1, 0);
  controls.target.set(0, 0, 0);
  controls.enabled = true;
  controls.update();

  // 委託說明
  $('introNpc').textContent = lv.npc.emoji;
  $('introNpcName').textContent = lv.npc.name;
  $('introStory').textContent = lv.story;
  $('introItems').innerHTML = lv.targets.map((t) => `<li><b>${t.emoji}</b>${t.name}</li>`).join('');
  $('intro').hidden = false;
  $('hud').hidden = false;
  $('journal').classList.toggle('closed', innerWidth < 700);
}

$('introGo').onclick = () => {
  $('intro').hidden = true;
  countdown(() => { mode = 'play'; game.start(); });
};

/** 3、2、1、出發！ */
function countdown(done) {
  const el = $('countdown');
  el.hidden = false;
  const seq = ['3', '2', '1', '出發！'];
  let i = 0;
  const step = () => {
    if (i >= seq.length) { el.hidden = true; return; }
    el.className = `countdown${i === 3 ? ' go' : ''}`;
    el.innerHTML = `<span>${seq[i]}</span>`;
    if (i < 3) { sfx.tick(); haptic.tap(); } else { sfx.go(); haptic.search(); }
    if (i === 3) done();
    i++;
    setTimeout(step, i === 4 ? 600 : 700);
  };
  step();
}

function showResult({ time, stars }) {
  mode = 'result';
  const lv = LEVELS[levelIndex];
  if (dailyRun) {
    // 每日挑戰：只記錄當天第一次，不影響一般關卡的進度與解鎖
    const recorded = dailyRun.first && daily.record(dailyRun.key, time, stars);
    dailyRun.first = false;
    if (recorded) submitTime(LEADERBOARD.daily, time);
    $('resultBest').textContent = recorded
      ? `📅 今日成績已記錄・🔥 連續 ${daily.streak()} 天`
      : `📅 練習模式・今日成績 ${fmtTime(daily.result(dailyRun.key).time)}`;
  } else {
    const isBest = progress.save(lv.id, stars, time);
    submitTime(LEADERBOARD.best(lv.id), time);
    submitScore(LEADERBOARD.stars, progress.totalStars(LEVELS));
    $('resultBest').textContent = isBest ? '🏆 新紀錄！' : `最佳 ${fmtTime(progress.get(lv.id).best)}`;
  }
  $('resultTime').textContent = fmtTime(time);
  $('resultOutro').textContent = `${lv.npc.emoji} ${lv.outro}`;
  sfx.fanfare();
  const starEls = [...document.querySelectorAll('#resultStars .rs')];
  starEls.forEach((s) => s.classList.remove('on'));
  starEls.slice(0, stars).forEach((s, k) => setTimeout(() => { s.classList.add('on'); sfx.star(k); haptic.star(); }, 700 + k * 350));
  const hasNext = levelIndex + 1 < LEVELS.length;
  $('nextBtn').hidden = !hasNext || !!dailyRun;
  $('resultLbBtn').hidden = !hasGameCenter;
  $('result').hidden = false;
}
$('retryBtn').onclick = () => startLevel(levelIndex, dailyRun?.key);
$('resultLbBtn').onclick = () => showLeaderboard(dailyRun ? LEADERBOARD.daily : LEADERBOARD.best(LEVELS[levelIndex].id));
$('menuBtn').onclick = () => { selected = levelIndex; showSelect(); };
$('nextBtn').onclick = () => {
  selected = levelIndex + 1;
  // 打完第 8 關還沒買完整版：回選關畫面並打開完整版介紹
  if (progress.lockReason(LEVELS, selected) === 'paid') { showSelect(); openStore(); return; }
  startLevel(selected);
};
$('backBtn').onclick = () => { selected = levelIndex; showSelect(); };
$('journalTab').onclick = () => $('journal').classList.toggle('closed');

/* =========================================================
 * 每日挑戰
 * ======================================================= */
$('dailyBtn').onclick = () => {
  const key = todayKey();
  const lv = LEVELS[dailyPick(LEVELS, key).index];
  const r = daily.result(key);
  $('dailyDate').textContent = key;
  $('dailyPlanet').textContent = `${lv.emoji} ${lv.name}`;
  $('dailySub').textContent = lv.subtitle;
  $('dailyStatus').innerHTML = r ? `今日成績<b>${fmtTime(r.time)}</b>${'⭐'.repeat(r.stars)}` : '今天還沒挑戰';
  const streak = daily.streak(key);
  $('dailyStreak').textContent = streak ? `🔥 連續 ${streak} 天` : '🔥 完成今天的挑戰，開始累積連續天數！';
  $('dailyGo').textContent = r ? '再練習一次' : '開始挑戰！';
  $('dailyLb').hidden = !hasGameCenter;
  $('daily').hidden = false;
};
$('dailyGo').onclick = () => {
  $('daily').hidden = true;
  const key = todayKey();
  startLevel(dailyPick(LEVELS, key).index, key);
};
$('dailyLb').onclick = () => showLeaderboard(LEADERBOARD.daily);
$('dailyClose').onclick = () => { $('daily').hidden = true; };

/* =========================================================
 * 完整版（App 內購買）
 * ======================================================= */
function openStore() {
  $('storeMsg').textContent = hasStore ? '' : '完整版請下載 iOS App 購買';
  $('buyBtn').hidden = !hasStore;
  $('restoreBtn').hidden = !hasStore;
  $('buyBtn').disabled = false;
  $('buyBtn').textContent = store.price ? `購買 ${store.price}` : '購買';
  $('store').hidden = false;
}
const STORE_MSG = {
  purchased: '🎉 感謝購買！全部星球都解鎖了',
  cancelled: '',
  pending: '⏳ 等待核准（例如家長同意）後就會自動解鎖',
  failed: '購買沒有完成，請稍後再試',
};
$('unlockBtn').onclick = openStore;
$('storeClose').onclick = () => { $('store').hidden = true; };
$('buyBtn').onclick = async () => {
  $('buyBtn').disabled = true;
  $('storeMsg').textContent = '連線到 App Store…';
  const status = await purchaseFull();
  $('buyBtn').disabled = false;
  $('storeMsg').textContent = STORE_MSG[status] ?? STORE_MSG.failed;
  if (status === 'purchased') {
    sfx.fanfare();
    haptic.found();
    setTimeout(() => { $('store').hidden = true; }, 1500);
  }
};
$('restoreBtn').onclick = async () => {
  $('storeMsg').textContent = '正在向 App Store 確認…';
  const ok = await restorePurchases();
  $('storeMsg').textContent = ok ? '✅ 已恢復完整版' : '這個 Apple ID 沒有完整版的購買紀錄';
  if (ok) { haptic.found(); setTimeout(() => { $('store').hidden = true; }, 1500); }
};
// 設定裡的恢復購買（按鈕空間小，只顯示簡短結果）
$('restoreBtn2').onclick = async () => {
  const b = $('restoreBtn2');
  b.textContent = '確認中…';
  const ok = await restorePurchases();
  b.textContent = ok ? '已擁有' : '查無紀錄';
  b.classList.toggle('on', ok);
};
// 購買、退款、家人共享等狀態改變時更新畫面
onStoreChange(() => { if (mode === 'select') renderSelectCard(); });

/* =========================================================
 * 排行榜與設定
 * ======================================================= */
$('lbBtn').hidden = !hasGameCenter;
$('lbBtn').onclick = () => showLeaderboard();

const TOGGLES = ['music', 'sfx', 'haptics'];
function renderSettings() {
  for (const k of TOGGLES) {
    $(`set-${k}`).classList.toggle('on', settings[k]);
    $(`set-${k}`).textContent = settings[k] ? '開' : '關';
  }
}
for (const k of TOGGLES) $(`set-${k}`).onclick = () => { setSetting(k, !settings[k]); renderSettings(); };
$('hapticsRow').hidden = !hasHaptics;
$('restoreRow').hidden = !hasStore;
$('settingsBtn').onclick = () => {
  renderSettings();
  $('restoreBtn2').textContent = store.owned ? '已擁有' : '恢復購買';
  $('restoreBtn2').classList.toggle('on', store.owned);
  $('settings').hidden = false;
};
$('settingsClose').onclick = () => { $('settings').hidden = true; };

/* =========================================================
 * 主迴圈
 * ======================================================= */
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(pixelRatio());
  renderer.setSize(innerWidth, innerHeight);
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(innerWidth, innerHeight);
  labelRenderer.setSize(innerWidth, innerHeight);
});

/* ---------- App 切到背景時暫停：停止渲染，計時也不會繼續跑 ---------- */
let paused = false;
function setPaused(p) {
  if (p === paused) return;
  paused = p;
  if (!p) last = performance.now(); // 回到前景時重設時間基準，背景期間不計入
  renderer.setAnimationLoop(p ? null : loop);
  setAudioPaused(p);
}
document.addEventListener('visibilitychange', () => setPaused(document.hidden));
if (Capacitor.isNativePlatform()) App.addListener('appStateChange', ({ isActive }) => setPaused(!isActive));

const camGoal = new THREE.Vector3();
let last = performance.now();
function loop() {
  const now = performance.now();
  const rawDt = Math.min((now - last) / 1000, 1); // 計時用真實時間（不受低幀率影響）
  const dt = Math.min(rawDt, 0.05);                // 動畫用，避免跳幀
  last = now;
  const t = now / 1000;

  lerpTheme(Math.min(1, dt * 3));
  stars.material.uniforms.uTime.value = t;
  stars.rotation.y += dt * 0.004;

  if (mode === 'select') {
    // 輪播：相機滑到選中的星球，星球緩慢自轉
    const portrait = innerWidth < innerHeight;
    // 直式時依螢幕寬度拉遠相機，讓整顆星球（含大氣層，半寬約 6.3）都放得進畫面
    const fit = 6.3 / (camera.aspect * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    const dist = portrait ? Math.max(26, fit) : 19;
    camGoal.set(selected * SPACING, 1.2, dist);
    camera.position.lerp(camGoal, Math.min(1, dt * 4));
    camera.lookAt(camera.position.x, portrait ? -1.5 * (dist / 26) : -0.8, 0);
    previews.children.forEach((p) => {
      const i = p.userData.index;
      p.rotation.y += dt * (i === selected ? 0.25 : 0.08);
      const s = i === selected ? 1 : 0.7;
      p.scale.setScalar(THREE.MathUtils.lerp(p.scale.x, s, Math.min(1, dt * 5)));
    });
    sun.position.set(camera.position.x + 14, 9, 10);
    sun.target.position.set(camera.position.x, 0, 0);
  } else {
    controls.update();
    // 太陽從相機右上方照過來，玩家看的那一面永遠是亮的
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    sun.position.copy(camera.position).normalize().multiplyScalar(14).addScaledVector(camera.up, 6).addScaledVector(right, 6);
    sun.target.position.set(0, 0, 0);
    world?.update(t, dt);
    game?.update(dt, t, rawDt);
  }

  particles.update(dt);
  composer.render();
  labelRenderer.render(scene, camera);
}
renderer.setAnimationLoop(loop);

// 先讀完存檔與設定，選關畫面的星數、解鎖狀態、每日挑戰標記才正確
await Promise.all([loadProgress(), loadSettings(), loadDaily(), loadStore()]);
signInGameCenter();
showSelect();
applyTheme(LEVELS[0].theme, true);

// 商店截圖用的自動展示模式：只在 VITE_SCREENSHOT=1 建置時打包，正式版會被整段移除
if (import.meta.env.VITE_SCREENSHOT === '1') {
  import('./src/demo.js').then((m) => m.runDemo({ LEVELS, choose, startLevel, progress }));
}
