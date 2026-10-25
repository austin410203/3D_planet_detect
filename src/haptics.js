/**
 * haptics.js — 觸覺回饋
 * iOS 用 Taptic Engine（@capacitor/haptics）。網頁版不震動（navigator.vibrate 在桌機無效、還會被瀏覽器擋）。
 * 設定裡關掉「震動」時全部略過。
 */
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { settings } from './settings.js';

export const hasHaptics = Capacitor.isNativePlatform();
const run = (fn) => { if (hasHaptics && settings.haptics) fn().catch(() => {}); };

export const haptic = {
  /** 按鈕、切換星球、倒數 */
  tap: () => run(() => Haptics.impact({ style: ImpactStyle.Light })),
  /** 翻找藏匿點 */
  search: () => run(() => Haptics.impact({ style: ImpactStyle.Medium })),
  /** 找到物品 */
  found: () => run(() => Haptics.notification({ type: NotificationType.Success })),
  /** 翻錯、加秒 */
  wrong: () => run(() => Haptics.notification({ type: NotificationType.Warning })),
  /** 結算時每亮一顆星 */
  star: () => run(() => Haptics.impact({ style: ImpactStyle.Heavy })),
};
