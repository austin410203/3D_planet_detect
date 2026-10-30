/**
 * saves.js — 存檔欄位（Company/playbooks/save-system.md）
 * - 3 個欄位：關卡進度 `planetLostFound.v1`、每日挑戰成績 `planetLostFound.daily` 跟著欄位走，
 *   存在 localStorage `eosv_pl_s{N}_<key>`；設定、試玩次數、完整版購買全欄位共用。
 * - iOS App：每次存檔也寫一份到原生 Preferences（同一個 key），localStorage 被系統清掉時從那裡還原；
 *   欄位被刪除／匯入時同步更新（不然會還原出已刪除的存檔）。
 * - 舊版存在 Preferences（網頁版＝localStorage `CapacitorStorage.<key>`）或 localStorage 的進度，第一次讀取時搬進存檔 1。
 */
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { createSaves } from './save.js';
import { createSaveUI } from './saveui.js';
import { lang } from './i18n.js';
import { LEVELS } from './levels.js';

const fmtTime = (sec) => { const s = Math.max(0, Math.floor(sec)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const NATIVE = Capacitor.isNativePlatform();
const PREFIX = 'eosv_pl_';
export const SLOT_KEYS = ['planetLostFound.v1', 'planetLostFound.daily'];
export const saves = createSaves({ game: 'PlanetLostFound', prefix: PREFIX, slotKeys: SLOT_KEYS, raw: true });
const backupKeys = (n) => [...SLOT_KEYS, 'meta', '__log'].map((k) => `${PREFIX}s${n}_${k}`);
function backup(n) {
  if (!NATIVE) return;
  for (const k of [...backupKeys(n), `${PREFIX}slot`]) {
    const v = localStorage.getItem(k);
    (v == null ? Preferences.remove({ key: k }) : Preferences.set({ key: k, value: v })).catch(() => {});
  }
}

/** 讀目前欄位的進度（字串）；沒有就從原生備份、舊版存檔找 */
export async function slotGet(key) {
  let v = saves.ls.getItem(key);
  if (v != null) return v;
  if (NATIVE) {
    try {
      // localStorage 被清掉：整組欄位資料從原生備份還原
      for (const k of [`${PREFIX}slot`, ...[1, 2, 3].flatMap(backupKeys)]) {
        if (localStorage.getItem(k) != null) continue;
        const { value } = await Preferences.get({ key: k });
        if (value != null) localStorage.setItem(k, value);
      }
      saves.setSlot(+JSON.parse(localStorage.getItem(`${PREFIX}slot`) || '1') || 1);
    } catch { /* ignore */ }
    v = saves.ls.getItem(key);
    if (v != null) return v;
  }
  if (saves.slot !== 1 || saves.meta(1)?.legacy?.includes(key)) return null;
  // 舊版：Preferences（App：UserDefaults；網頁：localStorage `CapacitorStorage.<key>`），更早的網頁版直接存 localStorage
  let old = null;
  try { old = (await Preferences.get({ key })).value; } catch { /* ignore */ }
  if (old == null) try { old = localStorage.getItem(key); } catch { /* ignore */ }
  if (old != null) {
    try { saves.ls.setItem(key, old); } catch { return old; }
    Preferences.remove({ key }).catch(() => {});
    try { localStorage.removeItem(key); } catch { /* ignore */ }
    backup(1);
  }
  return old;
}
/** 寫進目前欄位（自動存檔） */
export function slotSet(key, value) {
  try { saves.ls.setItem(key, value); } catch { /* 空間滿了 */ }
  backup(saves.slot);
}

const SUM = {
  zh: (s, c, m) => `⭐ ${s}/${m}・過關 ${c}/${LEVELS.length} 顆星球`, en: (s, c, m) => `⭐ ${s}/${m} · ${c}/${LEVELS.length} planets cleared`,
  ja: (s, c, m) => `⭐ ${s}/${m}・クリア ${c}/${LEVELS.length} 惑星`, ko: (s, c, m) => `⭐ ${s}/${m} · ${c}/${LEVELS.length} 행성 클리어`,
};
const DAILY = { zh: '每日挑戰', en: 'Daily challenge', ja: 'デイリーチャレンジ', ko: '데일리 챌린지' };
export const saveUI = createSaveUI(saves, {
  name: { zh: '星球失物招領所', en: 'Planet Lost & Found', ja: '惑星落とし物センター', ko: '행성 분실물 센터' }, file: 'PlanetLostFound', lang: () => lang,
  summary: (d) => {
    let p = {}; try { p = JSON.parse(d['planetLostFound.v1'] || '{}') || {}; } catch { /* */ }
    const v = Object.values(p);
    return (SUM[lang] || SUM.en)(v.reduce((a, x) => a + (x.stars || 0), 0), v.filter((x) => x.stars > 0).length, LEVELS.length * 3);
  },
  logRow: (e) => {
    const lv = LEVELS.find((l) => l.id === e.lv);
    return { title: `${lv ? `${lv.emoji} ${lv.name}` : e.lv}${e.daily ? `・${DAILY[lang] || DAILY.en}` : ''}`, result: '★'.repeat(e.stars) + '☆'.repeat(3 - e.stars), detail: `⏱ ${fmtTime(e.time)}`, ok: e.stars > 0 };
  },
  onData: (n) => backup(n),
});
