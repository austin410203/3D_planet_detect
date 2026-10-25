/**
 * settings.js — 玩家設定（配樂、音效、震動開關）
 * 存在 Capacitor Preferences，啟動時需先 await loadSettings()。
 */
import { Preferences } from '@capacitor/preferences';

const KEY = 'planetLostFound.settings';
const listeners = new Set();
export const settings = { music: true, sfx: true, haptics: true };

export async function loadSettings() {
  try {
    const { value } = await Preferences.get({ key: KEY });
    if (value) Object.assign(settings, JSON.parse(value));
  } catch { /* 讀不到就用預設值 */ }
}

/** 切換設定並存檔，通知訂閱者（例如配樂要立刻停止） */
export function setSetting(name, on) {
  settings[name] = on;
  Preferences.set({ key: KEY, value: JSON.stringify(settings) }).catch(() => {});
  listeners.forEach((fn) => fn(name, on));
}
export const onSettingChange = (fn) => listeners.add(fn);
