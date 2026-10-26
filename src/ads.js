/**
 * ads.js — 免費版廣告（買了完整版就全部不顯示）。公司規則見 Company/playbooks/ads-monetization.md
 * --------------------------------------------------
 * 1. 獎勵廣告：玩家自己按「看廣告試玩」，看完換一次付費星球的試玩（每天最多 TRIALS_PER_DAY 次）
 * 2. 插頁廣告：每過 INTERSTITIAL_EVERY 關，離開結算畫面時播一支可關閉的全螢幕廣告；
 *    開始玩的前 3 分鐘不播、兩支至少隔 3 分鐘、每次開啟最多 4 支；遊戲中、教學中、購買流程中都不播
 * iOS App：Google AdMob（@capacitor-community/admob）。可愛風格作品一律非個人化廣告、內容分級 G、不跳追蹤授權（ATT）；
 *          歐盟、英國等地區先顯示 Google 的同意視窗（UMP）。
 * 網頁版：Google AdSense「H5 遊戲廣告」（adBreak）。WEB_AD_CLIENT 還沒填、或沒有廣告可播時，改播自家其他作品的推廣廣告。
 * Android 目前只有測試用 APK，全部開放、沒有廣告。
 * 廣告載入失敗或離線：獎勵廣告顯示「目前沒有廣告」，插頁廣告直接略過，不會卡住遊戲。
 */
import { Preferences } from '@capacitor/preferences';
import { AdMob, RewardAdPluginEvents, InterstitialAdPluginEvents } from '@capacitor-community/admob';
import { store, hasStore, isWeb } from './store.js';
import { setAudioPaused } from './audio.js';
import { t, lang } from './i18n.js';

export const TRIALS_PER_DAY = 5;
const INTERSTITIAL_EVERY = 2;
const INTERSTITIAL_GAP = 3 * 60e3;   // 開始玩後、兩支插頁之間至少隔 3 分鐘
const INTERSTITIAL_MAX = 4;          // 每次開啟 App 最多 4 支
const HOUSE_SECONDS = 5;             // 自家推廣廣告當獎勵廣告時要看幾秒

/** AdMob 廣告單元（iOS）。正式 ID 申請好後填入並把 ADMOB_LIVE 改成 true；Info.plist 的 GADApplicationIdentifier 也要換 */
const ADMOB_LIVE = false;
const ADMOB = ADMOB_LIVE
  ? { rewarded: '', interstitial: '' }
  : { rewarded: 'ca-app-pub-3940256099942544/1712485313', interstitial: 'ca-app-pub-3940256099942544/4411468910' }; // Google 官方測試 ID
/** 網頁版 AdSense 發布商 ID。公司帳號是 ca-pub-4390142574700801（emptyoffice.app 2026-10-27 送審中），
 *  要等「H5 遊戲廣告」另外核准後才填進來，否則玩家按「看廣告」會一直沒有廣告；WEB_AD_TEST 為 true 時只播測試廣告 */
const WEB_AD_CLIENT = '';
const WEB_AD_TEST = true;

/** 自家推廣廣告輪播的作品（四語系：zh, en, ja, ko） */
const HOUSE_ADS = [
  { url: 'https://train.emptyoffice.app/', img: 'https://train.emptyoffice.app/icons/icon-192.png',
    name: ['月台圖鑑', 'Platform Atlas', 'ホーム図鑑', '플랫폼 도감'],
    desc: ['在手繪車站裡收集 95 款日本與台灣列車', 'Collect 95 Japanese and Taiwanese trains in hand-drawn stations', '手描きの駅で日本と台湾の列車 95 種を集めよう', '손그림 역에서 일본·대만 열차 95종을 모아 보세요'] },
  { url: 'https://mystery.emptyoffice.app/', img: 'https://mystery.emptyoffice.app/icons/icon-192.png',
    name: ['疊居謎案', 'Stack Mystery', '積み住まいの謎', '스택 미스터리'],
    desc: ['在一棟疊疊樂公寓裡蒐證、找出真兇', 'Gather clues in a stacked apartment and name the culprit', '積み木のようなアパートで証拠を集め、犯人を当てよう', '쌓아 올린 아파트에서 단서를 모아 범인을 찾아내세요'] },
  { url: 'https://life.emptyoffice.app/', img: 'https://life.emptyoffice.app/icons/icon-192.png',
    name: ['80億分之一的人生', 'One in 8 Billion', '80億分の1の人生', '80억 분의 1의 인생'],
    desc: ['隨機出生在世界上任何地方，活出一段人生', 'Be born anywhere in the world and live a whole life', '世界のどこかに生まれて、ひとつの人生を生きよう', '세계 어딘가에서 태어나 한 사람의 인생을 살아 보세요'] },
];
const LANG_INDEX = { zh: 0, en: 1, ja: 2, ko: 3 };

const provider = hasStore ? 'admob' : isWeb ? 'web' : null;
/** 這個平台有沒有廣告（iOS 與網頁版有；Android 測試版沒有） */
export const adsAvailable = !!provider;
const active = () => adsAvailable && !store.owned;

/* ---------- 試玩次數（每天重置，存在 Preferences） ---------- */
const KEY = 'planetLostFound.trials';
// 依裝置的當地日期換日（台灣是 00:00，不是 UTC 的早上 8 點）
const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
let trials = { day: today(), used: 0 };
let granted = null; // 看完廣告、還沒開始的試玩關卡 index

export async function loadAds() {
  try {
    const v = JSON.parse((await Preferences.get({ key: KEY })).value || 'null');
    if (v && v.day === today()) trials = v;
  } catch { /* 用預設值 */ }
  if (provider === 'admob') initAdMob();
  if (provider === 'web' && WEB_AD_CLIENT && !store.owned) loadAdSense();
}
export const trialsLeft = () => (trials.day === today() ? Math.max(0, TRIALS_PER_DAY - trials.used) : TRIALS_PER_DAY);
/** 這關目前可以試玩（看完廣告、還沒開始） */
export const hasTrial = (index) => granted === index;
/** 開始試玩時呼叫：試玩權用掉，結束後就再鎖起來 */
export function consumeTrial(index) {
  if (granted !== index) return false;
  granted = null;
  return true;
}

/** 看獎勵廣告換第 index 關的試玩；回傳 'ok' | 'limit' | 'unavailable'（沒有廣告）| 'skipped'（沒看完） */
export async function watchForTrial(index) {
  if (!active()) return 'unavailable';
  if (trialsLeft() <= 0) return 'limit';
  const r = await showRewarded();
  if (r !== 'rewarded') return r;
  if (trials.day !== today()) trials = { day: today(), used: 0 };
  trials.used++;
  Preferences.set({ key: KEY, value: JSON.stringify(trials) }).catch(() => {});
  granted = index;
  return 'ok';
}

/* ---------- 插頁廣告 ---------- */
const sessionStart = Date.now();
let lastAdAt = sessionStart;  // 開始玩的前 3 分鐘也當作「剛播過」
let shownThisSession = 0;
let finishedSinceAd = 0;
/** 過關時呼叫（新手教學不算） */
export function levelFinished() { if (active()) finishedSinceAd++; }
/** 離開結算畫面時呼叫：符合頻率規則就播一支，播完（或沒有廣告）才 resolve */
export async function maybeInterstitial() {
  if (!active() || finishedSinceAd < INTERSTITIAL_EVERY) return;
  if (Date.now() - lastAdAt < INTERSTITIAL_GAP || shownThisSession >= INTERSTITIAL_MAX) return;
  finishedSinceAd = 0;
  lastAdAt = Date.now();
  shownThisSession++;
  await showInterstitial();
}

/* ---------- 共用：播廣告時暫停遊戲音訊 ---------- */
async function withPausedAudio(fn) {
  setAudioPaused(true);
  try { return await fn(); } finally { setAudioPaused(false); }
}

function showRewarded() {
  if (provider === 'admob') return admobRewarded();
  return withPausedAudio(() => (window.adBreak ? webBreak('reward') : Promise.resolve('none')))
    .then((r) => (r === 'none' ? houseAd(true) : r));
}
function showInterstitial() {
  if (provider === 'admob') return admobInterstitial();
  return withPausedAudio(() => (window.adBreak ? webBreak('next') : Promise.resolve('none')))
    .then((r) => (r === 'none' ? houseAd(false) : r));
}

/* ---------- iOS：AdMob ---------- */
let admobReady = null;
function initAdMob() {
  admobReady = (async () => {
    try {
      const info = await AdMob.requestConsentInfo();
      if (info.isConsentFormAvailable && info.status === 'REQUIRED') await AdMob.showConsentForm();
    } catch { /* 同意流程失敗時仍初始化，Google 會自動限制廣告 */ }
    await AdMob.initialize({ maxAdContentRating: 'General' });
    return true;
  })().catch(() => false);
}

function admobShow(prepare, show, events) {
  return withPausedAudio(() => new Promise((resolve) => {
    let rewarded = false;
    const handles = [];
    const done = (r) => { handles.forEach((h) => h.then((x) => x.remove())); resolve(r); };
    if (events.reward) handles.push(AdMob.addListener(events.reward, () => { rewarded = true; }));
    handles.push(AdMob.addListener(events.dismissed, () => done(events.reward ? (rewarded ? 'rewarded' : 'skipped') : 'shown')));
    handles.push(AdMob.addListener(events.failed, () => done('unavailable')));
    prepare().then(show).catch(() => done('unavailable'));
  }));
}
async function admobRewarded() {
  if (!(await admobReady)) return 'unavailable';
  return admobShow(
    () => AdMob.prepareRewardVideoAd({ adId: ADMOB.rewarded, npa: true, isTesting: !ADMOB_LIVE }),
    () => AdMob.showRewardVideoAd(),
    { reward: RewardAdPluginEvents.Rewarded, dismissed: RewardAdPluginEvents.Dismissed, failed: RewardAdPluginEvents.FailedToShow },
  );
}
async function admobInterstitial() {
  if (!(await admobReady)) return 'unavailable';
  return admobShow(
    () => AdMob.prepareInterstitial({ adId: ADMOB.interstitial, npa: true, isTesting: !ADMOB_LIVE }),
    () => AdMob.showInterstitial(),
    { dismissed: InterstitialAdPluginEvents.Dismissed, failed: InterstitialAdPluginEvents.FailedToShow },
  );
}

/* ---------- 網頁版：AdSense H5 遊戲廣告 ---------- */
function loadAdSense() {
  window.adsbygoogle = window.adsbygoogle || [];
  window.adBreak = window.adConfig = (o) => window.adsbygoogle.push(o);
  const s = document.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${WEB_AD_CLIENT}`;
  s.dataset.adClient = WEB_AD_CLIENT;
  if (WEB_AD_TEST) s.dataset.adbreakTest = 'on';
  document.head.append(s);
  window.adConfig({ preloadAdBreaks: 'on', sound: 'on' });
}
/** 回傳 'rewarded' | 'skipped' | 'shown' | 'none'（AdSense 沒有廣告可播，改播自家廣告） */
function webBreak(type) {
  return new Promise((resolve) => {
    let r = '';
    const o = {
      type, name: type === 'reward' ? 'trial-planet' : 'level-complete',
      adBreakDone: (info) => resolve(r || (info?.breakStatus === 'viewed' && type === 'next' ? 'shown' : 'none')),
    };
    if (type === 'reward') {
      o.beforeReward = (showAdFn) => showAdFn();
      o.adViewed = () => { r = 'rewarded'; };
      o.adDismissed = () => { r = 'skipped'; };
    }
    window.adBreak(o);
  });
}

/* ---------- 自家推廣廣告（網頁版還沒有 AdSense 或沒有廣告時） ---------- */
let houseTurn = Math.floor(Math.random() * HOUSE_ADS.length);
function houseAd(reward) {
  const a = HOUSE_ADS[houseTurn++ % HOUSE_ADS.length];
  const i = LANG_INDEX[lang] ?? 1;
  return new Promise((resolve) => {
    const box = document.createElement('div');
    box.className = 'modal house-ad';
    box.innerHTML = `<div class="dialog">
      <p class="ad-tag">${t('adTag')}</p>
      <img class="ad-icon" src="${a.img}" alt="" width="96" height="96" />
      <h2>${a.name[i]}</h2>
      <p class="ad-desc">${a.desc[i]}</p>
      <a class="btn btn-go btn-small" href="${a.url}?utm_source=planet&utm_campaign=house_ad" target="_blank" rel="noopener">${t('adPlayFree')} ↗</a>
      ${reward ? '<div class="ad-bar"><i></i></div>' : ''}
      <button class="link-btn ad-close">${t(reward ? 'adCloseNoReward' : 'close')}</button>
    </div>`;
    document.body.append(box);
    const close = (r) => { clearTimeout(timer); box.remove(); resolve(r); };
    box.querySelector('.ad-close').onclick = () => close(reward ? 'skipped' : 'shown');
    let timer = null;
    if (reward) {
      const fill = box.querySelector('.ad-bar i');
      fill.style.transition = `width ${HOUSE_SECONDS}s linear`;
      requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = '100%'; }));
      timer = setTimeout(() => close('rewarded'), HOUSE_SECONDS * 1000 + 300);
    }
  });
}

export const adsDebug = { get provider() { return provider; }, get trials() { return trials; }, get granted() { return granted; }, get finishedSinceAd() { return finishedSinceAd; }, house: houseAd };
