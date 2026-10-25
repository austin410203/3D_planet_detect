/**
 * i18n.js — 多語系（繁中／English／日本語／한국어）
 * --------------------------------------------------
 * - 語言：設定裡選的優先，否則跟著裝置語言（中文 → 繁中、日文、韓文，其他 → 英文）
 * - t(key, vars)：介面文字（src/locales/ui.js），{名稱} 代入 vars
 * - applyStaticText()：把 HTML 上有 data-i18n／data-i18n-aria 的元素換成目前語言
 * - localizeLevels()：載入 src/locales/levels-<語言>.js，把關卡文字（星球名、委託、地標、物品、線索、雜物）
 *   與藏匿點名稱換成目前語言；繁中是原始資料，不需要額外檔案
 * 切換語言時存設定後重新載入頁面，所有畫面（含 3D 標籤）一次換好。
 */
import { UI } from './locales/ui.js';
import { CLUE_TEXT } from './locales/clue-text.js';

export const LANGS = ['zh', 'ja', 'ko', 'en'];
const HTML_LANG = { zh: 'zh-Hant', en: 'en', ja: 'ja', ko: 'ko' };
export let lang = 'zh';

function detect(saved) {
  if (LANGS.includes(saved)) return saved;
  for (const l of (navigator.languages?.length ? navigator.languages : [navigator.language || 'en'])) {
    const s = l.toLowerCase();
    if (s.startsWith('zh')) return 'zh';
    if (s.startsWith('ja')) return 'ja';
    if (s.startsWith('ko')) return 'ko';
    if (s.startsWith('en')) return 'en';
  }
  return 'en';
}

/** 啟動時呼叫：決定語言並設定 <html lang>（CSS 依此切換日文／韓文字型） */
export function initLang(saved) {
  lang = detect(saved);
  document.documentElement.lang = HTML_LANG[lang];
  return lang;
}

export function t(key, vars) {
  let s = UI[lang][key] ?? UI.zh[key] ?? key;
  if (typeof s === 'string' && vars) s = fixJosa(s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? ''));
  return s;
}

/**
 * 韓文助詞：依前一個字有沒有收尾子音（받침）選對的助詞
 * 模板寫成「이(가)／을(를)／은(는)／(으)로」，代入名稱後再換成正確的一個；其他語言不處理
 * 名稱後面若接著引號、括號，會往前找最後一個韓文字
 */
export function fixJosa(s) {
  if (lang !== 'ko') return s;
  return s.replace(/([가-힣])([^가-힣\s]{0,3})(이\(가\)|을\(를\)|은\(는\)|\(으\)로)/g, (_, ch, mid, p) => {
    const jong = (ch.charCodeAt(0) - 0xac00) % 28; // 0 = 沒有收尾子音，8 = ㄹ
    const pick = {
      '이(가)': jong ? '이' : '가',
      '을(를)': jong ? '을' : '를',
      '은(는)': jong ? '은' : '는',
      '(으)로': jong && jong !== 8 ? '으로' : '로',
    }[p];
    return ch + mid + pick;
  });
}

export function applyStaticText(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.innerHTML = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.title = t('titlePlain');
}

/** 線索模板、藏匿點說法、愛八卦的居民（clues.js 用） */
export const clueText = () => CLUE_TEXT[lang];

const LEVEL_FILES = {
  en: () => import('./locales/levels-en.js'),
  ja: () => import('./locales/levels-ja.js'),
  ko: () => import('./locales/levels-ko.js'),
};

/**
 * 把關卡資料與藏匿點名稱換成目前語言（直接改寫物件，其他模組拿到的參照不變）
 * 格式見 src/locales/levels-en.js 開頭說明；缺的欄位保留繁中
 */
export async function localizeLevels(levels, spots) {
  if (lang === 'zh') return;
  const { LEVEL_TEXT } = await LEVEL_FILES[lang]();
  for (const lv of levels) {
    const tx = LEVEL_TEXT[lv.id];
    if (!tx) continue;
    if (tx.name) lv.name = tx.name;
    if (tx.subtitle) lv.subtitle = tx.subtitle;
    if (tx.npc) lv.npc = { ...lv.npc, name: tx.npc };
    if (tx.story) lv.story = tx.story;
    if (tx.outro) lv.outro = tx.outro;
    for (const lm of lv.landmarks) {
      const l = tx.lm?.[lm.id];
      if (l) [lm.name, lm.lore] = [l[0] ?? lm.name, l[1] ?? lm.lore];
    }
    lv.targets.forEach((tg, i) => {
      const it = tx.items?.[i];
      if (it) [tg.name, tg.clue] = [it[0] ?? tg.name, it[1] ?? tg.clue];
    });
    (lv.junk ?? []).forEach((j, i) => { if (tx.junk?.[i]) j[1] = tx.junk[i]; });
  }
  const names = CLUE_TEXT[lang].spots;
  for (const [k, s] of Object.entries(spots)) if (names[k]) s.name = names[k];
}
