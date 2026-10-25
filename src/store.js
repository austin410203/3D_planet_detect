/**
 * store.js — App 內購買：買斷「完整版」解鎖第 9～28 關
 * --------------------------------------------------
 * 原生端：ios/App/App/StorePlugin.swift（StoreKit 2，交易在裝置上驗證）
 * - 啟動時先讀本地快取（離線也能玩已購買的關卡），再背景向 StoreKit 確認（處理退款、家人共享、換手機）
 * - 網頁版沒有內購：WEB_FULL_ACCESS 為 true 時網頁版全部免費，false 時第 9 關以後提示下載 App
 * 商品設定見 docs/in-app-purchase.md
 */
import { Capacitor, registerPlugin } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const Store = registerPlugin('Store');
export const FULL_UNLOCK_ID = 'com.austin410203.planetlostfound.fullunlock';
export const FREE_LEVELS = 8;
export const hasStore = Capacitor.getPlatform() === 'ios';
/** App 上架前網頁版先維持全部免費，避免影響現有的網頁玩家；上架後改成 false */
const WEB_FULL_ACCESS = true;

const KEY = 'planetLostFound.store';
const listeners = new Set();
let owned = false;
let product = null; // { id, displayName, description, displayPrice }

function setOwned(v) {
  if (v === owned) return;
  owned = v;
  Preferences.set({ key: KEY, value: v ? 'owned' : '' }).catch(() => {});
  listeners.forEach((fn) => fn());
}

/** 啟動時呼叫：讀取快取的購買狀態，並在背景向 App Store 確認 */
export async function loadStore() {
  if (!hasStore) { owned = WEB_FULL_ACCESS; return; }
  try { owned = (await Preferences.get({ key: KEY })).value === 'owned'; } catch { /* 用預設值 */ }
  Store.addListener('entitlementsChanged', ({ productIds }) => setOwned(productIds.includes(FULL_UNLOCK_ID)));
  Store.getEntitlements().then(({ productIds }) => setOwned(productIds.includes(FULL_UNLOCK_ID))).catch(() => {});
  Store.getProducts({ productIds: [FULL_UNLOCK_ID] })
    .then(({ products }) => { product = products[0] ?? null; listeners.forEach((fn) => fn()); })
    .catch(() => {});
}

export const store = {
  get owned() { return owned; },
  /** 當地貨幣的價格字串（例如 NT$90），還沒查到時為 null */
  get price() { return product?.displayPrice ?? null; },
  /** 第 index 關（從 0 起算）是否需要完整版 */
  needsPurchase: (index) => index >= FREE_LEVELS && !owned,
};

/** 購買完整版，回傳 purchased | cancelled | pending | failed | unavailable */
export async function purchaseFull() {
  if (!hasStore) return 'unavailable';
  try {
    const { status } = await Store.purchase({ productId: FULL_UNLOCK_ID });
    if (status === 'purchased') setOwned(true);
    return status;
  } catch { return 'failed'; }
}

/** 恢復購買，回傳是否擁有完整版（沒找到時不會把已擁有的狀態改掉） */
export async function restorePurchases() {
  if (!hasStore) return false;
  try {
    const { productIds } = await Store.restore();
    if (productIds.includes(FULL_UNLOCK_ID)) setOwned(true);
  } catch { /* 網路錯誤等，維持原狀 */ }
  return owned;
}

export const onStoreChange = (fn) => listeners.add(fn);
