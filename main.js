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
import { progress, fmtTime } from './src/progress.js';

const $ = (id) => document.getElementById(id);
const isMobile = matchMedia('(pointer: coarse)').matches || innerWidth < 768;

/* =========================================================
 * Renderer / Scene / Camera
 * ======================================================= */
const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2));
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
LEVELS.forEach((lv, i) => {
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
  previews.add(group);
});

let selected = 0;
function renderSelectCard() {
  const lv = LEVELS[selected];
  const p = progress.get(lv.id);
  const unlocked = progress.isUnlocked(LEVELS, selected);
  $('pcNum').textContent = selected + 1;
  $('pcEmoji').textContent = lv.emoji;
  $('pcName').textContent = lv.name;
  $('pcSub').textContent = lv.subtitle;
  $('pcStars').innerHTML = [1, 2, 3].map((n) => `<span class="${p.stars >= n ? '' : 'off'}">⭐</span>`).join('');
  $('pcItems').textContent = `${lv.targets.length} 件`;
  $('pcBest').textContent = p.best !== null ? fmtTime(p.best) : '--';
  $('pcGoal').textContent = `${lv.stars[0]} 秒`;
  $('planetCard').classList.toggle('locked', !unlocked);
  $('pcLock').hidden = unlocked;
  $('planetDots').innerHTML = LEVELS.map((_, i) => `<span class="${i === selected ? 'on' : ''}" data-i="${i}"></span>`).join('');
  $('totalStars').textContent = progress.totalStars(LEVELS);
  applyTheme(lv.theme);
}
function choose(i) {
  selected = (i + LEVELS.length) % LEVELS.length;
  renderSelectCard();
}
$('prevPlanet').onclick = () => choose(selected - 1);
$('nextPlanet').onclick = () => choose(selected + 1);
$('planetDots').onclick = (e) => e.target.dataset.i && choose(Number(e.target.dataset.i));
$('startBtn').onclick = () => startLevel(selected);
addEventListener('keydown', (e) => {
  if (mode !== 'select') return;
  if (e.key === 'ArrowLeft') choose(selected - 1);
  if (e.key === 'ArrowRight') choose(selected + 1);
  if (e.key === 'Enter' && progress.isUnlocked(LEVELS, selected)) startLevel(selected);
});

/* =========================================================
 * 畫面流程
 * ======================================================= */
let mode = 'select';   // select | intro | play | result
let world = null;
let game = null;
let levelIndex = 0;

function showSelect() {
  teardown();
  mode = 'select';
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

function startLevel(i) {
  if (!progress.isUnlocked(LEVELS, i)) return;
  teardown();
  levelIndex = i;
  const lv = LEVELS[i];
  mode = 'intro';
  $('select').hidden = true;
  $('result').hidden = true;
  previews.visible = false;
  applyTheme(lv.theme, true);

  world = buildWorld(lv);
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
    if (i === 3) done();
    i++;
    setTimeout(step, i === 4 ? 600 : 700);
  };
  step();
}

function showResult({ time, stars }) {
  mode = 'result';
  const lv = LEVELS[levelIndex];
  const isBest = progress.save(lv.id, stars, time);
  $('resultTime').textContent = fmtTime(time);
  $('resultBest').textContent = isBest ? '🏆 新紀錄！' : `最佳 ${fmtTime(progress.get(lv.id).best)}`;
  $('resultOutro').textContent = `${lv.npc.emoji} ${lv.outro}`;
  const starEls = [...document.querySelectorAll('#resultStars .rs')];
  starEls.forEach((s) => s.classList.remove('on'));
  starEls.slice(0, stars).forEach((s, k) => setTimeout(() => s.classList.add('on'), 400 + k * 350));
  const hasNext = levelIndex + 1 < LEVELS.length;
  $('nextBtn').hidden = !hasNext;
  $('result').hidden = false;
}
$('retryBtn').onclick = () => startLevel(levelIndex);
$('menuBtn').onclick = () => { selected = levelIndex; showSelect(); };
$('nextBtn').onclick = () => { selected = levelIndex + 1; startLevel(levelIndex + 1); };
$('backBtn').onclick = () => { selected = levelIndex; showSelect(); };
$('journalTab').onclick = () => $('journal').classList.toggle('closed');

/* =========================================================
 * 主迴圈
 * ======================================================= */
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
  labelRenderer.setSize(innerWidth, innerHeight);
});

const camGoal = new THREE.Vector3();
let last = performance.now();
renderer.setAnimationLoop(() => {
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
    camGoal.set(selected * SPACING, 1.2, portrait ? 26 : 19);
    camera.position.lerp(camGoal, Math.min(1, dt * 4));
    camera.lookAt(camera.position.x, portrait ? -1.5 : -0.8, 0);
    previews.children.forEach((p, i) => {
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
});

showSelect();
applyTheme(LEVELS[0].theme, true);
