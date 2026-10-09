/**
 * controls.js — 旋轉與縮放控制
 * --------------------------------------------------
 * - 使用 OrbitControls：左鍵／單指拖曳旋轉，滾輪／雙指縮放
 * - 停用平移，限制縮放距離
 * - 無操作一段時間後，星球自動緩慢自轉
 */
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as THREE from 'three';

const IDLE_DELAY = 2.5;      // 停止操作幾秒後恢復自轉
const AUTO_SPIN_SPEED = 0.12; // 自轉速度（弧度/秒）

export function createControls(camera, domElement, planetGroup) {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;      // 慣性阻尼，手感更滑順
  controls.dampingFactor = 0.08;
  controls.enablePan = false;         // 禁止平移，視角永遠以星球為中心
  controls.minDistance = 8.5;         // 最近距離
  controls.maxDistance = 24;          // 最遠距離
  controls.rotateSpeed = 0.6;
  controls.zoomSpeed = 0.8;
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE };

  let lastInteraction = -Infinity;
  let spinBlend = 1; // 0~1，讓自轉平滑淡入淡出
  let elapsed = 0;

  controls.addEventListener('start', () => { lastInteraction = Infinity; });
  controls.addEventListener('end', () => { lastInteraction = elapsed; });

  return {
    controls,
    /** 每幀更新（dt：秒） */
    update(dt) {
      elapsed += dt;
      const idle = elapsed - lastInteraction > IDLE_DELAY;
      spinBlend = THREE.MathUtils.lerp(spinBlend, idle ? 1 : 0, Math.min(1, dt * 2));
      planetGroup.rotation.y += AUTO_SPIN_SPEED * spinBlend * dt;
      controls.update();
    },
    /** 暫停自轉（例如開啟彈窗或滑鼠停在物件上） */
    hold() { lastInteraction = elapsed; },
  };
}
