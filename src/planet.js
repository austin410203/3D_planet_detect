/**
 * planet.js — 星球本體建立邏輯
 * --------------------------------------------------
 * - 以 SphereGeometry 為基底，依「生態區（biome）」位移頂點並上色（low-poly 風格）
 * - 生態區：草地、沙漠、雪地、海洋
 * - 一層半透明海面球殼 + Fresnel 大氣層光暈
 * - 匯出 getSurfaceRadius()，讓物件能準確貼在地表上
 */
import * as THREE from 'three';

/** 星球基準半徑 */
export const PLANET_RADIUS = 5;
/** 海平面半徑（略高於海床） */
export const SEA_RADIUS = PLANET_RADIUS - 0.02;

/* ---------- 簡易 3D 雜訊（value noise），用於地形起伏與邊界擾動 ---------- */
function hash(x, y, z) {
  // 以三角函數產生偽隨機數，結果 0~1
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}
function smooth(t) { return t * t * (3 - 2 * t); }
function valueNoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = smooth(x - xi), yf = smooth(y - yi), zf = smooth(z - zi);
  const lerp = (a, b, t) => a + (b - a) * t;
  // 三線性插值 8 個晶格點
  const c = (dx, dy, dz) => hash(xi + dx, yi + dy, zi + dz);
  const x00 = lerp(c(0, 0, 0), c(1, 0, 0), xf);
  const x10 = lerp(c(0, 1, 0), c(1, 1, 0), xf);
  const x01 = lerp(c(0, 0, 1), c(1, 0, 1), xf);
  const x11 = lerp(c(0, 1, 1), c(1, 1, 1), xf);
  return lerp(lerp(x00, x10, yf), lerp(x01, x11, yf), zf);
}
/** 分形雜訊（多層疊加），回傳約 -0.5 ~ 0.5 */
function fbm(v) {
  let sum = 0, amp = 0.5, freq = 1.4;
  for (let i = 0; i < 3; i++) {
    sum += amp * (valueNoise(v.x * freq + 10, v.y * freq + 10, v.z * freq + 10) - 0.5);
    freq *= 2.1; amp *= 0.5;
  }
  return sum;
}

/* ---------- 經緯度 ↔ 方向向量 ---------- */
/**
 * 球面座標轉笛卡爾座標（單位向量）
 * @param {number} lat 緯度（度），北極 = 90
 * @param {number} lon 經度（度）
 */
export function latLonToDir(lat, lon) {
  const phi = THREE.MathUtils.degToRad(90 - lat);   // 與 +Y 軸夾角
  const theta = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(
    Math.sin(phi) * Math.sin(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.cos(theta)
  ).normalize();
}

/* ---------- 生態區定義 ---------- */
// 每個生態區有一個「中心方向」，地表某點歸屬於最近的中心（加入雜訊讓邊界不規則）
const BIOME_CENTERS = [
  { type: 'grass',  dir: latLonToDir(15, 0) },
  { type: 'grass',  dir: latLonToDir(-20, 70) },
  { type: 'desert', dir: latLonToDir(5, 140) },
  { type: 'ocean',  dir: latLonToDir(0, -110) },
  { type: 'ocean',  dir: latLonToDir(-35, -170) },
];

/** 生態區配色（low-poly 粉彩色調） */
const PALETTE = {
  grass:  [new THREE.Color('#8fd14f'), new THREE.Color('#6dbb3c')],
  desert: [new THREE.Color('#f2c76e'), new THREE.Color('#e0a955')],
  snow:   [new THREE.Color('#f4f8ff'), new THREE.Color('#d6e4f5')],
  ocean:  [new THREE.Color('#e9d9a6'), new THREE.Color('#d8c48a')], // 海床（沙）
  shore:  [new THREE.Color('#f5e3a8'), new THREE.Color('#ecd590')],
};

/**
 * 取得某方向的生態區
 * @param {THREE.Vector3} dir 單位方向向量
 * @returns {'grass'|'desert'|'snow'|'ocean'}
 */
export function getBiome(dir) {
  // 高緯度為雪地（加雜訊讓雪線起伏）
  const snowLine = 0.78 + fbm(dir.clone().multiplyScalar(2)) * 0.25;
  if (Math.abs(dir.y) > snowLine) return 'snow';

  // 找出最接近的生態區中心
  const jitter = fbm(dir.clone().multiplyScalar(1.7)) * 0.5;
  let best = null, bestDot = -Infinity;
  for (const b of BIOME_CENTERS) {
    const d = dir.dot(b.dir) + (b.type === 'ocean' ? jitter : -jitter * 0.5);
    if (d > bestDot) { bestDot = d; best = b; }
  }
  return best.type;
}

/**
 * 取得某方向的地表半徑（物件貼附用）
 * @param {THREE.Vector3} dir 單位方向向量
 */
export function getSurfaceRadius(dir) {
  const biome = getBiome(dir);
  const n = fbm(dir);
  let h = 0;
  switch (biome) {
    case 'ocean':  h = -0.28 + n * 0.1; break;           // 海床低於海平面
    case 'desert': h = 0.12 + n * 0.16; break;           // 沙丘起伏
    case 'snow':   h = 0.12 + Math.max(0, n) * 0.6; break; // 雪山較高
    default:       h = 0.14 + n * 0.2;                   // 草原丘陵
  }
  return PLANET_RADIUS + h;
}

/**
 * 建立星球（地形 + 海面 + 大氣層）
 * @returns {{ group: THREE.Group, terrain: THREE.Mesh, atmosphere: THREE.Mesh }}
 */
export function createPlanet() {
  const group = new THREE.Group();
  group.name = 'planet';

  /* ---------- 地形 ---------- */
  // 使用非索引幾何，讓每個三角面獨立上色，形成 low-poly 平面著色
  const geo = new THREE.SphereGeometry(PLANET_RADIUS, 72, 48).toNonIndexed();
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const dir = new THREE.Vector3();

  // 1) 依地表半徑位移頂點
  for (let i = 0; i < pos.count; i++) {
    dir.fromBufferAttribute(pos, i).normalize();
    const r = getSurfaceRadius(dir);
    pos.setXYZ(i, dir.x * r, dir.y * r, dir.z * r);
  }

  // 2) 每個三角面依其中心點決定顏色（同一面三個頂點同色）
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const center = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i);
    b.fromBufferAttribute(pos, i + 1);
    c.fromBufferAttribute(pos, i + 2);
    center.copy(a).add(b).add(c).divideScalar(3);
    const r = center.length();
    const d = center.normalize();
    let biome = getBiome(d);
    // 海岸線：靠近海平面的地面呈現沙灘色
    if (biome !== 'snow' && biome !== 'ocean' && r < SEA_RADIUS + 0.07) biome = 'shore';
    else if (biome === 'ocean' && r > SEA_RADIUS - 0.06) biome = 'shore';
    const pal = PALETTE[biome];
    // 兩色隨機交錯，增加 low-poly 質感
    const col = pal[0].clone().lerp(pal[1], hash(d.x * 50, d.y * 50, d.z * 50));
    for (let k = 0; k < 3; k++) col.toArray(colors, (i + k) * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const terrain = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9, metalness: 0 })
  );
  terrain.name = 'terrain';
  terrain.receiveShadow = true;
  terrain.castShadow = true;
  group.add(terrain);

  /* ---------- 海面（半透明球殼） ---------- */
  const sea = new THREE.Mesh(
    new THREE.IcosahedronGeometry(SEA_RADIUS, 6),
    new THREE.MeshStandardMaterial({
      color: '#3cc6d6', transparent: true, opacity: 0.78,
      roughness: 0.25, metalness: 0.1, flatShading: true,
    })
  );
  sea.name = 'sea';
  sea.receiveShadow = true;
  group.add(sea);

  /* ---------- 大氣層光暈（Fresnel Shader） ---------- */
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(PLANET_RADIUS * 1.12, 64, 48),
    new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color('#7fd8ff') },
        uIntensity: { value: 0.7 },
      },
      vertexShader: /* glsl */`
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }`,
      fragmentShader: /* glsl */`
        uniform vec3 uColor;
        uniform float uIntensity;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          // 背面渲染：法線朝內，邊緣（視線與法線垂直處）最亮
          float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 3.0);
          float rim = (1.0 - fresnel) * fresnel * 2.2;
          gl_FragColor = vec4(uColor * uIntensity, clamp(rim, 0.0, 1.0));
        }`,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  atmosphere.name = 'atmosphere';

  return { group, terrain, sea, atmosphere };
}
