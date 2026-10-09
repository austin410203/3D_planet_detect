/**
 * ui.js — 標籤與彈窗 UI
 * --------------------------------------------------
 * - 以 CSS2DRenderer 在 3D 物件上方顯示名稱標籤（hover 時淡入）
 * - 卡片式彈窗：物件名稱、類別、描述、表情圖示
 * - 探索進度計數、操作說明收合
 */
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export function createUI(container, objects) {
  /* ---------- CSS2D 標籤渲染器 ---------- */
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.style.position = 'fixed';
  labelRenderer.domElement.style.inset = '0';
  labelRenderer.domElement.style.pointerEvents = 'none'; // 不攔截滑鼠事件
  container.appendChild(labelRenderer.domElement);

  // 為每個物件建立標籤，掛在 root 上方（會跟著星球旋轉）
  for (const o of objects) {
    const el = document.createElement('div');
    el.className = 'obj-label';
    el.textContent = `${o.emoji} ${o.name}`;
    const label = new CSS2DObject(el);
    label.position.set(0, o.baseY + o.height * 1.25 + 0.25, 0);
    o.root.add(label);
    o.labelEl = el;
  }

  /* ---------- 卡片彈窗 ---------- */
  const mask = document.getElementById('cardMask');
  const $ = (id) => document.getElementById(id);
  let onClose = null;

  function openCard(o) {
    $('cardEmoji').textContent = o.emoji;
    $('cardCat').textContent = o.cat;
    $('cardName').textContent = o.name;
    $('cardDesc').textContent = o.desc;
    mask.hidden = false;
  }
  function closeCard() {
    mask.hidden = true;
    onClose?.();
  }
  $('cardClose').addEventListener('click', closeCard);
  // 點擊卡片外的遮罩也可關閉
  mask.addEventListener('click', (e) => { if (e.target === mask) closeCard(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !mask.hidden) closeCard(); });

  /* ---------- 探索進度 ---------- */
  $('total').textContent = objects.length;
  function markDiscovered(o) {
    if (o.discovered) return;
    o.discovered = true;
    $('found').textContent = objects.filter((x) => x.discovered).length;
  }

  /* ---------- 操作說明收合（手機上預設收起） ---------- */
  const help = $('help');
  if (window.innerWidth < 600) setTimeout(() => help.classList.add('collapsed'), 4000);
  $('helpToggle').addEventListener('click', () => help.classList.toggle('collapsed'));

  return {
    labelRenderer,
    openCard,
    markDiscovered,
    isCardOpen: () => !mask.hidden,
    set onClose(fn) { onClose = fn; },
    /** 顯示／隱藏某物件的標籤 */
    setLabel(o, show) { o.labelEl.classList.toggle('show', show); },
    resize(w, h) { labelRenderer.setSize(w, h); },
    render(scene, camera) { labelRenderer.render(scene, camera); },
  };
}
