/**
 * daily.js — 每日挑戰
 * --------------------------------------------------
 * - 每天（以 UTC+8 的日期為準）由日期算出固定的星球與 seed：全世界同一天玩到同一張地圖
 * - 只有當天第一次完成的成績會記錄並上傳排行榜，之後重玩是練習模式（避免背答案刷榜）
 * - 記錄連續挑戰天數，結果存在 Capacitor Preferences（只保留最近 60 天）
 */
import { Preferences } from '@capacitor/preferences';

const KEY = 'planetLostFound.daily';
const DAY = 86400e3;
const TZ_OFFSET = 8 * 3600e3; // UTC+8：與 Game Center 循環排行榜的重置時間一致
let results = {};             // { 'YYYY-MM-DD': { time, stars } }

/** 今天的日期字串（UTC+8） */
export const todayKey = (now = Date.now()) => new Date(now + TZ_OFFSET).toISOString().slice(0, 10);
const shiftDay = (key, days) => new Date(Date.parse(`${key}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10);

function hash(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.codePointAt(0), 16777619);
  return h >>> 0;
}

/** 這一天的挑戰：{ index（第幾顆星球）, seed（buildWorld 用） } */
export function dailyPick(levels, key = todayKey()) {
  const h = hash(`daily:${key}`);
  return { index: h % levels.length, seed: (hash(`seed:${key}`) % 1e9) + 1 };
}

export async function loadDaily() {
  try {
    const { value } = await Preferences.get({ key: KEY });
    if (value) results = JSON.parse(value) || {};
  } catch { results = {}; }
}

export const daily = {
  result: (key = todayKey()) => results[key] ?? null,
  /** 記錄當天第一次的成績；已經有成績就不覆蓋，回傳是否有記錄 */
  record(key, time, stars) {
    if (results[key]) return false;
    results[key] = { time, stars };
    const keep = Object.keys(results).sort().slice(-60);
    results = Object.fromEntries(keep.map((k) => [k, results[k]]));
    Preferences.set({ key: KEY, value: JSON.stringify(results) }).catch(() => {});
    return true;
  },
  /** 連續挑戰天數：今天還沒玩就從昨天往回算，不會因為今天還沒玩就歸零 */
  streak(key = todayKey()) {
    let d = results[key] ? key : shiftDay(key, -1);
    let n = 0;
    while (results[d]) { n++; d = shiftDay(d, -1); }
    return n;
  },
};
