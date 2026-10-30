/**
 * store.js — 完整版：前 4 顆星球免費，買斷解鎖第 5～28 顆
 * --------------------------------------------------
 * iOS App：App Store 內購（ios/App/App/StorePlugin.swift，StoreKit 2，交易在裝置上驗證）
 * - 啟動時先讀本地快取（離線也能玩已購買的關卡），再背景向 StoreKit 確認（處理退款、家人共享、換手機）
 * 網頁版：Lemon Squeezy 序號，由 Worker 的 /api/license/* 代為驗證（worker/index.js）
 * - 啟用後記在 localStorage，每 7 天重新驗證一次；退款或停用的序號會重新上鎖，網路錯誤則維持已解鎖
 * - App 內絕對不能出現序號輸入或外部付款連結（審查指南 3.1.1）
 * Android 目前只有自己測試用的 APK，全部開放。
 * 商品設定見 docs/in-app-purchase.md、docs/lemon-squeezy-listing.md
 */
import { Capacitor, registerPlugin } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const Store = registerPlugin('Store');
export const FULL_UNLOCK_ID = 'com.austin410203.planetlostfound.fullunlock';
export const FREE_LEVELS = 4;
export const hasStore = Capacitor.getPlatform() === 'ios';
export const isWeb = !Capacitor.isNativePlatform();

/** 網頁版：Lemon Squeezy 結帳連結（商品建好後填入）。商店還在測試模式時只有網址加 ?lstest 才看得到購買按鈕 */
const LIVE = true;
const CHECKOUT = 'https://emptyofficex.lemonsqueezy.com/checkout/buy/51310518-d6bd-4e9c-9c3e-e6664fb9c62c';
const testing = (() => { try { return new URLSearchParams(location.search).has('lstest'); } catch { return false; } })();
export const WEB_PASS = {
  checkoutUrl: LIVE || testing ? CHECKOUT : '', // 空字串：購買按鈕顯示「付款頁面即將開放」
  price: 'NT$90',
};

const KEY = 'planetLostFound.store';
const listeners = new Set();
let owned = false;
let product = null; // { id, displayName, description, displayPrice }

function setOwned(v) {
  if (v === owned) return;
  owned = v;
  if (hasStore) Preferences.set({ key: KEY, value: v ? 'owned' : '' }).catch(() => {});
  listeners.forEach((fn) => fn());
}

/* ---------- 網頁版序號 ---------- */
const PASS_KEY = 'planetLostFound.pass';
const API = '/api/license/';
const RECHECK = 7 * 86400e3;
const readPass = () => { try { return JSON.parse(localStorage.getItem(PASS_KEY) || 'null'); } catch { return null; } };
const writePass = (v) => { try { v ? localStorage.setItem(PASS_KEY, JSON.stringify(v)) : localStorage.removeItem(PASS_KEY); } catch { /* 無痕模式等 */ } };
let pass = null;

async function call(path, body) {
  const r = await fetch(API + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || String(r.status));
  return j;
}
const deviceName = () => `web ${navigator.platform || ''} ${new Date().toISOString().slice(0, 10)}`.trim();

/** 網頁版：在這個瀏覽器啟用序號；成功回傳 true，失敗丟出原因（invalid、limit、empty、upstream…） */
export async function activateKey(key) {
  key = String(key || '').trim();
  if (!key) throw new Error('empty');
  const j = await call('activate', { key, name: deviceName() });
  pass = { ok: true, key, instance: j.instance, since: new Date().toISOString().slice(0, 10), checked: Date.now() };
  writePass(pass);
  setOwned(true);
  return true;
}
/** 網頁版：目前啟用的序號（只顯示前 8 碼） */
export const passInfo = () => (pass?.ok ? { key: `${pass.key.slice(0, 8)}…`, since: pass.since } : null);

async function recheck() {
  if (!pass?.ok || Date.now() - (pass.checked || 0) < RECHECK) return;
  try {
    const j = await call('validate', { key: pass.key, instance: pass.instance });
    if (j.valid) { pass.checked = Date.now(); writePass(pass); } else { pass = null; writePass(null); setOwned(false); }
  } catch { /* 離線或 Lemon Squeezy 暫時無法連線：下次再試 */ }
}

/** 啟動時呼叫：讀取快取的購買狀態，並在背景確認 */
export async function loadStore() {
  if (isWeb) {
    pass = readPass();
    owned = !!pass?.ok;
    recheck();
    return;
  }
  if (!hasStore) { owned = true; return; } // Android 測試版
  try { owned = (await Preferences.get({ key: KEY })).value === 'owned'; } catch { /* 用預設值 */ }
  Store.addListener('entitlementsChanged', ({ productIds }) => setOwned(productIds.includes(FULL_UNLOCK_ID)));
  Store.getEntitlements().then(({ productIds }) => setOwned(productIds.includes(FULL_UNLOCK_ID))).catch(() => {});
  Store.getProducts({ productIds: [FULL_UNLOCK_ID] })
    .then(({ products }) => { product = products[0] ?? null; listeners.forEach((fn) => fn()); })
    .catch(() => {});
}

export const store = {
  get owned() { return owned; },
  /** 價格字串：iOS 用 App Store 的當地價格（還沒查到時為 null），網頁版固定 NT$90 */
  get price() { return isWeb ? WEB_PASS.price : product?.displayPrice ?? null; },
  /** 第 index 關（從 0 起算）是否需要完整版 */
  needsPurchase: (index) => index >= FREE_LEVELS && !owned,
};

/** 購買完整版（iOS），回傳 purchased | cancelled | pending | failed | unavailable */
export async function purchaseFull() {
  if (!hasStore) return 'unavailable';
  try {
    const { status } = await Store.purchase({ productId: FULL_UNLOCK_ID });
    if (status === 'purchased') setOwned(true);
    return status;
  } catch { return 'failed'; }
}

/** 恢復購買（iOS），回傳是否擁有完整版（沒找到時不會把已擁有的狀態改掉） */
export async function restorePurchases() {
  if (!hasStore) return false;
  try {
    const { productIds } = await Store.restore();
    if (productIds.includes(FULL_UNLOCK_ID)) setOwned(true);
  } catch { /* 網路錯誤等，維持原狀 */ }
  return owned;
}

export const onStoreChange = (fn) => listeners.add(fn);
