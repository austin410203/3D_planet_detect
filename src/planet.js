/**
 * planet.js — 依「主題」生成星球（地形、海面、大氣層）
 * --------------------------------------------------
 * 每顆星球由 theme 描述：
 *   biomes   : 生態區中心 [{ type: 'land1'|'land2'|'sea', lat, lon }]
 *   snowLine : 兩極「peak」地形的範圍（越大越小）
 *   palette  : 各生態區的兩個配色 { land1, land2, peak, sea(海床), shore }
 *   heights  : 各生態區的高度 { land1, land2, peak, sea }
 *   seaColor / seaOpacity / seaGlow : 海面（可以是熔岩、巧克力、機油）
 *   atmosphere : 大氣層顏色
 *   seed     : 雜訊偏移，讓每顆星球地形不同
 * getSurfaceRadius() / getBiome() 以「目前啟用的主題」計算，
 * 讓物件能貼在地表上；切換星球前呼叫 setActiveTheme()。
 */
import * as THREE from 'three';

export const PLANET_RADIUS = 5;
export const SEA_RADIUS = PLANET_RADIUS - 0.02;

/* ---------- 簡易 3D value noise ---------- */
function hash(x, y, z) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}
function smooth(t) { return t * t * (3 - 2 * t); }
function valueNoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = smooth(x - xi), yf = smooth(y - yi), zf = smooth(z - zi);
  const lerp = (a, b, t) => a + (b - a) * t;
  const c = (dx, dy, dz) => hash(xi + dx, yi + dy, zi + dz);
  const x00 = lerp(c(0, 0, 0), c(1, 0, 0), xf), x10 = lerp(c(0, 1, 0), c(1, 1, 0), xf);
  const x01 = lerp(c(0, 0, 1), c(1, 0, 1), xf), x11 = lerp(c(0, 1, 1), c(1, 1, 1), xf);
  return lerp(lerp(x00, x10, yf), lerp(x01, x11, yf), zf);
}
let seed = 10;
/** 分形雜訊，回傳約 -0.5 ~ 0.5 */
export function fbm(v, scale = 1) {
  let sum = 0, amp = 0.5, freq = 1.4 * scale;
  for (let i = 0; i < 3; i++) {
    sum += amp * (valueNoise(v.x * freq + seed, v.y * freq + seed, v.z * freq + seed) - 0.5);
    freq *= 2.1; amp *= 0.5;
  }
  return sum;
}

/** 球面座標（緯度、經度，單位：度）轉單位向量 */
export function latLonToDir(lat, lon) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(Math.sin(phi) * Math.sin(theta), Math.cos(phi), Math.sin(phi) * Math.cos(theta)).normalize();
}

/* ---------- 目前啟用的主題 ---------- */
let theme = null;
let centers = [];
const DEFAULT_HEIGHTS = { land1: 0.14, land2: 0.12, peak: 0.12, sea: -0.28 };

export function setActiveTheme(t) {
  theme = t;
  seed = t.seed ?? 10;
  centers = t.biomes.map((b) => ({ type: b.type, dir: latLonToDir(b.lat, b.lon) }));
}

/** 取得某方向的生態區：'land1' | 'land2' | 'peak' | 'sea' */
export function getBiome(dir) {
  const snowLine = (theme.snowLine ?? 0.78) + fbm(dir.clone().multiplyScalar(2)) * 0.25;
  if (Math.abs(dir.y) > snowLine) return 'peak';
  const jitter = fbm(dir.clone().multiplyScalar(1.7)) * 0.5;
  let best = centers[0], bestDot = -Infinity;
  for (const b of centers) {
    const d = dir.dot(b.dir) + (b.type === 'sea' ? jitter : -jitter * 0.5);
    if (d > bestDot) { bestDot = d; best = b; }
  }
  return best.type;
}

/** 取得某方向的地表半徑 */
export function getSurfaceRadius(dir) {
  const biome = getBiome(dir);
  const n = fbm(dir);
  const h = { ...DEFAULT_HEIGHTS, ...theme.heights };
  switch (biome) {
    case 'sea':   return PLANET_RADIUS + h.sea + n * 0.1;
    case 'land2': return PLANET_RADIUS + h.land2 + n * 0.16;
    case 'peak':  return PLANET_RADIUS + h.peak + Math.max(0, n) * (theme.peakRough ?? 0.6);
    default:      return PLANET_RADIUS + h.land1 + n * 0.2;
  }
}

/** 是否為陸地（物件可放置處） */
export function isLand(dir) {
  return getSurfaceRadius(dir) > SEA_RADIUS + 0.03;
}

/**
 * 建立星球
 * @param {object} t 主題
 * @param {{ detail?: number }} opts detail：細緻度（選關預覽用較低）
 */
export function createPlanet(t, opts = {}) {
  setActiveTheme(t);
  const detail = opts.detail ?? 1;
  const group = new THREE.Group();

  /* ---------- 地形（逐面上色的 low-poly） ---------- */
  const geo = new THREE.SphereGeometry(PLANET_RADIUS, Math.round(72 * detail), Math.round(48 * detail)).toNonIndexed();
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const dir = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    dir.fromBufferAttribute(pos, i).normalize();
    const r = getSurfaceRadius(dir);
    pos.setXYZ(i, dir.x * r, dir.y * r, dir.z * r);
  }
  const pal = {};
  for (const [k, v] of Object.entries(t.palette)) pal[k] = v.map((c) => new THREE.Color(c));
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), center = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i); b.fromBufferAttribute(pos, i + 1); c.fromBufferAttribute(pos, i + 2);
    center.copy(a).add(b).add(c).divideScalar(3);
    const r = center.length();
    const d = center.normalize();
    let biome = getBiome(d);
    if (biome !== 'peak' && biome !== 'sea' && r < SEA_RADIUS + 0.07) biome = 'shore';
    else if (biome === 'sea' && r > SEA_RADIUS - 0.06) biome = 'shore';
    const p = pal[biome];
    const col = p[0].clone().lerp(p[1], hash(d.x * 50, d.y * 50, d.z * 50));
    for (let k = 0; k < 3; k++) col.toArray(colors, (i + k) * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const terrain = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9 }));
  terrain.name = 'terrain';
  terrain.receiveShadow = true;
  terrain.castShadow = true;
  group.add(terrain);

  /* ---------- 海面（水、熔岩、巧克力、機油…） ---------- */
  const seaMat = new THREE.MeshStandardMaterial({
    color: t.seaColor, transparent: (t.seaOpacity ?? 0.78) < 1, opacity: t.seaOpacity ?? 0.78,
    roughness: t.seaRough ?? 0.25, metalness: 0.1, flatShading: true,
    emissive: t.seaGlow ? new THREE.Color(t.seaColor) : new THREE.Color(0), emissiveIntensity: t.seaGlow ?? 0,
  });
  const sea = new THREE.Mesh(new THREE.IcosahedronGeometry(SEA_RADIUS, Math.max(3, Math.round(6 * detail))), seaMat);
  sea.name = 'sea';
  sea.receiveShadow = true;
  group.add(sea);

  /* ---------- 大氣層光暈（Fresnel） ---------- */
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(PLANET_RADIUS * 1.12, 48, 32),
    new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(t.atmosphere) }, uIntensity: { value: t.atmoIntensity ?? 0.7 } },
      vertexShader: /* glsl */`
        varying vec3 vNormal; varying vec3 vViewDir;
        void main() {
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }`,
      fragmentShader: /* glsl */`
        uniform vec3 uColor; uniform float uIntensity;
        varying vec3 vNormal; varying vec3 vViewDir;
        void main() {
          float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 3.0);
          float rim = (1.0 - fresnel) * fresnel * 2.2;
          gl_FragColor = vec4(uColor * uIntensity, clamp(rim, 0.0, 1.0));
        }`,
      side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    })
  );
  group.add(atmosphere);

  return { group, terrain, sea, atmosphere };
}

/** 釋放幾何資源（材質由快取共用，不在此處釋放） */
export function disposeGroup(group) {
  group.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
}
