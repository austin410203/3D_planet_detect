/**
 * clues.js — 每次開局隨機分配物品位置，並自動產生線索
 * --------------------------------------------------
 * - 物品隨機分配到不同地標（每個地標最多一件），藏匿點種類也隨機
 * - 若隨機結果剛好等於關卡原本寫好的位置，就使用手寫的線索
 * - 否則從「線索／傳說／八卦」三種模板中產生，模板會帶入
 *   地標名稱、藏匿點、物品名稱與愛八卦的居民
 * - 模板與藏匿點說法依目前語言（src/locales/clue-text.js）
 */
import { SPOTS } from './props.js';
import { clueText, fixJosa } from './i18n.js';

/** 藏匿點在句子裡的說法（預設為「名稱＋裡」） */
export const insideOf = (type) => {
  const tx = clueText();
  return tx.inside[type] ?? tx.insideDefault.replace('{spot}', SPOTS[type].name);
};

function shuffle(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 產生本局的物品配置
 * @returns {Array} 每件物品 { name, emoji, at, spot, type, clue }
 */
export function rollTargets(level, rand) {
  const tx = clueText();
  const lms = shuffle(level.landmarks, rand);
  const usedTpl = new Set();
  const who = level.gossipers ?? tx.gossipers;
  return level.targets.map((t, i) => {
    const lm = lms[i % lms.length];
    // 有一半機率沿用原本劇本的藏匿點，否則從這顆星球的藏匿點種類中隨機挑
    const spot = t.at === lm.id && rand() < 0.5 ? t.spot : level.spotPool[Math.floor(rand() * level.spotPool.length)];
    if (t.at === lm.id && t.spot === spot && t.clue) return { ...t, at: lm.id, spot };

    // 從模板產生線索（三種類型隨機，避免重複使用同一句）
    const type = ['線索', '傳說', '八卦'][Math.floor(rand() * 3)];
    let tpl, k = 0;
    do { tpl = tx.templates[type][Math.floor(rand() * tx.templates[type].length)]; } while (usedTpl.has(tpl) && ++k < 10);
    usedTpl.add(tpl);
    const clue = fixJosa(tpl
      .replaceAll('{item}', `${t.emoji}${t.name}`)
      .replaceAll('{lm}', `${tx.quote[0]}${lm.name}${tx.quote[1]}`)
      .replaceAll('{spot}', SPOTS[spot].name)
      .replaceAll('{in}', insideOf(spot))
      .replaceAll('{who}', who[Math.floor(rand() * who.length)]));
    return { ...t, at: lm.id, spot, type, clue };
  });
}
