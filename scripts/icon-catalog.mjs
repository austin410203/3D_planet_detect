/**
 * icon-catalog.mjs — 整理遊戲中用到的所有 emoji，產生圖示清單與 Gemini 生成用的分組
 * --------------------------------------------------
 * 輸出 design/icons/catalog.json：
 *   icons:  [{ emoji, file, label, cat }]，file 為 emoji 碼位（例如 1f48c）
 *   sheets: 每 16 個一組（4×4），依「介面 → 物品 → 委託人 → 星球 → 雜物」排序
 * 用法：node scripts/icon-catalog.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LEVELS } from '../src/levels.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// 介面上的圖示（index.html、main.js、game.js 中出現的）
const UI = [
  ['🔍', '放大鏡（遊戲標誌）'], ['⭐', '星星（評分）'], ['🔒', '鎖頭（未解鎖）'], ['🔓', '打開的鎖頭（解鎖）'],
  ['💎', '鑽石（完整版）'], ['📅', '日曆（每日挑戰）'], ['🏆', '獎盃（排行榜）'], ['⚙️', '齒輪（設定）'],
  ['💡', '燈泡（提示）'], ['📖', '打開的書（線索手冊）'], ['🎵', '音符（配樂）'], ['🔊', '喇叭（音效）'],
  ['📳', '震動中的手機（震動）'], ['🪐', '土星（選關）'], ['🔥', '火焰（連續天數）'], ['🎉', '拉炮（找到了）'],
  ['⏳', '沙漏（等待）'], ['✅', '打勾（完成）'], ['📍', '地圖圖釘（地標）'], ['✨', '閃光（亮點）'],
];

// 去掉變體選擇符，統一 key（⚙️ 與 ⚙ 視為同一個）
const norm = (e) => e.replace(/️/g, '');
const fileOf = (e) => [...norm(e)].map((c) => c.codePointAt(0).toString(16)).join('-');

const seen = new Map();
const add = (emoji, label, cat) => {
  const k = norm(emoji);
  if (!seen.has(k)) seen.set(k, { emoji: k, file: fileOf(k), label, cat });
};
UI.forEach(([e, l]) => add(e, l, 'ui'));
for (const lv of LEVELS) for (const t of lv.targets) add(t.emoji, t.name, 'item');
for (const lv of LEVELS) add(lv.npc.emoji, lv.npc.name, 'npc');
for (const lv of LEVELS) add(lv.emoji, `${lv.name}的代表圖`, 'planet');
for (const lv of LEVELS) for (const [e, l] of lv.junk ?? []) add(e, l, 'junk');

const icons = [...seen.values()];
const sheets = [];
for (let i = 0; i < icons.length; i += 16) sheets.push(icons.slice(i, i + 16).map((x) => x.file));

const out = join(root, 'design', 'icons', 'catalog.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ icons, sheets }, null, 1) + '\n');
const count = (c) => icons.filter((x) => x.cat === c).length;
console.log(`共 ${icons.length} 個圖示、${sheets.length} 張圖示表：介面 ${count('ui')}、物品 ${count('item')}、委託人 ${count('npc')}、星球 ${count('planet')}、雜物 ${count('junk')}`);
