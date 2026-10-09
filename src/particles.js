/**
 * particles.js — 粒子效果
 * --------------------------------------------------
 * - createStarfield()：以 THREE.Points 建立會閃爍的星空背景（自訂 shader）
 * - ParticleBurst：點擊物件時的彩色粒子爆發（物件池重複利用，避免 GC 卡頓）
 */
import * as THREE from 'three';

/* =========================================================
 * 星空背景
 * ======================================================= */
export function createStarfield(count = 2500) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const palette = [new THREE.Color('#ffffff'), new THREE.Color('#ffe9b0'), new THREE.Color('#b8d4ff'), new THREE.Color('#ffc2e0')];

  for (let i = 0; i < count; i++) {
    // 在半徑 60~120 的球殼內隨機分布
    const r = 60 + Math.random() * 60;
    const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    positions.set([r * s * Math.cos(th), r * u, r * s * Math.sin(th)], i * 3);
    sizes[i] = Math.random() < 0.06 ? 3 + Math.random() * 2.5 : 0.8 + Math.random() * 1.6;
    phases[i] = Math.random() * Math.PI * 2;
    palette[(Math.random() * palette.length) | 0].toArray(colors, i * 3);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: /* glsl */`
      attribute float aSize;
      attribute float aPhase;
      attribute vec3 color;
      uniform float uTime;
      uniform float uPixelRatio;
      varying vec3 vColor;
      varying float vTwinkle;
      void main() {
        vColor = color;
        // 閃爍：以正弦波改變亮度
        vTwinkle = 0.55 + 0.45 * sin(uTime * 1.8 + aPhase);
        gl_PointSize = aSize * uPixelRatio * (0.8 + vTwinkle * 0.4);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vColor;
      varying float vTwinkle;
      void main() {
        // 圓形柔邊粒子
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor * (0.8 + vTwinkle), a * vTwinkle);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, material);
  points.name = 'starfield';
  points.frustumCulled = false;
  return points;
}

/* =========================================================
 * 點擊粒子爆發
 * ======================================================= */
const BURST_COUNT = 40;      // 每次爆發的粒子數
const POOL_SIZE = 6;         // 同時存在的爆發上限
const LIFETIME = 1.1;        // 粒子壽命（秒）

export class ParticleBurst {
  constructor(scene) {
    this.bursts = [];
    const colors = ['#ffd166', '#ff6b9a', '#7ee8fa', '#a0ff8a', '#ffffff'].map((c) => new THREE.Color(c));

    for (let b = 0; b < POOL_SIZE; b++) {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(BURST_COUNT * 3);
      const col = new Float32Array(BURST_COUNT * 3);
      for (let i = 0; i < BURST_COUNT; i++) colors[i % colors.length].toArray(col, i * 3);
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const material = new THREE.PointsMaterial({
        size: 0.14, vertexColors: true, transparent: true, opacity: 1,
        blending: THREE.AdditiveBlending, depthWrite: false, map: makeDotTexture(),
      });
      const points = new THREE.Points(geo, material);
      points.visible = false;
      points.frustumCulled = false;
      scene.add(points);
      this.bursts.push({ points, velocities: new Float32Array(BURST_COUNT * 3), age: Infinity });
    }
  }

  /**
   * 在指定世界座標產生爆發
   * @param {THREE.Vector3} origin 世界座標
   * @param {THREE.Vector3} normal 爆發主方向（球面法線）
   */
  emit(origin, normal) {
    // 取最舊的一組重複使用
    const burst = this.bursts.reduce((a, b) => (a.age > b.age ? a : b));
    const pos = burst.points.geometry.attributes.position.array;
    const v = new THREE.Vector3();
    for (let i = 0; i < BURST_COUNT; i++) {
      pos[i * 3] = origin.x; pos[i * 3 + 1] = origin.y; pos[i * 3 + 2] = origin.z;
      // 隨機方向 + 偏向法線，讓粒子往天空噴發
      v.randomDirection().multiplyScalar(0.8 + Math.random() * 1.6).addScaledVector(normal, 1.6);
      burst.velocities.set([v.x, v.y, v.z], i * 3);
    }
    burst.points.geometry.attributes.position.needsUpdate = true;
    burst.normal = normal.clone();
    burst.age = 0;
    burst.points.visible = true;
  }

  /** 每幀更新：位移、重力（朝球心）、淡出 */
  update(dt) {
    for (const b of this.bursts) {
      if (b.age > LIFETIME) continue;
      b.age += dt;
      const pos = b.points.geometry.attributes.position.array;
      for (let i = 0; i < BURST_COUNT * 3; i += 3) {
        // 簡易重力：沿法線反方向加速
        b.velocities[i] -= b.normal.x * 3 * dt;
        b.velocities[i + 1] -= b.normal.y * 3 * dt;
        b.velocities[i + 2] -= b.normal.z * 3 * dt;
        pos[i] += b.velocities[i] * dt;
        pos[i + 1] += b.velocities[i + 1] * dt;
        pos[i + 2] += b.velocities[i + 2] * dt;
      }
      b.points.geometry.attributes.position.needsUpdate = true;
      const life = b.age / LIFETIME;
      b.points.material.opacity = 1 - life;
      b.points.material.size = 0.14 * (1 - life * 0.5);
      if (b.age > LIFETIME) b.points.visible = false;
    }
  }
}

/** 以 Canvas 繪製圓形柔光貼圖，讓粒子呈圓點 */
let dotTexture = null;
function makeDotTexture() {
  if (dotTexture) return dotTexture;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.8)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  dotTexture = new THREE.CanvasTexture(c);
  return dotTexture;
}
