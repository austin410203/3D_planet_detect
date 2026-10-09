/**
 * world.js — 依關卡資料建立整顆可遊玩的星球
 * --------------------------------------------------
 * - 星球地形（planet.js）
 * - 地標：放在指定經緯度（自動挪到陸地上），可點擊看介紹
 * - 藏匿點：每個地標旁 3 個「種類不同」的藏匿點（其中可能藏著目標），
 *           另有隨機散布的干擾點（空的或藏著搞笑雜物）
 * - 裝飾：依生態區以 InstancedMesh 大量散布
 */
import * as THREE from 'three';
import { createPlanet, getSurfaceRadius, getBiome, isLand, latLonToDir, SEA_RADIUS } from './planet.js';
import { SPOTS, LANDMARKS, DECOR, M, G, makeEmojiSprite } from './props.js';

const UP = new THREE.Vector3(0, 1, 0);
const LANDMARK_SCALE = 1.45;
const SPOT_SCALE = 1.35;

/** 將物件貼在球面上（+Y 對齊法線） */
export function placeOnSurface(obj, dir, radius, yaw = 0) {
  obj.position.copy(dir).multiplyScalar(radius);
  obj.quaternion.setFromUnitVectors(UP, dir);
  obj.rotateY(yaw);
}

/** 可重現的亂數 */
function rng(seed) {
  let s = seed % 2147483647 || 1;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}
function randomDir(rand) {
  const u = rand() * 2 - 1, th = rand() * Math.PI * 2, s = Math.sqrt(1 - u * u);
  return new THREE.Vector3(s * Math.cos(th), u, s * Math.sin(th));
}
/** 取得 dir 的切平面兩個基底向量 */
function tangentBasis(dir) {
  const ref = Math.abs(dir.y) < 0.9 ? UP : new THREE.Vector3(1, 0, 0);
  const t1 = new THREE.Vector3().crossVectors(ref, dir).normalize();
  const t2 = new THREE.Vector3().crossVectors(dir, t1).normalize();
  return [t1, t2];
}
/** 若不在陸地上，就在附近螺旋搜尋最近的陸地 */
function nudgeToLand(dir, rand) {
  if (isLand(dir)) return dir.clone();
  const [t1, t2] = tangentBasis(dir);
  for (let i = 1; i < 240; i++) {
    const a = i * 2.4, r = 0.01 * i;
    const d = dir.clone().addScaledVector(t1, Math.cos(a) * r).addScaledVector(t2, Math.sin(a) * r).normalize();
    if (isLand(d)) return d;
  }
  return dir.clone();
}

/**
 * 建立關卡世界
 * @param {object} level levels.js 的一筆資料
 */
export function buildWorld(level) {
  const rand = rng(level.theme.seed * 9973 + 7);
  const { group, terrain, atmosphere } = createPlanet(level.theme);
  const clickables = [];   // 可點擊的紀錄（地標與藏匿點）
  const landmarks = new Map();
  const spots = [];
  const occupied = [];     // 已佔用位置（避免重疊）

  const free = (d, minAngle) => occupied.every((o) => o.dir.angleTo(d) > Math.max(minAngle, o.r));
  const canPlace = (d, anywhere) => anywhere || isLand(d);

  /* ---------- 地標 ---------- */
  for (const lm of level.landmarks) {
    let dir = latLonToDir(lm.lat, lm.lon);
    if (!lm.anywhere) dir = nudgeToLand(dir, rand);
    const root = new THREE.Group();
    const pivot = new THREE.Group();
    LANDMARKS[lm.model](pivot);
    root.add(pivot);
    placeOnSurface(root, dir, getSurfaceRadius(dir) - 0.03, rand() * Math.PI * 2);
    root.scale.setScalar(LANDMARK_SCALE);
    group.add(root);
    const height = new THREE.Box3().setFromObject(pivot).max.y * LANDMARK_SCALE;
    const rec = { kind: 'landmark', id: lm.id, name: lm.name, lore: lm.lore, dir, root, pivot, height, hoverScale: 1, hovered: false };
    root.traverse((c) => (c.userData.record = rec));
    landmarks.set(lm.id, rec);
    clickables.push(rec);
    occupied.push({ dir, r: 0.1 });
  }

  /* ---------- 藏匿點 ---------- */
  function addSpot(type, dir, content) {
    const def = SPOTS[type];
    const root = new THREE.Group();
    const pivot = new THREE.Group();
    def.build(pivot);
    root.add(pivot);
    placeOnSurface(root, dir, getSurfaceRadius(dir) - 0.02, rand() * Math.PI * 2);
    root.scale.setScalar(SPOT_SCALE);
    group.add(root);
    const height = new THREE.Box3().setFromObject(pivot).max.y * SPOT_SCALE;
    const rec = {
      kind: 'spot', type, name: def.name, dir, root, pivot, height, content,
      searched: false, shakeT: -1, hoverScale: 1, hovered: false, phase: rand() * 6,
    };
    root.traverse((c) => (c.userData.record = rec));
    spots.push(rec);
    clickables.push(rec);
    occupied.push({ dir, r: 0.05 });
    return rec;
  }

  // 每個地標旁放 3 個不同種類的藏匿點，目標一定在其中
  for (const lm of level.landmarks) {
    const rec = landmarks.get(lm.id);
    const required = level.targets.filter((t) => t.at === lm.id);
    const types = required.map((t) => t.spot);
    const pool = level.spotPool.filter((t) => !types.includes(t)).sort(() => rand() - 0.5);
    while (types.length < 3 && pool.length) types.push(pool.shift());
    const [t1, t2] = tangentBasis(rec.dir);
    const start = rand() * Math.PI * 2;
    types.forEach((type, i) => {
      // 環繞地標平均分布，若落在海中就再往外推一點
      let d;
      for (let k = 0; k < 12; k++) {
        const a = start + (i / types.length) * Math.PI * 2 + k * 0.35;
        const r = 0.12 + k * 0.012;
        d = rec.dir.clone().addScaledVector(t1, Math.cos(a) * r).addScaledVector(t2, Math.sin(a) * r).normalize();
        if (canPlace(d, lm.anywhere || level.spotsAnywhere) && free(d, 0.06)) break;
      }
      const target = required.find((t) => t.spot === type);
      addSpot(type, d, target ? { target } : null);
    });
  }

  // 額外的隨機干擾點：遠離地標，部分藏著搞笑雜物
  let junkLeft = level.junk.length;
  for (let i = 0, made = 0; i < 600 && made < level.extraSpots; i++) {
    const d = randomDir(rand);
    if (!canPlace(d, level.spotsAnywhere)) continue;
    if ([...landmarks.values()].some((l) => l.dir.angleTo(d) < 0.3)) continue;
    if (!free(d, 0.12)) continue;
    const type = level.spotPool[Math.floor(rand() * level.spotPool.length)];
    const junk = junkLeft > 0 && rand() < 0.5 ? level.junk[--junkLeft] : null;
    addSpot(type, d, junk ? { junk } : null);
    made++;
  }

  /* ---------- 裝飾（InstancedMesh） ---------- */
  const dummy = new THREE.Object3D();
  for (const dec of level.theme.decor) {
    const matrices = [], tints = [];
    for (let i = 0; i < dec.count * 12 && matrices.length < dec.count; i++) {
      const d = randomDir(rand);
      if (!dec.biomes.includes(getBiome(d))) continue;
      const r = getSurfaceRadius(d);
      if (!dec.biomes.includes('sea') && r < SEA_RADIUS + 0.03) continue;
      if (!free(d, 0.05)) continue;
      placeOnSurface(dummy, d, r - 0.02, rand() * Math.PI * 2);
      dummy.scale.setScalar(0.75 + rand() * 0.6);
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
      tints.push(new THREE.Color().setHSL(rand(), 0.65, 0.6));
    }
    if (!matrices.length) continue;
    for (const [geo, color, flag] of DECOR[dec.kind]()) {
      const mat = flag === 'glow' ? G(color, 2) : M(color);
      const im = new THREE.InstancedMesh(geo, mat, matrices.length);
      matrices.forEach((m, i) => {
        im.setMatrixAt(i, m);
        if (flag === true) im.setColorAt(i, new THREE.Color(color).lerp(tints[i], 0.55));
      });
      im.castShadow = true;
      im.receiveShadow = true;
      group.add(im);
    }
  }

  /* ---------- 提示光柱（使用提示時出現在地標上） ---------- */
  const beacon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.25, 3, 16, 1, true),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd23a').multiplyScalar(2), transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
  );
  beacon.visible = false;
  group.add(beacon);

  /** 每幀更新：hover 縮放、搜尋搖晃、地標小動畫、物品彈出 */
  const popups = [];
  function update(t, dt) {
    for (const r of clickables) {
      r.hoverScale = THREE.MathUtils.lerp(r.hoverScale, r.hovered ? 1.15 : 1, Math.min(1, dt * 12));
      let rz = 0, y = 0;
      if (r.kind === 'spot') {
        if (r.shakeT >= 0) {
          const p = (t - r.shakeT) / 0.6;
          if (p >= 1) r.shakeT = -1;
          else { rz = Math.sin(p * Math.PI * 8) * 0.25 * (1 - p); y = Math.sin(p * Math.PI) * 0.08; }
        }
        // 搜過的點會變扁一點、變暗，方便辨識
        const flat = r.searched ? 0.8 : 1;
        r.pivot.scale.set(r.hoverScale, r.hoverScale * flat, r.hoverScale);
      } else {
        r.pivot.scale.setScalar(r.hoverScale);
        const u = r.pivot.userData;
        if (u.spin) u.spin.rotation.z += dt * 1.2;     // 風車、齒輪轉動
        if (u.spinY) u.spinY.rotation.y += dt * 0.6;   // 衛星天線掃描
        if (u.bob === r.pivot) y = Math.sin(t * 2) * 0.04; // 浮標上下漂
        else if (u.bob) u.bob.position.y = (u.bob.userData.baseY ??= u.bob.position.y) + Math.sin(t * 2) * 0.04; // 煙霧飄動
      }
      r.pivot.rotation.z = rz;
      r.pivot.position.y = y;
    }
    if (beacon.visible) beacon.material.opacity = 0.25 + Math.sin(t * 5) * 0.12;
    // 彈出物品：往上飄、旋轉、縮小消失
    for (let i = popups.length - 1; i >= 0; i--) {
      const p = popups[i];
      p.age += dt;
      const k = p.age / 1.6;
      p.sprite.position.copy(p.base).addScaledVector(p.up, 0.3 + Math.sin(Math.min(1, k * 2) * Math.PI / 2) * 0.7);
      p.sprite.scale.setScalar(p.size * (k < 0.15 ? k / 0.15 : k > 0.8 ? (1 - k) / 0.2 : 1));
      if (k >= 1) { group.remove(p.sprite); popups.splice(i, 1); }
    }
  }

  /** 讓物品從藏匿點彈出 */
  function popItem(spot, emoji, size = 0.7) {
    const sprite = makeEmojiSprite(emoji, size);
    const base = spot.dir.clone().multiplyScalar(getSurfaceRadius(spot.dir) + spot.height);
    sprite.position.copy(base);
    group.add(sprite);
    popups.push({ sprite, base, up: spot.dir.clone(), age: 0, size });
  }

  /** 在地標上顯示提示光柱 */
  function showBeacon(lmId) {
    const lm = landmarks.get(lmId);
    beacon.position.copy(lm.dir).multiplyScalar(getSurfaceRadius(lm.dir) + 1.5);
    beacon.quaternion.setFromUnitVectors(UP, lm.dir);
    beacon.visible = true;
  }

  return { group, terrain, atmosphere, clickables, landmarks, spots, update, popItem, showBeacon, hideBeacon: () => (beacon.visible = false) };
}
