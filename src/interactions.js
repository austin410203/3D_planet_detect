/**
 * interactions.js — Raycaster 點擊偵測與互動邏輯
 * --------------------------------------------------
 * - 滑鼠移動：偵測 hover 物件 → 放大 + 顯示標籤 + 游標變手指
 * - 點擊（非拖曳）：播放點擊動畫、粒子爆發、開啟資訊卡片
 * - 地形也納入射線檢測當作「遮擋物」，避免點到星球背面的物件
 */
import * as THREE from 'three';
import { triggerClick } from './objects.js';

const CLICK_MOVE_TOLERANCE = 6; // 移動超過幾像素視為拖曳而非點擊

export function setupInteractions({ camera, domElement, terrain, objects, particles, ui, controls, clock }) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  // 射線目標：地形（遮擋）+ 所有互動物件的網格
  const targets = [terrain];
  for (const o of objects) o.root.traverse((c) => c.isMesh && targets.push(c));

  let hovered = null;
  let downPos = null;

  /** 將螢幕座標轉為 NDC 並取得命中的物件紀錄 */
  function pick(clientX, clientY) {
    const rect = domElement.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(targets, false);
    // 取最近的命中；若是地形則代表被擋住
    const first = hits[0];
    return first && first.object !== terrain ? first.object.userData.record : null;
  }

  function setHovered(o) {
    if (hovered === o) return;
    if (hovered) { hovered.hovered = false; ui.setLabel(hovered, false); }
    hovered = o;
    if (o) { o.hovered = true; ui.setLabel(o, true); }
    domElement.style.cursor = o ? 'pointer' : 'grab';
  }

  /* ---------- Hover（僅滑鼠） ---------- */
  domElement.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || ui.isCardOpen()) return;
    if (e.buttons) return; // 拖曳中不做 hover 偵測
    setHovered(pick(e.clientX, e.clientY));
    if (hovered) controls.hold(); // 指著物件時暫停自轉，方便點擊
  });
  domElement.addEventListener('pointerleave', () => setHovered(null));

  /* ---------- 點擊（區分拖曳） ---------- */
  domElement.addEventListener('pointerdown', (e) => {
    downPos = { x: e.clientX, y: e.clientY };
    if (e.pointerType === 'mouse') domElement.style.cursor = 'grabbing';
  });
  domElement.addEventListener('pointerup', (e) => {
    if (!downPos) return;
    const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
    downPos = null;
    domElement.style.cursor = hovered ? 'pointer' : 'grab';
    if (moved > CLICK_MOVE_TOLERANCE) return;

    const o = pick(e.clientX, e.clientY);
    if (!o) return;
    activate(o, e.pointerType !== 'mouse');
  });

  /** 觸發物件互動 */
  function activate(o, isTouch) {
    const t = clock.getElapsedTime();
    triggerClick(o, t);
    controls.hold();

    // 粒子從物件頂端（世界座標）爆發
    const top = new THREE.Vector3(0, o.baseY + o.height * 0.8, 0);
    o.root.localToWorld(top);
    const normal = top.clone().normalize();
    particles.emit(top, normal);

    // 觸控裝置沒有 hover，點擊時短暫顯示標籤
    if (isTouch) {
      setHovered(o);
      setTimeout(() => hovered === o && setHovered(null), 1500);
    }

    ui.markDiscovered(o);
    // 稍微延遲開卡片，讓玩家先看到動畫
    setTimeout(() => ui.openCard(o), 380);
  }

  ui.onClose = () => setHovered(null);
  domElement.style.cursor = 'grab';
}
