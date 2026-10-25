/**
 * icons.js — 把畫面上的 emoji 換成遊戲自己的低多邊形圖示
 * --------------------------------------------------
 * 圖示由 Gemini 生成、scripts/slice_icons.py 切圖去背，放在 public/icons/game/<碼位>.webp；
 * src/icon-list.js 記錄目前有哪些。還沒有圖示的 emoji 維持原樣顯示，可以分批替換。
 * - startIconSwap()：監看整個頁面，文字裡出現有圖示的 emoji 就換成 <img>（含 CSS2D 標籤、提示訊息）
 * - iconUrl(emoji)：給 3D 物品彈出圖用
 */
import { ICON_FILES } from './icon-list.js';

const keyOf = (emoji) => [...emoji.replace(/️/g, '')].map((c) => c.codePointAt(0).toString(16)).join('-');

/** 有圖示就回傳網址，沒有回傳 null */
export function iconUrl(emoji) {
  const k = keyOf(emoji);
  return ICON_FILES.has(k) ? `/icons/game/${k}.webp` : null;
}

// emoji（含 ZWJ 組合，例如 🏴‍☠️）
const EMOJI_RE = /\p{Extended_Pictographic}️?(?:‍\p{Extended_Pictographic}️?)*/gu;

function swapTextNode(node) {
  const text = node.nodeValue;
  if (!text || !EMOJI_RE.test(text)) return;
  EMOJI_RE.lastIndex = 0;
  const frag = document.createDocumentFragment();
  let last = 0, changed = false;
  for (const m of text.matchAll(EMOJI_RE)) {
    const url = iconUrl(m[0]);
    if (!url) continue;
    changed = true;
    if (m.index > last) frag.append(text.slice(last, m.index));
    const img = document.createElement('img');
    img.className = 'gi';
    img.src = url;
    img.alt = m[0];
    img.draggable = false;
    frag.append(img);
    last = m.index + m[0].length;
  }
  if (!changed) return;
  if (last < text.length) frag.append(text.slice(last));
  node.replaceWith(frag);
}

function swapIn(root) {
  if (root.nodeType === Node.TEXT_NODE) { swapTextNode(root); return; }
  if (root.nodeType !== Node.ELEMENT_NODE || root.closest('script,style,textarea')) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(swapTextNode);
}

/** 啟動時呼叫一次：先換掉現有內容，之後新增或改變的文字也會自動換 */
export function startIconSwap() {
  if (!ICON_FILES.size) return;
  swapIn(document.body);
  new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'characterData') swapTextNode(r.target);
      else r.addedNodes.forEach(swapIn);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
}
