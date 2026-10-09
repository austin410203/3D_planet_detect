/**
 * objects.js — 互動物件建立與管理
 * --------------------------------------------------
 * - 以基本幾何體組合出 16 種互動物件（動物／建築／植物／道具）
 * - placeOnSurface()：把物件貼在球面上，法線對齊球心方向
 * - 每個物件結構：root（貼附定位） → pivot（動畫用） → 模型
 * - 另以 InstancedMesh 大量散布裝飾樹木、松樹、岩石，降低 draw call
 */
import * as THREE from 'three';
import { latLonToDir, getSurfaceRadius, getBiome, SEA_RADIUS } from './planet.js';

const UP = new THREE.Vector3(0, 1, 0);
/** 互動物件整體縮放倍率 */
const OBJECT_SCALE = 1.45;

/* =========================================================
 * 共用工具
 * ======================================================= */

/** 材質快取：相同顏色共用同一份材質，節省記憶體 */
const matCache = new Map();
function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) {
    matCache.set(key, new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.8, ...opts }));
  }
  return matCache.get(key);
}
/** 會發光的材質（搭配 Bloom 產生光暈） */
function glow(color, intensity = 2.5) {
  return mat(color, { emissive: color, emissiveIntensity: intensity });
}

/** 建立網格並設定位置、陰影 */
function mesh(geo, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/**
 * 將物件貼附於球面
 * @param {THREE.Object3D} obj 要放置的物件（模型 +Y 為「上方」）
 * @param {THREE.Vector3} dir 球面方向（單位向量）
 * @param {number} radius 距球心半徑
 * @param {number} yaw 繞自身法線的旋轉角（弧度）
 */
export function placeOnSurface(obj, dir, radius, yaw = 0) {
  obj.position.copy(dir).multiplyScalar(radius);
  // 讓物件的 +Y 軸對齊球面法線（= 從球心指向外的方向）
  obj.quaternion.setFromUnitVectors(UP, dir);
  obj.rotateY(yaw);
}

/** 可重現的偽隨機數產生器（固定種子，每次載入場景一致） */
function seededRandom(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

/* =========================================================
 * 模型建構函式（皆以 y=0 為底部、+Y 朝上）
 * ======================================================= */

// ---------- 動物 ----------
function buildFox() {
  const g = new THREE.Group();
  const orange = mat('#f08a3c'), white = mat('#fff4e6'), dark = mat('#3a2a20');
  const body = mesh(new THREE.CapsuleGeometry(0.11, 0.22, 3, 6), orange, 0, 0.17, 0);
  body.rotation.z = Math.PI / 2;
  g.add(body);
  const head = mesh(new THREE.ConeGeometry(0.1, 0.22, 5), orange, 0.2, 0.26, 0);
  head.rotation.z = -Math.PI / 2;
  g.add(head);
  g.add(mesh(new THREE.ConeGeometry(0.035, 0.06, 4), dark, 0.32, 0.26, 0)).children; // 鼻子
  const nose = g.children[g.children.length - 1]; nose.rotation.z = -Math.PI / 2;
  for (const z of [-0.05, 0.05]) {
    g.add(mesh(new THREE.ConeGeometry(0.035, 0.09, 4), orange, 0.15, 0.36, z)); // 耳朵
    g.add(mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.1, 5), dark, 0.1, 0.05, z)); // 前腳
    g.add(mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.1, 5), dark, -0.1, 0.05, z)); // 後腳
  }
  const tail = mesh(new THREE.ConeGeometry(0.07, 0.28, 5), orange, -0.26, 0.24, 0);
  tail.rotation.z = Math.PI / 2.6;
  g.add(tail);
  const tip = mesh(new THREE.ConeGeometry(0.04, 0.08, 5), white, -0.36, 0.31, 0);
  tip.rotation.z = Math.PI / 2.6;
  g.add(tip);
  g.userData.tail = tail;
  return g;
}

function buildBird() {
  const g = new THREE.Group();
  const blue = mat('#4f8ef7'), yellow = mat('#ffcc33');
  const body = mesh(new THREE.SphereGeometry(0.1, 8, 6), blue, 0, 0, 0);
  body.scale.set(1.3, 1, 1);
  g.add(body);
  g.add(mesh(new THREE.SphereGeometry(0.07, 8, 6), blue, 0.11, 0.06, 0));
  const beak = mesh(new THREE.ConeGeometry(0.025, 0.07, 4), yellow, 0.2, 0.06, 0);
  beak.rotation.z = -Math.PI / 2;
  g.add(beak);
  // 翅膀以樞紐群組包住，方便拍動
  const wings = [];
  for (const s of [-1, 1]) {
    const hinge = new THREE.Group();
    hinge.position.set(0, 0.03, 0.06 * s);
    const w = mesh(new THREE.BoxGeometry(0.12, 0.015, 0.18), blue, 0, 0, 0.09 * s);
    hinge.add(w);
    hinge.userData.side = s;
    g.add(hinge);
    wings.push(hinge);
  }
  g.userData.wings = wings;
  return g;
}

function buildFish() {
  const g = new THREE.Group();
  const coral = mat('#ff7a6b'), fin = mat('#ffb36b');
  const body = mesh(new THREE.SphereGeometry(0.12, 8, 6), coral);
  body.scale.set(1.5, 1, 0.6);
  g.add(body);
  const tail = mesh(new THREE.ConeGeometry(0.09, 0.14, 4), fin, -0.22, 0, 0);
  tail.rotation.z = Math.PI / 2;
  g.add(tail);
  g.add(mesh(new THREE.SphereGeometry(0.02, 6, 4), mat('#222'), 0.12, 0.03, 0.06));
  g.userData.tail = tail;
  return g;
}

function buildBear() {
  const g = new THREE.Group();
  const brown = mat('#8a5a3b'), light = mat('#d9b48f'), dark = mat('#2a1d15');
  const body = mesh(new THREE.SphereGeometry(0.2, 8, 6), brown, 0, 0.24, 0);
  body.scale.set(1.3, 1, 1);
  g.add(body);
  g.add(mesh(new THREE.SphereGeometry(0.13, 8, 6), brown, 0.26, 0.38, 0));
  g.add(mesh(new THREE.SphereGeometry(0.06, 6, 4), light, 0.37, 0.35, 0));
  g.add(mesh(new THREE.SphereGeometry(0.025, 6, 4), dark, 0.43, 0.37, 0));
  for (const z of [-0.08, 0.08]) {
    g.add(mesh(new THREE.SphereGeometry(0.045, 6, 4), brown, 0.24, 0.5, z)); // 耳朵
    g.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.14, 6), brown, 0.14, 0.07, z * 1.4));
    g.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.14, 6), brown, -0.14, 0.07, z * 1.4));
  }
  return g;
}

// ---------- 建築 ----------
function buildCabin() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(0.5, 0.34, 0.42), mat('#b9773f'), 0, 0.17, 0));
  const roof = mesh(new THREE.ConeGeometry(0.42, 0.28, 4), mat('#c4442f'), 0, 0.48, 0);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1.05, 1, 0.9);
  g.add(roof);
  g.add(mesh(new THREE.BoxGeometry(0.07, 0.2, 0.07), mat('#7a6a5c'), 0.13, 0.56, 0.06)); // 煙囪
  g.add(mesh(new THREE.BoxGeometry(0.11, 0.18, 0.02), mat('#5b3a22'), -0.08, 0.09, 0.215)); // 門
  // 發光窗戶（Bloom 會讓它產生暖光）
  g.add(mesh(new THREE.BoxGeometry(0.1, 0.09, 0.02), glow('#ffcf6b', 2.2), 0.13, 0.2, 0.215));
  g.userData.chimneyTop = new THREE.Vector3(0.13, 0.68, 0.06);
  return g;
}

function buildCastle() {
  const g = new THREE.Group();
  const stone = mat('#cfc7bd'), roof = mat('#5b6fd6');
  g.add(mesh(new THREE.BoxGeometry(0.56, 0.3, 0.56), stone, 0, 0.15, 0));
  g.add(mesh(new THREE.BoxGeometry(0.26, 0.5, 0.26), stone, 0, 0.25, 0)); // 主塔
  g.add(mesh(new THREE.ConeGeometry(0.2, 0.3, 6), roof, 0, 0.65, 0));
  for (const [x, z] of [[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28]]) {
    g.add(mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.42, 6), stone, x, 0.21, z));
    g.add(mesh(new THREE.ConeGeometry(0.11, 0.2, 6), roof, x, 0.52, z));
  }
  g.add(mesh(new THREE.BoxGeometry(0.12, 0.16, 0.02), mat('#4a3a2a'), 0, 0.08, 0.285));
  // 旗子
  g.add(mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.2, 4), mat('#444'), 0, 0.88, 0));
  const flag = mesh(new THREE.BoxGeometry(0.12, 0.07, 0.005), mat('#ffcc33'), 0.06, 0.94, 0);
  g.add(flag);
  g.userData.flag = flag;
  return g;
}

function buildLighthouse() {
  const g = new THREE.Group();
  const red = mat('#e04848'), white = mat('#f6f2ea');
  // 紅白相間塔身
  for (let i = 0; i < 4; i++) {
    const r0 = 0.15 - i * 0.02, r1 = 0.15 - (i + 1) * 0.02;
    g.add(mesh(new THREE.CylinderGeometry(r1, r0, 0.18, 8), i % 2 ? white : red, 0, 0.09 + i * 0.18, 0));
  }
  g.add(mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 8), mat('#333'), 0, 0.735, 0));
  const lamp = mesh(new THREE.SphereGeometry(0.06, 8, 6), glow('#fff2a8', 4), 0, 0.8, 0);
  g.add(lamp);
  g.add(mesh(new THREE.ConeGeometry(0.1, 0.1, 8), red, 0, 0.91, 0));
  // 旋轉光束（半透明圓錐）
  const beamGroup = new THREE.Group();
  beamGroup.position.y = 0.8;
  const beam = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.9, 12, 1, true),
    new THREE.MeshBasicMaterial({
      color: '#fff6c0', transparent: true, opacity: 0.22,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    })
  );
  beam.rotation.z = Math.PI / 2;
  beam.position.x = -0.45;
  beamGroup.add(beam);
  g.add(beamGroup);
  g.userData.beam = beamGroup;
  g.userData.lamp = lamp;
  return g;
}

function buildWindmill() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.1, 0.17, 0.6, 8), mat('#f2e6d0'), 0, 0.3, 0));
  g.add(mesh(new THREE.ConeGeometry(0.14, 0.18, 8), mat('#a0522d'), 0, 0.69, 0));
  // 扇葉轉軸
  const hub = new THREE.Group();
  hub.position.set(0, 0.55, 0.15);
  hub.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 6), mat('#555'), 0, 0, 0)).children;
  hub.children[0].rotation.x = Math.PI / 2;
  for (let i = 0; i < 4; i++) {
    const arm = new THREE.Group();
    arm.rotation.z = (i * Math.PI) / 2;
    arm.add(mesh(new THREE.BoxGeometry(0.06, 0.34, 0.01), mat('#fffaf0'), 0, 0.2, 0.02));
    hub.add(arm);
  }
  g.add(hub);
  g.userData.blades = hub;
  return g;
}

// ---------- 植物 ----------
function buildBigTree() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.4, 6), mat('#8b5a2b'), 0, 0.2, 0));
  g.add(mesh(new THREE.IcosahedronGeometry(0.28, 0), mat('#4caf50'), 0, 0.55, 0));
  g.add(mesh(new THREE.IcosahedronGeometry(0.18, 0), mat('#66c05a'), 0.15, 0.68, 0.05));
  // 掛在樹上的發光果實
  const fruits = [];
  for (const [x, y, z] of [[0.2, 0.45, 0.15], [-0.18, 0.6, 0.12], [0.05, 0.5, -0.24]]) {
    const f = mesh(new THREE.SphereGeometry(0.04, 6, 4), glow('#ff6b6b', 1.4), x, y, z);
    g.add(f); fruits.push(f);
  }
  g.userData.fruits = fruits;
  return g;
}

function buildCactus() {
  const g = new THREE.Group();
  const green = mat('#3fa55b');
  g.add(mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.5, 7), green, 0, 0.25, 0));
  g.add(mesh(new THREE.SphereGeometry(0.07, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), green, 0, 0.5, 0));
  for (const s of [-1, 1]) {
    const arm = mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.14, 6), green, 0.11 * s, 0.26, 0);
    arm.rotation.z = Math.PI / 2;
    g.add(arm);
    g.add(mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.16 + (s > 0 ? 0.06 : 0), 6), green, 0.17 * s, 0.33, 0));
  }
  g.add(mesh(new THREE.SphereGeometry(0.035, 6, 4), mat('#ff6fa8'), 0, 0.57, 0)); // 頂端小花
  return g;
}

function buildFlower() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.3, 5), mat('#3d8b37'), 0, 0.15, 0));
  const head = new THREE.Group();
  head.position.y = 0.32;
  head.add(mesh(new THREE.SphereGeometry(0.045, 8, 6), glow('#ffd34d', 0.8)));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const p = mesh(new THREE.SphereGeometry(0.05, 6, 4), mat('#ff8fc7'), Math.cos(a) * 0.08, 0, Math.sin(a) * 0.08);
    p.scale.set(1, 0.4, 1);
    head.add(p);
  }
  head.rotation.x = 0.3;
  g.add(head);
  const leaf = mesh(new THREE.SphereGeometry(0.05, 6, 4), mat('#4caf50'), 0.05, 0.1, 0);
  leaf.scale.set(1.4, 0.3, 0.6);
  g.add(leaf);
  g.userData.head = head;
  return g;
}

function buildMushroom() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.22, 7), mat('#f6ecd9'), 0, 0.11, 0));
  g.add(mesh(new THREE.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat('#e8413c'), 0, 0.2, 0));
  // 白色斑點
  for (const [x, y, z] of [[0.1, 0.33, 0.06], [-0.08, 0.34, 0.08], [0.02, 0.38, -0.1], [-0.12, 0.29, -0.07], [0.15, 0.27, -0.06]]) {
    g.add(mesh(new THREE.SphereGeometry(0.03, 6, 4), mat('#ffffff'), x, y, z));
  }
  return g;
}

// ---------- 道具 ----------
function buildChest() {
  const g = new THREE.Group();
  const wood = mat('#9b5e2e'), gold = mat('#f2c14e', { metalness: 0.6, roughness: 0.4 });
  g.add(mesh(new THREE.BoxGeometry(0.34, 0.18, 0.22), wood, 0, 0.09, 0));
  // 金幣（開箱時才看得見）
  g.add(mesh(new THREE.BoxGeometry(0.3, 0.04, 0.18), glow('#ffd700', 1.8), 0, 0.17, 0));
  // 箱蓋：樞紐在後方，方便開合
  const lidHinge = new THREE.Group();
  lidHinge.position.set(0, 0.18, -0.11);
  const lid = mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.34, 8, 1, false, 0, Math.PI), wood, 0, 0, 0.11);
  lid.rotation.z = Math.PI / 2;
  lid.rotation.y = Math.PI / 2;
  lidHinge.add(lid);
  lidHinge.add(mesh(new THREE.BoxGeometry(0.06, 0.06, 0.02), gold, 0, 0, 0.225));
  g.add(lidHinge);
  g.userData.lid = lidHinge;
  return g;
}

function buildSignpost() {
  const g = new THREE.Group();
  const wood = mat('#a9744a'), board = mat('#d9a066');
  g.add(mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.55, 6), wood, 0, 0.275, 0));
  const b1 = mesh(new THREE.BoxGeometry(0.3, 0.08, 0.02), board, 0.08, 0.46, 0.03);
  const b2 = mesh(new THREE.BoxGeometry(0.26, 0.08, 0.02), board, -0.06, 0.34, 0.03);
  b2.rotation.y = 0.5;
  g.add(b1, b2);
  return g;
}

function buildStele() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(0.34, 0.06, 0.2), mat('#8d8676'), 0, 0.03, 0));
  g.add(mesh(new THREE.BoxGeometry(0.24, 0.5, 0.1), mat('#a39d8f'), 0, 0.31, 0));
  // 發光符文（點擊後亮度提升）
  const runeMat = new THREE.MeshStandardMaterial({ color: '#58e6ff', emissive: '#58e6ff', emissiveIntensity: 0.6, flatShading: true });
  const runes = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    runes.add(mesh(new THREE.BoxGeometry(0.12 - i * 0.02, 0.025, 0.01), runeMat, 0, 0.42 - i * 0.09, 0.052));
  }
  g.add(runes);
  g.userData.runeMat = runeMat;
  return g;
}

function buildMailbox() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 6), mat('#6b4b32'), 0, 0.175, 0));
  g.add(mesh(new THREE.BoxGeometry(0.16, 0.12, 0.26), mat('#3f7fd9'), 0, 0.41, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.26, 8, 1, false, 0, Math.PI), mat('#3f7fd9'), 0, 0.47, 0)).children;
  const top = g.children[g.children.length - 1];
  top.rotation.x = Math.PI / 2; top.rotation.y = Math.PI / 2;
  // 紅色小旗（收到信時舉起）
  const flagHinge = new THREE.Group();
  flagHinge.position.set(0.085, 0.4, -0.05);
  flagHinge.add(mesh(new THREE.BoxGeometry(0.01, 0.16, 0.02), mat('#e23b3b'), 0, 0.08, 0));
  flagHinge.add(mesh(new THREE.BoxGeometry(0.01, 0.05, 0.07), mat('#e23b3b'), 0, 0.14, 0.04));
  flagHinge.rotation.x = Math.PI / 2;
  g.add(flagHinge);
  g.userData.flag = flagHinge;
  return g;
}

/* =========================================================
 * 物件資料表
 * anim：點擊時的通用動畫（jump 跳躍、spin 旋轉、wiggle 搖擺）
 * hover：額外懸浮高度（鳥在空中飛）
 * ======================================================= */
const OBJECT_DEFS = [
  // 動物
  { id: 'fox', cat: '動物', name: '小狐狸 Momo', emoji: '🦊', lat: 22, lon: 12, build: buildFox, anim: 'jump',
    desc: '住在草原上的好奇小狐狸，最喜歡追著自己的尾巴轉圈圈。' },
  { id: 'bird', cat: '動物', name: '藍鵲 Pip', emoji: '🐦', lat: 34, lon: -22, build: buildBird, anim: 'spin', hover: 0.9,
    desc: '每天繞著星球巡邏的信差，會把各地的消息帶回小屋。' },
  { id: 'fish', cat: '動物', name: '珊瑚魚 Bubu', emoji: '🐟', lat: 2, lon: -112, build: buildFish, anim: 'jump', water: true,
    desc: '海洋裡最愛跳水的魚，聽說牠能一路跳到月亮上。' },
  { id: 'bear', cat: '動物', name: '雪山熊 Kuma', emoji: '🐻', lat: 66, lon: 40, build: buildBear, anim: 'wiggle',
    desc: '在雪地冬眠到一半被你吵醒了！正在伸懶腰。' },
  // 建築
  { id: 'cabin', cat: '建築', name: '紅頂小屋', emoji: '🏠', lat: 8, lon: -14, build: buildCabin, anim: 'wiggle',
    desc: '星球上第一棟房子，壁爐裡的火從來沒有熄滅過。' },
  { id: 'castle', cat: '建築', name: '藍頂城堡', emoji: '🏰', lat: -26, lon: 62, build: buildCastle, anim: 'wiggle',
    desc: '小星球的國王住在這裡——雖然國民只有一隻狐狸。' },
  { id: 'lighthouse', cat: '建築', name: '海岬燈塔', emoji: '🗼', lat: 14, lon: -52, build: buildLighthouse, anim: 'wiggle',
    desc: '為迷路的流星指引方向，點擊後光束會加速旋轉。' },
  { id: 'windmill', cat: '建築', name: '風車磨坊', emoji: '🌬️', lat: 28, lon: 34, build: buildWindmill, anim: 'wiggle',
    desc: '把星際微風轉成麵粉，點一下讓它全速運轉！' },
  // 植物
  { id: 'tree', cat: '植物', name: '許願果樹', emoji: '🌳', lat: -6, lon: 26, build: buildBigTree, anim: 'wiggle',
    desc: '結著發光果實的古老大樹，搖一搖會掉下好運。' },
  { id: 'cactus', cat: '植物', name: '沙漠仙人掌', emoji: '🌵', lat: 2, lon: 128, build: buildCactus, anim: 'wiggle',
    desc: '在沙漠中屹立三百年，頭頂的小花是它的驕傲。' },
  { id: 'flower', cat: '植物', name: '星光花', emoji: '🌸', lat: -16, lon: 4, build: buildFlower, anim: 'spin',
    desc: '只在小星球上綻放，花心會在夜裡微微發光。' },
  { id: 'mushroom', cat: '植物', name: '紅帽蘑菇', emoji: '🍄', lat: -36, lon: 88, build: buildMushroom, anim: 'jump',
    desc: '彈性十足的蘑菇，踩上去可以跳得很高（請勿食用）。' },
  // 道具
  { id: 'chest', cat: '道具', name: '神秘寶箱', emoji: '💰', lat: 16, lon: 156, build: buildChest, anim: 'jump',
    desc: '埋在沙丘裡的寶箱，裡面裝滿了閃亮的星星金幣！' },
  { id: 'signpost', cat: '道具', name: '十字路標', emoji: '🪧', lat: 4, lon: 48, build: buildSignpost, anim: 'spin',
    desc: '左邊往沙漠、右邊往大海，往上……是外太空。' },
  { id: 'stele', cat: '道具', name: '古代石碑', emoji: '🗿', lat: -14, lon: 118, build: buildStele, anim: 'wiggle',
    desc: '刻著遠古符文的石碑，觸碰時符文會亮起藍光。' },
  { id: 'mailbox', cat: '道具', name: '星際信箱', emoji: '📮', lat: 36, lon: -2, build: buildMailbox, anim: 'jump',
    desc: '你收到一封信：「歡迎來到小星球，祝你探險愉快！」' },
];

/* =========================================================
 * 各物件專屬的每幀更新與點擊效果
 * ======================================================= */
const SPECIAL = {
  bird: {
    update(o, t) {
      // 翅膀拍動
      for (const w of o.model.userData.wings) w.rotation.x = Math.sin(t * 14) * 0.7 * w.userData.side;
    },
  },
  fox: {
    update(o, t) { o.model.userData.tail.rotation.y = Math.sin(t * 4) * 0.4; },
  },
  fish: {
    update(o, t) {
      // 魚每隔一段時間躍出水面（拋物線）
      const cycle = (t * 0.45) % 1;
      const leap = cycle < 0.35 ? Math.sin((cycle / 0.35) * Math.PI) : 0;
      o.model.position.y = -0.12 + leap * 0.55;
      o.model.rotation.z = leap > 0 ? Math.cos((cycle / 0.35) * Math.PI) * 0.8 : 0;
      o.model.userData.tail.rotation.y = Math.sin(t * 12) * 0.5;
    },
  },
  windmill: {
    update(o, t, dt) {
      o.speed = THREE.MathUtils.lerp(o.speed ?? 1, 1, dt * 0.5); // 慢慢恢復原速
      o.model.userData.blades.rotation.z += dt * o.speed;
    },
    click(o) { o.speed = 14; },
  },
  lighthouse: {
    update(o, t, dt) {
      o.speed = THREE.MathUtils.lerp(o.speed ?? 1, 1, dt * 0.5);
      o.model.userData.beam.rotation.y += dt * 1.2 * o.speed;
    },
    click(o) { o.speed = 8; },
  },
  castle: {
    update(o, t) { o.model.userData.flag.rotation.y = Math.sin(t * 5) * 0.3; },
  },
  flower: {
    update(o, t) { o.model.userData.head.rotation.z = Math.sin(t * 1.5) * 0.15; },
  },
  chest: {
    update(o, t, dt) {
      const target = o.open ? -1.9 : 0;
      const lid = o.model.userData.lid;
      lid.rotation.x = THREE.MathUtils.lerp(lid.rotation.x, target, dt * 6);
    },
    click(o) { o.open = !o.open; },
  },
  mailbox: {
    update(o, t, dt) {
      const flag = o.model.userData.flag;
      flag.rotation.x = THREE.MathUtils.lerp(flag.rotation.x, o.raised ? 0 : Math.PI / 2, dt * 5);
    },
    click(o) { o.raised = true; },
  },
  stele: {
    update(o, t, dt) {
      const m = o.model.userData.runeMat;
      m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, o.lit ? 4 : 0.6 + Math.sin(t * 2) * 0.3, dt * 3);
    },
    click(o) { o.lit = true; setTimeout(() => (o.lit = false), 2500); },
  },
  tree: {
    update(o, t) {
      o.model.userData.fruits.forEach((f, i) => (f.material.emissiveIntensity = 1.2 + Math.sin(t * 3 + i) * 0.6));
    },
  },
};

/* =========================================================
 * 建立所有互動物件
 * ======================================================= */
/**
 * @param {THREE.Group} planetGroup 星球群組（物件會成為其子物件，跟著自轉）
 * @returns {Array} 互動物件紀錄陣列
 */
export function createInteractiveObjects(planetGroup) {
  const list = [];
  OBJECT_DEFS.forEach((def, i) => {
    const dir = latLonToDir(def.lat, def.lon);
    const surface = def.water ? SEA_RADIUS : getSurfaceRadius(dir);

    const root = new THREE.Group();   // 貼附在球面上的定位節點
    const pivot = new THREE.Group();  // 動畫用節點（idle 浮動、hover 放大、點擊動畫）
    const model = def.build();
    pivot.add(model);
    root.add(pivot);
    // 微微陷入地面，避免地形起伏造成懸空
    placeOnSurface(root, dir, surface - 0.03, (i * 1.7) % (Math.PI * 2));
    root.scale.setScalar(OBJECT_SCALE); // 整體放大，遠距離也看得清楚
    planetGroup.add(root);

    // 計算模型高度，作為標籤與粒子位置參考
    const box = new THREE.Box3().setFromObject(model);
    const height = box.max.y - box.min.y;

    const record = {
      ...def,
      root, pivot, model,
      dir,
      height,
      baseY: def.hover ?? 0,
      phase: i * 0.9,          // idle 動畫相位錯開
      hoverScale: 1,           // 目前縮放（平滑過渡）
      hovered: false,
      clickTime: -1,           // 點擊動畫開始時間（-1 = 未播放）
      discovered: false,
      special: SPECIAL[def.id],
    };
    // 讓 Raycaster 命中任何子網格時都能找回此紀錄
    root.traverse((c) => { c.userData.record = record; });
    list.push(record);

    if (getBiome(dir) === 'ocean' && !def.water) {
      console.warn(`[objects] ${def.name} 位於海洋區，可能會泡在水裡`);
    }
  });
  return list;
}

/* =========================================================
 * 每幀更新：idle 浮動、hover 放大、點擊動畫
 * ======================================================= */
const CLICK_DURATION = 0.9;
export function updateInteractiveObjects(list, t, dt) {
  for (const o of list) {
    // 1) idle 懸浮跳動
    let y = o.baseY + Math.sin(t * 2.2 + o.phase) * 0.035;
    let rotY = 0, rotZ = 0, squash = 1;

    // 2) 點擊動畫
    if (o.clickTime >= 0) {
      const p = (t - o.clickTime) / CLICK_DURATION;
      if (p >= 1) {
        o.clickTime = -1;
      } else {
        const ease = 1 - Math.pow(1 - p, 3);
        if (o.anim === 'jump') {
          y += Math.sin(p * Math.PI) * 0.5;
          squash = 1 + Math.sin(p * Math.PI * 2) * 0.12; // 擠壓伸展
        } else if (o.anim === 'spin') {
          rotY = ease * Math.PI * 2;
          y += Math.sin(p * Math.PI) * 0.15;
        } else {
          rotZ = Math.sin(p * Math.PI * 6) * 0.25 * (1 - p);
        }
      }
    }

    // 3) hover 放大（平滑插值）
    const targetScale = o.hovered ? 1.25 : 1;
    o.hoverScale = THREE.MathUtils.lerp(o.hoverScale, targetScale, Math.min(1, dt * 12));

    o.pivot.position.y = y;
    o.pivot.rotation.set(0, rotY, rotZ);
    o.pivot.scale.set(o.hoverScale / Math.sqrt(squash), o.hoverScale * squash, o.hoverScale / Math.sqrt(squash));

    // 4) 物件專屬動畫
    o.special?.update?.(o, t, dt);
  }
}

/** 觸發物件的點擊動畫（由 interactions.js 呼叫） */
export function triggerClick(o, t) {
  o.clickTime = t;
  o.special?.click?.(o);
}

/* =========================================================
 * 裝飾物：InstancedMesh 大量散布（不可互動）
 * ======================================================= */
/**
 * 建立一組 instanced 裝飾
 * @param {Array<{geo:THREE.BufferGeometry, color:string}>} parts 組成零件（幾何已平移到正確高度）
 * @param {Array<THREE.Matrix4>} matrices 每個實例的變換矩陣
 */
function makeInstanced(parts, matrices, tint) {
  const group = new THREE.Group();
  for (const part of parts) {
    const im = new THREE.InstancedMesh(part.geo, mat(part.color), matrices.length);
    matrices.forEach((m, i) => {
      im.setMatrixAt(i, m);
      if (tint && part.tint) im.setColorAt(i, tint[i]);
    });
    im.castShadow = true;
    im.receiveShadow = true;
    im.instanceMatrix.needsUpdate = true;
    group.add(im);
  }
  return group;
}

export function createDecorations(planetGroup, interactiveList) {
  const rand = seededRandom(20261009);
  const buckets = { tree: [], pine: [], rock: [], smallCactus: [] };
  const tints = { tree: [] };
  const dummy = new THREE.Object3D();
  const avoid = interactiveList.map((o) => o.dir);

  for (let i = 0; i < 420 && buckets.tree.length + buckets.pine.length < 110; i++) {
    // 球面均勻取樣
    const u = rand() * 2 - 1, th = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const dir = new THREE.Vector3(s * Math.cos(th), u, s * Math.sin(th));
    // 避開互動物件周圍
    if (avoid.some((d) => d.angleTo(dir) < 0.16)) continue;
    const r = getSurfaceRadius(dir);
    if (r < SEA_RADIUS + 0.02) continue; // 水裡不放

    const biome = getBiome(dir);
    let key = null;
    if (biome === 'grass') key = rand() < 0.75 ? 'tree' : 'rock';
    else if (biome === 'snow') key = rand() < 0.8 ? 'pine' : 'rock';
    else if (biome === 'desert') key = rand() < 0.4 ? 'smallCactus' : rand() < 0.5 ? 'rock' : null;
    if (!key) continue;

    placeOnSurface(dummy, dir, r - 0.02, rand() * Math.PI * 2);
    const sc = 0.7 + rand() * 0.6;
    dummy.scale.setScalar(sc);
    dummy.updateMatrix();
    buckets[key].push(dummy.matrix.clone());
    if (key === 'tree') tints.tree.push(new THREE.Color().setHSL(0.27 + rand() * 0.08, 0.55, 0.42 + rand() * 0.1));
  }

  // 各裝飾的零件幾何（以 translate 預先放到正確高度）
  const tree = [
    { geo: new THREE.CylinderGeometry(0.03, 0.05, 0.25, 5).translate(0, 0.125, 0), color: '#8b5a2b' },
    { geo: new THREE.IcosahedronGeometry(0.16, 0).translate(0, 0.34, 0), color: '#ffffff', tint: true },
  ];
  const pine = [
    { geo: new THREE.CylinderGeometry(0.025, 0.035, 0.12, 5).translate(0, 0.06, 0), color: '#7a5230' },
    { geo: new THREE.ConeGeometry(0.15, 0.3, 6).translate(0, 0.24, 0), color: '#2f7d55' },
    { geo: new THREE.ConeGeometry(0.11, 0.24, 6).translate(0, 0.4, 0), color: '#e9f3ff' }, // 積雪樹頂
  ];
  const rock = [{ geo: new THREE.DodecahedronGeometry(0.09, 0).scale(1.2, 0.7, 1).translate(0, 0.04, 0), color: '#9aa0a8' }];
  const smallCactus = [{ geo: new THREE.CylinderGeometry(0.04, 0.05, 0.24, 6).translate(0, 0.12, 0), color: '#4cae62' }];

  planetGroup.add(makeInstanced(tree, buckets.tree, tints.tree));
  planetGroup.add(makeInstanced(pine, buckets.pine));
  planetGroup.add(makeInstanced(rock, buckets.rock));
  planetGroup.add(makeInstanced(smallCactus, buckets.smallCactus));
}

/* =========================================================
 * 環繞星球飄動的雲朵
 * ======================================================= */
export function createClouds(scene) {
  const group = new THREE.Group();
  const cloudMat = mat('#ffffff', { roughness: 1, transparent: true, opacity: 0.92 });
  const rand = seededRandom(42);
  for (let i = 0; i < 9; i++) {
    const cloud = new THREE.Group();
    const puffs = 3 + Math.floor(rand() * 3);
    for (let p = 0; p < puffs; p++) {
      const puff = mesh(new THREE.IcosahedronGeometry(0.16 + rand() * 0.12, 0), cloudMat,
        (p - puffs / 2) * 0.18, rand() * 0.08, (rand() - 0.5) * 0.15);
      puff.receiveShadow = false;
      cloud.add(puff);
    }
    const dir = latLonToDir(rand() * 120 - 60, rand() * 360);
    placeOnSurface(cloud, dir, 6.2 + rand() * 0.6, rand() * Math.PI);
    group.add(cloud);
  }
  scene.add(group);
  return group;
}
