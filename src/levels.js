/**
 * levels.js — 八顆星球關卡資料
 * --------------------------------------------------
 * 每關包含：
 *   theme      星球外觀（地形配色、海面、大氣、背景、燈光、裝飾）
 *   npc/story  委託人與狀況說明、過關台詞
 *   landmarks  有名字的地標（id、模型、經緯度、介紹）
 *   targets    要找的物品：藏在「某地標旁的某種藏匿點」，
 *              並附一條線索（線索／傳說／八卦）
 *   spotPool   這顆星球會出現的藏匿點種類（用來產生干擾點）
 *   extraSpots 額外隨機散布的干擾藏匿點數量
 *   junk       干擾點裡可能翻出的搞笑雜物
 *   stars      [三星秒數, 二星秒數]；超過二星秒數仍完成即為一星
 */

import { EXTRA_LEVELS } from './levels-extra.js';

const BASE_LEVELS = [
  /* ======================= 1. 綠野星 ======================= */
  {
    id: 'verdant', name: '綠野星', emoji: '🌳', subtitle: '郵差的失物',
    theme: {
      seed: 10,
      biomes: [{ type: 'land1', lat: 15, lon: 0 }, { type: 'land1', lat: -20, lon: 70 }, { type: 'land2', lat: 5, lon: 140 }, { type: 'sea', lat: 0, lon: -110 }, { type: 'sea', lat: -35, lon: -170 }],
      palette: {
        land1: ['#8fd14f', '#6dbb3c'], land2: ['#f2c76e', '#e0a955'], peak: ['#f4f8ff', '#d6e4f5'],
        sea: ['#e9d9a6', '#d8c48a'], shore: ['#f5e3a8', '#ecd590'],
      },
      seaColor: '#3cc6d6', atmosphere: '#7fd8ff', background: '#070b1a',
      light: { ambient: '#b8c4ff', sky: '#dff3ff', ground: '#3a2f5a', sun: 2.6 },
      decor: [{ kind: 'tree', biomes: ['land1'], count: 70 }, { kind: 'rock', biomes: ['land1', 'land2'], count: 20 }, { kind: 'pine', biomes: ['peak'], count: 30 }, { kind: 'cactus', biomes: ['land2'], count: 14 }],
    },
    npc: { emoji: '🐦', name: '藍鵲郵差 Pip' },
    story: '糟糕！我的郵包破了一個洞，三封重要的信在飛越星球時掉了出來……可以幫我找回來嗎？鎮上的人好像都看到了些什麼。',
    outro: '太好了，信都找回來了！今天的郵件可以準時送達啦～',
    landmarks: [
      { id: 'cabin', model: 'cabin', name: '紅頂小屋', lat: 8, lon: -14, lore: '星球上第一棟房子，Pip 的郵局就設在這裡。' },
      { id: 'lighthouse', model: 'lighthouse', name: '海岬燈塔', lat: 14, lon: -52, lore: '燈塔守在海邊，海風常常把東西吹到它腳下。' },
      { id: 'windmill', model: 'windmill', name: '風車磨坊', lat: 28, lon: 34, lore: '磨坊老爹是個害羞的詩人。' },
      { id: 'castle', model: 'castle', name: '藍頂城堡', lat: -26, lon: 62, lore: '國王很小氣，從不相信銀行。' },
    ],
    targets: [
      { name: '情書', emoji: '💌', at: 'windmill', spot: 'haystack', type: '八卦', clue: '聽說磨坊老爹每天都把偷偷寫的情詩塞進乾草堆裡，羞死人了！' },
      { name: '國王的包裹', emoji: '📦', at: 'castle', spot: 'barrel', type: '傳說', clue: '城堡的國王從不用金庫，他總說：「木桶才是最安全的保險箱。」' },
      { name: '明信片', emoji: '📨', at: 'lighthouse', spot: 'rock', type: '線索', clue: 'Pip：我飛過燈塔時郵包被海風吹開，有東西卡進了燈塔腳下的石頭縫！' },
    ],
    spotPool: ['bush', 'rock', 'barrel', 'haystack', 'crate', 'stump'],
    extraSpots: 10,
    junk: [['🧦', '一隻臭襪子'], ['🐌', '一隻害羞的蝸牛'], ['🍌', '香蕉皮']],
    stars: [60, 120],
  },

  /* ======================= 2. 熔岩星 ======================= */
  {
    id: 'ember', name: '熔岩星', emoji: '🌋', subtitle: '火焰祭典的聖物',
    theme: {
      seed: 23,
      biomes: [{ type: 'land1', lat: 10, lon: 20 }, { type: 'land2', lat: -25, lon: 110 }, { type: 'land1', lat: 30, lon: -80 }, { type: 'sea', lat: -10, lon: -150 }, { type: 'sea', lat: 40, lon: 160 }],
      palette: {
        land1: ['#6a4a40', '#5c4038'], land2: ['#8a7060', '#7a6252'], peak: ['#3a3048', '#463a56'],
        sea: ['#5a2a1a', '#4a2214'], shore: ['#7a3a22', '#8a4628'],
      },
      seaColor: '#ff6a1a', seaOpacity: 1, seaGlow: 0.8, seaRough: 0.6,
      atmosphere: '#ff7a3a', atmoIntensity: 0.9, background: '#1a0806',
      light: { ambient: '#ffc0a0', sky: '#ffc8a0', ground: '#6a2a18', sun: 2.6 },
      decor: [{ kind: 'spikes', biomes: ['land1', 'peak'], count: 45 }, { kind: 'emberRock', biomes: ['land1', 'land2'], count: 40 }],
    },
    npc: { emoji: '🔥', name: '火精靈 Fia' },
    story: '今晚就是火焰祭典了，可是四件聖物全都不見了！沒有它們，星球的火會一點一點熄滅……拜託你，快幫我找回來！',
    outro: '聖物都回來了！今晚的營火會是星系裡最旺的！',
    landmarks: [
      { id: 'volcano', model: 'volcano', name: '咆哮火山', lat: 12, lon: 18, lore: '每天中午準時噴發，比時鐘還準。' },
      { id: 'forge', model: 'forge', name: '矮人鍛造屋', lat: -18, lon: 95, lore: '矮人鐵匠愛喝薑汁汽水，喝了就會亂丟東西。' },
      { id: 'tower', model: 'obsidianTower', name: '黑曜石塔', lat: 34, lon: -70, lore: '塔裡住著一位很怕黑的火焰巫師。' },
      { id: 'nest', model: 'phoenixNest', name: '鳳凰巢', lat: -30, lon: 40, lore: '鳳凰每千年在這裡浴火重生一次。' },
    ],
    targets: [
      { name: '鳳凰羽毛', emoji: '🪶', at: 'nest', spot: 'ashpile', type: '傳說', clue: '鳳凰重生時，舊羽毛會混進灰燼裡——想找羽毛，就往鳳凰巢旁的灰裡挖吧。' },
      { name: '永恆燭火', emoji: '🕯️', at: 'tower', spot: 'pot', type: '八卦', clue: '黑曜石塔的巫師超怕黑，聽說她睡覺時都把蠟燭藏在塔邊的陶罐裡。' },
      { name: '熔岩寶石', emoji: '💎', at: 'volcano', spot: 'lavarock', type: '線索', clue: '火山噴發那晚，有顆會發光的寶石滾到了火山腳下，那塊石頭的裂縫到現在還在冒紅光。' },
      { name: '雷神鐵鎚', emoji: '🔨', at: 'forge', spot: 'barrel', type: '八卦', clue: '鍛造屋的矮人喝醉後把鐵鎚丟進門口的木桶，醒來還一直說是小偷偷的。' },
    ],
    spotPool: ['lavarock', 'ashpile', 'pot', 'barrel', 'crate', 'rock'],
    extraSpots: 12,
    junk: [['🍠', '一顆烤焦的地瓜'], ['🧯', '過期的滅火器'], ['🥵', '一個熱到冒汗的笑臉']],
    stars: [80, 150],
  },

  /* ======================= 3. 汪洋星 ======================= */
  {
    id: 'aqua', name: '汪洋星', emoji: '🌊', subtitle: '海龜奶奶的生日派對',
    theme: {
      seed: 37,
      biomes: [{ type: 'sea', lat: 0, lon: 0 }, { type: 'sea', lat: 0, lon: 120 }, { type: 'sea', lat: 0, lon: -120 }, { type: 'land1', lat: 20, lon: 60 }, { type: 'land1', lat: -15, lon: -60 }, { type: 'sea', lat: -40, lon: 60 }],
      snowLine: 1.2,
      heights: { sea: -0.2, land1: 0.1 },
      palette: {
        land1: ['#f2d98a', '#ead08a'], land2: ['#7cc95a', '#6dbb3c'], peak: ['#ffffff', '#eeeeee'],
        sea: ['#4fb8a8', '#3fa5a0'], shore: ['#f5e3a8', '#ecd590'],
      },
      seaColor: '#2fb8d6', seaOpacity: 0.5, atmosphere: '#7fe8ff', background: '#04121e',
      light: { ambient: '#a8e6ff', sky: '#dff8ff', ground: '#1a4a5a', sun: 2.6 },
      decor: [{ kind: 'palm', biomes: ['land1'], count: 22 }, { kind: 'coral', biomes: ['sea'], count: 60 }, { kind: 'seaweed', biomes: ['sea'], count: 50 }],
    },
    npc: { emoji: '🐢', name: '海龜奶奶' },
    story: '今天是我 200 歲生日，孫子們把派對道具藏起來玩捉迷藏，結果全都忘了藏在哪！有些可能在海底喔，海水很清澈，仔細看就看得到。',
    outro: '呵呵呵，派對可以開始了！要不要留下來吃塊蛋糕？',
    landmarks: [
      { id: 'lighthouse', model: 'lighthouse', name: '白浪燈塔', lat: 22, lon: 58, lore: '整顆星球唯一的燈塔，守在最大的島上。' },
      { id: 'wreck', model: 'shipwreck', name: '海盜沉船', lat: 2, lon: 2, lore: '小章魚們最愛的遊樂場。', anywhere: true },
      { id: 'palace', model: 'coralPalace', name: '珊瑚宮殿', lat: -5, lon: 120, lore: '海底最華麗的建築，門口有隻愛打瞌睡的大貝殼。', anywhere: true },
      { id: 'buoy', model: 'buoy', name: '發光浮標', lat: -16, lon: -58, lore: '晚上會發出藍光，海鷗都在這裡聚會。' },
    ],
    targets: [
      { name: '派對喇叭', emoji: '🎺', at: 'wreck', spot: 'crate', type: '八卦', clue: '小章魚說他把喇叭塞進了沉船旁的木箱，因為「沉船太安靜了，需要音樂」。' },
      { name: '生日蛋糕', emoji: '🍰', at: 'palace', spot: 'clam', type: '線索', clue: '珊瑚宮殿門口有個大貝殼一開一合，剛剛好放得下一塊蛋糕。' },
      { name: '彩色氣球', emoji: '🎈', at: 'lighthouse', spot: 'coral', type: '傳說', clue: '燈塔守護者說：燈塔下的珊瑚叢會把迷路的東西藏起來保護。' },
      { name: '神秘禮物', emoji: '🎁', at: 'buoy', spot: 'barrel', type: '八卦', clue: '浮標附近的海鷗整天盯著一個木桶，說裡面有很香的東西。' },
    ],
    spotPool: ['clam', 'coral', 'crate', 'barrel', 'rock'],
    extraSpots: 12, spotsAnywhere: true,
    junk: [['🥾', '一隻舊靴子'], ['🦀', '一隻生氣的螃蟹'], ['🫧', '一串泡泡']],
    stars: [90, 170],
  },

  /* ======================= 4. 糖果星 ======================= */
  {
    id: 'candy', name: '糖果星', emoji: '🍭', subtitle: '甜點大賽的秘方',
    theme: {
      seed: 51,
      biomes: [{ type: 'land1', lat: 10, lon: 0 }, { type: 'land2', lat: -10, lon: 90 }, { type: 'land1', lat: 20, lon: -100 }, { type: 'sea', lat: -10, lon: 180 }, { type: 'land2', lat: -30, lon: -40 }],
      palette: {
        land1: ['#ffb3d1', '#ffc4dc'], land2: ['#a8f0d0', '#bff5dd'], peak: ['#fffaf5', '#fff0f5'],
        sea: ['#7a4a2a', '#6a3e22'], shore: ['#f5d0a0', '#ecc490'],
      },
      seaColor: '#6b3a22', seaOpacity: 0.97, seaRough: 0.15,
      atmosphere: '#ff9ff3', atmoIntensity: 0.9, background: '#24102a',
      light: { ambient: '#ffd6f0', sky: '#fff0fa', ground: '#6a3a5a', sun: 2.4 },
      decor: [{ kind: 'candyCane', biomes: ['land1'], count: 35 }, { kind: 'lollipop', biomes: ['land2', 'land1'], count: 40 }, { kind: 'gumdrop', biomes: ['land1', 'land2', 'peak'], count: 45 }],
    },
    npc: { emoji: '🧁', name: '甜點師 Mochi' },
    story: '明天就是星際甜點大賽了！我的四樣秘方材料被搗蛋糖精靈藏起來了，居民們都在傳一些奇怪的八卦……快幫我找回來！',
    outro: '材料齊了！這次的冠軍蛋糕一定會甜到冒泡泡～',
    landmarks: [
      { id: 'ginger', model: 'gingerbread', name: '薑餅屋', lat: 10, lon: 2, lore: '薑餅人住在這裡，他是全星球最貪吃的人。' },
      { id: 'lolly', model: 'lollipopTree', name: '棒棒糖大樹', lat: -12, lon: 88, lore: '一年只結一顆彩虹糖的神奇大樹。' },
      { id: 'fountain', model: 'chocoFountain', name: '巧克力噴泉', lat: 24, lon: -96, lore: '24 小時流個不停，旁邊總是黏黏的。' },
      { id: 'castle', model: 'candyCastle', name: '糖果城堡', lat: -32, lon: -40, lore: '公主很喜歡收集亮晶晶的東西。' },
    ],
    targets: [
      { name: '金色蜂蜜', emoji: '🍯', at: 'ginger', spot: 'cupcake', type: '八卦', clue: '薑餅人最貪吃了，他每次偷蜂蜜都藏在屋旁的杯子蛋糕裡，以為沒人發現。' },
      { name: '彩虹糖', emoji: '🍬', at: 'lolly', spot: 'jar', type: '傳說', clue: '棒棒糖大樹每年結出的那顆彩虹糖，都會掉進樹下的糖果罐裡。' },
      { name: '星星牛奶', emoji: '🥛', at: 'fountain', spot: 'gift', type: '線索', clue: '巧克力噴泉旁的禮物盒一直在晃，裡面有液體晃來晃去的聲音……' },
      { name: '閃亮糖粉', emoji: '✨', at: 'castle', spot: 'crate', type: '八卦', clue: '有人看到公主半夜在城堡外的木箱裡藏了東西，閃閃發亮的。' },
    ],
    spotPool: ['cupcake', 'jar', 'gift', 'crate', 'bush'],
    extraSpots: 12,
    junk: [['🦷', '一顆蛀牙'], ['🍋', '酸到皺眉的檸檬'], ['🪥', '一支牙刷']],
    stars: [80, 150],
  },

  /* ======================= 5. 冰晶星 ======================= */
  {
    id: 'frost', name: '冰晶星', emoji: '❄️', subtitle: '企鵝探險隊的裝備',
    theme: {
      seed: 64,
      biomes: [{ type: 'land1', lat: 0, lon: 0 }, { type: 'land2', lat: 10, lon: 120 }, { type: 'land1', lat: -10, lon: -120 }, { type: 'sea', lat: -20, lon: 60 }, { type: 'sea', lat: 20, lon: -60 }],
      snowLine: 0.72,
      palette: {
        land1: ['#eef6ff', '#dfeefa'], land2: ['#bfe3f5', '#a8d6ee'], peak: ['#ffffff', '#e6f2ff'],
        sea: ['#5a7a9a', '#4a6a8a'], shore: ['#d6eaf5', '#cde3f0'],
      },
      seaColor: '#9fdcf0', seaOpacity: 0.92, seaRough: 0.05,
      atmosphere: '#bfe9ff', background: '#0a1426',
      light: { ambient: '#c8e6ff', sky: '#eef8ff', ground: '#3a4a6a', sun: 2.3 },
      decor: [{ kind: 'pine', biomes: ['land1', 'peak'], count: 55 }, { kind: 'iceSpike', biomes: ['land2', 'peak'], count: 40 }, { kind: 'rock', biomes: ['land2'], count: 12 }],
    },
    npc: { emoji: '🐧', name: '企鵝隊長 Pengo' },
    story: '昨晚的暴風雪把我們探險隊的裝備吹得到處都是！沒有指南針和地圖，我們就回不了家了……',
    outro: '裝備全員到齊！探險隊出發——往南走，應該吧？',
    landmarks: [
      { id: 'igloo', model: 'igloo', name: '冰屋', lat: 4, lon: 4, lore: '探險隊的營地，住著一隻愛打小報告的海豹。' },
      { id: 'icecastle', model: 'iceCastle', name: '冰之城堡', lat: 18, lon: 118, lore: '暴風雪就是從這個方向吹來的。' },
      { id: 'snowman', model: 'snowman', name: '雪人先生', lat: -14, lon: -118, lore: '雪人先生的紅圍巾是他最大的驕傲。' },
      { id: 'frozentree', model: 'frozenTree', name: '冰封之樹', lat: -30, lon: 10, lore: '傳說它會守護所有迷路的人。' },
    ],
    targets: [
      { name: '指南針', emoji: '🧭', at: 'icecastle', spot: 'iceblock', type: '線索', clue: '暴風雪從冰之城堡那邊吹來，城堡旁的冰塊裡好像凍著一個會指方向的東西。' },
      { name: '毛毛圍巾', emoji: '🧣', at: 'snowman', spot: 'snowpile', type: '八卦', clue: '雪人先生最近脖子特別暖，可他的圍巾明明還是紅色那條……他旁邊的雪堆很可疑！' },
      { name: '探險地圖', emoji: '🗺️', at: 'frozentree', spot: 'crate', type: '傳說', clue: '冰封之樹守護所有迷路者的地圖，據說都收在樹下的木箱裡。' },
      { name: '晚餐鮮魚', emoji: '🐟', at: 'igloo', spot: 'barrel', type: '八卦', clue: '冰屋的海豹說：有隻企鵝把魚藏進門口的木桶，打算半夜偷吃。' },
    ],
    spotPool: ['snowpile', 'iceblock', 'crate', 'barrel', 'rock'],
    extraSpots: 13,
    junk: [['🧤', '一隻落單的手套'], ['🥶', '一個冷到發抖的臉'], ['🍦', '一支冷凍過頭的冰淇淋']],
    stars: [85, 160],
  },

  /* ======================= 6. 沙丘星 ======================= */
  {
    id: 'dune', name: '沙丘星', emoji: '🏜️', subtitle: '商隊的貨物',
    theme: {
      seed: 77,
      biomes: [{ type: 'land1', lat: 0, lon: 0 }, { type: 'land1', lat: 20, lon: 120 }, { type: 'land2', lat: -20, lon: -100 }, { type: 'land1', lat: -30, lon: 60 }, { type: 'land1', lat: 40, lon: -10 }, { type: 'land2', lat: 10, lon: -170 }, { type: 'land1', lat: 50, lon: -90 }, { type: 'sea', lat: 35, lon: -45 }],
      snowLine: 0.92,
      heights: { land1: 0.12, land2: 0.2 },
      palette: {
        land1: ['#f0cf86', '#e8c27a'], land2: ['#d4825a', '#c47048'], peak: ['#f5e2b0', '#ecd6a0'],
        sea: ['#c8a060', '#b89050'], shore: ['#f5e3a8', '#ecd590'],
      },
      seaColor: '#3cc6d6', atmosphere: '#ffcf8a', background: '#1a1008',
      light: { ambient: '#ffe0b0', sky: '#fff2d6', ground: '#6a4a2a', sun: 2.8 },
      decor: [{ kind: 'cactus', biomes: ['land1'], count: 35 }, { kind: 'dune', biomes: ['land1'], count: 40 }, { kind: 'rock', biomes: ['land2'], count: 30 }],
    },
    npc: { emoji: '🐪', name: '駱駝商人 Kamal' },
    story: '我的商隊被沙塵暴襲擊，四件珍貴的貨物被吹散到沙漠各處。沙漠裡的傳說和流言，也許能幫上忙。',
    outro: '貨物一件不少！這趟生意一定大賺，分你一杯冰沙！',
    landmarks: [
      { id: 'pyramid', model: 'pyramid', name: '黃金金字塔', lat: 2, lon: 2, lore: '入口旁站著「永遠不會說話的守門人」。' },
      { id: 'oasis', model: 'oasis', name: '月牙綠洲', lat: 22, lon: 118, lore: '一群愛撿東西的猴子住在這裡。' },
      { id: 'obelisk', model: 'obelisk', name: '藍紋方尖碑', lat: -24, lon: -96, lore: '碑上的藍色紋路據說是古代的導航圖。' },
      { id: 'tent', model: 'tent', name: '商隊帳篷', lat: -28, lon: 58, lore: '商隊的臨時營地，昨晚發生了怪事。' },
    ],
    targets: [
      { name: '古老鑰匙', emoji: '🗝️', at: 'pyramid', spot: 'pot', type: '傳說', clue: '法老會把鑰匙交給「永遠不會說話的守門人」——就是金字塔旁的陶罐。' },
      { name: '藏寶圖', emoji: '📜', at: 'oasis', spot: 'mound', type: '八卦', clue: '綠洲的猴子愛撿東西，常把撿到的紙捲埋進水邊的沙堆。' },
      { name: '青瓷茶壺', emoji: '🫖', at: 'obelisk', spot: 'crate', type: '線索', clue: '方尖碑旁的木箱傳出叮叮噹噹的瓷器碰撞聲。' },
      { name: '神燈', emoji: '🪔', at: 'tent', spot: 'barrel', type: '八卦', clue: '帳篷主人發誓：昨晚有盞燈自己溜出帳篷，躲進了附近的木桶！' },
    ],
    spotPool: ['pot', 'mound', 'crate', 'barrel', 'rock'],
    extraSpots: 14,
    junk: [['🦂', '一隻蠍子（快放下！）'], ['🌵', '一根仙人掌刺'], ['🥾', '沙子灌滿的靴子']],
    stars: [85, 160],
  },

  /* ======================= 7. 蘑菇星 ======================= */
  {
    id: 'spore', name: '蘑菇星', emoji: '🍄', subtitle: '夜光森林的寶物',
    theme: {
      seed: 88,
      biomes: [{ type: 'land1', lat: 10, lon: 0 }, { type: 'land2', lat: -10, lon: 100 }, { type: 'land1', lat: 0, lon: -110 }, { type: 'sea', lat: 30, lon: 160 }, { type: 'land2', lat: -35, lon: -30 }],
      palette: {
        land1: ['#7a5ab8', '#8a6ac8'], land2: ['#3fa58c', '#4fb89c'], peak: ['#c8b8ff', '#d8c8ff'],
        sea: ['#2a3a5a', '#22324e'], shore: ['#5a4a8a', '#64549a'],
      },
      seaColor: '#5af0ff', seaOpacity: 0.6, seaGlow: 0.6,
      atmosphere: '#b48cff', atmoIntensity: 1, background: '#0c0618',
      light: { ambient: '#8a7aff', sky: '#c8b8ff', ground: '#2a1a4a', sun: 1.6 },
      decor: [{ kind: 'shroom', biomes: ['land1'], count: 50 }, { kind: 'glowShroom', biomes: ['land1', 'land2'], count: 60 }, { kind: 'tree', biomes: ['land2'], count: 35 }],
    },
    npc: { emoji: '🦉', name: '貓頭鷹長老' },
    story: '森林慶典要開始了，可是四件寶物在昨晚的仲夏夜派對後全都不見了。森林居民的話不一定可信，但總有一點真相……',
    outro: '呼呼～寶物都找到了，森林慶典可以開始了！',
    landmarks: [
      { id: 'house', model: 'mushroomHouse', name: '紅傘蘑菇屋', lat: 12, lon: 2, lore: '蘑菇長老的家，門口有株會吃書的大蘑菇。' },
      { id: 'ring', model: 'fairyRing', name: '妖精圈', lat: -12, lon: 98, lore: '午夜時分，妖精圈的光會指向附近的樹樁。' },
      { id: 'hollow', model: 'hollowTree', name: '空心老樹', lat: 2, lon: -108, lore: '樹洞裡住著一隻耳朵很靈的貓頭鷹。' },
      { id: 'pond', model: 'glowPond', name: '夜光池塘', lat: -36, lon: -28, lore: '池水在夜裡會發出青藍色的光。' },
    ],
    targets: [
      { name: '水晶球', emoji: '🔮', at: 'ring', spot: 'stump', type: '線索', clue: '妖精圈的光在午夜指向一個樹樁——水晶球就滾到那裡去了。' },
      { name: '精靈小提琴', emoji: '🎻', at: 'hollow', spot: 'bush', type: '八卦', clue: '空心樹裡的貓頭鷹抱怨：旁邊的草叢一直傳出走音的音樂，吵死了。' },
      { name: '咒語書', emoji: '📕', at: 'house', spot: 'shroom', type: '傳說', clue: '蘑菇屋門口有株會吃書的大蘑菇，借了不還的書都在它肚子裡。' },
      { name: '月光瓶', emoji: '🌙', at: 'pond', spot: 'pot', type: '八卦', clue: '夜光池塘邊的陶罐，晚上總是比池塘還亮，大家都覺得怪怪的。' },
    ],
    spotPool: ['stump', 'bush', 'shroom', 'pot', 'rock'],
    extraSpots: 14,
    junk: [['🐛', '一隻睡著的毛毛蟲'], ['🧦', '妖精的襪子'], ['🍂', '一片枯葉']],
    stars: [90, 170],
  },

  /* ======================= 8. 齒輪星 ======================= */
  {
    id: 'gear', name: '齒輪星', emoji: '⚙️', subtitle: '主機重新開機',
    theme: {
      seed: 99,
      biomes: [{ type: 'land1', lat: 0, lon: 0 }, { type: 'land2', lat: 20, lon: 110 }, { type: 'land1', lat: -20, lon: -100 }, { type: 'sea', lat: -30, lon: 80 }, { type: 'land2', lat: 30, lon: -40 }],
      snowLine: 0.85,
      palette: {
        land1: ['#8a929c', '#7a828c'], land2: ['#a8643a', '#985a34'], peak: ['#c8d0d8', '#b8c0c8'],
        sea: ['#1a1a22', '#22222c'], shore: ['#4a5058', '#545a62'],
      },
      seaColor: '#1f2a3a', seaOpacity: 0.92, seaRough: 0.1,
      atmosphere: '#5affb0', background: '#060a10',
      light: { ambient: '#b8d8ff', sky: '#dff0ff', ground: '#2a2a3a', sun: 2.4 },
      decor: [{ kind: 'gear', biomes: ['land1'], count: 35 }, { kind: 'pipe', biomes: ['land1', 'peak'], count: 40 }, { kind: 'bolt', biomes: ['land2'], count: 40 }],
    },
    npc: { emoji: '🤖', name: '維修機器人 Bolt' },
    story: '嗶——警告！星球主機當機了！重新開機需要四個零件，但它們被清潔機器人當成垃圾收走了……嗶嗶，請協助尋找。',
    outro: '嗶嗶！系統重新啟動完成。感謝您的協助，好評五顆星。',
    landmarks: [
      { id: 'factory', model: 'factory', name: '綠光工廠', lat: 2, lon: 2, lore: '排氣管最近一直在冒火花。' },
      { id: 'dish', model: 'dish', name: '衛星天線', lat: 22, lon: 108, lore: '管理員是個愛偷看別人資料的八卦機器人。' },
      { id: 'geartower', model: 'gearTower', name: '齒輪塔', lat: -22, lon: -98, lore: '塔上的大齒輪好像少了一齒，轉起來喀喀作響。' },
      { id: 'statue', model: 'robotStatue', name: '機器人雕像', lat: 32, lon: -42, lore: '紀念第一代機器人的雕像，一直在掉零件。' },
    ],
    targets: [
      { name: '能量電池', emoji: '🔋', at: 'factory', spot: 'vent', type: '線索', clue: '工廠的排氣管最近一直冒火花，可能有電池卡在裡面。' },
      { name: '記憶磁碟', emoji: '💾', at: 'dish', spot: 'trashcan', type: '八卦', clue: '天線管理員偷看完別人的資料，就把磁碟丟進天線下的垃圾桶湮滅證據。' },
      { name: '黃金齒輪', emoji: '⚙️', at: 'geartower', spot: 'drum', type: '傳說', clue: '齒輪塔的大齒輪少了一齒，傳說那一齒掉進了塔邊的油桶裡。' },
      { name: '萬能螺絲', emoji: '🔩', at: 'statue', spot: 'crate', type: '八卦', clue: '雕像旁的木箱是它的「秘密置物櫃」，掉下來的零件都收在裡面。' },
    ],
    spotPool: ['vent', 'trashcan', 'drum', 'crate', 'barrel'],
    extraSpots: 15,
    junk: [['🥫', '一個空罐頭'], ['🔌', '斷掉的插頭'], ['📟', '上個世紀的呼叫器']],
    stars: [90, 170],
  },
];

/** 全部 28 關：原本 8 關 + 追加 20 關 */
export const LEVELS = [...BASE_LEVELS, ...EXTRA_LEVELS];
