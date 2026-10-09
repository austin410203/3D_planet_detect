/**
 * progress.js — 關卡進度（存在瀏覽器 localStorage）
 * 記錄每顆星球的最佳星數與最佳時間；上一關拿到至少 1 星才解鎖下一關。
 * 網址加上 ?unlock=all 可解鎖全部關卡（測試用）。
 */
const KEY = 'planetLostFound.v1';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
let data = load();

export const progress = {
  get(id) { return data[id] || { stars: 0, best: null }; },
  /** 記錄成績，回傳是否刷新最佳時間 */
  save(id, stars, time) {
    const prev = this.get(id);
    const isBest = prev.best === null || time < prev.best;
    data[id] = { stars: Math.max(prev.stars, stars), best: isBest ? time : prev.best };
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* 無痕模式等情況忽略 */ }
    return isBest;
  },
  isUnlocked(levels, index) {
    if (index === 0 || new URLSearchParams(location.search).get('unlock') === 'all') return true;
    return this.get(levels[index - 1].id).stars > 0;
  },
  totalStars(levels) { return levels.reduce((s, l) => s + this.get(l.id).stars, 0); },
};

/** 秒數格式化為 m:ss */
export function fmtTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
