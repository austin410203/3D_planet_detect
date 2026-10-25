/**
 * settings.js — 玩家設定（配樂、音效、震動開關、語言）
 * 存在 Capacitor Preferences，啟動時需先 await loadSettings()。
 * lang 為 null 時跟著裝置語言（見 i18n.js）。
 */
import { Preferences } from '@capacitor/preferences';

const KEY = 'planetLostFound.settings';
const listeners = new Set();
export const settings = { music: true, sfx: true, haptics: true, lang: null, tutorialDone: false };

export async function loadSettings() {
  try {
    const { value } = await Preferences.get({ key: KEY });
    if (value) Object.assign(settings, JSON.parse(value));
  } catch { /* 讀不到就用預設值 */ }
}

/** 切換設定並存檔，通知訂閱者（例如配樂要立刻停止）；回傳存檔完成的 Promise */
export function setSetting(name, value) {
  settings[name] = value;
  listeners.forEach((fn) => fn(name, value));
  return Preferences.set({ key: KEY, value: JSON.stringify(settings) }).catch(() => {});
}
export const onSettingChange = (fn) => listeners.add(fn);
