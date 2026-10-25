/**
 * props.js — 場景道具模型庫
 * --------------------------------------------------
 * 全部以基本幾何體組合（low-poly、y=0 為底部、+Y 朝上）。
 *   SPOTS      ：可搜尋的藏匿點（草叢、木桶、禮物盒、貝殼…）
 *   LANDMARKS  ：有名字的地標（燈塔、火山、薑餅屋…），線索會提到它們
 *   DECOR      ：大量散布的裝飾（InstancedMesh 用的零件表）
 *   makeEmojiSprite：把物品 emoji 畫成 Sprite（搜到時彈出）
 */
import * as THREE from 'three';
import { iconUrl } from './icons.js';

/* =========================================================
 * 共用工具
 * ======================================================= */
const matCache = new Map();
/** 取得（快取的）材質 */
export function M(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.8, ...opts }));
  return matCache.get(key);
}
/** 發光材質（Bloom 會讓它發亮） */
export const G = (color, k = 2.5) => M(color, { emissive: color, emissiveIntensity: k });

function mesh(parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
const cone = (r, h, s = 8) => new THREE.ConeGeometry(r, h, s);
const ball = (r, d = 0) => new THREE.IcosahedronGeometry(r, d);
const sph = (r, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);
const torus = (r, t, a = Math.PI * 2) => new THREE.TorusGeometry(r, t, 6, 16, a);

/* =========================================================
 * 藏匿點（可點擊搜尋）
 * 每個 builder 回傳 Group；name 為顯示名稱
 * ======================================================= */
export const SPOTS = {
  bush: { name: '草叢', build(g) {
    for (const [x, y, z, r] of [[0, 0.12, 0, 0.16], [0.13, 0.09, 0.04, 0.11], [-0.12, 0.08, -0.03, 0.12], [0.02, 0.2, -0.05, 0.1]])
      mesh(g, ball(r, 0), M('#4fae4a'), x, y, z);
    mesh(g, ball(0.03), M('#ff6b8a'), 0.08, 0.22, 0.1);
  } },
  rock: { name: '岩石', build(g) {
    mesh(g, new THREE.DodecahedronGeometry(0.18, 0), M('#9aa0a8'), 0, 0.1, 0).scale.set(1.2, 0.8, 1);
    mesh(g, new THREE.DodecahedronGeometry(0.09, 0), M('#878d96'), 0.17, 0.05, 0.05);
  } },
  barrel: { name: '木桶', build(g) {
    mesh(g, cyl(0.12, 0.12, 0.3, 10), M('#a8693a'), 0, 0.15, 0);
    for (const y of [0.05, 0.25]) mesh(g, cyl(0.125, 0.125, 0.025, 10), M('#555'), 0, y, 0);
    mesh(g, cyl(0.11, 0.11, 0.01, 10), M('#7a4a28'), 0, 0.305, 0);
  } },
  crate: { name: '木箱', build(g) {
    mesh(g, box(0.28, 0.24, 0.28), M('#c8904f'), 0, 0.12, 0);
    for (const s of [-1, 1]) mesh(g, box(0.29, 0.03, 0.03), M('#8b5a2b'), 0, 0.12, 0.135 * s, 0, 0, 0.7 * s);
  } },
  chest: { name: '寶箱', build(g) {
    mesh(g, box(0.3, 0.16, 0.2), M('#9b5e2e'), 0, 0.08, 0);
    mesh(g, cyl(0.1, 0.1, 0.3, 8, 1), M('#8a4f25'), 0, 0.16, 0, 0, 0, Math.PI / 2);
    mesh(g, box(0.05, 0.06, 0.02), M('#f2c14e', { metalness: 0.6 }), 0, 0.15, 0.105);
  } },
  pot: { name: '陶罐', build(g) {
    mesh(g, sph(0.13, 10, 8), M('#c26a3a'), 0, 0.13, 0).scale.set(1, 1.1, 1);
    mesh(g, cyl(0.06, 0.08, 0.08, 10), M('#c26a3a'), 0, 0.28, 0);
    mesh(g, torus(0.13, 0.015), M('#f2d38a'), 0, 0.15, 0, Math.PI / 2);
  } },
  haystack: { name: '乾草堆', build(g) {
    mesh(g, cone(0.2, 0.3, 9), M('#e8c35a'), 0, 0.15, 0);
    mesh(g, cyl(0.2, 0.22, 0.06, 9), M('#d9b04a'), 0, 0.03, 0);
  } },
  mound: { name: '沙堆', build(g) {
    mesh(g, sph(0.2, 10, 6), M('#e6c27a'), 0, 0, 0).scale.set(1.2, 0.6, 1);
    mesh(g, cone(0.03, 0.12, 5), M('#7a5230'), 0.05, 0.12, 0.02, 0.3); // 插著的小樹枝
  } },
  snowpile: { name: '雪堆', build(g) {
    mesh(g, sph(0.2, 10, 6), M('#f4f8ff'), 0, 0, 0).scale.set(1.2, 0.7, 1);
    mesh(g, sph(0.1, 8, 6), M('#ffffff'), 0.1, 0.1, 0.05);
  } },
  iceblock: { name: '冰塊', build(g) {
    mesh(g, box(0.24, 0.24, 0.24), M('#9fe3ff', { transparent: true, opacity: 0.75, roughness: 0.1 }), 0, 0.12, 0, 0, 0.4, 0);
  } },
  gift: { name: '禮物盒', build(g) {
    mesh(g, box(0.24, 0.2, 0.24), M('#ff6fa8'), 0, 0.1, 0);
    mesh(g, box(0.25, 0.21, 0.05), M('#fff176'), 0, 0.1, 0);
    mesh(g, box(0.05, 0.21, 0.25), M('#fff176'), 0, 0.1, 0);
    for (const s of [-1, 1]) mesh(g, torus(0.04, 0.015), M('#fff176'), 0.035 * s, 0.22, 0, 0, Math.PI / 2, 0.6 * s);
  } },
  cupcake: { name: '杯子蛋糕', build(g) {
    mesh(g, cyl(0.12, 0.09, 0.12, 10), M('#f2a65a'), 0, 0.06, 0);
    mesh(g, sph(0.14, 10, 8), M('#ffd1e8'), 0, 0.14, 0).scale.set(1, 0.7, 1);
    mesh(g, ball(0.035), M('#e8413c'), 0, 0.25, 0);
  } },
  jar: { name: '糖果罐', build(g) {
    mesh(g, cyl(0.12, 0.12, 0.26, 12), M('#bfefff', { transparent: true, opacity: 0.55, roughness: 0.1 }), 0, 0.13, 0);
    for (let i = 0; i < 6; i++) mesh(g, ball(0.035), M(['#ff5a8a', '#ffd23a', '#5ad1ff'][i % 3]), Math.sin(i) * 0.06, 0.05 + (i % 3) * 0.04, Math.cos(i) * 0.06);
    mesh(g, cyl(0.13, 0.13, 0.04, 12), M('#ff6fa8'), 0, 0.28, 0);
  } },
  clam: { name: '大貝殼', build(g) {
    mesh(g, sph(0.18, 10, 6, ), M('#f7c6d9'), 0, 0.02, 0).scale.set(1, 0.45, 1);
    const top = mesh(g, sph(0.18, 10, 6), M('#ffd6e4'), 0, 0.08, -0.03, -0.35); top.scale.set(1, 0.4, 1);
  } },
  coral: { name: '珊瑚叢', build(g) {
    for (const [x, z, h, c] of [[0, 0, 0.3, '#ff7a6b'], [0.09, 0.05, 0.22, '#ffb36b'], [-0.08, -0.03, 0.24, '#e85aa0']]) {
      mesh(g, cyl(0.025, 0.035, h, 6), M(c), x, h / 2, z, 0.2 * x * 10, 0, 0.2);
      mesh(g, ball(0.045), M(c), x + 0.03, h, z);
    }
  } },
  stump: { name: '樹樁', build(g) {
    mesh(g, cyl(0.14, 0.16, 0.16, 9), M('#8b5a2b'), 0, 0.08, 0);
    mesh(g, cyl(0.13, 0.13, 0.01, 9), M('#e0b07a'), 0, 0.165, 0);
    mesh(g, ball(0.04), M('#ff6b6b'), 0.1, 0.18, 0.06); // 小蘑菇
  } },
  shroom: { name: '大蘑菇', build(g) {
    mesh(g, cyl(0.05, 0.07, 0.2, 7), M('#f6ecd9'), 0, 0.1, 0);
    mesh(g, new THREE.SphereGeometry(0.17, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M('#9b6bff'), 0, 0.18, 0);
    for (const [x, z] of [[0.08, 0.06], [-0.07, 0.05], [0, -0.1]]) mesh(g, ball(0.025), G('#c8f5ff', 1.2), x, 0.3, z);
  } },
  trashcan: { name: '垃圾桶', build(g) {
    mesh(g, cyl(0.11, 0.09, 0.28, 10), M('#7f8c99', { metalness: 0.6, roughness: 0.4 }), 0, 0.14, 0);
    mesh(g, cyl(0.12, 0.12, 0.03, 10), M('#6b7682', { metalness: 0.6 }), 0, 0.295, 0);
    mesh(g, box(0.06, 0.02, 0.02), M('#555'), 0, 0.32, 0);
  } },
  drum: { name: '油桶', build(g) {
    mesh(g, cyl(0.12, 0.12, 0.3, 10), M('#3f7fd9', { metalness: 0.5, roughness: 0.4 }), 0, 0.15, 0);
    for (const y of [0.08, 0.22]) mesh(g, torus(0.122, 0.01), M('#2a5aa8', { metalness: 0.5 }), 0, y, 0, Math.PI / 2);
    mesh(g, box(0.1, 0.06, 0.005), M('#ffd23a'), 0, 0.15, 0.121);
  } },
  vent: { name: '排氣管', build(g) {
    mesh(g, cyl(0.07, 0.08, 0.26, 8), M('#8a929c', { metalness: 0.7, roughness: 0.3 }), 0, 0.13, 0);
    mesh(g, cyl(0.1, 0.07, 0.06, 8), M('#6b737c', { metalness: 0.7 }), 0, 0.28, 0);
    mesh(g, box(0.14, 0.05, 0.14), M('#4a5058'), 0, 0.025, 0);
  } },
  lavarock: { name: '熔岩石', build(g) {
    mesh(g, new THREE.DodecahedronGeometry(0.18, 0), M('#2e2626'), 0, 0.1, 0).scale.set(1.15, 0.85, 1);
    mesh(g, box(0.02, 0.15, 0.02), G('#ff6a1a', 2.5), 0.06, 0.12, 0.13, 0.3, 0, 0.4);
    mesh(g, box(0.02, 0.1, 0.02), G('#ff6a1a', 2.5), -0.08, 0.1, 0.12, 0, 0, -0.5);
  } },
  ashpile: { name: '灰燼堆', build(g) {
    mesh(g, sph(0.19, 10, 6), M('#5a5050'), 0, 0, 0).scale.set(1.2, 0.6, 1);
    for (const [x, z] of [[0.05, 0.05], [-0.06, 0.02]]) mesh(g, ball(0.025), G('#ff8a3c', 2), x, 0.1, z);
  } },
};

/* =========================================================
 * 地標（有名字，線索會提到它們）
 * ======================================================= */
export const LANDMARKS = {
  /* ----- 草原星 ----- */
  cabin(g) {
    mesh(g, box(0.5, 0.34, 0.42), M('#b9773f'), 0, 0.17, 0);
    mesh(g, cone(0.42, 0.28, 4), M('#c4442f'), 0, 0.48, 0, 0, Math.PI / 4);
    mesh(g, box(0.07, 0.2, 0.07), M('#7a6a5c'), 0.13, 0.56, 0.06);
    mesh(g, box(0.11, 0.18, 0.02), M('#5b3a22'), -0.08, 0.09, 0.215);
    mesh(g, box(0.1, 0.09, 0.02), G('#ffcf6b', 2), 0.13, 0.2, 0.215);
  },
  lighthouse(g) {
    for (let i = 0; i < 4; i++) mesh(g, cyl(0.15 - (i + 1) * 0.02, 0.15 - i * 0.02, 0.18, 8), M(i % 2 ? '#f6f2ea' : '#e04848'), 0, 0.09 + i * 0.18, 0);
    mesh(g, cyl(0.11, 0.11, 0.03, 8), M('#333'), 0, 0.735, 0);
    mesh(g, ball(0.06, 1), G('#fff2a8', 4), 0, 0.8, 0);
    mesh(g, cone(0.1, 0.1, 8), M('#e04848'), 0, 0.91, 0);
  },
  windmill(g) {
    mesh(g, cyl(0.1, 0.17, 0.6, 8), M('#f2e6d0'), 0, 0.3, 0);
    mesh(g, cone(0.14, 0.18, 8), M('#a0522d'), 0, 0.69, 0);
    const hub = new THREE.Group(); hub.position.set(0, 0.55, 0.15); g.add(hub);
    for (let i = 0; i < 4; i++) mesh(hub, box(0.06, 0.34, 0.01), M('#fffaf0'), Math.sin(i * Math.PI / 2) * 0.17, Math.cos(i * Math.PI / 2) * 0.17, 0, 0, 0, -i * Math.PI / 2);
    g.userData.spin = hub;
  },
  castle(g) {
    const stone = M('#cfc7bd'), roof = M('#5b6fd6');
    mesh(g, box(0.56, 0.3, 0.56), stone, 0, 0.15, 0);
    mesh(g, box(0.26, 0.5, 0.26), stone, 0, 0.25, 0);
    mesh(g, cone(0.2, 0.3, 6), roof, 0, 0.65, 0);
    for (const [x, z] of [[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28]]) {
      mesh(g, cyl(0.08, 0.09, 0.42, 6), stone, x, 0.21, z);
      mesh(g, cone(0.11, 0.2, 6), roof, x, 0.52, z);
    }
    mesh(g, box(0.12, 0.16, 0.02), M('#4a3a2a'), 0, 0.08, 0.285);
  },
  /* ----- 火焰星 ----- */
  volcano(g) {
    mesh(g, cyl(0.12, 0.42, 0.55, 9), M('#3a2a2a'), 0, 0.275, 0);
    mesh(g, cyl(0.1, 0.1, 0.02, 9), G('#ff6a1a', 3), 0, 0.555, 0);
    for (let i = 0; i < 3; i++) mesh(g, box(0.03, 0.3, 0.03), G('#ff4a1a', 2.5), Math.sin(i * 2.1) * 0.2, 0.25, Math.cos(i * 2.1) * 0.2, Math.cos(i * 2.1) * 0.5, 0, -Math.sin(i * 2.1) * 0.5);
    const smoke = new THREE.Group(); smoke.position.y = 0.65; g.add(smoke);
    for (let i = 0; i < 3; i++) mesh(smoke, ball(0.08 + i * 0.03), M('#6b6060', { transparent: true, opacity: 0.8 }), i * 0.05, i * 0.12, 0);
    g.userData.bob = smoke;
  },
  forge(g) {
    mesh(g, box(0.5, 0.3, 0.36), M('#4a3a36'), 0, 0.15, 0);
    mesh(g, box(0.2, 0.14, 0.02), G('#ff7a2a', 3), 0, 0.12, 0.185);
    mesh(g, cyl(0.06, 0.07, 0.4, 6), M('#5a4a46'), 0.15, 0.5, -0.08);
    mesh(g, box(0.18, 0.08, 0.1), M('#333a44', { metalness: 0.7 }), -0.38, 0.12, 0.05); // 鐵砧
    mesh(g, box(0.08, 0.08, 0.06), M('#333a44'), -0.38, 0.04, 0.05);
  },
  obsidianTower(g) {
    for (let i = 0; i < 4; i++) mesh(g, cyl(0.16 - i * 0.03, 0.18 - i * 0.03, 0.22, 6), M('#1f1a2a', { roughness: 0.3, metalness: 0.4 }), 0, 0.11 + i * 0.22, 0, 0, i * 0.3);
    mesh(g, new THREE.OctahedronGeometry(0.08), G('#ff3a6a', 3), 0, 1.0, 0);
  },
  phoenixNest(g) {
    mesh(g, torus(0.22, 0.07), M('#6b4a2a'), 0, 0.08, 0, Math.PI / 2);
    for (let i = 0; i < 3; i++) mesh(g, sph(0.07, 8, 6), M('#ffd166'), Math.sin(i * 2.1) * 0.08, 0.1, Math.cos(i * 2.1) * 0.08).scale.y = 1.3;
    mesh(g, cyl(0.03, 0.05, 0.5, 5), M('#3a2a2a'), 0.25, 0.25, -0.1, 0, 0, -0.2);
    mesh(g, cone(0.06, 0.18, 5), G('#ff8a1a', 2), 0.3, 0.55, -0.1);
  },
  /* ----- 海洋星 ----- */
  shipwreck(g) {
    const wood = M('#7a5230');
    mesh(g, box(0.7, 0.2, 0.28), wood, 0, 0.1, 0, 0, 0, 0.25);
    mesh(g, cone(0.15, 0.3, 4), wood, 0.42, 0.18, 0, 0, Math.PI / 4, -Math.PI / 2 + 0.25);
    mesh(g, cyl(0.02, 0.02, 0.6, 5), M('#5a3a22'), -0.05, 0.4, 0, 0, 0, 0.5);
    mesh(g, box(0.02, 0.22, 0.25), M('#e8e0cc'), 0.02, 0.45, 0, 0, 0, 0.5);
  },
  coralPalace(g) {
    mesh(g, cyl(0.25, 0.3, 0.3, 10), M('#ff8fb0'), 0, 0.15, 0);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      mesh(g, cone(0.07, 0.4, 7), M(['#ff7a6b', '#ffb36b', '#e85aa0'][i % 3]), Math.sin(a) * 0.22, 0.45, Math.cos(a) * 0.22);
    }
    mesh(g, cone(0.12, 0.55, 8), M('#ff5a8a'), 0, 0.55, 0);
    mesh(g, ball(0.06, 1), G('#ffffff', 2), 0, 0.85, 0);
  },
  buoy(g) {
    mesh(g, cyl(0.12, 0.16, 0.18, 8), M('#e04848'), 0, 0.09, 0);
    mesh(g, cyl(0.03, 0.03, 0.3, 6), M('#f6f2ea'), 0, 0.33, 0);
    mesh(g, ball(0.05, 1), G('#7ee8fa', 3), 0, 0.5, 0);
    g.userData.bob = g;
  },
  /* ----- 糖果星 ----- */
  gingerbread(g) {
    mesh(g, box(0.5, 0.34, 0.42), M('#b8743a'), 0, 0.17, 0);
    mesh(g, cone(0.42, 0.28, 4), M('#fff4f8'), 0, 0.48, 0, 0, Math.PI / 4);
    for (const x of [-0.15, 0, 0.15]) mesh(g, ball(0.035), M(['#ff5a8a', '#5ad17a', '#5ad1ff'][Math.round(x * 10 + 1.5) % 3]), x, 0.36, 0.22);
    mesh(g, box(0.11, 0.18, 0.02), M('#ff8fc7'), 0, 0.09, 0.215);
    mesh(g, box(0.5, 0.02, 0.43), M('#ffffff'), 0, 0.34, 0);
  },
  lollipopTree(g) {
    mesh(g, cyl(0.025, 0.025, 0.7, 6), M('#ffffff'), 0, 0.35, 0);
    mesh(g, cyl(0.25, 0.25, 0.06, 18), M('#ff6fa8'), 0, 0.85, 0, Math.PI / 2);
    mesh(g, torus(0.15, 0.03), M('#ffffff'), 0, 0.85, 0.035);
    mesh(g, torus(0.07, 0.025), M('#fff176'), 0, 0.85, 0.04);
  },
  chocoFountain(g) {
    for (let i = 0; i < 3; i++) mesh(g, cyl(0.3 - i * 0.09, 0.3 - i * 0.09, 0.08, 14), M('#e8e0cc'), 0, 0.04 + i * 0.22, 0);
    mesh(g, cyl(0.03, 0.03, 0.6, 6), M('#e8e0cc'), 0, 0.3, 0);
    for (let i = 0; i < 3; i++) mesh(g, cyl(0.27 - i * 0.09, 0.27 - i * 0.09, 0.02, 14), M('#5a3020', { roughness: 0.2 }), 0, 0.085 + i * 0.22, 0);
    mesh(g, ball(0.05, 1), M('#5a3020', { roughness: 0.2 }), 0, 0.62, 0);
  },
  candyCastle(g) {
    mesh(g, box(0.5, 0.3, 0.5), M('#ffd1e8'), 0, 0.15, 0);
    for (const [x, z] of [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]]) {
      mesh(g, cyl(0.08, 0.08, 0.45, 8), M('#b8f2d6'), x, 0.22, z);
      mesh(g, cone(0.11, 0.22, 8), M('#ff6fa8'), x, 0.55, z);
      mesh(g, ball(0.03), M('#fff176'), x, 0.68, z);
    }
    mesh(g, cyl(0.14, 0.14, 0.4, 10), M('#c9b8ff'), 0, 0.5, 0);
    mesh(g, cone(0.18, 0.3, 10), M('#ff6fa8'), 0, 0.85, 0);
  },
  /* ----- 冰晶星 ----- */
  igloo(g) {
    mesh(g, new THREE.SphereGeometry(0.3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), M('#f4f8ff'), 0, 0, 0);
    mesh(g, new THREE.CylinderGeometry(0.11, 0.11, 0.2, 10, 1, false, 0, Math.PI), M('#e6eef8'), 0, 0.07, 0.28, Math.PI / 2, 0, Math.PI / 2);
    mesh(g, box(0.12, 0.12, 0.02), M('#3a4a6a'), 0, 0.06, 0.38);
  },
  iceCastle(g) {
    const ice = M('#bfeaff', { roughness: 0.15, transparent: true, opacity: 0.9 });
    mesh(g, box(0.5, 0.28, 0.5), ice, 0, 0.14, 0);
    for (const [x, z, h] of [[-0.22, -0.22, 0.7], [0.22, -0.22, 0.55], [-0.22, 0.22, 0.5], [0.22, 0.22, 0.65]]) mesh(g, new THREE.OctahedronGeometry(0.1), ice, x, h, z).scale.set(1, 3, 1);
    mesh(g, new THREE.OctahedronGeometry(0.12), G('#9fe3ff', 1.5), 0, 0.75, 0).scale.set(1, 3.2, 1);
  },
  snowman(g) {
    mesh(g, sph(0.18), M('#ffffff'), 0, 0.17, 0);
    mesh(g, sph(0.13), M('#ffffff'), 0, 0.44, 0);
    mesh(g, sph(0.1), M('#ffffff'), 0, 0.64, 0);
    mesh(g, cone(0.025, 0.12, 6), M('#ff8a2a'), 0, 0.64, 0.14, Math.PI / 2);
    mesh(g, cyl(0.08, 0.08, 0.12, 10), M('#2a2a3a'), 0, 0.78, 0);
    mesh(g, cyl(0.12, 0.12, 0.02, 10), M('#2a2a3a'), 0, 0.72, 0);
    mesh(g, torus(0.1, 0.025), M('#e04848'), 0, 0.54, 0, Math.PI / 2);
  },
  frozenTree(g) {
    mesh(g, cyl(0.04, 0.07, 0.4, 6), M('#6b7a8c'), 0, 0.2, 0);
    for (let i = 0; i < 3; i++) mesh(g, cone(0.3 - i * 0.07, 0.3, 7), M('#d6f3ff', { roughness: 0.2 }), 0, 0.45 + i * 0.2, 0);
    mesh(g, new THREE.OctahedronGeometry(0.05), G('#ffffff', 2), 0, 1.07, 0);
  },
  /* ----- 沙漠星 ----- */
  pyramid(g) {
    mesh(g, cone(0.55, 0.7, 4), M('#e0b46a'), 0, 0.35, 0, 0, Math.PI / 4);
    mesh(g, cone(0.12, 0.15, 4), M('#ffd84a', { metalness: 0.6, roughness: 0.3 }), 0, 0.66, 0, 0, Math.PI / 4);
    mesh(g, box(0.12, 0.16, 0.02), M('#4a3020'), 0, 0.08, 0.37);
  },
  oasis(g) {
    mesh(g, cyl(0.32, 0.32, 0.02, 14), M('#3cc6d6', { roughness: 0.1 }), 0, 0.01, 0);
    for (const [x, z, r] of [[0.28, 0.1, 0.3], [-0.25, -0.15, -0.2]]) {
      mesh(g, cyl(0.025, 0.035, 0.55, 6), M('#8b5a2b'), x, 0.27, z, 0, 0, r);
      for (let i = 0; i < 5; i++) mesh(g, box(0.06, 0.01, 0.28), M('#4caf50'), x + Math.sin(r) * -0.25, 0.55, z, 0.5, (i / 5) * Math.PI * 2, 0).translateZ(0.12);
    }
  },
  obelisk(g) {
    mesh(g, box(0.3, 0.06, 0.3), M('#b89a6a'), 0, 0.03, 0);
    mesh(g, cyl(0.06, 0.1, 0.8, 4), M('#d9c08a'), 0, 0.45, 0, 0, Math.PI / 4);
    mesh(g, cone(0.06, 0.12, 4), M('#ffd84a', { metalness: 0.6 }), 0, 0.91, 0, 0, Math.PI / 4);
    mesh(g, box(0.04, 0.18, 0.01), G('#3cc6ff', 1.5), 0, 0.4, 0.075);
  },
  tent(g) {
    mesh(g, cone(0.35, 0.4, 6), M('#e8806a'), 0, 0.2, 0);
    mesh(g, cone(0.36, 0.1, 6), M('#f2d38a'), 0, 0.22, 0).scale.set(1, 0.3, 1);
    mesh(g, cyl(0.015, 0.015, 0.2, 4), M('#5a3a22'), 0, 0.47, 0);
    mesh(g, box(0.08, 0.06, 0.005), M('#3c8ae0'), 0.04, 0.55, 0);
  },
  /* ----- 蘑菇星 ----- */
  mushroomHouse(g) {
    mesh(g, cyl(0.18, 0.22, 0.4, 10), M('#f6ecd9'), 0, 0.2, 0);
    mesh(g, new THREE.SphereGeometry(0.42, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M('#e8413c'), 0, 0.36, 0).scale.y = 0.7;
    for (const [x, z] of [[0.2, 0.2], [-0.25, 0.1], [0.05, -0.3], [0.28, -0.12]]) mesh(g, ball(0.05), M('#ffffff'), x, 0.52, z);
    mesh(g, box(0.1, 0.16, 0.02), M('#8b5a2b'), 0, 0.08, 0.21);
    mesh(g, ball(0.035), G('#ffcf6b', 2), 0.1, 0.25, 0.19);
  },
  fairyRing(g) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      mesh(g, cyl(0.02, 0.025, 0.08, 5), M('#f6ecd9'), Math.sin(a) * 0.35, 0.04, Math.cos(a) * 0.35);
      mesh(g, new THREE.SphereGeometry(0.05, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), G('#c8a0ff', 1.5), Math.sin(a) * 0.35, 0.08, Math.cos(a) * 0.35);
    }
    mesh(g, cyl(0.25, 0.25, 0.01, 14), M('#7a5ad1', { transparent: true, opacity: 0.4 }), 0, 0.01, 0);
  },
  hollowTree(g) {
    mesh(g, cyl(0.18, 0.28, 0.6, 9), M('#6b4a3a'), 0, 0.3, 0);
    mesh(g, cyl(0.08, 0.08, 0.02, 9), M('#1f140f'), 0, 0.2, 0.2, Math.PI / 2 - 0.2);
    mesh(g, ball(0.38, 1), M('#3fa58c'), 0, 0.8, 0);
    mesh(g, ball(0.22, 1), M('#5ac9a8'), 0.2, 0.95, 0.1);
  },
  glowPond(g) {
    mesh(g, cyl(0.3, 0.3, 0.02, 16), G('#5af0ff', 1.2), 0, 0.01, 0);
    for (let i = 0; i < 6; i++) mesh(g, new THREE.DodecahedronGeometry(0.07, 0), M('#6a6a8a'), Math.sin(i) * 0.34, 0.03, Math.cos(i) * 0.34);
    mesh(g, cyl(0.01, 0.01, 0.3, 4), M('#3a8a5a'), 0.15, 0.15, 0.05);
    mesh(g, ball(0.05, 1), G('#ff9ff3', 2), 0.15, 0.32, 0.05);
  },
  /* ----- 齒輪星 ----- */
  factory(g) {
    mesh(g, box(0.6, 0.32, 0.4), M('#8a929c', { metalness: 0.5 }), 0, 0.16, 0);
    for (let i = 0; i < 3; i++) mesh(g, cone(0.12, 0.14, 4), M('#6b737c', { metalness: 0.5 }), -0.2 + i * 0.2, 0.39, 0, 0, Math.PI / 4, 0).scale.set(1, 1, 0.6);
    mesh(g, cyl(0.06, 0.08, 0.5, 8), M('#a85a3a'), 0.22, 0.55, -0.12);
    mesh(g, box(0.4, 0.06, 0.01), G('#5affb0', 2), 0, 0.22, 0.205);
    const smoke = new THREE.Group(); smoke.position.set(0.22, 0.85, -0.12); g.add(smoke);
    for (let i = 0; i < 3; i++) mesh(smoke, ball(0.06 + i * 0.02), M('#c8ccd2', { transparent: true, opacity: 0.8 }), i * 0.04, i * 0.1, 0);
    g.userData.bob = smoke;
  },
  dish(g) {
    mesh(g, cyl(0.04, 0.06, 0.4, 6), M('#8a929c', { metalness: 0.6 }), 0, 0.2, 0);
    const d = new THREE.Group(); d.position.y = 0.45; d.rotation.x = -0.6; g.add(d);
    mesh(d, new THREE.SphereGeometry(0.3, 14, 6, 0, Math.PI * 2, 0, Math.PI / 3), M('#e6eaee', { metalness: 0.3, side: THREE.DoubleSide }), 0, -0.25, 0);
    mesh(d, cyl(0.01, 0.01, 0.25, 4), M('#555'), 0, 0.05, 0);
    mesh(d, ball(0.03), G('#ff4a5a', 3), 0, 0.18, 0);
    g.userData.spinY = d;
  },
  gearTower(g) {
    mesh(g, cyl(0.12, 0.16, 0.8, 8), M('#6b737c', { metalness: 0.6 }), 0, 0.4, 0);
    const gear = new THREE.Group(); gear.position.set(0, 0.6, 0.17); g.add(gear);
    mesh(gear, cyl(0.2, 0.2, 0.05, 12), M('#d9a441', { metalness: 0.7, roughness: 0.3 }), 0, 0, 0, Math.PI / 2);
    for (let i = 0; i < 8; i++) mesh(gear, box(0.06, 0.08, 0.05), M('#d9a441', { metalness: 0.7 }), Math.sin(i * Math.PI / 4) * 0.22, Math.cos(i * Math.PI / 4) * 0.22, 0, 0, 0, -i * Math.PI / 4);
    mesh(gear, cyl(0.05, 0.05, 0.07, 8), M('#444'), 0, 0, 0, Math.PI / 2);
    g.userData.spin = gear;
    mesh(g, ball(0.06, 1), G('#5affb0', 3), 0, 0.88, 0);
  },
  robotStatue(g) {
    mesh(g, box(0.3, 0.1, 0.3), M('#4a5058'), 0, 0.05, 0);
    mesh(g, box(0.22, 0.26, 0.16), M('#b8c0c8', { metalness: 0.6 }), 0, 0.28, 0);
    mesh(g, box(0.18, 0.15, 0.15), M('#b8c0c8', { metalness: 0.6 }), 0, 0.5, 0);
    mesh(g, box(0.12, 0.04, 0.01), G('#5ad1ff', 3), 0, 0.51, 0.076);
    for (const s of [-1, 1]) mesh(g, box(0.06, 0.22, 0.06), M('#9aa2aa', { metalness: 0.6 }), 0.15 * s, 0.28, 0);
    mesh(g, cyl(0.008, 0.008, 0.12, 4), M('#555'), 0, 0.63, 0);
    mesh(g, ball(0.025), G('#ff4a5a', 3), 0, 0.7, 0);
  },
};

/* =========================================================
 * 裝飾零件表（InstancedMesh）
 * 每個零件：[幾何, 顏色, 是否隨機上色(tint)]，幾何已平移到正確高度
 * ======================================================= */
const T = (geo, x, y, z) => geo.translate(x, y, z);
export const DECOR = {
  tree: () => [[T(cyl(0.03, 0.05, 0.25, 5), 0, 0.125, 0), '#8b5a2b'], [T(ball(0.16), 0, 0.34, 0), '#5ab04a', true]],
  pine: () => [[T(cyl(0.025, 0.035, 0.12, 5), 0, 0.06, 0), '#7a5230'], [T(cone(0.15, 0.3, 6), 0, 0.24, 0), '#2f7d55'], [T(cone(0.11, 0.24, 6), 0, 0.4, 0), '#e9f3ff']],
  rock: () => [[T(new THREE.DodecahedronGeometry(0.09, 0).scale(1.2, 0.7, 1), 0, 0.04, 0), '#9aa0a8', true]],
  cactus: () => [[T(cyl(0.04, 0.05, 0.26, 6), 0, 0.13, 0), '#4cae62'], [T(cyl(0.025, 0.025, 0.1, 5), 0.06, 0.16, 0), '#4cae62']],
  spikes: () => [[T(cone(0.06, 0.32, 5), 0, 0.16, 0), '#2a2030'], [T(cone(0.035, 0.2, 5), 0.07, 0.1, 0.03), '#3a2a3a'], [T(ball(0.025), 0, 0.33, 0), '#ff5a1a', 'glow']],
  emberRock: () => [[T(new THREE.DodecahedronGeometry(0.1, 0).scale(1.2, 0.7, 1), 0, 0.04, 0), '#3a2e2e'], [T(ball(0.03), 0.05, 0.08, 0.05), '#ff7a2a', 'glow']],
  coral: () => [[T(cyl(0.02, 0.03, 0.22, 5), 0, 0.11, 0), '#ff7a6b', true], [T(cyl(0.015, 0.025, 0.15, 5), 0.05, 0.075, 0.02), '#ff7a6b', true]],
  seaweed: () => [[T(cone(0.04, 0.35, 4), 0, 0.17, 0), '#3fa58c'], [T(cone(0.03, 0.25, 4), 0.05, 0.12, 0), '#4fc29a']],
  palm: () => [[T(cyl(0.02, 0.035, 0.4, 5), 0, 0.2, 0), '#8b5a2b'], [T(cone(0.2, 0.08, 6), 0, 0.42, 0), '#4caf50']],
  candyCane: () => [[T(cyl(0.025, 0.025, 0.3, 6), 0, 0.15, 0), '#ffffff'], [T(new THREE.TorusGeometry(0.05, 0.025, 6, 10, Math.PI), 0.05, 0.3, 0), '#ff4a5a']],
  lollipop: () => [[T(cyl(0.01, 0.01, 0.25, 4), 0, 0.125, 0), '#ffffff'], [T(cyl(0.08, 0.08, 0.025, 12).rotateX(Math.PI / 2), 0, 0.3, 0), '#ff6fa8', true]],
  gumdrop: () => [[T(new THREE.SphereGeometry(0.08, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), 0, 0, 0), '#5ad1ff', true]],
  iceSpike: () => [[T(new THREE.OctahedronGeometry(0.08).scale(1, 2.6, 1), 0, 0.18, 0), '#bfeaff'], [T(new THREE.OctahedronGeometry(0.05).scale(1, 2.2, 1), 0.08, 0.1, 0.02), '#e6f7ff']],
  dune: () => [[T(new THREE.SphereGeometry(0.16, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.4, 0.4, 1), 0, 0, 0), '#e8c27a']],
  shroom: () => [[T(cyl(0.025, 0.035, 0.18, 5), 0, 0.09, 0), '#f6ecd9'], [T(new THREE.SphereGeometry(0.1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), 0, 0.17, 0), '#9b6bff', true]],
  glowShroom: () => [[T(cyl(0.015, 0.02, 0.1, 5), 0, 0.05, 0), '#d6f5ff'], [T(new THREE.SphereGeometry(0.05, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), 0, 0.1, 0), '#5af0ff', 'glow']],
  gear: () => [[T(cyl(0.12, 0.12, 0.04, 8).rotateX(Math.PI / 2), 0, 0.12, 0), '#d9a441'], [T(cyl(0.04, 0.04, 0.06, 6).rotateX(Math.PI / 2), 0, 0.12, 0), '#555a60']],
  pipe: () => [[T(cyl(0.035, 0.035, 0.3, 6), 0, 0.15, 0), '#8a929c'], [T(cyl(0.05, 0.05, 0.04, 6), 0, 0.3, 0), '#a85a3a']],
  bolt: () => [[T(cyl(0.05, 0.05, 0.05, 6), 0, 0.025, 0), '#9aa2aa'], [T(cyl(0.025, 0.025, 0.12, 6), 0, 0.09, 0), '#9aa2aa']],
};

/* =========================================================
 * 物品 Emoji Sprite（搜到時彈出）
 * ======================================================= */
const spriteCache = new Map();
const textureLoader = new THREE.TextureLoader();
export function makeEmojiSprite(emoji, size = 0.4) {
  const url = iconUrl(emoji);
  if (!spriteCache.has(emoji) && url) {
    // 有遊戲自己的低多邊形圖示就用圖示（icons.js），否則退回畫 emoji
    const tex = textureLoader.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    spriteCache.set(emoji, new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  }
  if (!spriteCache.has(emoji)) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    ctx.font = '96px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 64, 70);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    spriteCache.set(emoji, new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  }
  const s = new THREE.Sprite(spriteCache.get(emoji));
  s.scale.setScalar(size);
  return s;
}
