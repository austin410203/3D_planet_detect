/**
 * audio.js — 音效與配樂（Web Audio 即時合成，不需要任何音檔）
 * --------------------------------------------------
 * - sfx.xxx()：短音效（點擊、翻找、找到、翻錯、提示、倒數、星星、過關）
 * - playMusic('menu' | level)：配樂。依星球 id 產生固定的 8 小節循環（調性、速度、音色每關不同），
 *   和弦進行 + 低音 + 琶音 + 旋律，關卡中再加上鼓組
 * - iOS 需要使用者手勢才能發聲：第一次觸控時自動解鎖
 * - 設定關掉「配樂／音效」時對應的聲音全部略過
 */
import { settings, onSettingChange } from './settings.js';

let ctx = null, master, musicBus, sfxBus, noiseBuf;

function ensure() {
  if (ctx) return ctx;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);
  musicBus = ctx.createGain();
  musicBus.gain.value = 0.32;
  musicBus.connect(master);
  sfxBus = ctx.createGain();
  sfxBus.gain.value = 0.8;
  sfxBus.connect(master);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return ctx;
}

/** 第一次觸控／按鍵時解鎖音訊（iOS Safari／WKWebView 的規定） */
function unlock() {
  ensure();
  if (suspendedByApp) return;
  const start = () => { if (song && !timer && settings.music) startScheduler(); };
  if (ctx.state === 'running') start();
  else ctx.resume().then(start, () => {});
}
addEventListener('pointerdown', unlock, { capture: true });
addEventListener('keydown', unlock, { capture: true });

/** App 切到背景時整個暫停，回到前景再繼續 */
let suspendedByApp = false;
export function setAudioPaused(p) {
  suspendedByApp = p;
  if (!ctx) return;
  if (p) ctx.suspend(); else ctx.resume();
}

/* =========================================================
 * 合成工具
 * ======================================================= */
const midi = (n) => 440 * 2 ** ((n - 69) / 12);

/** 單音：可滑音、可加低通濾波 */
function tone({ f, f2, type = 'sine', at, dur = 0.15, vol = 0.3, attack = 0.005, bus = sfxBus, lp }) {
  const t0 = at ?? ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f, t0);
  if (f2) osc.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  let node = osc;
  if (lp) {
    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.value = lp;
    osc.connect(flt);
    node = flt;
  }
  node.connect(g).connect(bus);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/** 噪音：翻找聲、鼓組 */
function noise({ at, dur = 0.1, vol = 0.2, freq = 1500, q = 1, type = 'bandpass', bus = sfxBus }) {
  const t0 = at ?? ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const flt = ctx.createBiquadFilter();
  flt.type = type;
  flt.frequency.value = freq;
  flt.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(flt).connect(g).connect(bus);
  src.start(t0, Math.random() * 0.5);
  src.stop(t0 + dur + 0.02);
}

/* =========================================================
 * 音效
 * ======================================================= */
const play = (fn) => () => {
  if (!settings.sfx) return;
  ensure();
  if (ctx.state !== 'running') return;
  fn(ctx.currentTime);
};

export const sfx = {
  tap: play((t) => tone({ f: 880, f2: 1250, type: 'triangle', at: t, dur: 0.07, vol: 0.14 })),
  swipe: play((t) => {
    noise({ at: t, dur: 0.18, vol: 0.12, freq: 1100, q: 0.7 });
    tone({ f: 320, f2: 640, at: t, dur: 0.16, vol: 0.08 });
  }),
  pop: play((t) => tone({ f: 500, f2: 950, at: t, dur: 0.1, vol: 0.18 })),
  search: play((t) => {
    noise({ at: t, dur: 0.16, vol: 0.32, freq: 1700, q: 0.8 });
    noise({ at: t + 0.09, dur: 0.14, vol: 0.22, freq: 2400, q: 0.8 });
  }),
  found: play((t) => {
    [84, 88, 91, 96].forEach((n, i) => tone({ f: midi(n), type: 'triangle', at: t + i * 0.07, dur: 0.3, vol: 0.2 }));
    tone({ f: midi(103), at: t + 0.28, dur: 0.5, vol: 0.06 });
  }),
  wrong: play((t) => {
    tone({ f: 230, f2: 150, type: 'square', at: t, dur: 0.18, vol: 0.1, lp: 1200 });
    tone({ f: 180, f2: 110, type: 'square', at: t + 0.13, dur: 0.22, vol: 0.1, lp: 1000 });
  }),
  hint: play((t) => [88, 93, 96].forEach((n, i) => tone({ f: midi(n), at: t + i * 0.09, dur: 0.6, vol: 0.13 }))),
  tick: play((t) => tone({ f: 660, type: 'square', at: t, dur: 0.1, vol: 0.08, lp: 2200 })),
  go: play((t) => {
    tone({ f: 990, type: 'square', at: t, dur: 0.4, vol: 0.09, lp: 2600 });
    tone({ f: 1320, type: 'triangle', at: t, dur: 0.45, vol: 0.12 });
  }),
  /** 結算時第 i 顆星（0～2），音一顆比一顆高 */
  star: (i) => play((t) => {
    tone({ f: midi(79 + i * 4), type: 'triangle', at: t, dur: 0.35, vol: 0.2 });
    tone({ f: midi(91 + i * 4), at: t + 0.03, dur: 0.5, vol: 0.07 });
  })(),
  fanfare: play((t) => {
    [72, 76, 79, 84].forEach((n, i) => tone({ f: midi(n), type: 'triangle', at: t + i * 0.11, dur: 0.28, vol: 0.18 }));
    [60, 64, 67, 72].forEach((n) => tone({ f: midi(n), type: 'square', at: t + 0.44, dur: 0.9, vol: 0.05, lp: 1800 }));
    tone({ f: midi(84), type: 'triangle', at: t + 0.44, dur: 0.9, vol: 0.16 });
  }),
};

/* =========================================================
 * 配樂
 * ======================================================= */
const SCALE = { major: [0, 2, 4, 7, 9], minor: [0, 3, 5, 7, 10] };       // 五聲音階
const PROG = {                                                          // 和弦進行（相對主音的半音）
  major: [[0, 4, 7], [9, 12, 16], [5, 9, 12], [7, 11, 14]],             // I–vi–IV–V
  minor: [[0, 3, 7], [8, 12, 15], [3, 7, 10], [10, 14, 17]],            // i–VI–III–VII
};
/** 氣氛比較緊張、詭異的星球用小調 */
const MINOR = new Set(['ember', 'pirate', 'giants', 'neon', 'dragon', 'halloween', 'viking', 'alien', 'jungle', 'atlantis']);
const LEAD = ['triangle', 'square', 'sine', 'triangle'];
const STEPS = 64; // 8 小節 × 每小節 8 個八分音符

function hash(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.codePointAt(0), 16777619);
  return h >>> 0;
}
function rng(seed) {
  let s = seed % 2147483647 || 1;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

/** 依星球 id 產生一首固定的循環曲 */
function makeSong(id, menu) {
  const h = hash(id);
  const rand = rng(h);
  const mode = MINOR.has(id) ? 'minor' : 'major';
  const scale = SCALE[mode];
  const root = menu ? 60 : 55 + (h % 8);
  const melody = [];
  let deg = 5;
  for (let s = 0; s < STEPS; s++) {
    const strong = s % 4 === 0;
    if (rand() < (strong ? 0.85 : 0.4)) {
      deg = Math.max(0, Math.min(10, deg + Math.round((rand() - 0.5) * 4)));
      const len = rand() < 0.3 ? 2 : 1;
      melody.push({ s, n: root + 12 + Math.floor(deg / 5) * 12 + scale[deg % 5], len });
    }
  }
  return {
    id, mode, root, melody, drums: !menu,
    step: 60 / (menu ? 88 : 96 + (h % 5) * 6) / 2,   // 八分音符長度（秒）
    lead: menu ? 'triangle' : LEAD[(h >> 3) % LEAD.length],
    prog: PROG[mode],
  };
}

let song = null, timer = null, stepIdx = 0, nextT = 0;

function playStep(s, t) {
  const bar = Math.floor(s / 8) % 4;
  const beat = s % 8;
  const chord = song.prog[bar].map((x) => song.root + x);
  const d = song.step;
  // 低音：每小節第 1、3 拍
  if (beat === 0 || beat === 4) tone({ f: midi(chord[0] - 24), type: 'triangle', at: t, dur: d * 3.6, vol: 0.32, bus: musicBus });
  // 琶音：每個八分音符一個和弦內音
  tone({ f: midi(chord[[0, 1, 2, 1][beat % 4]] + (beat >= 4 ? 12 : 0)), at: t, dur: d * 1.6, vol: 0.07, bus: musicBus });
  // 旋律
  for (const m of song.melody) {
    if (m.s === s) tone({ f: midi(m.n), type: song.lead, at: t, dur: d * 1.8 * m.len, vol: song.lead === 'square' ? 0.06 : 0.13, attack: 0.01, bus: musicBus, lp: 3000 });
  }
  // 鼓組（關卡中才有）
  if (song.drums) {
    if (beat === 0 || beat === 4) tone({ f: 130, f2: 45, at: t, dur: 0.16, vol: 0.5, bus: musicBus });
    if (beat === 2 || beat === 6) noise({ at: t, dur: 0.12, vol: 0.12, freq: 1800, q: 0.6, bus: musicBus });
    if (beat % 2 === 1) noise({ at: t, dur: 0.035, vol: 0.06, freq: 7500, type: 'highpass', bus: musicBus });
  }
}

function startScheduler() {
  if (!ctx || ctx.state !== 'running') return; // 等第一次觸控解鎖後由 unlock() 啟動
  stepIdx = 0;
  nextT = ctx.currentTime + 0.08;
  timer = setInterval(() => {
    while (nextT < ctx.currentTime + 0.15) {
      playStep(stepIdx, nextT);
      nextT += song.step;
      stepIdx = (stepIdx + 1) % STEPS;
    }
  }, 25);
}
function stopScheduler() {
  clearInterval(timer);
  timer = null;
}

/** 播放配樂：'menu' 為選關畫面，否則傳入關卡資料。同一首正在播就不重來 */
export function playMusic(level) {
  const id = level === 'menu' ? 'menu' : level.id;
  if (song?.id === id && timer) return;
  stopScheduler();
  song = makeSong(id, level === 'menu');
  if (settings.music) startScheduler();
}
export function stopMusic() {
  stopScheduler();
  song = null;
}

onSettingChange((name, on) => {
  if (name !== 'music' || !song) return;
  if (on && !timer) startScheduler();
  if (!on) stopScheduler();
});
