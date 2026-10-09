/**
 * main.js — 程式進入點
 * --------------------------------------------------
 * 建立 Scene / Camera / Renderer、燈光、後處理，
 * 並串接星球、物件、控制、互動、粒子、UI 各模組與主迴圈。
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { createPlanet, PLANET_RADIUS } from './src/planet.js';
import { createInteractiveObjects, updateInteractiveObjects, createDecorations, createClouds } from './src/objects.js';
import { createControls } from './src/controls.js';
import { setupInteractions } from './src/interactions.js';
import { createStarfield, ParticleBurst } from './src/particles.js';
import { createUI } from './src/ui.js';

/* ---------- 裝置判斷：行動裝置降低畫質以維持 30fps ---------- */
const isMobile = matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
let pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);

/* ---------- 基本三件套 ---------- */
const container = document.getElementById('app');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#070b1a');

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 400);
// 手機直式畫面較窄，相機拉遠一點才能看到整顆星球
camera.position.set(0, 4, window.innerWidth < window.innerHeight ? 21 : 16);

const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: 'high-performance' });
renderer.setPixelRatio(pixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
container.appendChild(renderer.domElement);

/* ---------- 燈光：環境光 + 半球光 + 太陽方向光（含陰影） ---------- */
scene.add(new THREE.AmbientLight('#b8c4ff', 0.35));
scene.add(new THREE.HemisphereLight('#dff3ff', '#3a2f5a', 0.9));

const sunLight = new THREE.DirectionalLight('#fff1d6', 2.6);
sunLight.position.set(14, 9, 10);
sunLight.castShadow = true;
const shadowSize = isMobile ? 1024 : 2048;
sunLight.shadow.mapSize.set(shadowSize, shadowSize);
// 陰影相機只需涵蓋星球範圍，提高陰影解析度
const sc = sunLight.shadow.camera;
sc.left = sc.bottom = -7.5;
sc.right = sc.top = 7.5;
sc.near = 1; sc.far = 40;
sunLight.shadow.bias = -0.0005;
sunLight.shadow.normalBias = 0.03;
scene.add(sunLight);

/* ---------- 太陽與月亮（裝飾，太陽會被 Bloom 照亮） ---------- */
const sun = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.3, 2),
  new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd76a').multiplyScalar(3) })
);
sun.position.copy(sunLight.position).normalize().multiplyScalar(26);
scene.add(sun);

const moonPivot = new THREE.Group();
const moon = new THREE.Mesh(
  new THREE.DodecahedronGeometry(0.7, 0),
  new THREE.MeshStandardMaterial({ color: '#4a5aa8', flatShading: true, roughness: 1 })
);
moon.position.set(9.5, 1.5, 0);
moon.castShadow = true;
moonPivot.add(moon);
moonPivot.rotation.z = 0.25;
scene.add(moonPivot);

/* ---------- 星空 ---------- */
const stars = createStarfield(isMobile ? 1500 : 2800);
scene.add(stars);

/* ---------- 星球 + 物件 ---------- */
const { group: planetGroup, terrain, atmosphere } = createPlanet();
planetGroup.rotation.x = 0.25; // 微微傾斜，更有立體感
scene.add(planetGroup);
scene.add(atmosphere);

const objects = createInteractiveObjects(planetGroup);
createDecorations(planetGroup, objects);
const clouds = createClouds(scene);

/* ---------- 後處理：Bloom 發光 ---------- */
const composer = new EffectComposer(renderer);
composer.setPixelRatio(pixelRatio);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.55,  // 強度
  0.5,   // 半徑
  0.85   // 閾值：只有夠亮的部分（太陽、燈塔、窗戶）才發光
);
composer.addPass(bloom);
composer.addPass(new OutputPass()); // 色調映射與色彩空間轉換

/* ---------- 各模組 ---------- */
// 簡易計時器（以 performance.now 計算 dt 與經過時間）
const clock = (() => {
  const start = performance.now();
  let last = start;
  return {
    getDelta() { const now = performance.now(); const d = (now - last) / 1000; last = now; return d; },
    getElapsedTime() { return (performance.now() - start) / 1000; },
  };
})();
const ui = createUI(container, objects);
const particles = new ParticleBurst(scene);
const ctrl = createControls(camera, renderer.domElement, planetGroup);
setupInteractions({
  camera, domElement: renderer.domElement, terrain, objects,
  particles, ui, controls: ctrl, clock,
});
ui.resize(window.innerWidth, window.innerHeight);

/* ---------- 響應式：視窗大小改變 ---------- */
function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
  bloom.setSize(w, h);
  ui.resize(w, h);
}
window.addEventListener('resize', onResize);

/* ---------- 自適應畫質：持續低於目標 FPS 時降低解析度 ---------- */
const targetFps = isMobile ? 30 : 55;
let fpsFrames = 0, fpsTime = 0, lowStreak = 0;
function adaptQuality(dt) {
  fpsFrames++; fpsTime += dt;
  if (fpsTime < 1) return;
  const fps = fpsFrames / fpsTime;
  fpsFrames = 0; fpsTime = 0;
  lowStreak = fps < targetFps ? lowStreak + 1 : 0;
  if (lowStreak >= 3 && pixelRatio > 0.75) {
    pixelRatio = Math.max(0.75, pixelRatio - 0.25);
    renderer.setPixelRatio(pixelRatio);
    composer.setPixelRatio(pixelRatio);
    onResize();
    lowStreak = 0;
  }
}

/* ---------- 主迴圈 ---------- */
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05); // 避免切換分頁回來時 dt 過大
  const t = clock.getElapsedTime();

  if (ui.isCardOpen()) ctrl.hold(); // 看卡片時暫停自轉
  ctrl.update(dt);
  updateInteractiveObjects(objects, t, dt);
  particles.update(dt);

  stars.material.uniforms.uTime.value = t;
  stars.rotation.y += dt * 0.004;
  clouds.rotation.y += dt * 0.05;   // 雲朵以不同速度飄移
  clouds.rotation.x = Math.sin(t * 0.1) * 0.1;
  moonPivot.rotation.y += dt * 0.15;
  moon.rotation.x += dt * 0.3;

  composer.render();
  ui.render(scene, camera);
  adaptQuality(dt);
});

// 方便除錯
window.__planet = { scene, camera, objects, PLANET_RADIUS };
