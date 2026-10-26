/**
 * progress.js — 關卡進度存檔
 * 記錄每顆星球的最佳星數與最佳時間。關卡不用依序過關：前 4 顆免費，第 5 顆以後需要完整版（store.js）。
 * - 存在 Capacitor Preferences：iOS App 內存在原生 UserDefaults（不會被系統清掉），
 *   網頁版則由 Preferences 自動改用 localStorage。
 * - 舊版直接存在 localStorage 的進度，第一次啟動時會自動搬過來。
 * - 網址加上 ?unlock=all 可解鎖全部關卡（只在 npm run dev 開發模式有效；網頁正式版有付費鎖，不能開）。
 */
import { Preferences } from '@capacitor/preferences';
import { store } from './store.js';

const KEY = 'planetLostFound.v1';
let data = {};

/** 啟動時讀取存檔（必須在顯示選關畫面前 await） */
export async function loadProgress() {
  try {
    const { value } = await Preferences.get({ key: KEY });
    if (value) data = JSON.parse(value) || {};
    else {
      const legacy = localStorage.getItem(KEY);
      if (legacy) { data = JSON.parse(legacy) || {}; persist(); }
    }
  } catch { data = {}; }
}
function persist() {
  Preferences.set({ key: KEY, value: JSON.stringify(data) }).catch(() => { /* 無痕模式等情況忽略 */ });
}

const unlockAll = import.meta.env.DEV
  && new URLSearchParams(location.search).get('unlock') === 'all';

export const progress = {
  get(id) { return data[id] || { stars: 0, best: null }; },
  /** 記錄成績，回傳是否刷新最佳時間 */
  save(id, stars, time) {
    const prev = this.get(id);
    const isBest = prev.best === null || time < prev.best;
    data[id] = { stars: Math.max(prev.stars, stars), best: isBest ? time : prev.best };
    persist();
    return isBest;
  },
  /** 鎖住的原因：null（可以玩）、'paid'（需要完整版） */
  lockReason(levels, index) {
    if (unlockAll) return null;
    return store.needsPurchase(index) ? 'paid' : null;
  },
  isUnlocked(levels, index) { return !this.lockReason(levels, index); },
  totalStars(levels) { return levels.reduce((s, l) => s + this.get(l.id).stars, 0); },
};

/** 秒數格式化為 m:ss */
export function fmtTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
