/**
 * clues.js — 每次開局隨機分配物品位置，並自動產生線索
 * --------------------------------------------------
 * - 物品隨機分配到不同地標（每個地標最多一件），藏匿點種類也隨機
 * - 若隨機結果剛好等於關卡原本寫好的位置，就使用手寫的線索
 * - 否則從「線索／傳說／八卦」三種模板中產生，模板會帶入
 *   地標名稱、藏匿點、物品名稱與愛八卦的居民
 */
import { SPOTS } from './props.js';

/** 藏匿點在句子裡的說法（預設為「名稱＋裡」） */
const INSIDE = {
  rock: '石頭底下', bush: '草叢裡', haystack: '乾草堆裡', mound: '沙堆裡', snowpile: '雪堆裡',
  iceblock: '冰塊裡', coral: '珊瑚叢裡', clam: '大貝殼裡', stump: '樹樁的洞裡', shroom: '大蘑菇底下',
  lavarock: '熔岩石的裂縫裡', ashpile: '灰燼堆裡', vent: '排氣管裡', tombstone: '墓碑後面',
  bones: '骨頭堆裡', crystal: '水晶簇後面', cloud: '雲朵裡', pumpkin: '南瓜裡', basket: '籃子裡',
};
export const insideOf = (type) => INSIDE[type] ?? `${SPOTS[type].name}裡`;

const TEMPLATES = {
  線索: [
    '有人看到{item}掉進了{lm}旁邊的{in}。',
    '一串小腳印通往{lm}，最後停在一個{spot}前面。',
    '{lm}附近的{spot}剛剛動了一下，裡面好像有{item}！',
    '地上留著{item}的痕跡，一路指向{lm}旁的{spot}。',
    '目擊者說：{item}最後出現在{lm}，就在那個{spot}旁邊。',
    '{lm}旁的{spot}比平常重了一點，有人動過手腳。',
  ],
  傳說: [
    '古老的歌謠唱著：『{lm}守護之物，沉睡於{in}。』',
    '傳說{lm}旁的{spot}有魔力，掉進去的東西都會被藏起來。',
    '老人家說，每逢月圓，{lm}旁的{spot}就會發出微光——那是{item}的光芒。',
    '相傳{lm}的建造者，把最珍貴的東西都藏在{in}。',
    '星球上流傳一句諺語：『想找失物，先翻{lm}的{spot}。』',
  ],
  八卦: [
    '噓——聽說{who}把{item}塞進了{lm}旁的{in}，別說是我講的！',
    '{who}最近老在{lm}附近鬼鬼祟祟，一直盯著那個{spot}看……',
    '大家都在傳：{lm}旁邊的{spot}裡藏著好東西，八成就是{item}啦！',
    '我昨天看到一隻小動物叼著{item}跑到{lm}，鑽進{in}了。',
    '{who}發誓，半夜聽到{lm}旁的{spot}裡有{item}的聲音。',
  ],
};
const GOSSIPERS = ['隔壁的大嬸', '愛八卦的鸚鵡', '路過的旅人', '調皮的小精靈', '值夜班的守衛', '話很多的松鼠'];

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
  const lms = shuffle(level.landmarks, rand);
  const usedTpl = new Set();
  const who = level.gossipers ?? GOSSIPERS;
  return level.targets.map((t, i) => {
    const lm = lms[i % lms.length];
    // 有一半機率沿用原本劇本的藏匿點，否則從這顆星球的藏匿點種類中隨機挑
    const spot = t.at === lm.id && rand() < 0.5 ? t.spot : level.spotPool[Math.floor(rand() * level.spotPool.length)];
    if (t.at === lm.id && t.spot === spot && t.clue) return { ...t, at: lm.id, spot };

    // 從模板產生線索（三種類型隨機，避免重複使用同一句）
    const type = ['線索', '傳說', '八卦'][Math.floor(rand() * 3)];
    let tpl, k = 0;
    do { tpl = TEMPLATES[type][Math.floor(rand() * TEMPLATES[type].length)]; } while (usedTpl.has(tpl) && ++k < 10);
    usedTpl.add(tpl);
    const clue = tpl
      .replaceAll('{item}', `${t.emoji}${t.name}`)
      .replaceAll('{lm}', `「${lm.name}」`)
      .replaceAll('{spot}', SPOTS[spot].name)
      .replaceAll('{in}', insideOf(spot))
      .replaceAll('{who}', who[Math.floor(rand() * who.length)]);
    return { ...t, at: lm.id, spot, type, clue };
  });
}
