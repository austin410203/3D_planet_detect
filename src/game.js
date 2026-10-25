/**
 * game.js — 單一關卡的遊戲邏輯
 * --------------------------------------------------
 * - 計時（含翻錯／提示的加秒懲罰），依時間給 1~3 星
 * - Raycaster：hover 藏匿點顯示名稱、點擊搜尋、點擊地標看介紹
 * - 線索手冊、物品欄、提示（第一次標出地標，第二次說出藏匿點種類）
 * - 地標名稱標籤（CSS2D），轉到星球背面時自動隱藏
 */
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { getSurfaceRadius } from './planet.js';
import { SPOTS } from './props.js';
import { fmtTime } from './progress.js';
import { sfx } from './audio.js';
import { haptic } from './haptics.js';
import { t as tr } from './i18n.js';

const WRONG_PENALTY = 3;   // 翻錯地方 +3 秒
const HINT_PENALTY = 15;   // 使用提示 +15 秒

const $ = (id) => document.getElementById(id);

export function createGame({ level, world, camera, domElement, particles, onFinish, onSearch }) {
  const state = {
    time: 0, penalty: 0, running: false, done: false,
    found: new Set(),
    hintLevel: new Map(), // 每個目標的提示階段
  };
  const targets = world.targets; // 本局隨機產生的物品配置與線索
  const cleanup = [];
  const floats = [];

  /* ---------- 地標標籤 ---------- */
  const lmLabels = [];
  for (const lm of world.landmarks.values()) {
    const el = document.createElement('div');
    el.className = 'lm-label';
    el.textContent = lm.name;
    const obj = new CSS2DObject(el);
    obj.position.copy(lm.dir).multiplyScalar(getSurfaceRadius(lm.dir) + lm.height + 0.25);
    world.group.add(obj);
    lmLabels.push({ lm, obj, el });
  }
  // 藏匿點 hover 標籤（共用一個）
  const hoverEl = document.createElement('div');
  hoverEl.className = 'spot-label';
  const hoverObj = new CSS2DObject(hoverEl);
  world.group.add(hoverObj);

  /* ---------- HUD：物品欄與線索手冊 ---------- */
  $('itemSlots').innerHTML = targets.map((t, i) => `<li data-i="${i}" title="${t.name}"><span>${t.emoji}</span></li>`).join('');
  $('journalBody').innerHTML = targets.map((t, i) => `
    <div class="clue" data-i="${i}">
      <div class="clue-head"><b>${t.emoji}</b><strong>${t.name}</strong><span class="tag tag-${t.type}">${tr(`clue.${t.type}`)}</span></div>
      <p>${t.clue}</p>
    </div>`).join('');
  const [t3, t2] = level.stars;
  const span = t2 * 1.2;
  $('mark3').style.left = `${(t3 / span) * 100}%`;
  $('mark2').style.left = `${(t2 / span) * 100}%`;

  /* ---------- 浮動文字 ---------- */
  function floatText(dir, height, text, cls) {
    const el = document.createElement('div');
    el.className = `float-text ${cls}`;
    el.textContent = text;
    const obj = new CSS2DObject(el);
    const base = dir.clone().multiplyScalar(getSurfaceRadius(dir) + height);
    obj.position.copy(base);
    world.group.add(obj);
    floats.push({ obj, el, base, dir: dir.clone(), age: 0 });
  }
  function toast(text) {
    const t = $('toast');
    t.textContent = text;
    t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
  }
  function addPenalty(sec) {
    state.penalty += sec;
    const el = $('timer');
    el.classList.remove('penalty'); void el.offsetWidth; el.classList.add('penalty');
  }

  /* ---------- Raycaster ---------- */
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const targetsMeshes = [world.terrain];
  for (const r of world.clickables) r.root.traverse((c) => c.isMesh && targetsMeshes.push(c));
  let hovered = null;
  let downAt = null;

  function pick(x, y) {
    const rect = domElement.getBoundingClientRect();
    pointer.set(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(targetsMeshes, false)[0];
    return hit && hit.object !== world.terrain ? hit.object.userData.record : null;
  }
  function setHover(r) {
    if (hovered === r) return;
    if (hovered) hovered.hovered = false;
    hovered = r;
    domElement.style.cursor = r ? 'pointer' : 'grab';
    if (r) {
      r.hovered = true;
      if (r.kind === 'spot') {
        hoverEl.textContent = tr(r.searched ? 'hoverSearched' : 'hoverSpot', { name: r.name });
        hoverObj.position.copy(r.dir).multiplyScalar(getSurfaceRadius(r.dir) + r.height + 0.18);
        hoverEl.classList.add('show');
      } else hoverEl.classList.remove('show');
    } else hoverEl.classList.remove('show');
  }

  const onMove = (e) => {
    if (!state.running || e.buttons) return;
    if (e.pointerType === 'mouse') setHover(pick(e.clientX, e.clientY));
  };
  const onDown = (e) => { downAt = { x: e.clientX, y: e.clientY }; };
  const onUp = (e) => {
    if (!downAt || !state.running) return;
    const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
    downAt = null;
    if (moved > 7) return; // 拖曳旋轉，不算點擊
    const r = pick(e.clientX, e.clientY);
    if (!r) return;
    if (e.pointerType !== 'mouse') setHover(r);
    if (r.kind === 'landmark') { sfx.pop(); toast(tr('landmarkInfo', { name: r.name, lore: r.lore })); }
    else search(r);
  };
  domElement.addEventListener('pointermove', onMove);
  domElement.addEventListener('pointerdown', onDown);
  domElement.addEventListener('pointerup', onUp);
  cleanup.push(() => {
    domElement.removeEventListener('pointermove', onMove);
    domElement.removeEventListener('pointerdown', onDown);
    domElement.removeEventListener('pointerup', onUp);
  });

  /* ---------- 搜尋藏匿點 ---------- */
  function search(spot) {
    if (spot.searched) { toast(tr('alreadySearched', { name: spot.name })); return; }
    spot.searched = true;
    spot.shakeT = state.clock;
    sfx.search();
    haptic.search();
    const top = spot.dir.clone().multiplyScalar(getSurfaceRadius(spot.dir) + spot.height);
    particles.emit(top, spot.dir.clone());
    hoverEl.textContent = tr('hoverSearched', { name: spot.name });

    const c = spot.content;
    if (c?.target) {
      const i = targets.indexOf(c.target);
      state.found.add(i);
      setTimeout(() => { sfx.found(); haptic.found(); }, 120); // 翻找聲之後再響
      world.popItem(spot, c.target.emoji, 0.8);
      particles.emit(top, spot.dir.clone());
      floatText(spot.dir, spot.height + 0.5, tr('floatFound', { name: c.target.name }), 'good');
      toast(tr('toastFound', { emoji: c.target.emoji, name: c.target.name, found: state.found.size, total: targets.length }));
      document.querySelector(`#itemSlots li[data-i="${i}"]`)?.classList.add('found');
      document.querySelector(`#journalBody .clue[data-i="${i}"]`)?.classList.add('found');
      // 這個目標的提示已完成，收起光柱
      if (state.beaconFor === i) { world.hideBeacon(); state.beaconFor = null; lmLabels.forEach((l) => l.el.classList.remove('hint')); }
      if (state.found.size === targets.length) finish();
    } else {
      setTimeout(() => { sfx.wrong(); haptic.wrong(); }, 120);
      if (!state.paused) { // 教學中翻錯不加秒
        addPenalty(WRONG_PENALTY);
        floatText(spot.dir, spot.height + 0.3, tr('penalty', { n: WRONG_PENALTY }), 'bad');
      }
      if (c?.junk) {
        world.popItem(spot, c.junk[0], 0.55);
        toast(tr('junkFound', { emoji: c.junk[0], name: c.junk[1] }));
      } else { const lines = tr('emptyLines'); toast(lines[Math.floor(Math.random() * lines.length)]); }
    }
    onSearch?.(!!c?.target); // 教學用：通知翻找了一次（是否找到）
  }

  /* ---------- 提示 ---------- */
  const onHint = () => {
    if (!state.running) return;
    const i = targets.findIndex((_, k) => !state.found.has(k));
    if (i < 0) return;
    const t = targets[i];
    const lv = (state.hintLevel.get(i) ?? 0) + 1;
    state.hintLevel.set(i, lv);
    addPenalty(HINT_PENALTY);
    sfx.hint();
    world.showBeacon(t.at);
    state.beaconFor = i;
    const lm = world.landmarks.get(t.at);
    lmLabels.forEach((l) => l.el.classList.toggle('hint', l.lm === lm));
    if (lv === 1) toast(tr('hint1', { emoji: t.emoji, name: t.name, lm: lm.name, n: HINT_PENALTY }));
    else toast(tr('hint2', { emoji: t.emoji, name: t.name, lm: lm.name, spot: SPOTS[t.spot].name, n: HINT_PENALTY }));
  };
  $('hintBtn').addEventListener('click', onHint);
  cleanup.push(() => $('hintBtn').removeEventListener('click', onHint));

  /* ---------- 完成 ---------- */
  function finish() {
    state.running = false;
    state.done = true;
    const total = state.time + state.penalty;
    const stars = total <= t3 ? 3 : total <= t2 ? 2 : 1;
    setTimeout(() => onFinish({ time: total, stars }), 1300);
  }

  const _v = new THREE.Vector3();
  return {
    state,
    start() { state.running = true; },
    /** 教學用：標出第 i 件物品所在的地標（光柱＋名稱標籤閃動），不加秒 */
    guide(i) {
      const lm = world.landmarks.get(targets[i].at);
      world.showBeacon(targets[i].at);
      state.beaconFor = i;
      lmLabels.forEach((l) => l.el.classList.toggle('hint', l.lm === lm));
      return lm;
    },
    update(dt, t, rawDt = dt) {
      state.clock = t;
      if (state.running && !state.paused) state.time += rawDt; // 教學進行中（paused）不計時
      const total = state.time + state.penalty;
      $('timer').textContent = fmtTime(total);
      $('starFill').style.width = `${Math.min(100, (total / span) * 100)}%`;

      // 地標標籤：只顯示面向相機的那一側
      _v.copy(camera.position).normalize();
      for (const l of lmLabels) l.el.style.opacity = l.lm.dir.dot(_v) > 0.25 ? '1' : '0';

      // 浮動文字上飄淡出
      for (let i = floats.length - 1; i >= 0; i--) {
        const f = floats[i];
        f.age += dt;
        f.obj.position.copy(f.base).addScaledVector(f.dir, f.age * 0.5);
        f.el.style.opacity = String(1 - f.age / 1.2);
        if (f.age > 1.2) { world.group.remove(f.obj); f.el.remove(); floats.splice(i, 1); }
      }
    },
    dispose() {
      cleanup.forEach((fn) => fn());
      // CSS2D 元素在物件移除時不會自動消失，手動清除
      for (const l of lmLabels) l.el.remove();
      hoverEl.remove();
      floats.forEach((f) => f.el.remove());
    },
  };
}
