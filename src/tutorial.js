/**
 * tutorial.js — 第一次遊玩的簡短教學（第一關綠野星）
 * --------------------------------------------------
 * 三個步驟，畫面下方的提示框說明，可「下一步」或「跳過」：
 *   1. 拖曳旋轉星球（偵測到相機轉動就自動完成）
 *   2. 打開線索手冊看線索（手冊打開、或手冊本來就開著就完成）
 *   3. 找到線索提到的地標，點旁邊的藏匿點（標出第一件物品的地標；翻找一次就完成）
 * 教學期間暫停計時、翻錯不加秒；結束後計時開始，並記錄已看過教學。
 */
import { t } from './i18n.js';
import { sfx } from './audio.js';
import { haptic } from './haptics.js';

const $ = (id) => document.getElementById(id);

/**
 * @param {{ game, controls, onSearchHook: (fn) => void }} ctx
 *        onSearchHook：讓教學接收「翻找了一次」的通知
 * @returns {Promise<void>} 教學結束（完成或跳過）
 */
export function runTutorial({ game, controls, onSearchHook }) {
  const box = $('tutorial');
  const text = $('tutText');
  const step = $('tutStep');
  const next = $('tutNext');
  game.state.paused = true;
  let current = 0;
  let cleanup = () => {};

  return new Promise((resolve) => {
    const finish = () => {
      current = -1;
      cleanup();
      box.hidden = true;
      $('journal').classList.remove('tut-focus');
      game.state.paused = false;
      resolve();
    };

    const STEPS = [
      // 1. 拖曳旋轉
      (done) => {
        const start = controls.object.position.clone();
        const onChange = () => { if (controls.object.position.distanceTo(start) > 2.5) done(); };
        controls.addEventListener('change', onChange);
        return () => controls.removeEventListener('change', onChange);
      },
      // 2. 線索手冊
      (done) => {
        const j = $('journal');
        j.classList.add('tut-focus');
        const check = () => { if (!j.classList.contains('closed')) setTimeout(done, 1800); };
        const tab = $('journalTab');
        tab.addEventListener('click', check);
        if (!j.classList.contains('closed')) setTimeout(done, 3500); // 寬螢幕手冊本來就開著，讀一下再往下
        return () => { tab.removeEventListener('click', check); j.classList.remove('tut-focus'); };
      },
      // 3. 地標旁的藏匿點
      (done) => {
        game.guide(0);
        onSearchHook(() => { sfx.hint(); haptic.found(); done(); });
        return () => onSearchHook(null);
      },
    ];

    function show(i) {
      cleanup();
      if (i >= STEPS.length) {
        text.innerHTML = t('tutDone');
        step.textContent = '';
        next.textContent = t('tutGo');
        current = STEPS.length;
        next.onclick = finish;
        setTimeout(() => { if (current === STEPS.length) finish(); }, 2600);
        return;
      }
      current = i;
      step.textContent = `${i + 1} / ${STEPS.length}`;
      text.innerHTML = t(`tut${i + 1}`);
      next.textContent = t('tutNext');
      next.onclick = advance;
      box.hidden = false;
      box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
      // 每個步驟只能讓「自己」前進：延遲的檢查若在玩家按了下一步之後才觸發，不會跳過步驟
      const done = () => { if (current === i) advance(); };
      cleanup = STEPS[i](done) || (() => {});
    }
    function advance() { show(current + 1); }

    $('tutSkip').onclick = finish;
    show(0);
  });
}
