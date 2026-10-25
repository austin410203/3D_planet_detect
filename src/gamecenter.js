/**
 * gamecenter.js — Game Center 排行榜（只在 iOS App 內有效，網頁版全部略過）
 * --------------------------------------------------
 * 原生端：ios/App/App/GameCenterPlugin.swift
 * 排行榜 ID（要在 App Store Connect 建立，見 docs/game-center.md）：
 *   plf.best.<星球 id>  各星球最快時間（經典型，越小越好，單位 1/100 秒）
 *   plf.daily           每日挑戰時間（循環型，每天 00:00 UTC+8 重置）
 *   plf.stars           總星數（經典型，越大越好）
 */
import { Capacitor, registerPlugin } from '@capacitor/core';

const GameCenter = registerPlugin('GameCenter');
export const hasGameCenter = Capacitor.getPlatform() === 'ios';

export const LEADERBOARD = {
  best: (levelId) => `plf.best.${levelId}`,
  daily: 'plf.daily',
  stars: 'plf.stars',
};

let authed = false;
let signingIn = null;

/** 啟動時登入；玩家取消也不影響遊戲 */
export function signInGameCenter() {
  if (!hasGameCenter) return Promise.resolve(false);
  signingIn ??= GameCenter.signIn()
    .then((r) => (authed = !!r.authenticated))
    .catch(() => false);
  return signingIn;
}

/** 上傳時間（秒），轉成 1/100 秒 */
export function submitTime(leaderboardId, sec) {
  submitScore(leaderboardId, Math.round(sec * 100));
}
export function submitScore(leaderboardId, score) {
  if (!hasGameCenter || !authed) return;
  GameCenter.submitScore({ leaderboardId, score }).catch(() => { /* 離線時 Game Center 會自己重送 */ });
}

/** 開啟排行榜（不帶 id 顯示全部） */
export async function showLeaderboard(leaderboardId) {
  if (!hasGameCenter) return;
  if (!(await signInGameCenter())) return;
  GameCenter.showLeaderboard(leaderboardId ? { leaderboardId } : {}).catch(() => {});
}
