/**
 * props-extra.js — 第 9～28 關使用的追加模型
 * --------------------------------------------------
 * 匯入時會把新的藏匿點、地標、裝飾合併進 props.js 的 SPOTS / LANDMARKS / DECOR。
 * 主題：海盜、遠古巨人、外太空、霓虹機械城、魔法王國、七矮人森林、奇境仙境、
 *       恐龍谷、亞特蘭提斯、天空浮島、巨龍之巢、南瓜鬼鎮、東方仙山、維京峽灣、
 *       蒸汽飛船港、外星蟲巢、玩具王國、翡翠城、聖誕北極、叢林神殿
 */
import * as THREE from 'three';
import { SPOTS, LANDMARKS, DECOR, M, G } from './props.js';

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
const sph = (r, w = 12, h = 8) => new THREE.SphereGeometry(r, w, h);
const half = (r, w = 12) => new THREE.SphereGeometry(r, w, 6, 0, Math.PI * 2, 0, Math.PI / 2);
const torus = (r, t, a = Math.PI * 2) => new THREE.TorusGeometry(r, t, 6, 16, a);
const T = (geo, x, y, z) => geo.translate(x, y, z);

/* =========================================================
 * 追加藏匿點
 * ======================================================= */
Object.assign(SPOTS, {
  sack: { name: '麻布袋', build(g) {
    mesh(g, sph(0.14), M('#c8a86a'), 0, 0.13, 0).scale.set(1, 1.1, 0.9);
    mesh(g, cyl(0.04, 0.06, 0.06, 8), M('#b8985a'), 0, 0.28, 0);
    mesh(g, torus(0.045, 0.012), M('#7a5230'), 0, 0.26, 0, Math.PI / 2);
  } },
  basket: { name: '籃子', build(g) {
    mesh(g, cyl(0.15, 0.11, 0.14, 12), M('#c9944a'), 0, 0.07, 0);
    mesh(g, torus(0.13, 0.012, Math.PI), M('#a8763a'), 0, 0.14, 0);
    mesh(g, sph(0.11), M('#ffffff'), 0, 0.13, 0).scale.set(1.2, 0.3, 1.2); // 蓋布
  } },
  tombstone: { name: '墓碑', build(g) {
    mesh(g, box(0.2, 0.26, 0.06), M('#8a8f98'), 0, 0.13, 0);
    mesh(g, cyl(0.1, 0.1, 0.06, 12, 1), M('#8a8f98'), 0, 0.26, 0, Math.PI / 2);
    mesh(g, box(0.1, 0.02, 0.01), M('#5a5f68'), 0, 0.2, 0.031);
    mesh(g, box(0.26, 0.04, 0.16), M('#6b5a46'), 0, 0.02, 0.04);
  } },
  bones: { name: '骨頭堆', build(g) {
    for (const [x, z, r] of [[0, 0, 0.3], [0.06, 0.05, -0.6], [-0.05, 0.03, 1.1]]) {
      const b = new THREE.Group(); b.position.set(x, 0.04, z); b.rotation.y = r; g.add(b);
      mesh(b, cyl(0.02, 0.02, 0.22, 6), M('#f2ead6'), 0, 0, 0, 0, 0, Math.PI / 2);
      for (const s of [-1, 1]) mesh(b, ball(0.035), M('#f2ead6'), 0.11 * s, 0, 0);
    }
    mesh(g, sph(0.07), M('#f2ead6'), 0, 0.09, -0.04); // 頭骨
    for (const s of [-1, 1]) mesh(g, sph(0.015), M('#222'), 0.025 * s, 0.1, 0.02);
  } },
  crystal: { name: '水晶簇', build(g) {
    for (const [x, z, h, rz] of [[0, 0, 0.32, 0], [0.08, 0.03, 0.22, -0.4], [-0.07, 0.02, 0.2, 0.5], [0.02, -0.07, 0.16, 0.3]])
      mesh(g, new THREE.OctahedronGeometry(0.06), G('#b48cff', 1.2), x, h / 2, z, 0.2, 0, rz).scale.set(1, h * 9, 1);
  } },
  cloud: { name: '雲朵', build(g) {
    for (const [x, y, z, r] of [[0, 0.12, 0, 0.14], [0.13, 0.08, 0, 0.1], [-0.13, 0.09, 0.02, 0.11], [0.03, 0.2, 0, 0.09]])
      mesh(g, ball(r, 1), M('#ffffff', { roughness: 1 }), x, y, z);
  } },
  pumpkin: { name: '南瓜', build(g) {
    for (let i = 0; i < 6; i++) mesh(g, sph(0.1), M('#ff8a1a'), Math.sin(i) * 0.06, 0.11, Math.cos(i) * 0.06).scale.set(0.8, 1, 0.8);
    mesh(g, cyl(0.015, 0.02, 0.06, 5), M('#3a6a2a'), 0, 0.24, 0);
  } },
  toybox: { name: '玩具箱', build(g) {
    mesh(g, box(0.3, 0.2, 0.22), M('#4f8ef7'), 0, 0.1, 0);
    mesh(g, box(0.32, 0.05, 0.24), M('#ffd23a'), 0, 0.22, 0);
    for (const [x, c] of [[-0.08, '#ff5a5a'], [0.08, '#4fd1a5']]) mesh(g, sph(0.04), M(c), x, 0.11, 0.115);
  } },
  teapot: { name: '大茶壺', build(g) {
    mesh(g, sph(0.15), M('#ffffff', { roughness: 0.3 }), 0, 0.14, 0).scale.set(1.1, 0.9, 1.1);
    mesh(g, cyl(0.02, 0.035, 0.14, 6), M('#ffffff'), 0.17, 0.17, 0, 0, 0, -0.9);
    mesh(g, torus(0.06, 0.015, Math.PI), M('#ffffff'), -0.15, 0.15, 0, 0, 0, Math.PI / 2);
    mesh(g, cyl(0.06, 0.06, 0.03, 10), M('#4f8ef7'), 0, 0.27, 0);
    mesh(g, torus(0.15, 0.012), M('#4f8ef7'), 0, 0.14, 0, Math.PI / 2);
  } },
});

/* =========================================================
 * 追加地標
 * ======================================================= */
Object.assign(LANDMARKS, {
  /* ----- 海盜 ----- */
  pirateShip(g) {
    const wood = M('#7a4a2a');
    mesh(g, box(0.7, 0.2, 0.28), wood, 0, 0.12, 0);
    mesh(g, cone(0.14, 0.26, 4), wood, 0.45, 0.12, 0, 0, Math.PI / 4, -Math.PI / 2);
    mesh(g, box(0.18, 0.12, 0.26), wood, -0.28, 0.27, 0);
    mesh(g, cyl(0.018, 0.018, 0.75, 5), M('#5a3a22'), 0.02, 0.58, 0);
    mesh(g, box(0.02, 0.32, 0.38), M('#2a2a32'), 0.03, 0.62, 0);
    mesh(g, sph(0.035), M('#ffffff'), 0.045, 0.66, 0); // 骷髏旗
    mesh(g, box(0.01, 0.07, 0.11), M('#ffffff'), 0.045, 0.6, 0);
  },
  skullRock(g) {
    mesh(g, sph(0.38, 14, 10), M('#c8c0b0'), 0, 0.32, 0).scale.set(1, 0.95, 0.9);
    for (const s of [-1, 1]) mesh(g, sph(0.09), M('#1a1820'), 0.13 * s, 0.38, 0.28).scale.z = 0.6;
    mesh(g, cone(0.05, 0.08, 3), M('#1a1820'), 0, 0.27, 0.32, -0.3);
    mesh(g, box(0.28, 0.08, 0.2), M('#b8b0a0'), 0, 0.06, 0.2);
  },
  cannonFort(g) {
    mesh(g, cyl(0.38, 0.42, 0.3, 10), M('#a89880'), 0, 0.15, 0);
    for (let i = 0; i < 10; i++) mesh(g, box(0.1, 0.1, 0.1), M('#a89880'), Math.sin(i * 0.628) * 0.36, 0.34, Math.cos(i * 0.628) * 0.36);
    mesh(g, cyl(0.05, 0.06, 0.4, 8), M('#2a2a32', { metalness: 0.6 }), 0, 0.38, 0.32, Math.PI / 2 - 0.2);
    mesh(g, cyl(0.01, 0.01, 0.4, 4), M('#5a3a22'), 0, 0.5, 0);
    mesh(g, box(0.01, 0.1, 0.16), M('#e04848'), 0, 0.65, 0.08);
  },
  tavern(g) {
    mesh(g, box(0.5, 0.36, 0.4), M('#9a6a3a'), 0, 0.18, 0);
    mesh(g, cone(0.42, 0.26, 4), M('#4a3a5a'), 0, 0.49, 0, 0, Math.PI / 4);
    mesh(g, box(0.02, 0.12, 0.2), M('#5a3a22'), 0.27, 0.3, 0.12, 0, Math.PI / 2);
    mesh(g, box(0.16, 0.1, 0.02), M('#f2c14e'), 0.27, 0.24, 0.24);
    mesh(g, box(0.1, 0.1, 0.02), G('#ffb84a', 2), -0.12, 0.2, 0.205);
    mesh(g, cyl(0.06, 0.06, 0.1, 10), M('#8b5a2b'), 0.18, 0.05, 0.28); // 酒桶
  },
  /* ----- 遠古巨人 ----- */
  giantHead(g) {
    const stone = M('#8a8a7a');
    mesh(g, box(0.4, 0.62, 0.36), stone, 0, 0.31, 0);
    mesh(g, box(0.44, 0.1, 0.4), stone, 0, 0.6, 0);
    mesh(g, box(0.1, 0.22, 0.12), stone, 0, 0.3, 0.22);
    for (const s of [-1, 1]) mesh(g, box(0.1, 0.04, 0.02), M('#4a4a3a'), 0.1 * s, 0.42, 0.19);
    mesh(g, box(0.18, 0.03, 0.02), M('#4a4a3a'), 0, 0.14, 0.19);
    mesh(g, ball(0.1), M('#5a8a4a'), 0.16, 0.66, 0.1); // 苔蘚
  },
  stoneCircle(g) {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      mesh(g, box(0.1, 0.42, 0.08), M('#9a9a8a'), Math.sin(a) * 0.36, 0.21, Math.cos(a) * 0.36, 0, a);
    }
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.52;
      mesh(g, box(0.38, 0.08, 0.1), M('#8a8a7a'), Math.sin(a) * 0.31, 0.46, Math.cos(a) * 0.31, 0, a + Math.PI / 2);
    }
    mesh(g, box(0.2, 0.06, 0.14), G('#7ee8fa', 0.8), 0, 0.03, 0);
  },
  ribcage(g) {
    for (let i = 0; i < 5; i++) mesh(g, torus(0.3, 0.035, Math.PI), M('#f2ead6'), 0, 0, -0.32 + i * 0.16, 0, 0, 0);
    mesh(g, cyl(0.04, 0.04, 0.8, 6), M('#f2ead6'), 0, 0.3, 0, Math.PI / 2);
    mesh(g, sph(0.2), M('#f2ead6'), 0, 0.22, 0.52).scale.set(1, 0.8, 1.2);
    for (const s of [-1, 1]) mesh(g, sph(0.05), M('#222'), 0.08 * s, 0.28, 0.66);
  },
  giantSword(g) {
    mesh(g, box(0.14, 0.9, 0.04), M('#c8d0d8', { metalness: 0.8, roughness: 0.25 }), 0, 0.45, 0);
    mesh(g, box(0.44, 0.08, 0.08), M('#d9a441', { metalness: 0.6 }), 0, 0.92, 0);
    mesh(g, cyl(0.035, 0.035, 0.25, 8), M('#6b4a2a'), 0, 1.08, 0);
    mesh(g, ball(0.06), G('#ff4a6a', 2), 0, 1.24, 0);
    mesh(g, sph(0.25, 10, 6), M('#7a6a5a'), 0, 0, 0).scale.y = 0.3;
  },
  /* ----- 外太空 ----- */
  rocket(g) {
    mesh(g, cyl(0.12, 0.14, 0.6, 12), M('#f2f2f2', { metalness: 0.3 }), 0, 0.42, 0);
    mesh(g, cone(0.12, 0.25, 12), M('#e04848'), 0, 0.84, 0);
    mesh(g, cyl(0.05, 0.05, 0.02, 12), M('#7ee8fa', { metalness: 0.5 }), 0, 0.55, 0.13, Math.PI / 2);
    for (let i = 0; i < 3; i++) mesh(g, box(0.02, 0.2, 0.14), M('#e04848'), Math.sin(i * 2.09) * 0.14, 0.18, Math.cos(i * 2.09) * 0.14, 0, i * 2.09);
    mesh(g, cone(0.08, 0.12, 8), G('#ff9a3a', 2.5), 0, 0.06, 0, Math.PI);
  },
  domeBase(g) {
    mesh(g, half(0.36, 16), M('#bfefff', { transparent: true, opacity: 0.55, roughness: 0.1 }), 0, 0, 0);
    mesh(g, cyl(0.38, 0.38, 0.05, 16), M('#8a929c', { metalness: 0.5 }), 0, 0.025, 0);
    mesh(g, ball(0.12), M('#4caf50'), 0, 0.1, 0);
    mesh(g, box(0.12, 0.14, 0.24), M('#c8d0d8', { metalness: 0.5 }), 0, 0.07, 0.42);
    mesh(g, box(0.08, 0.02, 0.01), G('#5affb0', 2), 0, 0.11, 0.54);
  },
  ufo(g) {
    const body = new THREE.Group(); body.position.y = 0.4; g.add(body);
    mesh(body, sph(0.32, 16, 8), M('#9aa2aa', { metalness: 0.7, roughness: 0.3 }), 0, 0, 0).scale.y = 0.25;
    mesh(body, half(0.14), M('#7ee8fa', { transparent: true, opacity: 0.7 }), 0, 0.05, 0);
    for (let i = 0; i < 6; i++) mesh(body, ball(0.03), G(['#ff4a6a', '#ffd23a', '#5affb0'][i % 3], 3), Math.sin(i) * 0.27, -0.02, Math.cos(i) * 0.27);
    mesh(g, cone(0.25, 0.4, 16, 1), new THREE.MeshBasicMaterial({ color: '#c8ffd8', transparent: true, opacity: 0.18, depthWrite: false }), 0, 0.2, 0);
    g.userData.spinY = body;
  },
  /* ----- 霓虹機械城 ----- */
  skyscraper(g) {
    mesh(g, box(0.28, 1.0, 0.28), M('#2a2f45', { metalness: 0.5 }), 0, 0.5, 0);
    for (let i = 0; i < 6; i++) mesh(g, box(0.29, 0.03, 0.29), G(i % 2 ? '#ff4ad1' : '#4ad1ff', 2), 0, 0.12 + i * 0.15, 0);
    mesh(g, cyl(0.01, 0.01, 0.25, 4), M('#888'), 0, 1.12, 0);
    mesh(g, ball(0.03), G('#ff4a5a', 3), 0, 1.25, 0);
  },
  hologram(g) {
    mesh(g, cyl(0.2, 0.24, 0.08, 12), M('#3a3f55', { metalness: 0.6 }), 0, 0.04, 0);
    const holo = new THREE.Group(); holo.position.y = 0.45; g.add(holo);
    mesh(holo, new THREE.OctahedronGeometry(0.18), new THREE.MeshBasicMaterial({ color: new THREE.Color('#4ad1ff').multiplyScalar(2), wireframe: true }), 0, 0, 0);
    mesh(g, cone(0.2, 0.36, 12, 1), new THREE.MeshBasicMaterial({ color: '#4ad1ff', transparent: true, opacity: 0.15, depthWrite: false }), 0, 0.26, 0, Math.PI);
    g.userData.spinY = holo;
  },
  /* ----- 魔法王國 ----- */
  wizardTower(g) {
    mesh(g, cyl(0.15, 0.2, 0.7, 10), M('#8a7ac8'), 0, 0.35, 0);
    mesh(g, cone(0.24, 0.42, 10), M('#3a2a7a'), 0, 0.9, 0, 0.1);
    for (let i = 0; i < 4; i++) mesh(g, ball(0.025), G('#ffd23a', 2), Math.sin(i * 1.6) * 0.15, 0.85 + i * 0.05, Math.cos(i * 1.6) * 0.15);
    mesh(g, box(0.08, 0.1, 0.02), G('#ffcf6b', 2), 0, 0.5, 0.17);
    mesh(g, box(0.1, 0.16, 0.02), M('#5a3a22'), 0, 0.08, 0.2);
  },
  fountain(g) {
    mesh(g, cyl(0.36, 0.38, 0.12, 16), M('#d8d0c8'), 0, 0.06, 0);
    mesh(g, cyl(0.32, 0.32, 0.02, 16), M('#4ad1ff', { roughness: 0.1 }), 0, 0.12, 0);
    mesh(g, cyl(0.05, 0.07, 0.4, 8), M('#d8d0c8'), 0, 0.3, 0);
    mesh(g, cyl(0.16, 0.08, 0.06, 12), M('#d8d0c8'), 0, 0.5, 0);
    mesh(g, ball(0.06, 1), G('#9fe3ff', 2), 0, 0.6, 0);
  },
  crystalSpire(g) {
    mesh(g, new THREE.OctahedronGeometry(0.16), G('#b48cff', 1.2), 0, 0.55, 0).scale.set(1, 3.5, 1);
    for (let i = 0; i < 4; i++) mesh(g, new THREE.OctahedronGeometry(0.08), G('#8af0ff', 1), Math.sin(i * 1.57) * 0.2, 0.2, Math.cos(i * 1.57) * 0.2, 0, 0, 0.3).scale.set(1, 2.5, 1);
    mesh(g, new THREE.DodecahedronGeometry(0.22, 0), M('#5a5a6a'), 0, 0.02, 0).scale.y = 0.4;
  },
  /* ----- 七矮人森林 ----- */
  cottage(g) {
    mesh(g, box(0.5, 0.3, 0.38), M('#e8d8b8'), 0, 0.15, 0);
    for (const x of [-0.18, 0, 0.18]) mesh(g, box(0.02, 0.3, 0.39), M('#6b4a2a'), x, 0.15, 0);
    mesh(g, cone(0.42, 0.34, 4), M('#7a5a3a'), 0, 0.47, 0, 0, Math.PI / 4).scale.set(1.1, 1, 0.85);
    mesh(g, box(0.08, 0.12, 0.02), M('#5a3a22'), -0.08, 0.06, 0.2);
    for (let i = 0; i < 7; i++) mesh(g, cone(0.025, 0.06, 5), M(['#e04848', '#ffd23a', '#4f8ef7', '#4fd1a5', '#ff8a3c', '#b48cff', '#ff6fa8'][i]), -0.21 + i * 0.07, 0.03, 0.26); // 七頂小帽
  },
  wishingWell(g) {
    mesh(g, cyl(0.22, 0.24, 0.22, 12), M('#a8a090'), 0, 0.11, 0);
    mesh(g, cyl(0.18, 0.18, 0.02, 12), M('#2a4a6a'), 0, 0.2, 0);
    for (const s of [-1, 1]) mesh(g, box(0.04, 0.4, 0.04), M('#7a5230'), 0.2 * s, 0.38, 0);
    mesh(g, cone(0.32, 0.18, 4), M('#a0522d'), 0, 0.64, 0, 0, Math.PI / 4).scale.z = 0.6;
    mesh(g, cyl(0.03, 0.03, 0.36, 6), M('#7a5230'), 0, 0.48, 0, 0, 0, Math.PI / 2);
    mesh(g, cyl(0.05, 0.04, 0.07, 8), M('#8b5a2b'), 0, 0.33, 0);
  },
  magicMirror(g) {
    mesh(g, box(0.3, 0.06, 0.18), M('#5a3a5a'), 0, 0.03, 0);
    mesh(g, cyl(0.03, 0.04, 0.2, 6), M('#d9a441', { metalness: 0.7 }), 0, 0.14, 0);
    mesh(g, torus(0.22, 0.035), M('#d9a441', { metalness: 0.7, roughness: 0.3 }), 0, 0.48, 0).scale.y = 1.3;
    mesh(g, cyl(0.21, 0.21, 0.02, 20), M('#cfe8ff', { metalness: 0.9, roughness: 0.05 }), 0, 0.48, 0, Math.PI / 2).scale.z = 1.3;
    mesh(g, ball(0.04), G('#b48cff', 2), 0, 0.8, 0);
  },
  appleTree(g) {
    mesh(g, cyl(0.06, 0.09, 0.4, 7), M('#6b4a2a'), 0, 0.2, 0);
    mesh(g, ball(0.32, 1), M('#3f8f3a'), 0, 0.58, 0);
    for (const [x, y, z] of [[0.2, 0.5, 0.2], [-0.24, 0.6, 0.12], [0.1, 0.78, -0.18], [-0.05, 0.42, 0.28], [0.27, 0.66, -0.05]])
      mesh(g, sph(0.045), M('#e0202a', { roughness: 0.3 }), x, y, z);
  },
  /* ----- 奇境仙境 ----- */
  teaTable(g) {
    mesh(g, cyl(0.36, 0.36, 0.03, 16), M('#ffffff'), 0, 0.26, 0);
    mesh(g, cyl(0.37, 0.37, 0.08, 16, 1), M('#ff8fc7'), 0, 0.22, 0);
    mesh(g, cyl(0.04, 0.06, 0.24, 6), M('#7a5230'), 0, 0.12, 0);
    for (let i = 0; i < 5; i++) {
      const a = i * 1.26;
      mesh(g, cyl(0.035, 0.03, 0.05, 8), M(['#4f8ef7', '#ffd23a', '#4fd1a5'][i % 3]), Math.sin(a) * 0.24, 0.3, Math.cos(a) * 0.24);
    }
    mesh(g, cyl(0.06, 0.08, 0.1, 10), M('#ffffff'), 0, 0.33, 0);
    mesh(g, cyl(0.05, 0.08, 0.18, 10), M('#2a2a32'), 0.12, 0.38, -0.05); // 大禮帽
    mesh(g, cyl(0.1, 0.1, 0.01, 12), M('#2a2a32'), 0.12, 0.29, -0.05);
  },
  giantClock(g) {
    mesh(g, cyl(0.04, 0.06, 0.4, 6), M('#7a5230'), 0, 0.2, 0);
    mesh(g, cyl(0.3, 0.3, 0.06, 20), M('#ffd23a', { metalness: 0.5 }), 0, 0.62, 0, Math.PI / 2);
    mesh(g, cyl(0.26, 0.26, 0.065, 20), M('#fff8e7'), 0, 0.62, 0, Math.PI / 2);
    const hands = new THREE.Group(); hands.position.set(0, 0.62, 0.04); g.add(hands);
    mesh(hands, box(0.02, 0.2, 0.01), M('#1d1b3a'), 0, 0.09, 0);
    mesh(hands, box(0.02, 0.14, 0.01), M('#1d1b3a'), 0.05, 0.03, 0.005, 0, 0, -1.2);
    for (let i = 0; i < 12; i++) mesh(g, box(0.02, 0.03, 0.01), M('#1d1b3a'), Math.sin(i * 0.52) * 0.22, 0.62 + Math.cos(i * 0.52) * 0.22, 0.035);
    g.userData.spin = hands;
  },
  rabbitHole(g) {
    mesh(g, cyl(0.3, 0.34, 0.06, 16), M('#6b4a2a'), 0, 0.03, 0);
    mesh(g, cyl(0.22, 0.22, 0.07, 16), new THREE.MeshBasicMaterial({ color: '#0a0610' }), 0, 0.035, 0);
    for (let i = 0; i < 7; i++) mesh(g, cone(0.04, 0.16, 4), M('#4caf50'), Math.sin(i) * 0.32, 0.08, Math.cos(i) * 0.32);
    mesh(g, box(0.02, 0.36, 0.02), M('#7a5230'), 0.36, 0.18, 0);
    mesh(g, box(0.2, 0.08, 0.01), M('#fff8e7'), 0.4, 0.32, 0.01, 0, 0, -0.1); // 「往下」告示牌
  },
  cardTower(g) {
    const suits = ['#e0202a', '#1d1b3a'];
    for (let r = 0; r < 3; r++) for (let i = 0; i < 3 - r; i++) {
      const x = (i - (2 - r) / 2) * 0.22;
      for (const s of [-1, 1]) mesh(g, box(0.14, 0.22, 0.01), M('#ffffff'), x + 0.05 * s, 0.11 + r * 0.22, 0, 0, 0, 0.3 * s);
      mesh(g, box(0.04, 0.04, 0.012), M(suits[(i + r) % 2]), x, 0.13 + r * 0.22, 0.01);
    }
  },
  /* ----- 恐龍谷 ----- */
  dinoStatue(g) {
    const c = M('#6aa84a');
    mesh(g, sph(0.25), c, 0, 0.32, 0).scale.set(0.9, 0.8, 1.3);
    mesh(g, cyl(0.07, 0.11, 0.5, 8), c, 0, 0.62, 0.28, 0.5);
    mesh(g, sph(0.1), c, 0, 0.85, 0.42).scale.z = 1.4;
    mesh(g, cone(0.1, 0.45, 8), c, 0, 0.3, -0.45, -Math.PI / 2 + 0.3);
    for (const [x, z] of [[-0.12, 0.15], [0.12, 0.15], [-0.12, -0.15], [0.12, -0.15]]) mesh(g, cyl(0.05, 0.06, 0.2, 6), c, x, 0.1, z);
    for (const s of [-1, 1]) mesh(g, sph(0.015), M('#111'), 0.06 * s, 0.88, 0.5);
  },
  dinoNest(g) {
    mesh(g, torus(0.24, 0.08), M('#8a6a3a'), 0, 0.08, 0, Math.PI / 2);
    for (let i = 0; i < 3; i++) mesh(g, sph(0.09), M('#f2ead6'), Math.sin(i * 2.1) * 0.09, 0.12, Math.cos(i * 2.1) * 0.09).scale.y = 1.35;
    mesh(g, sph(0.012), M('#6aa84a'), 0.1, 0.2, 0.05);
  },
  treehouse(g) {
    mesh(g, cyl(0.1, 0.14, 0.7, 8), M('#6b4a2a'), 0, 0.35, 0);
    mesh(g, box(0.4, 0.04, 0.4), M('#a8763a'), 0, 0.52, 0);
    mesh(g, box(0.3, 0.2, 0.3), M('#c8904f'), 0, 0.64, 0);
    mesh(g, cone(0.3, 0.2, 4), M('#4a8a3a'), 0, 0.84, 0, 0, Math.PI / 4);
    mesh(g, ball(0.28, 1), M('#3f8f3a'), 0.1, 1.0, -0.1);
    for (let i = 0; i < 5; i++) mesh(g, box(0.1, 0.015, 0.02), M('#8b5a2b'), 0.16, 0.08 + i * 0.1, 0.12); // 梯子
  },
  /* ----- 亞特蘭提斯 ----- */
  columns(g) {
    mesh(g, box(0.7, 0.06, 0.3), M('#e8e0d0'), 0, 0.03, 0);
    for (const [x, h] of [[-0.25, 0.6], [0, 0.45], [0.25, 0.6]]) {
      mesh(g, cyl(0.06, 0.07, h, 10), M('#e8e0d0'), x, h / 2 + 0.06, 0);
      mesh(g, box(0.16, 0.05, 0.16), M('#e8e0d0'), x, h + 0.08, 0);
    }
    mesh(g, box(0.66, 0.06, 0.18), M('#e8e0d0'), 0, 0.71, 0, 0, 0, 0.06);
  },
  tridentStatue(g) {
    mesh(g, cyl(0.2, 0.24, 0.12, 10), M('#c8c0b0'), 0, 0.06, 0);
    mesh(g, cyl(0.025, 0.025, 0.9, 6), M('#d9a441', { metalness: 0.7 }), 0, 0.55, 0);
    for (const x of [-0.08, 0, 0.08]) mesh(g, cone(0.03, 0.16, 5), M('#d9a441', { metalness: 0.7 }), x, 1.04, 0);
    mesh(g, box(0.2, 0.03, 0.03), M('#d9a441', { metalness: 0.7 }), 0, 0.95, 0);
    mesh(g, ball(0.05, 1), G('#7ee8fa', 3), 0, 0.85, 0);
  },
  /* ----- 天空浮島 ----- */
  balloon(g) {
    const b = new THREE.Group(); b.position.y = 0.2; g.add(b);
    mesh(b, sph(0.26, 12, 10), M('#ff6a4a'), 0, 0.55, 0).scale.y = 1.15;
    for (let i = 0; i < 6; i++) mesh(b, box(0.02, 0.58, 0.02), M('#ffd23a'), Math.sin(i * 1.05) * 0.24, 0.55, Math.cos(i * 1.05) * 0.24, 0, i * 1.05);
    mesh(b, box(0.14, 0.1, 0.14), M('#a8763a'), 0, 0.12, 0);
    for (const s of [-1, 1]) mesh(b, cyl(0.004, 0.004, 0.2, 3), M('#555'), 0.06 * s, 0.25, 0);
    g.userData.bob = b;
  },
  rainbow(g) {
    ['#ff4a5a', '#ff9a3a', '#ffd23a', '#5ad17a', '#4f8ef7', '#9b6bff'].forEach((c, i) =>
      mesh(g, torus(0.5 - i * 0.05, 0.025, Math.PI), M(c), 0, 0, 0));
    for (const s of [-1, 1]) mesh(g, ball(0.12, 1), M('#ffffff'), 0.42 * s, 0.05, 0);
  },
  cloudCastle(g) {
    const w = M('#f6f8ff');
    mesh(g, box(0.44, 0.3, 0.44), w, 0, 0.15, 0);
    for (const [x, z] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) {
      mesh(g, cyl(0.07, 0.07, 0.45, 8), w, x, 0.22, z);
      mesh(g, cone(0.1, 0.2, 8), M('#8ac8ff'), x, 0.55, z);
    }
    mesh(g, cyl(0.12, 0.12, 0.35, 10), w, 0, 0.45, 0);
    mesh(g, cone(0.16, 0.28, 10), M('#ffd23a'), 0, 0.76, 0);
    for (let i = 0; i < 6; i++) mesh(g, ball(0.12, 1), w, Math.sin(i) * 0.32, 0.02, Math.cos(i) * 0.32);
  },
  /* ----- 巨龍之巢 ----- */
  dragonStatue(g) {
    const c = M('#5a3a6a', { metalness: 0.3 });
    mesh(g, box(0.34, 0.1, 0.4), M('#4a4050'), 0, 0.05, 0);
    mesh(g, sph(0.18), c, 0, 0.28, 0).scale.set(1, 0.9, 1.3);
    mesh(g, cyl(0.06, 0.09, 0.3, 7), c, 0, 0.5, 0.16, 0.6);
    mesh(g, cone(0.08, 0.22, 6), c, 0, 0.66, 0.32, Math.PI / 2 + 0.3);
    for (const s of [-1, 1]) {
      mesh(g, cone(0.025, 0.12, 5), M('#e8d0a0'), 0.05 * s, 0.74, 0.24, -0.6);
      const wing = mesh(g, cone(0.22, 0.4, 3), c, 0.24 * s, 0.48, -0.05, 0, 0, -0.9 * s);
      wing.scale.z = 0.15;
      mesh(g, ball(0.018), G('#ffd23a', 3), 0.04 * s, 0.68, 0.34);
    }
  },
  goldPile(g) {
    mesh(g, cone(0.38, 0.3, 10), M('#f2c14e', { metalness: 0.8, roughness: 0.3 }), 0, 0.15, 0);
    for (let i = 0; i < 10; i++) mesh(g, cyl(0.04, 0.04, 0.012, 10), M('#ffd84a', { metalness: 0.8, roughness: 0.25 }), Math.sin(i * 2.4) * (0.2 + (i % 3) * 0.06), 0.03, Math.cos(i * 2.4) * (0.2 + (i % 3) * 0.06), 0.4);
    mesh(g, new THREE.OctahedronGeometry(0.06), G('#ff4a6a', 1.5), 0.05, 0.3, 0.05);
    mesh(g, new THREE.OctahedronGeometry(0.05), G('#4ad1ff', 1.5), -0.1, 0.22, 0.12);
  },
  /* ----- 南瓜鬼鎮 ----- */
  hauntedHouse(g) {
    mesh(g, box(0.44, 0.44, 0.38), M('#4a4058'), 0, 0.22, 0, 0, 0, 0.04);
    mesh(g, cone(0.38, 0.36, 4), M('#2a2438'), 0, 0.62, 0, 0, Math.PI / 4, 0.06);
    mesh(g, box(0.16, 0.35, 0.16), M('#4a4058'), 0.2, 0.55, -0.08);
    mesh(g, cone(0.14, 0.24, 4), M('#2a2438'), 0.2, 0.84, -0.08, 0, Math.PI / 4);
    for (const [x, y] of [[-0.1, 0.3], [0.1, 0.3], [0.2, 0.6]]) mesh(g, box(0.08, 0.08, 0.02), G('#c8ff5a', 1.8), x, y, 0.2);
    mesh(g, box(0.1, 0.16, 0.02), M('#1a1420'), 0, 0.08, 0.2);
  },
  pumpkinGiant(g) {
    for (let i = 0; i < 8; i++) mesh(g, sph(0.24, 12, 10), M('#ff7a1a'), Math.sin(i * 0.785) * 0.13, 0.26, Math.cos(i * 0.785) * 0.13).scale.set(0.75, 1, 0.75);
    mesh(g, cyl(0.03, 0.05, 0.14, 6), M('#3a6a2a'), 0, 0.55, 0, 0, 0, 0.3);
    for (const s of [-1, 1]) mesh(g, cone(0.05, 0.07, 3), G('#ffd23a', 2.5), 0.1 * s, 0.32, 0.34, Math.PI / 2, 0, Math.PI);
    mesh(g, box(0.22, 0.05, 0.02), G('#ffd23a', 2.5), 0, 0.18, 0.36);
  },
  graveyard(g) {
    for (const [x, z, r] of [[-0.25, 0, 0.1], [0, -0.1, -0.1], [0.25, 0.02, 0.2]]) {
      mesh(g, box(0.14, 0.24, 0.05), M('#8a8f98'), x, 0.12, z, 0, 0, r);
      mesh(g, cyl(0.07, 0.07, 0.05, 10, 1), M('#8a8f98'), x - Math.sin(r) * 0.12, 0.24, z, Math.PI / 2, 0, r);
    }
    for (let i = 0; i < 7; i++) mesh(g, box(0.02, 0.18, 0.02), M('#2a2438'), -0.42 + i * 0.14, 0.09, 0.25);
    mesh(g, box(0.9, 0.02, 0.02), M('#2a2438'), 0, 0.15, 0.25);
    mesh(g, cyl(0.03, 0.05, 0.6, 5), M('#3a2a2a'), 0.35, 0.3, -0.2, 0, 0, -0.15); // 枯樹
  },
  cauldron(g) {
    mesh(g, sph(0.24, 14, 10), M('#2a2a32', { metalness: 0.5 }), 0, 0.22, 0).scale.y = 0.85;
    mesh(g, cyl(0.2, 0.2, 0.02, 14), G('#7aff4a', 1.5), 0, 0.38, 0);
    mesh(g, torus(0.2, 0.025), M('#2a2a32'), 0, 0.38, 0, Math.PI / 2);
    for (let i = 0; i < 3; i++) mesh(g, ball(0.04, 1), G('#aaff7a', 1.2), Math.sin(i * 2) * 0.08, 0.44 + i * 0.06, Math.cos(i * 2) * 0.08);
    for (let i = 0; i < 3; i++) mesh(g, cyl(0.02, 0.02, 0.14, 4), M('#5a3a22'), Math.sin(i * 2.1) * 0.2, 0.04, Math.cos(i * 2.1) * 0.2, 0.5);
  },
  /* ----- 東方仙山 ----- */
  pagoda(g) {
    for (let i = 0; i < 4; i++) {
      const w = 0.36 - i * 0.06;
      mesh(g, box(w * 0.75, 0.16, w * 0.75), M('#c8402a'), 0, 0.08 + i * 0.22, 0);
      mesh(g, cone(w * 0.85, 0.08, 4), M('#2a5a4a'), 0, 0.2 + i * 0.22, 0, 0, Math.PI / 4);
    }
    mesh(g, cyl(0.01, 0.015, 0.2, 5), M('#d9a441'), 0, 1.0, 0);
    mesh(g, ball(0.03), G('#ffd23a', 2), 0, 1.1, 0);
  },
  archGate(g) {
    for (const s of [-1, 1]) mesh(g, cyl(0.04, 0.045, 0.6, 8), M('#d0302a'), 0.3 * s, 0.3, 0);
    mesh(g, box(0.86, 0.06, 0.1), M('#2a2a32'), 0, 0.64, 0);
    mesh(g, box(0.72, 0.05, 0.08), M('#d0302a'), 0, 0.52, 0);
    mesh(g, box(0.16, 0.1, 0.02), M('#d9a441'), 0, 0.58, 0.05);
  },
  bell(g) {
    for (const s of [-1, 1]) mesh(g, box(0.05, 0.6, 0.05), M('#7a3a2a'), 0.26 * s, 0.3, 0);
    mesh(g, cone(0.4, 0.14, 4), M('#2a5a4a'), 0, 0.68, 0, 0, Math.PI / 4).scale.z = 0.6;
    mesh(g, cyl(0.12, 0.18, 0.3, 12), M('#b88a3a', { metalness: 0.7, roughness: 0.35 }), 0, 0.38, 0);
    mesh(g, cyl(0.03, 0.03, 0.5, 6), M('#8b5a2b'), 0.3, 0.35, 0, 0, 0, Math.PI / 2);
  },
  teaHouse(g) {
    mesh(g, box(0.5, 0.26, 0.36), M('#f2e6d0'), 0, 0.13, 0);
    for (const x of [-0.24, 0.24]) mesh(g, box(0.03, 0.26, 0.37), M('#7a3a2a'), x, 0.13, 0);
    const roof = mesh(g, cone(0.46, 0.2, 4), M('#3a4a5a'), 0, 0.36, 0, 0, Math.PI / 4);
    roof.scale.z = 0.8;
    for (const s of [-1, 1]) mesh(g, sph(0.05), G('#ff5a3a', 1.5), 0.2 * s, 0.22, 0.22).scale.y = 1.3; // 燈籠
  },
  /* ----- 維京峽灣 ----- */
  longhouse(g) {
    mesh(g, box(0.36, 0.22, 0.62), M('#8b5a2b'), 0, 0.11, 0);
    for (const s of [-1, 1]) mesh(g, box(0.3, 0.02, 0.66), M('#c8a86a'), 0.12 * s, 0.32, 0, 0, 0, 0.75 * s);
    mesh(g, cone(0.04, 0.16, 4), M('#7a4a2a'), 0, 0.5, 0.32, 0.4);
    mesh(g, box(0.1, 0.14, 0.02), M('#4a2a1a'), 0, 0.07, 0.32);
    for (const z of [-0.2, 0.15]) mesh(g, cyl(0.07, 0.07, 0.015, 10), M(z > 0 ? '#e04848' : '#4f8ef7'), 0.185, 0.12, z, 0, 0, Math.PI / 2); // 盾牌
  },
  longship(g) {
    mesh(g, box(0.18, 0.12, 0.7), M('#7a4a2a'), 0, 0.08, 0);
    for (const s of [-1, 1]) mesh(g, cyl(0.03, 0.04, 0.25, 6), M('#7a4a2a'), 0, 0.2, 0.36 * s, 0.6 * s);
    mesh(g, cyl(0.015, 0.015, 0.6, 5), M('#5a3a22'), 0, 0.45, 0);
    for (let i = 0; i < 4; i++) mesh(g, box(0.38, 0.07, 0.01), M(i % 2 ? '#ffffff' : '#e04848'), 0, 0.36 + i * 0.07, 0.02);
    for (let i = 0; i < 4; i++) for (const s of [-1, 1]) mesh(g, cyl(0.05, 0.05, 0.01, 10), M(['#ffd23a', '#4f8ef7'][i % 2]), 0.095 * s, 0.1, -0.24 + i * 0.16, 0, 0, Math.PI / 2);
  },
  runestone(g) {
    mesh(g, box(0.26, 0.6, 0.1), M('#8a8f98'), 0, 0.3, 0, 0, 0, 0.05);
    for (let i = 0; i < 4; i++) mesh(g, box(0.1 - (i % 2) * 0.04, 0.02, 0.01), G('#7ee8fa', 1.2), 0, 0.15 + i * 0.12, 0.051);
    mesh(g, box(0.02, 0.4, 0.01), G('#7ee8fa', 1.2), 0, 0.33, 0.052);
  },
  watchtower(g) {
    for (const [x, z] of [[-0.12, -0.12], [0.12, -0.12], [-0.12, 0.12], [0.12, 0.12]]) mesh(g, cyl(0.025, 0.03, 0.7, 5), M('#7a5230'), x, 0.35, z);
    mesh(g, box(0.36, 0.16, 0.36), M('#8b5a2b'), 0, 0.72, 0);
    mesh(g, cone(0.3, 0.24, 4), M('#5a3a22'), 0, 0.92, 0, 0, Math.PI / 4);
    mesh(g, ball(0.04), G('#ff9a3a', 2.5), 0, 0.84, 0);
  },
  /* ----- 蒸汽飛船港 ----- */
  airship(g) {
    const s = new THREE.Group(); s.position.y = 0.6; g.add(s);
    mesh(s, sph(0.22, 14, 10), M('#c8904f'), 0, 0, 0).scale.set(1, 0.8, 2);
    for (const z of [-0.2, 0, 0.2]) mesh(s, torus(0.2, 0.012), M('#6b4a2a'), 0, 0, z).scale.y = 0.85;
    mesh(s, box(0.14, 0.1, 0.26), M('#6b4a2a'), 0, -0.24, 0);
    mesh(s, cone(0.1, 0.12, 4), M('#a8643a'), 0, 0, -0.48, -Math.PI / 2);
    mesh(g, cyl(0.02, 0.02, 0.4, 5), M('#555'), 0, 0.2, 0);
    g.userData.bob = s;
  },
  clockTower(g) {
    mesh(g, box(0.26, 0.9, 0.26), M('#9a6a4a'), 0, 0.45, 0);
    mesh(g, cone(0.22, 0.3, 4), M('#4a5a6a', { metalness: 0.5 }), 0, 1.05, 0, 0, Math.PI / 4);
    mesh(g, cyl(0.1, 0.1, 0.02, 16), M('#fff8e7'), 0, 0.72, 0.135, Math.PI / 2);
    const h = new THREE.Group(); h.position.set(0, 0.72, 0.15); g.add(h);
    mesh(h, box(0.012, 0.08, 0.01), M('#1d1b3a'), 0, 0.03, 0);
    g.userData.spin = h;
    for (const s of [-1, 1]) mesh(g, cyl(0.06, 0.06, 0.02, 8), M('#d9a441', { metalness: 0.7 }), 0.135 * s, 0.4, 0, 0, 0, Math.PI / 2);
  },
  /* ----- 外星蟲巢 ----- */
  alienPod(g) {
    mesh(g, sph(0.24, 14, 10), M('#7a3a8a', { roughness: 0.4 }), 0, 0.28, 0).scale.y = 1.3;
    for (let i = 0; i < 5; i++) mesh(g, sph(0.05), G('#5affb0', 1.8), Math.sin(i * 1.26) * 0.2, 0.2 + (i % 2) * 0.15, Math.cos(i * 1.26) * 0.2);
    mesh(g, torus(0.24, 0.05), M('#4a2a5a'), 0, 0.04, 0, Math.PI / 2);
  },
  tentaclePlant(g) {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      mesh(g, cone(0.06, 0.6, 6), M('#c84a8a'), Math.sin(a) * 0.1, 0.3, Math.cos(a) * 0.1, Math.cos(a) * 0.4, 0, -Math.sin(a) * 0.4);
      mesh(g, ball(0.04), G('#ffd23a', 2), Math.sin(a) * 0.22, 0.58, Math.cos(a) * 0.22);
    }
    mesh(g, sph(0.12), M('#8a2a5a'), 0, 0.06, 0);
  },
  /* ----- 玩具王國 ----- */
  toyBlocks(g) {
    const colors = ['#e04848', '#4f8ef7', '#ffd23a', '#4fd1a5', '#ff8a3c'];
    for (let i = 0; i < 5; i++) mesh(g, box(0.2, 0.2, 0.2), M(colors[i]), (i % 2) * 0.06 - 0.03, 0.1 + i * 0.2, 0, 0, i * 0.3);
  },
  teddy(g) {
    const fur = M('#c8904f');
    mesh(g, sph(0.22), fur, 0, 0.24, 0).scale.y = 1.1;
    mesh(g, sph(0.15), M('#f2d8b0'), 0, 0.22, 0.1).scale.z = 0.6;
    mesh(g, sph(0.17), fur, 0, 0.56, 0);
    for (const s of [-1, 1]) {
      mesh(g, sph(0.07), fur, 0.14 * s, 0.7, 0);
      mesh(g, sph(0.08), fur, 0.22 * s, 0.32, 0.05);
      mesh(g, sph(0.08), fur, 0.12 * s, 0.06, 0.12);
      mesh(g, sph(0.022), M('#1d1b3a'), 0.06 * s, 0.6, 0.15);
    }
    mesh(g, sph(0.05), M('#f2d8b0'), 0, 0.52, 0.15);
    mesh(g, sph(0.02), M('#1d1b3a'), 0, 0.54, 0.2);
    mesh(g, torus(0.1, 0.025), M('#e04848'), 0, 0.42, 0, Math.PI / 2);
  },
  spinningTop(g) {
    const top = new THREE.Group(); g.add(top);
    mesh(top, cone(0.3, 0.4, 12), M('#ff6fa8'), 0, 0.3, 0, Math.PI);
    mesh(top, cyl(0.3, 0.3, 0.06, 12), M('#ffd23a'), 0, 0.53, 0);
    mesh(top, cyl(0.04, 0.04, 0.2, 8), M('#4f8ef7'), 0, 0.64, 0);
    g.userData.spinY = top;
  },
  toyTrain(g) {
    mesh(g, box(0.3, 0.2, 0.2), M('#e04848'), -0.05, 0.16, 0);
    mesh(g, box(0.14, 0.26, 0.2), M('#4f8ef7'), -0.24, 0.19, 0);
    mesh(g, cyl(0.04, 0.05, 0.14, 8), M('#2a2a32'), 0.04, 0.33, 0);
    mesh(g, box(0.26, 0.16, 0.18), M('#ffd23a'), 0.3, 0.14, 0);
    for (const x of [-0.26, -0.1, 0.06, 0.24, 0.38]) for (const s of [-1, 1]) mesh(g, cyl(0.05, 0.05, 0.02, 10), M('#2a2a32'), x, 0.05, 0.1 * s, Math.PI / 2);
  },
  /* ----- 翡翠城 ----- */
  emeraldTower(g) {
    const em = M('#3ad17a', { roughness: 0.25, metalness: 0.2 });
    mesh(g, cyl(0.2, 0.25, 0.4, 8), em, 0, 0.2, 0);
    mesh(g, cyl(0.12, 0.16, 0.5, 8), em, 0, 0.6, 0);
    mesh(g, cone(0.14, 0.4, 8), M('#2ab868', { roughness: 0.2 }), 0, 1.05, 0);
    for (const s of [-1, 1]) { mesh(g, cyl(0.06, 0.08, 0.5, 8), em, 0.3 * s, 0.25, 0); mesh(g, cone(0.08, 0.2, 8), em, 0.3 * s, 0.6, 0); }
    mesh(g, new THREE.OctahedronGeometry(0.05), G('#a8ffc8', 3), 0, 1.3, 0);
  },
  scarecrow(g) {
    mesh(g, cyl(0.02, 0.025, 0.6, 5), M('#7a5230'), 0, 0.3, 0);
    mesh(g, cyl(0.015, 0.015, 0.5, 5), M('#7a5230'), 0, 0.42, 0, 0, 0, Math.PI / 2);
    mesh(g, box(0.2, 0.22, 0.1), M('#4f7ad1'), 0, 0.38, 0);
    mesh(g, sph(0.1), M('#e8d8a8'), 0, 0.6, 0);
    mesh(g, cone(0.12, 0.18, 8), M('#4a3a2a'), 0, 0.74, 0);
    mesh(g, cyl(0.16, 0.16, 0.01, 10), M('#4a3a2a'), 0, 0.66, 0);
    for (const s of [-1, 1]) mesh(g, cone(0.03, 0.08, 4), M('#e8c35a'), 0.27 * s, 0.42, 0, 0, 0, -Math.PI / 2 * s);
  },
  /* ----- 聖誕北極 ----- */
  workshop(g) {
    mesh(g, box(0.56, 0.34, 0.4), M('#c84030'), 0, 0.17, 0);
    mesh(g, cone(0.45, 0.3, 4), M('#ffffff'), 0, 0.49, 0, 0, Math.PI / 4);
    mesh(g, box(0.12, 0.18, 0.02), M('#3a6a2a'), 0, 0.09, 0.21);
    for (const x of [-0.18, 0.18]) mesh(g, box(0.1, 0.09, 0.02), G('#ffd23a', 2), x, 0.22, 0.21);
    mesh(g, box(0.08, 0.2, 0.08), M('#8a7a6a'), 0.16, 0.58, -0.05);
    mesh(g, torus(0.06, 0.02), M('#3a8a3a'), 0, 0.3, 0.215);
  },
  xmasTree(g) {
    mesh(g, cyl(0.04, 0.05, 0.14, 6), M('#6b4a2a'), 0, 0.07, 0);
    for (let i = 0; i < 4; i++) mesh(g, cone(0.36 - i * 0.07, 0.3, 8), M('#2f7d55'), 0, 0.26 + i * 0.18, 0);
    for (let i = 0; i < 12; i++) mesh(g, ball(0.03), G(['#ff4a5a', '#ffd23a', '#4ad1ff'][i % 3], 1.8), Math.sin(i * 1.7) * (0.28 - i * 0.018), 0.22 + i * 0.05, Math.cos(i * 1.7) * (0.28 - i * 0.018));
    mesh(g, new THREE.OctahedronGeometry(0.07), G('#ffd23a', 3), 0, 0.98, 0);
  },
  sleigh(g) {
    mesh(g, box(0.4, 0.16, 0.24), M('#c84030'), 0, 0.18, 0);
    mesh(g, box(0.12, 0.16, 0.24), M('#c84030'), -0.18, 0.3, 0);
    for (const s of [-1, 1]) mesh(g, box(0.56, 0.02, 0.02), M('#d9a441', { metalness: 0.7 }), 0.02, 0.06, 0.11 * s);
    for (const s of [-1, 1]) mesh(g, torus(0.05, 0.012, Math.PI), M('#d9a441', { metalness: 0.7 }), 0.3, 0.1, 0.11 * s, 0, 0, -Math.PI / 2);
    mesh(g, sph(0.12), M('#8a4a2a'), 0.06, 0.32, 0).scale.set(1, 0.8, 0.9); // 禮物袋
  },
  /* ----- 叢林神殿 ----- */
  stepPyramid(g) {
    for (let i = 0; i < 4; i++) mesh(g, box(0.7 - i * 0.15, 0.14, 0.7 - i * 0.15), M(i % 2 ? '#8a9a6a' : '#7a8a5a'), 0, 0.07 + i * 0.14, 0);
    mesh(g, box(0.16, 0.16, 0.16), M('#6a7a4a'), 0, 0.64, 0);
    mesh(g, box(0.12, 0.6, 0.02), M('#6a7a4a'), 0, 0.3, 0.33, -0.55);
    mesh(g, ball(0.04), G('#ffd23a', 2.5), 0, 0.76, 0);
  },
  stoneIdol(g) {
    const s = M('#6a7a5a');
    mesh(g, box(0.34, 0.5, 0.28), s, 0, 0.25, 0);
    for (const x of [-0.08, 0.08]) mesh(g, box(0.07, 0.07, 0.02), G('#5affb0', 1.5), x, 0.36, 0.15);
    mesh(g, box(0.2, 0.06, 0.02), M('#3a4a2a'), 0, 0.16, 0.15);
    mesh(g, box(0.42, 0.08, 0.32), s, 0, 0.54, 0);
    for (let i = 0; i < 3; i++) mesh(g, cone(0.04, 0.12, 4), M('#4a8a3a'), -0.12 + i * 0.12, 0.62, 0);
  },
  totem(g) {
    const cs = ['#c84030', '#d9a441', '#3a6aa8', '#3a8a5a'];
    for (let i = 0; i < 4; i++) {
      mesh(g, cyl(0.1, 0.11, 0.2, 8), M(cs[i]), 0, 0.1 + i * 0.2, 0);
      for (const x of [-0.04, 0.04]) mesh(g, sph(0.02), M('#ffffff'), x, 0.14 + i * 0.2, 0.095);
    }
    for (const s of [-1, 1]) mesh(g, box(0.2, 0.04, 0.06), M('#d9a441'), 0.15 * s, 0.68, 0, 0, 0, 0.3 * s);
  },
});

/* =========================================================
 * 追加裝飾（InstancedMesh 零件）
 * ======================================================= */
Object.assign(DECOR, {
  fern: () => [[T(cone(0.1, 0.18, 5), 0, 0.09, 0), '#4caf50', true], [T(cone(0.07, 0.14, 5), 0.06, 0.07, 0.03), '#5ac95a']],
  bamboo: () => [[T(cyl(0.018, 0.02, 0.5, 5), 0, 0.25, 0), '#8ac84a'], [T(cyl(0.015, 0.018, 0.38, 5), 0.05, 0.19, 0.02), '#9ad85a'], [T(cone(0.06, 0.1, 4), 0, 0.5, 0), '#5aa83a']],
  crystalD: () => [[T(new THREE.OctahedronGeometry(0.06).scale(1, 2.6, 1), 0, 0.15, 0), '#b48cff', 'glow'], [T(new THREE.OctahedronGeometry(0.04).scale(1, 2.2, 1), 0.06, 0.08, 0), '#8af0ff', 'glow']],
  cloudD: () => [[T(ball(0.1, 1), 0, 0.06, 0), '#ffffff'], [T(ball(0.07, 1), 0.1, 0.04, 0), '#f4f8ff']],
  tomb: () => [[T(box(0.08, 0.14, 0.03), 0, 0.07, 0), '#8a8f98'], [T(cyl(0.04, 0.04, 0.03, 8, 1).rotateX(Math.PI / 2), 0, 0.14, 0), '#8a8f98']],
  block: () => [[T(box(0.12, 0.12, 0.12), 0, 0.06, 0), '#4f8ef7', true]],
  column: () => [[T(cyl(0.04, 0.05, 0.3, 8), 0, 0.15, 0), '#e8e0d0'], [T(box(0.11, 0.03, 0.11), 0, 0.3, 0), '#d8d0c0']],
  jungle: () => [[T(cyl(0.03, 0.05, 0.4, 5), 0, 0.2, 0), '#6b4a2a'], [T(ball(0.2), 0, 0.46, 0), '#2f8f4a', true], [T(cone(0.12, 0.08, 6), 0, 0.6, 0), '#3fa55a']],
  candle: () => [[T(cyl(0.025, 0.025, 0.12, 6), 0, 0.06, 0), '#f2ead6'], [T(ball(0.02), 0, 0.14, 0), '#ffb84a', 'glow']],
  star: () => [[T(new THREE.OctahedronGeometry(0.06), 0, 0.1, 0), '#ffd23a', 'glow']],
});
