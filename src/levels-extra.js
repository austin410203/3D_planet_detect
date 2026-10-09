/**
 * levels-extra.js — 第 9～28 關（20 顆傳說與科幻主題星球）
 * --------------------------------------------------
 * 欄位格式同 levels.js。每關 4 個地標、4 件物品；
 * 物品實際藏在哪裡每局隨機（見 clues.js），這裡寫的位置與線索是「預設劇本」，
 * 隨機結果剛好相同時會使用這裡手寫的線索。
 */

/** 生態區配置範本 */
const LAYOUT = {
  mixed: [{ type: 'land1', lat: 15, lon: 0 }, { type: 'land1', lat: -20, lon: 70 }, { type: 'land2', lat: 5, lon: 140 }, { type: 'sea', lat: 0, lon: -110 }, { type: 'sea', lat: -35, lon: -170 }],
  land: [{ type: 'land1', lat: 0, lon: 0 }, { type: 'land2', lat: 20, lon: 120 }, { type: 'land1', lat: -20, lon: -100 }, { type: 'land2', lat: -30, lon: 60 }, { type: 'land1', lat: 40, lon: -10 }, { type: 'sea', lat: 35, lon: -45 }],
  islands: [{ type: 'sea', lat: 0, lon: 0 }, { type: 'sea', lat: 0, lon: 120 }, { type: 'sea', lat: 0, lon: -120 }, { type: 'land1', lat: 20, lon: 60 }, { type: 'land1', lat: -15, lon: -60 }, { type: 'land2', lat: 25, lon: -150 }, { type: 'sea', lat: -40, lon: 60 }],
  split: [{ type: 'land1', lat: 30, lon: 0 }, { type: 'land2', lat: -30, lon: 0 }, { type: 'land1', lat: 30, lon: 120 }, { type: 'land2', lat: -30, lon: 120 }, { type: 'land1', lat: 30, lon: -120 }, { type: 'sea', lat: -30, lon: -120 }],
};
/** 預設地標位置（四個方向分散） */
const SLOTS = [[8, -10], [-18, 75], [28, 160], [-30, -95]];
const lm = (id, model, name, lore, i, extra = {}) => ({ id, model, name, lore, lat: SLOTS[i][0], lon: SLOTS[i][1], ...extra });

export const EXTRA_LEVELS = [
  /* ======================= 9. 骷髏海盜灣 ======================= */
  {
    id: 'pirate', name: '骷髏海盜灣', emoji: '🏴‍☠️', subtitle: '船長的四件寶貝',
    theme: {
      seed: 111, biomes: LAYOUT.islands, snowLine: 1.2, heights: { sea: -0.22 },
      palette: { land1: ['#f2d98a', '#e8cd7a'], land2: ['#6aa84a', '#5a983a'], peak: ['#fff', '#eee'], sea: ['#2f8a9a', '#2a7a8a'], shore: ['#f5e3a8', '#ecd590'] },
      seaColor: '#1fa0c0', seaOpacity: 0.7, atmosphere: '#7fd8ff', background: '#06121e',
      light: { ambient: '#c8e8ff', sky: '#e8f8ff', ground: '#2a4a5a', sun: 2.7 },
      decor: [{ kind: 'palm', biomes: ['land1', 'land2'], count: 40 }, { kind: 'rock', biomes: ['land1'], count: 15 }, { kind: 'coral', biomes: ['sea'], count: 30 }],
    },
    npc: { emoji: '🦜', name: '鸚鵡大副 Polly' },
    story: '嘎——！船長喝醉後把四件寶貝藏在島上，酒醒就全忘了！明天要出海，找不到船長會把我的餅乾全扣光！',
    outro: '嘎嘎！船長說要賞你一枚金幣……然後又忘了放在哪。',
    landmarks: [
      lm('ship', 'pirateShip', '黑帆海盜船', '船長的愛船，甲板下藏過無數寶物。', 0),
      lm('skull', 'skullRock', '骷髏岩', '岩洞裡傳出陰森森的笑聲……其實是海風。', 1),
      lm('fort', 'cannonFort', '砲台要塞', '守衛整天打瞌睡，大砲只用來烤香腸。', 2),
      lm('tavern', 'tavern', '朗姆酒館', '全島最吵的地方，也是八卦的源頭。', 3),
    ],
    targets: [
      { name: '藏寶圖', emoji: '🗺️', at: 'skull', spot: 'chest', type: '傳說', clue: '海盜之間流傳：「骷髏凝視之處，寶箱自會開啟。」' },
      { name: '船長的眼罩', emoji: '🏴', at: 'tavern', spot: 'barrel', type: '八卦', clue: '酒保說船長昨晚喝到把眼罩丟進門口的酒桶，還以為那是帽子。' },
      { name: '金羅盤', emoji: '🧭', at: 'fort', spot: 'sack', type: '線索', clue: '砲台的麻布袋鼓鼓的，守衛說「那裡面只有砲彈」，但砲彈不會發光吧？' },
      { name: '藍寶石', emoji: '💎', at: 'ship', spot: 'crate', type: '八卦', clue: '小水手偷偷說，船長把寶石塞進海盜船旁的木箱，假裝是補給品。' },
    ],
    spotPool: ['chest', 'barrel', 'sack', 'crate', 'rock', 'clam'],
    extraSpots: 14, junk: [['🦀', '一隻夾人的螃蟹'], ['🍾', '空酒瓶'], ['🦴', '一根雞骨頭']],
    stars: [85, 160],
  },

  /* ======================= 10. 巨人遺跡星 ======================= */
  {
    id: 'giants', name: '巨人遺跡星', emoji: '🗿', subtitle: '沉睡巨人的信物',
    theme: {
      seed: 122, biomes: LAYOUT.land, heights: { land2: 0.22 },
      palette: { land1: ['#a8b878', '#98a868'], land2: ['#9a8a6a', '#8a7a5a'], peak: ['#c8c0b0', '#b8b0a0'], sea: ['#5a6a5a', '#4a5a4a'], shore: ['#c8b890', '#b8a880'] },
      seaColor: '#5ab0a0', atmosphere: '#c8e0a8', background: '#0e120a',
      light: { ambient: '#e0e8c8', sky: '#f0f8e0', ground: '#3a3a2a', sun: 2.6 },
      decor: [{ kind: 'rock', biomes: ['land1', 'land2', 'peak'], count: 50 }, { kind: 'fern', biomes: ['land1'], count: 40 }, { kind: 'column', biomes: ['land2'], count: 20 }],
    },
    npc: { emoji: '🧝', name: '考古學家 Indy' },
    story: '傳說只要集齊巨人的四件信物，沉睡在地底的巨人就會醒來，告訴我們這個星球的歷史！我挖了三十年，就差最後一步了……',
    outro: '地面震動了！巨人打了個大哈欠……然後翻身繼續睡。至少我們證明傳說是真的！',
    landmarks: [
      lm('head', 'giantHead', '巨人石像頭', '只剩一顆頭的石像，眼睛永遠望著東方。', 0),
      lm('circle', 'stoneCircle', '巨石陣', '古人在這裡舉行儀式，中央的石板會在夜裡發光。', 1),
      lm('ribs', 'ribcage', '巨人肋骨', '一具超大的骨骸，小動物們把這裡當成遊樂場。', 2),
      lm('sword', 'giantSword', '插地巨劍', '據說只有真正的勇者才能拔起來。', 3),
    ],
    targets: [
      { name: '巨人的戒指', emoji: '💍', at: 'ribs', spot: 'bones', type: '傳說', clue: '古卷記載：「巨人倒下時，戒指滾落在它自己的骨頭堆裡。」' },
      { name: '石板碎片', emoji: '🪨', at: 'circle', spot: 'rock', type: '線索', clue: '巨石陣中央石板缺了一角，附近有塊石頭形狀剛好吻合。' },
      { name: '巨人的鈕扣', emoji: '🔘', at: 'head', spot: 'stump', type: '八卦', clue: '松鼠說牠在石像頭旁邊的樹樁裡發現一個比牠還大的鈕扣。' },
      { name: '勇者徽章', emoji: '🎖️', at: 'sword', spot: 'pot', type: '傳說', clue: '拔不起巨劍的勇者們，都會把徽章留在劍旁的陶罐裡。' },
    ],
    spotPool: ['bones', 'rock', 'stump', 'pot', 'bush', 'crate'],
    extraSpots: 15, junk: [['🦷', '一顆巨人的牙齒（好重）'], ['🐞', '一隻瓢蟲'], ['🧦', '巨人的襪子（好臭）']],
    stars: [85, 160],
  },

  /* ======================= 11. 月球基地 ======================= */
  {
    id: 'moonbase', name: '月球基地', emoji: '🚀', subtitle: '太空人的補給',
    theme: {
      seed: 133, biomes: LAYOUT.land, snowLine: 1.2, heights: { sea: -0.18, land2: 0.18 },
      palette: { land1: ['#b8b8c0', '#a8a8b0'], land2: ['#8a8a96', '#7a7a86'], peak: ['#d8d8e0', '#c8c8d0'], sea: ['#4a4a56', '#3a3a46'], shore: ['#9a9aa6', '#8a8a96'] },
      seaColor: '#2a2a3a', seaOpacity: 1, seaRough: 0.9, atmosphere: '#9ab8ff', atmoIntensity: 0.4, background: '#020208',
      light: { ambient: '#c8d0ff', sky: '#e8ecff', ground: '#2a2a3a', sun: 3 },
      decor: [{ kind: 'rock', biomes: ['land1', 'land2'], count: 60 }, { kind: 'crystalD', biomes: ['land2'], count: 20 }],
    },
    npc: { emoji: '👩‍🚀', name: '太空人 Luna' },
    story: '基地的補給艙在降落時摔破了！沒有這四樣東西，我就沒辦法跟地球連線，還會餓肚子。月面低重力，東西可能彈得很遠……',
    outro: '連線成功！地球的大家在螢幕那頭跟你揮手呢～',
    landmarks: [
      lm('rocket', 'rocket', '返航火箭', '返回地球用的火箭，燃料只夠飛一次。', 0),
      lm('dome', 'domeBase', '玻璃溫室', '月球上唯一長得出蔬菜的地方。', 1),
      lm('ufo', 'ufo', '神秘飛碟', '不知道哪來的飛碟，基地成員都假裝沒看見。', 2),
      lm('dish', 'dish', '通訊天線', '跟地球連線的唯一管道。', 3),
    ],
    targets: [
      { name: '太空食物', emoji: '🥫', at: 'dome', spot: 'crate', type: '線索', clue: '溫室旁的木箱上寫著「蔬菜種子」，可是搖起來像罐頭的聲音。' },
      { name: '通訊晶片', emoji: '💾', at: 'dish', spot: 'trashcan', type: '八卦', clue: '機器人清潔員把一片「看起來像垃圾」的晶片丟進天線旁的垃圾桶了。' },
      { name: '氧氣瓶', emoji: '🫧', at: 'rocket', spot: 'drum', type: '線索', clue: '火箭旁的油桶外觀被刮花了，好像有東西被硬塞進去。' },
      { name: '外星石頭', emoji: '🌑', at: 'ufo', spot: 'crystal', type: '傳說', clue: '基地流傳：飛碟降落的地方會長出水晶，而水晶會吸引外星的寶物。' },
    ],
    spotPool: ['crate', 'trashcan', 'drum', 'crystal', 'rock', 'vent'],
    extraSpots: 15, junk: [['🧦', '漂浮的襪子'], ['🍪', '太空餅乾屑'], ['👽', '一隻害羞的小外星人']],
    stars: [85, 160],
  },

  /* ======================= 12. 霓虹機械城 ======================= */
  {
    id: 'neon', name: '霓虹機械城', emoji: '🌃', subtitle: '駭客機器人的任務',
    theme: {
      seed: 144, biomes: LAYOUT.land, snowLine: 0.9,
      palette: { land1: ['#2a2f45', '#323852'], land2: ['#3a2a55', '#44325f'], peak: ['#4a5068', '#545a72'], sea: ['#101020', '#141428'], shore: ['#2a2a40', '#30304a'] },
      seaColor: '#ff4ad1', seaOpacity: 0.85, seaGlow: 0.5, atmosphere: '#ff4ad1', atmoIntensity: 1, background: '#06030e',
      light: { ambient: '#a88aff', sky: '#c8a8ff', ground: '#1a0a2a', sun: 1.8 },
      decor: [{ kind: 'pipe', biomes: ['land1', 'peak'], count: 40 }, { kind: 'bolt', biomes: ['land2'], count: 30 }, { kind: 'star', biomes: ['land1', 'land2'], count: 40 }],
    },
    npc: { emoji: '🤖', name: '駭客機器人 Glitch' },
    story: '嗶——我的記憶體被病毒分散存到城市各處了！不找回這四個檔案，我就會忘記自己是誰……嗶嗶，快！',
    outro: '系統還原完成。我想起來了：我是……一台很會做鬆餅的機器人！',
    landmarks: [
      lm('tower', 'skyscraper', '霓虹大樓', '城市最高的大樓，頂樓的燈一閃一閃。', 0),
      lm('holo', 'hologram', '全息廣告塔', '不停播放「買一送一」的全息廣告。', 1),
      lm('statue', 'robotStatue', '始祖機器人像', '第一代機器人的紀念像。', 2),
      lm('factory', 'factory', '晶片工廠', '24 小時運轉，排氣管總是熱熱的。', 3),
    ],
    targets: [
      { name: '記憶檔案 A', emoji: '📀', at: 'tower', spot: 'vent', type: '線索', clue: '大樓旁的排氣管傳出「嗶—嗶—」的訊號聲。' },
      { name: '記憶檔案 B', emoji: '💿', at: 'holo', spot: 'trashcan', type: '八卦', clue: '廣告塔的看板機器人說，它把一張奇怪的光碟丟進旁邊的垃圾桶了。' },
      { name: '密碼鑰匙', emoji: '🔑', at: 'statue', spot: 'crate', type: '傳說', clue: '城市傳說：始祖機器人把最重要的鑰匙交給身旁的木箱保管。' },
      { name: '能量核心', emoji: '🔋', at: 'factory', spot: 'drum', type: '線索', clue: '工廠旁有個油桶一直在發熱，溫度計都爆表了。' },
    ],
    spotPool: ['vent', 'trashcan', 'crate', 'drum', 'barrel', 'toybox'],
    extraSpots: 16, junk: [['🔌', '斷掉的電線'], ['🕹️', '壞掉的搖桿'], ['📟', '舊呼叫器']],
    stars: [90, 165],
  },

  /* ======================= 13. 魔法王國 ======================= */
  {
    id: 'magic', name: '魔法王國', emoji: '🪄', subtitle: '見習魔法師的考試',
    theme: {
      seed: 155, biomes: LAYOUT.mixed,
      palette: { land1: ['#7ac87a', '#6ab86a'], land2: ['#c8a8e8', '#b898d8'], peak: ['#f4f0ff', '#e4e0f8'], sea: ['#4a3a8a', '#3a2a7a'], shore: ['#e8d8f8', '#d8c8e8'] },
      seaColor: '#8a6aff', seaOpacity: 0.7, seaGlow: 0.3, atmosphere: '#c8a8ff', atmoIntensity: 1, background: '#0e0820',
      light: { ambient: '#d8c8ff', sky: '#f0e8ff', ground: '#3a2a5a', sun: 2.5 },
      decor: [{ kind: 'tree', biomes: ['land1'], count: 45 }, { kind: 'crystalD', biomes: ['land2', 'peak'], count: 40 }, { kind: 'star', biomes: ['land2'], count: 25 }],
    },
    npc: { emoji: '🧙', name: '見習魔法師 Merry' },
    story: '今天是我的魔法師畢業考！考題是找回大法師藏起來的四件魔法道具……可是我的探測魔法又失靈了，拜託幫幫我！',
    outro: '我及格了！雖然大法師說「是你朋友找到的」……但總之及格了！',
    landmarks: [
      lm('castle', 'castle', '王國城堡', '國王與王后住的地方，衛兵很愛聊八卦。', 0),
      lm('tower', 'wizardTower', '大法師之塔', '大法師的研究室，窗戶總是透出金光。', 1),
      lm('fountain', 'fountain', '許願噴泉', '投下硬幣許願，據說真的會實現。', 2),
      lm('spire', 'crystalSpire', '星辰水晶柱', '吸收星光的巨大水晶，是魔力的源頭。', 3),
    ],
    targets: [
      { name: '魔法書', emoji: '📖', at: 'tower', spot: 'chest', type: '傳說', clue: '大法師常說：「知識要鎖起來才珍貴。」他的塔旁正好有個寶箱。' },
      { name: '魔杖', emoji: '🪄', at: 'castle', spot: 'barrel', type: '八卦', clue: '城堡衛兵說，昨晚有根會發光的棍子自己滾進城門口的木桶。' },
      { name: '星辰藥水', emoji: '🧪', at: 'spire', spot: 'crystal', type: '線索', clue: '水晶柱旁的小水晶簇裡，有一瓶藥水正在吸收星光。' },
      { name: '幸運金幣', emoji: '🪙', at: 'fountain', spot: 'basket', type: '八卦', clue: '噴泉旁賣花的婆婆，把撈到的金幣都藏在她的籃子裡。' },
    ],
    spotPool: ['chest', 'barrel', 'crystal', 'basket', 'pot', 'bush'],
    extraSpots: 16, junk: [['🐸', '一隻被變成青蛙的王子？'], ['🧹', '一把會自己掃地的掃把'], ['🎩', '空空的魔術帽']],
    stars: [90, 165],
  },

  /* ======================= 14. 七矮人森林 ======================= */
  {
    id: 'snowwhite', name: '七矮人森林', emoji: '🍎', subtitle: '森林公主的生日驚喜',
    theme: {
      seed: 166, biomes: LAYOUT.land,
      palette: { land1: ['#5aa84a', '#4a983a'], land2: ['#7aa858', '#6a9848'], peak: ['#f4f8ff', '#e4ecf8'], sea: ['#3a6a7a', '#2a5a6a'], shore: ['#a8c878', '#98b868'] },
      seaColor: '#5ac8d8', atmosphere: '#a8e8b8', background: '#08120a',
      light: { ambient: '#d8f0d0', sky: '#f0fff0', ground: '#2a3a2a', sun: 2.5 },
      decor: [{ kind: 'pine', biomes: ['land1', 'peak'], count: 50 }, { kind: 'tree', biomes: ['land2'], count: 40 }, { kind: 'shroom', biomes: ['land1'], count: 25 }, { kind: 'fern', biomes: ['land2'], count: 30 }],
    },
    npc: { emoji: '👸', name: '森林公主 Blanca' },
    story: '七位小矮人朋友在幫我準備生日驚喜，結果禮物被淘氣的松鼠們搬走藏起來了！小矮人們急得快哭了，可以幫忙找嗎？',
    outro: '謝謝你！這是我收過最棒的生日！來，分你一塊蘋果派～',
    landmarks: [
      lm('cottage', 'cottage', '小矮人木屋', '七張小床、七把小椅子，門口有七頂小帽子。', 0),
      lm('well', 'wishingWell', '許願井', '對著井口唱歌，會聽到美妙的回音。', 1),
      lm('mirror', 'magicMirror', '會說話的魔鏡', '魔鏡只說實話，但很愛賣關子。', 2),
      lm('apple', 'appleTree', '紅蘋果樹', '結出全森林最紅的蘋果。', 3),
    ],
    targets: [
      { name: '水晶髮飾', emoji: '💠', at: 'mirror', spot: 'chest', type: '傳說', clue: '魔鏡說：「最閃亮的東西，就藏在我身旁那只寶箱之中。」' },
      { name: '手工蘋果派', emoji: '🥧', at: 'apple', spot: 'basket', type: '線索', clue: '蘋果樹下的籃子飄出肉桂香，絕對不只是蘋果。' },
      { name: '鑽石項鍊', emoji: '📿', at: 'cottage', spot: 'sack', type: '八卦', clue: '愛打噴嚏的那位小矮人說，他把礦坑挖到的寶貝塞進木屋旁的麻布袋了。' },
      { name: '小鳥音樂盒', emoji: '🎶', at: 'well', spot: 'bush', type: '八卦', clue: '松鼠們說，許願井旁的草叢會傳出叮叮咚咚的音樂。' },
    ],
    spotPool: ['chest', 'basket', 'sack', 'bush', 'stump', 'shroom'],
    extraSpots: 16, junk: [['🍏', '一顆還沒熟的青蘋果'], ['🐿️', '一隻生氣的松鼠'], ['🧢', '小矮人的備用帽子']],
    stars: [90, 165],
  },

  /* ======================= 15. 奇境仙境 ======================= */
  {
    id: 'wonderland', name: '奇境仙境', emoji: '🎩', subtitle: '永遠的下午茶',
    theme: {
      seed: 177, biomes: LAYOUT.split,
      palette: { land1: ['#f8c8e0', '#e8b8d0'], land2: ['#b8e8a8', '#a8d898'], peak: ['#fff8e7', '#f8f0d8'], sea: ['#6a4a8a', '#5a3a7a'], shore: ['#ffe0a8', '#f8d898'] },
      seaColor: '#c88aff', seaOpacity: 0.75, atmosphere: '#ffb8f0', atmoIntensity: 1, background: '#1a0820',
      light: { ambient: '#ffe0f8', sky: '#fff0fa', ground: '#4a2a5a', sun: 2.5 },
      decor: [{ kind: 'shroom', biomes: ['land1', 'land2'], count: 50 }, { kind: 'lollipop', biomes: ['land1'], count: 20 }, { kind: 'block', biomes: ['land2'], count: 25 }],
    },
    npc: { emoji: '🐇', name: '遲到的白兔先生' },
    story: '要遲到了要遲到了！女王的下午茶會就要開始，我卻把四件茶會用品弄丟了！這裡的居民說話都顛三倒四，你要自己判斷喔！',
    outro: '趕上了！雖然茶會永遠停在下午六點，所以其實怎樣都趕得上……',
    landmarks: [
      lm('tea', 'teaTable', '瘋狂茶會長桌', '永遠在喝茶的長桌，座位永遠不夠坐。', 0),
      lm('clock', 'giantClock', '倒著走的大鐘', '這座鐘的指針會倒著轉。', 1),
      lm('hole', 'rabbitHole', '兔子洞', '一個深不見底的洞，掉下去要很久很久。', 2),
      lm('cards', 'cardTower', '撲克牌塔', '撲克牌衛兵們疊起來的高塔，風一吹就晃。', 3),
    ],
    targets: [
      { name: '懷錶', emoji: '⌚', at: 'clock', spot: 'teapot', type: '八卦', clue: '睡鼠迷迷糊糊地說：「懷錶……在大鐘旁邊的……茶壺裡……呼……」' },
      { name: '「吃我」蛋糕', emoji: '🧁', at: 'tea', spot: 'basket', type: '線索', clue: '長桌旁的籃子上貼著紙條：「請勿打開，裡面不是蛋糕。」——那就是蛋糕。' },
      { name: '「喝我」藥水', emoji: '🍶', at: 'hole', spot: 'shroom', type: '傳說', clue: '傳說兔子洞旁的大蘑菇底下，藏著能讓人變大變小的東西。' },
      { name: '紅心皇后的扇子', emoji: '🪭', at: 'cards', spot: 'toybox', type: '八卦', clue: '撲克牌衛兵小聲說：皇后的扇子被方塊 7 收進牌塔旁的玩具箱了。' },
    ],
    spotPool: ['teapot', 'basket', 'shroom', 'toybox', 'gift', 'cupcake'],
    extraSpots: 17, junk: [['🦩', '一隻當槌球棍的紅鶴'], ['😸', '只剩笑容的貓'], ['🃏', '一張鬼牌']],
    stars: [90, 170],
  },

  /* ======================= 16. 恐龍谷 ======================= */
  {
    id: 'dino', name: '恐龍谷', emoji: '🦕', subtitle: '時光機的零件',
    theme: {
      seed: 188, biomes: LAYOUT.mixed, heights: { land2: 0.2 },
      palette: { land1: ['#6ab84a', '#5aa83a'], land2: ['#a8784a', '#98683a'], peak: ['#5a4a4a', '#4a3a3a'], sea: ['#3a6a5a', '#2a5a4a'], shore: ['#c8b07a', '#b8a06a'] },
      seaColor: '#3ab8a0', atmosphere: '#ffd8a8', background: '#140c06',
      light: { ambient: '#f0e0c0', sky: '#fff0d8', ground: '#3a2a1a', sun: 2.7 },
      decor: [{ kind: 'fern', biomes: ['land1'], count: 60 }, { kind: 'jungle', biomes: ['land1'], count: 30 }, { kind: 'rock', biomes: ['land2', 'peak'], count: 30 }],
    },
    npc: { emoji: '👨‍🔬', name: '時空博士 Doc' },
    story: '我的時光機在侏羅紀迷航時撞壞了，零件噴得到處都是！再不修好，我就要跟恐龍當一輩子的鄰居了！',
    outro: '時光機啟動！謝謝你——咦，怎麼有隻小恐龍跟著上車了？',
    landmarks: [
      lm('statue', 'dinoStatue', '長頸龍石像', '原始人雕的恐龍像，很有藝術天分。', 0),
      lm('nest', 'dinoNest', '恐龍蛋巢', '三顆大蛋，恐龍媽媽剛好出門覓食。', 1),
      lm('volcano', 'volcano', '冒煙火山', '每隔一陣子就打一個噴嚏。', 2),
      lm('treehouse', 'treehouse', '原始人樹屋', '原始人一家住在樹上，避開恐龍。', 3),
    ],
    targets: [
      { name: '時光齒輪', emoji: '⚙️', at: 'nest', spot: 'bones', type: '線索', clue: '恐龍蛋巢旁的骨頭堆裡，有一個閃閃發亮的金屬圓盤。' },
      { name: '能量燃料', emoji: '🛢️', at: 'volcano', spot: 'lavarock', type: '傳說', clue: '原始人相信火山旁的發紅石頭會吞下「天上掉下來的怪東西」。' },
      { name: '控制面板', emoji: '🎛️', at: 'treehouse', spot: 'basket', type: '八卦', clue: '原始人小孩把一個「有好多按鈕的石板」藏進樹屋下的籃子當玩具。' },
      { name: '方向盤', emoji: '🛞', at: 'statue', spot: 'bush', type: '線索', clue: '石像旁的草叢被壓出一個圓圓的痕跡。' },
    ],
    spotPool: ['bones', 'lavarock', 'basket', 'bush', 'rock', 'stump'],
    extraSpots: 16, junk: [['🥚', '一顆普通的雞蛋？'], ['🦴', '恐龍的趾骨'], ['🪶', '翼龍的羽毛']],
    stars: [90, 165],
  },

  /* ======================= 17. 亞特蘭提斯 ======================= */
  {
    id: 'atlantis', name: '亞特蘭提斯', emoji: '🔱', subtitle: '海底王國的復興',
    theme: {
      seed: 199, biomes: LAYOUT.islands, snowLine: 1.2, heights: { sea: -0.2, land1: 0.1 },
      palette: { land1: ['#e8e0d0', '#d8d0c0'], land2: ['#7ac8a8', '#6ab898'], peak: ['#fff', '#eee'], sea: ['#3a8aa8', '#2a7a98'], shore: ['#f0e8d0', '#e0d8c0'] },
      seaColor: '#2ab8e0', seaOpacity: 0.45, atmosphere: '#7ef0ff', background: '#020e18',
      light: { ambient: '#a8f0ff', sky: '#e0fcff', ground: '#1a4a6a', sun: 2.6 },
      decor: [{ kind: 'column', biomes: ['land1', 'sea'], count: 35 }, { kind: 'coral', biomes: ['sea'], count: 50 }, { kind: 'seaweed', biomes: ['sea'], count: 40 }],
    },
    npc: { emoji: '🧜', name: '海之守護者 Nerea' },
    story: '亞特蘭提斯沉入海底千年，只要找回四件神器，古城的光芒就能重現。有些神器在島上，有些沉在清澈的海底。',
    outro: '古城的光芒復甦了！從今以後，亞特蘭提斯的大門永遠為你敞開。',
    landmarks: [
      lm('columns', 'columns', '神殿廢墟', '古代神殿只剩幾根柱子。', 0),
      lm('trident', 'tridentStatue', '三叉戟神像', '海神的三叉戟，寶石至今仍在發光。', 1),
      { id: 'palace', model: 'coralPalace', name: '珊瑚王宮', lore: '海底的王宮，由會唱歌的珊瑚建成。', lat: 0, lon: 0, anywhere: true },
      { id: 'wreck', model: 'shipwreck', name: '探險船殘骸', lore: '一百年前來找亞特蘭提斯的探險船。', lat: -5, lon: 120, anywhere: true },
    ],
    targets: [
      { name: '海神之冠', emoji: '👑', at: 'trident', spot: 'chest', type: '傳說', clue: '古碑文寫著：「海神之冠，安息於神像腳下的寶箱。」' },
      { name: '潮汐之珠', emoji: '🔮', at: 'palace', spot: 'clam', type: '線索', clue: '王宮門口的大貝殼一張一合，裡面透出藍光。' },
      { name: '古城地圖', emoji: '📜', at: 'wreck', spot: 'crate', type: '八卦', clue: '小丑魚說探險船的木箱裡有一張「畫滿柱子的紙」。' },
      { name: '月光豎琴', emoji: '🪕', at: 'columns', spot: 'pot', type: '傳說', clue: '神殿祭司會把樂器收在柱子旁的陶罐裡，以免被海水沖走。' },
    ],
    spotPool: ['chest', 'clam', 'crate', 'pot', 'coral', 'rock'],
    extraSpots: 16, spotsAnywhere: true,
    junk: [['🐙', '一隻害羞的章魚'], ['🥾', '探險家的靴子'], ['🫧', '一串泡泡']],
    stars: [95, 175],
  },

  /* ======================= 18. 天空浮島 ======================= */
  {
    id: 'sky', name: '天空浮島', emoji: '☁️', subtitle: '風之祭典',
    theme: {
      seed: 210, biomes: LAYOUT.mixed, snowLine: 0.75,
      palette: { land1: ['#9ae07a', '#8ad06a'], land2: ['#ffe0a8', '#f8d898'], peak: ['#ffffff', '#f4f8ff'], sea: ['#a8d8ff', '#98c8f0'], shore: ['#e8f8ff', '#d8f0ff'] },
      seaColor: '#c8ecff', seaOpacity: 0.85, atmosphere: '#bfe9ff', atmoIntensity: 1, background: '#0a1a30',
      light: { ambient: '#e0f0ff', sky: '#ffffff', ground: '#6a8aaa', sun: 2.7 },
      decor: [{ kind: 'cloudD', biomes: ['peak', 'land2'], count: 60 }, { kind: 'tree', biomes: ['land1'], count: 35 }],
    },
    npc: { emoji: '🕊️', name: '風之使者 Zephyr' },
    story: '風之祭典要開始了，可是一陣怪風把祭典的四件道具吹散到浮島各處！雲朵裡也可能藏著東西喔。',
    outro: '風又溫柔地吹起來了！祭典的風箏飛得比雲還高～',
    landmarks: [
      lm('balloon', 'balloon', '熱氣球站', '浮島之間唯一的交通工具。', 0),
      lm('rainbow', 'rainbow', '彩虹橋', '一座真正的彩虹做成的橋，踩上去軟軟的。', 1),
      lm('windmill', 'windmill', '風之磨坊', '收集風之力量的磨坊。', 2),
      lm('castle', 'cloudCastle', '雲上宮殿', '風之使者的家，建在最高的雲上。', 3),
    ],
    targets: [
      { name: '風箏', emoji: '🪁', at: 'rainbow', spot: 'cloud', type: '線索', clue: '彩虹橋旁的雲朵裡露出一截彩色的線。' },
      { name: '風鈴', emoji: '🎐', at: 'windmill', spot: 'haystack', type: '八卦', clue: '磨坊的老鼠說，乾草堆裡一直傳出「叮鈴叮鈴」的聲音，害牠睡不著。' },
      { name: '羽毛帽', emoji: '👒', at: 'balloon', spot: 'basket', type: '線索', clue: '熱氣球站的籃子上卡著一根羽毛。' },
      { name: '風之號角', emoji: '📯', at: 'castle', spot: 'chest', type: '傳說', clue: '歌謠唱道：「號角沉睡在宮殿旁的寶箱，等待風起之日。」' },
    ],
    spotPool: ['cloud', 'haystack', 'basket', 'chest', 'bush', 'gift'],
    extraSpots: 17, junk: [['🪶', '一根普通羽毛'], ['🎈', '漏氣的氣球'], ['🐦', '一隻迷路的小鳥']],
    stars: [90, 170],
  },

  /* ======================= 19. 巨龍之巢 ======================= */
  {
    id: 'dragon', name: '巨龍之巢', emoji: '🐉', subtitle: '借給巨龍的東西',
    theme: {
      seed: 221, biomes: LAYOUT.land, heights: { land2: 0.22 }, peakRough: 0.9,
      palette: { land1: ['#6a4a5a', '#5a3a4a'], land2: ['#8a5a4a', '#7a4a3a'], peak: ['#3a2a3a', '#4a3a4a'], sea: ['#5a1a1a', '#4a1414'], shore: ['#7a3a2a', '#8a4a32'] },
      seaColor: '#ff5a1a', seaOpacity: 1, seaGlow: 0.7, seaRough: 0.6, atmosphere: '#ff8a5a', atmoIntensity: 0.9, background: '#160608',
      light: { ambient: '#ffc8b0', sky: '#ffd0b8', ground: '#5a1a1a', sun: 2.6 },
      decor: [{ kind: 'spikes', biomes: ['land1', 'peak'], count: 40 }, { kind: 'emberRock', biomes: ['land2'], count: 40 }, { kind: 'crystalD', biomes: ['land1'], count: 15 }],
    },
    npc: { emoji: '🐲', name: '老巨龍 Ignis' },
    story: '咳咳……我年紀大了，記性不好。村民借我的四樣東西，我收藏在巢穴附近，現在想還卻找不到了。小勇者，幫幫老龍吧。',
    outro: '找到了！村民一定會很高興。這枚龍鱗送你，它會帶來好運。',
    landmarks: [
      lm('statue', 'dragonStatue', '巨龍石像', '老巨龍年輕時的雕像，帥氣多了。', 0),
      lm('gold', 'goldPile', '黃金寶山', '巨龍收集了一輩子的寶藏。', 1),
      lm('tower', 'obsidianTower', '黑曜石瞭望塔', '巨龍用來曬太陽的高塔。', 2),
      lm('volcano', 'volcano', '龍息火山', '巨龍最愛的溫泉就在火山旁。', 3),
    ],
    targets: [
      { name: '村長的眼鏡', emoji: '👓', at: 'gold', spot: 'chest', type: '八卦', clue: '小妖精說：巨龍把所有亮晶晶的東西都收進寶山旁的寶箱，連眼鏡也是。' },
      { name: '麵包師的擀麵棍', emoji: '🥖', at: 'volcano', spot: 'ashpile', type: '線索', clue: '火山旁的灰燼堆裡飄出烤麵包的香味。' },
      { name: '吟遊詩人的魯特琴', emoji: '🎸', at: 'tower', spot: 'bones', type: '傳說', clue: '傳說瞭望塔下的骨頭堆會在夜裡彈出旋律。' },
      { name: '小女孩的布偶', emoji: '🧸', at: 'statue', spot: 'pot', type: '八卦', clue: '巨龍說夢話：「布偶……放在……我的雕像旁的罐子……好好保管……」' },
    ],
    spotPool: ['chest', 'ashpile', 'bones', 'pot', 'lavarock', 'rock'],
    extraSpots: 17, junk: [['🦎', '一隻以為自己是龍的蜥蜴'], ['🧯', '燒焦的滅火器'], ['🪙', '一枚假金幣']],
    stars: [95, 175],
  },

  /* ======================= 20. 南瓜鬼鎮 ======================= */
  {
    id: 'halloween', name: '南瓜鬼鎮', emoji: '🎃', subtitle: '萬聖夜的糖果',
    theme: {
      seed: 232, biomes: LAYOUT.land,
      palette: { land1: ['#4a3a5a', '#3a2a4a'], land2: ['#5a4a3a', '#4a3a2a'], peak: ['#7a6a8a', '#6a5a7a'], sea: ['#1a2a1a', '#142014'], shore: ['#3a3a2a', '#444430'] },
      seaColor: '#7aff4a', seaOpacity: 0.7, seaGlow: 0.5, atmosphere: '#ff8a1a', atmoIntensity: 0.9, background: '#0a0412',
      light: { ambient: '#9a8aff', sky: '#c8b0ff', ground: '#2a1a1a', sun: 1.8 },
      decor: [{ kind: 'tomb', biomes: ['land1'], count: 30 }, { kind: 'candle', biomes: ['land1', 'land2'], count: 40 }, { kind: 'spikes', biomes: ['land2', 'peak'], count: 25 }],
    },
    npc: { emoji: '👻', name: '膽小幽靈 Boo' },
    story: '嗚嗚……萬聖夜的四袋糖果被調皮的蝙蝠藏起來了！沒有糖果，小怪物們就要搗蛋了……我、我不敢一個人去找啦！',
    outro: '不給糖就搗蛋～這次有糖了！你也拿一顆吧，嘻嘻！',
    landmarks: [
      lm('house', 'hauntedHouse', '鬼屋', '窗戶會發出綠光，晚上還會傳出鋼琴聲。', 0),
      lm('pumpkin', 'pumpkinGiant', '巨大南瓜燈', '鎮上最大的南瓜燈，笑得有點詭異。', 1),
      lm('grave', 'graveyard', '月光墓園', '其實住在這裡的骷髏都很友善。', 2),
      lm('cauldron', 'cauldron', '女巫大鍋', '鍋裡永遠在煮綠色的湯。', 3),
    ],
    targets: [
      { name: '彩虹棒棒糖', emoji: '🍭', at: 'grave', spot: 'tombstone', type: '八卦', clue: '骷髏先生說，他看到蝙蝠把東西藏在墓碑後面，還笑得很開心。' },
      { name: '巧克力球', emoji: '🍫', at: 'pumpkin', spot: 'pumpkin', type: '線索', clue: '大南瓜燈旁有顆小南瓜，被挖空的地方塞滿了甜甜的香味。' },
      { name: '水果軟糖', emoji: '🍬', at: 'cauldron', spot: 'basket', type: '傳說', clue: '女巫的老規矩：施完咒語，一定要把糖果放進鍋旁的籃子裡。' },
      { name: '焦糖蘋果', emoji: '🍎', at: 'house', spot: 'barrel', type: '八卦', clue: '鬼屋的管家幽靈說，有隻蝙蝠半夜把一顆蘋果丟進門口的木桶。' },
    ],
    spotPool: ['tombstone', 'pumpkin', 'basket', 'barrel', 'bones', 'pot'],
    extraSpots: 18, junk: [['🕷️', '一隻毛毛蜘蛛'], ['🦇', '一隻倒掛的蝙蝠'], ['💀', '會說哈囉的骷髏頭']],
    stars: [95, 175],
  },

  /* ======================= 21. 東方仙山 ======================= */
  {
    id: 'orient', name: '東方仙山', emoji: '🏮', subtitle: '仙人的寶物',
    theme: {
      seed: 243, biomes: LAYOUT.mixed, heights: { land2: 0.24 }, peakRough: 0.8,
      palette: { land1: ['#7ab86a', '#6aa85a'], land2: ['#8a9a7a', '#7a8a6a'], peak: ['#f0f4f0', '#e0e8e0'], sea: ['#3a6a7a', '#2a5a6a'], shore: ['#c8c8a8', '#b8b898'] },
      seaColor: '#6ad0c8', atmosphere: '#ffd0a8', background: '#0a0e14',
      light: { ambient: '#f0e8d8', sky: '#fff8e8', ground: '#3a3a2a', sun: 2.5 },
      decor: [{ kind: 'bamboo', biomes: ['land1'], count: 60 }, { kind: 'pine', biomes: ['land2', 'peak'], count: 30 }, { kind: 'rock', biomes: ['land2'], count: 20 }],
    },
    npc: { emoji: '🐼', name: '貪吃熊貓 Bao' },
    story: '仙人爺爺要我幫忙看家，我只是去吃了一下竹子，回來四件寶物就不見了！一定是那群愛惡作劇的猴子幹的！',
    outro: '寶物都回來了！仙人爺爺請大家吃包子，你也一起來吧！',
    landmarks: [
      lm('pagoda', 'pagoda', '九重寶塔', '塔頂的明珠能照亮整座山。', 0),
      lm('gate', 'archGate', '朱紅牌坊', '進入仙山的大門。', 1),
      lm('bell', 'bell', '古鐘亭', '每天清晨敲響，聲音傳遍整座山。', 2),
      lm('tea', 'teaHouse', '雲霧茶館', '泡出全天下最香的茶。', 3),
    ],
    targets: [
      { name: '如意', emoji: '🪷', at: 'pagoda', spot: 'pot', type: '傳說', clue: '古書記載：「寶塔之下，青瓷罐中，藏有吉祥之物。」' },
      { name: '仙人扇', emoji: '🪭', at: 'tea', spot: 'teapot', type: '八卦', clue: '茶館老闆娘說，猴子把一把扇子塞進了門口的大茶壺，害她泡不了茶。' },
      { name: '玉珮', emoji: '🟢', at: 'gate', spot: 'basket', type: '線索', clue: '牌坊下的竹籃裡，有東西反射著綠色的光。' },
      { name: '仙丹', emoji: '💊', at: 'bell', spot: 'bush', type: '八卦', clue: '小沙彌說，敲鐘時看到猴子鑽進鐘亭旁的草叢，嘴裡還含著東西。' },
    ],
    spotPool: ['pot', 'teapot', 'basket', 'bush', 'rock', 'sack'],
    extraSpots: 17, junk: [['🥟', '一顆冷掉的包子'], ['🐒', '一隻偷笑的猴子'], ['🎋', '一根竹子']],
    stars: [95, 175],
  },

  /* ======================= 22. 維京峽灣 ======================= */
  {
    id: 'viking', name: '維京峽灣', emoji: '🛡️', subtitle: '首領的戰利品',
    theme: {
      seed: 254, biomes: LAYOUT.islands, snowLine: 0.65, heights: { land1: 0.16 },
      palette: { land1: ['#7a9a6a', '#6a8a5a'], land2: ['#8a8a7a', '#7a7a6a'], peak: ['#f4f8ff', '#e4ecf8'], sea: ['#2a4a5a', '#1a3a4a'], shore: ['#9a9a8a', '#8a8a7a'] },
      seaColor: '#3a8aa8', seaOpacity: 0.85, atmosphere: '#a8d8ff', background: '#060c14',
      light: { ambient: '#c8d8f0', sky: '#e8f0ff', ground: '#2a3a4a', sun: 2.4 },
      decor: [{ kind: 'pine', biomes: ['land1', 'land2', 'peak'], count: 60 }, { kind: 'rock', biomes: ['land2'], count: 25 }],
    },
    npc: { emoji: '🧔', name: '維京首領 Bjorn' },
    story: '哈哈！昨晚的勝利宴會太歡樂了，結果我把四件戰利品放到哪都忘了！明天要出航，不帶著它們我可不走！',
    outro: '好樣的！你就是峽灣最棒的戰士！今晚的蜂蜜酒我請！',
    landmarks: [
      lm('hall', 'longhouse', '首領長屋', '維京人開宴會的地方，屋頂鋪滿稻草。', 0),
      lm('ship', 'longship', '龍頭長船', '首領的戰船，船帆紅白相間。', 1),
      lm('rune', 'runestone', '符文石', '刻著祖先故事的石碑，符文會發光。', 2),
      lm('watch', 'watchtower', '烽火瞭望台', '看見敵人就點燃烽火。', 3),
    ],
    targets: [
      { name: '黃金角杯', emoji: '🍺', at: 'hall', spot: 'barrel', type: '八卦', clue: '廚娘說，首領喝完最後一杯就把角杯丟進長屋門口的木桶裡。' },
      { name: '戰斧', emoji: '🪓', at: 'ship', spot: 'crate', type: '線索', clue: '長船旁的木箱被劈出一道裂痕，好像有很鋒利的東西在裡面。' },
      { name: '祖傳項鍊', emoji: '📿', at: 'rune', spot: 'snowpile', type: '傳說', clue: '祖先的符文寫著：「傳家之寶，埋於石旁積雪之中。」' },
      { name: '號角', emoji: '📯', at: 'watch', spot: 'sack', type: '八卦', clue: '守夜的戰士說，有人把號角塞進瞭望台下的麻布袋，害他吹不了晨號。' },
    ],
    spotPool: ['barrel', 'crate', 'snowpile', 'sack', 'rock', 'chest'],
    extraSpots: 17, junk: [['🐟', '一條鹹魚'], ['🪖', '一頂凹掉的頭盔'], ['🧦', '戰士的毛襪']],
    stars: [95, 175],
  },

  /* ======================= 23. 蒸汽飛船港 ======================= */
  {
    id: 'steam', name: '蒸汽飛船港', emoji: '🎈', subtitle: '首航典禮',
    theme: {
      seed: 265, biomes: LAYOUT.land, snowLine: 0.88,
      palette: { land1: ['#a8784a', '#98683a'], land2: ['#7a6a5a', '#6a5a4a'], peak: ['#c8b8a0', '#b8a890'], sea: ['#3a3a3a', '#2a2a2a'], shore: ['#8a6a4a', '#7a5a3a'] },
      seaColor: '#c8c0b0', seaOpacity: 0.9, seaRough: 0.9, atmosphere: '#ffd8a8', background: '#120c08',
      light: { ambient: '#ffe8c8', sky: '#fff4e0', ground: '#3a2a1a', sun: 2.5 },
      decor: [{ kind: 'gear', biomes: ['land1'], count: 35 }, { kind: 'pipe', biomes: ['land1', 'land2'], count: 40 }, { kind: 'bolt', biomes: ['land2'], count: 25 }],
    },
    npc: { emoji: '👩‍🔧', name: '發明家 Ada' },
    story: '我的蒸汽飛船明天首航，可是四個關鍵零件不見了！港口的工人都說看到了什麼，但每個人說的都不一樣……',
    outro: '引擎轟隆隆地啟動了！首航就邀請你當第一位乘客！',
    landmarks: [
      lm('airship', 'airship', '蒸汽飛船', '我的心血結晶，比雲還要輕。', 0),
      lm('clock', 'clockTower', '港口鐘樓', '整點會噴出蒸汽報時。', 1),
      lm('gear', 'gearTower', '巨型齒輪塔', '整個港口的動力來源。', 2),
      lm('factory', 'factory', '鍋爐工廠', '製造蒸汽的地方，熱得要命。', 3),
    ],
    targets: [
      { name: '壓力錶', emoji: '⏲️', at: 'clock', spot: 'crate', type: '線索', clue: '鐘樓旁的木箱裡傳出「滴答滴答」的聲音，可是鐘樓的鐘明明在上面。' },
      { name: '黃銅螺旋槳', emoji: '🌀', at: 'gear', spot: 'drum', type: '八卦', clue: '齒輪塔的工頭說，他看到有人把亮亮的東西塞進塔邊的油桶。' },
      { name: '蒸汽閥門', emoji: '🔧', at: 'factory', spot: 'vent', type: '線索', clue: '工廠旁的排氣管今天冒的煙特別少，像被什麼東西堵住了。' },
      { name: '航海日誌', emoji: '📓', at: 'airship', spot: 'sack', type: '八卦', clue: '貨運工人說，他把一本「寫滿數字的本子」當成貨物裝進飛船旁的麻布袋了。' },
    ],
    spotPool: ['crate', 'drum', 'vent', 'sack', 'barrel', 'trashcan'],
    extraSpots: 18, junk: [['🔩', '一顆歪掉的螺絲'], ['🎩', '紳士的高帽'], ['☕', '冷掉的咖啡']],
    stars: [95, 175],
  },

  /* ======================= 24. 外星蟲巢 ======================= */
  {
    id: 'alien', name: '外星蟲巢', emoji: '👾', subtitle: '迷路的外星寶寶',
    theme: {
      seed: 276, biomes: LAYOUT.split,
      palette: { land1: ['#5a2a6a', '#6a3a7a'], land2: ['#2a6a5a', '#3a7a6a'], peak: ['#8a5aa8', '#9a6ab8'], sea: ['#1a0a2a', '#140820'], shore: ['#4a2a5a', '#542e64'] },
      seaColor: '#5affb0', seaOpacity: 0.7, seaGlow: 0.6, atmosphere: '#5affb0', atmoIntensity: 1, background: '#04020a',
      light: { ambient: '#a8ffd8', sky: '#c8ffe8', ground: '#2a0a3a', sun: 1.9 },
      decor: [{ kind: 'glowShroom', biomes: ['land1', 'land2'], count: 60 }, { kind: 'crystalD', biomes: ['peak', 'land1'], count: 40 }, { kind: 'seaweed', biomes: ['land2'], count: 30 }],
    },
    npc: { emoji: '👽', name: '外星媽媽 Zorb' },
    story: '咕嚕咕嚕！我的四個寶寶在探索星球時把玩具弄丟了，現在哭個不停。外星語我盡量翻譯了，但可能不太準確……',
    outro: '咕嚕～寶寶們不哭了！作為感謝，送你一顆會唱歌的外星石頭！',
    landmarks: [
      lm('pod', 'alienPod', '孵化蛋莢', '外星寶寶出生的地方，摸起來軟軟的。', 0),
      lm('plant', 'tentaclePlant', '觸手植物', '會跟你揮手打招呼的植物。', 1),
      lm('spire', 'crystalSpire', '共鳴水晶', '外星人用它來跟家鄉通訊。', 2),
      lm('ufo', 'ufo', '母艦', '外星媽媽的太空船。', 3),
    ],
    targets: [
      { name: '發光波波球', emoji: '🟣', at: 'pod', spot: 'crystal', type: '線索', clue: '蛋莢旁的水晶簇正在一閃一閃，頻率跟寶寶的玩具一樣。' },
      { name: '星星搖鈴', emoji: '🌟', at: 'plant', spot: 'shroom', type: '八卦', clue: '觸手植物比手畫腳地說：「搖鈴…被…大蘑菇…吃掉了…」' },
      { name: '果凍積木', emoji: '🧊', at: 'spire', spot: 'bones', type: '傳說', clue: '外星古老傳說：共鳴水晶旁的骨頭堆，會收集宇宙中迷路的東西。' },
      { name: '宇宙奶嘴', emoji: '🍼', at: 'ufo', spot: 'toybox', type: '八卦', clue: '母艦機器人說，奶嘴被誤放進艙門旁的玩具箱了。' },
    ],
    spotPool: ['crystal', 'shroom', 'bones', 'toybox', 'rock', 'coral'],
    extraSpots: 18, junk: [['🦠', '一團會動的黏液'], ['👁️', '一顆會眨眼的眼珠'], ['🪐', '迷你行星模型']],
    stars: [100, 180],
  },

  /* ======================= 25. 玩具王國 ======================= */
  {
    id: 'toys', name: '玩具王國', emoji: '🧸', subtitle: '午夜玩具派對',
    theme: {
      seed: 287, biomes: LAYOUT.split, snowLine: 0.85,
      palette: { land1: ['#ffd23a', '#ffc82a'], land2: ['#4f8ef7', '#5a98ff'], peak: ['#ff6fa8', '#ff7ab0'], sea: ['#e04848', '#d03838'], shore: ['#fff8e7', '#f8f0d8'] },
      seaColor: '#4fd1a5', seaOpacity: 0.95, seaRough: 0.2, atmosphere: '#ffb8e0', atmoIntensity: 1, background: '#100a20',
      light: { ambient: '#fff0e0', sky: '#ffffff', ground: '#5a3a6a', sun: 2.6 },
      decor: [{ kind: 'block', biomes: ['land1', 'land2'], count: 60 }, { kind: 'lollipop', biomes: ['peak'], count: 20 }, { kind: 'gumdrop', biomes: ['land2'], count: 30 }],
    },
    npc: { emoji: '🪆', name: '木偶隊長 Pino' },
    story: '午夜十二點玩具們就會醒來開派對！可是派對要用的四樣東西被小主人收進不同地方了，天亮前一定要找到！',
    outro: '派對開始囉！機器人負責 DJ，泰迪熊負責跳舞，你負責……嗯，吃蛋糕！',
    landmarks: [
      lm('blocks', 'toyBlocks', '積木高塔', '玩具們最愛的攀爬場。', 0),
      lm('teddy', 'teddy', '巨大泰迪熊', '王國的守護者，抱起來很舒服。', 1),
      lm('top', 'spinningTop', '旋轉陀螺', '永遠不會停下來的陀螺。', 2),
      lm('train', 'toyTrain', '彩色小火車', '載著玩具們環遊王國。', 3),
    ],
    targets: [
      { name: '音樂盒', emoji: '🎵', at: 'teddy', spot: 'gift', type: '線索', clue: '泰迪熊旁的禮物盒，每隔幾秒就傳出一段旋律。' },
      { name: '派對皇冠', emoji: '👑', at: 'blocks', spot: 'toybox', type: '八卦', clue: '小兵玩偶說，小主人把皇冠收進積木塔旁的玩具箱了。' },
      { name: '彩色紙花', emoji: '🎊', at: 'train', spot: 'crate', type: '八卦', clue: '小火車的車長說，他把一箱「會爆炸的東西」卸在車站旁的木箱裡——應該是紙花吧？' },
      { name: '發條鑰匙', emoji: '🗝️', at: 'top', spot: 'basket', type: '傳說', clue: '玩具們的傳說：只要陀螺還在轉，發條鑰匙就會守在它身邊的籃子裡。' },
    ],
    spotPool: ['gift', 'toybox', 'crate', 'basket', 'cupcake', 'jar'],
    extraSpots: 18, junk: [['🧩', '少了一片的拼圖'], ['🎲', '一顆骰子'], ['🪀', '纏在一起的溜溜球']],
    stars: [95, 175],
  },

  /* ======================= 26. 翡翠城 ======================= */
  {
    id: 'emerald', name: '翡翠城', emoji: '💚', subtitle: '回家的路',
    theme: {
      seed: 298, biomes: LAYOUT.mixed,
      palette: { land1: ['#6ad07a', '#5ac06a'], land2: ['#f2d058', '#e8c448'], peak: ['#c8f8d8', '#b8e8c8'], sea: ['#2a6a4a', '#1a5a3a'], shore: ['#e8e0a8', '#d8d098'] },
      seaColor: '#3ad17a', seaOpacity: 0.7, seaGlow: 0.2, atmosphere: '#7aff9a', atmoIntensity: 0.9, background: '#04120a',
      light: { ambient: '#d8ffe0', sky: '#f0fff4', ground: '#2a4a2a', sun: 2.6 },
      decor: [{ kind: 'tree', biomes: ['land1'], count: 40 }, { kind: 'crystalD', biomes: ['peak'], count: 25 }, { kind: 'fern', biomes: ['land2'], count: 40 }],
    },
    npc: { emoji: '👧', name: '迷路的女孩 Dot' },
    story: '一陣龍捲風把我和我的小狗吹到這個奇怪的國度！翡翠城的巫師說，只要找到四件東西，就能送我回家。',
    outro: '敲三下鞋跟……我要回家囉！謝謝你，我永遠不會忘記這趟冒險！',
    landmarks: [
      lm('tower', 'emeraldTower', '翡翠宮', '巫師住的地方，整座城都是綠色的。', 0),
      lm('scarecrow', 'scarecrow', '稻草人', '一直說自己需要一顆聰明的腦袋。', 1),
      lm('balloon', 'balloon', '巫師的熱氣球', '巫師說這是回家的另一個方法……但不太可靠。', 2),
      lm('farm', 'cabin', '被吹來的農舍', '龍捲風把整棟房子吹到這裡來了。', 3),
    ],
    targets: [
      { name: '紅寶石鞋', emoji: '👠', at: 'farm', spot: 'basket', type: '八卦', clue: '小矮人們竊竊私語：農舍門口的籃子裡，有一雙閃閃發亮的鞋。' },
      { name: '小狗的項圈', emoji: '🐕', at: 'scarecrow', spot: 'haystack', type: '線索', clue: '稻草人說：「我身邊的乾草堆裡有個東西叮叮噹噹的……我想不起來是什麼。」' },
      { name: '綠寶石鑰匙', emoji: '🔑', at: 'tower', spot: 'chest', type: '傳說', clue: '城門守衛說：翡翠宮旁的寶箱，只有迷路的人才能打開。' },
      { name: '回家的地圖', emoji: '🗺️', at: 'balloon', spot: 'sack', type: '八卦', clue: '巫師偷偷承認，他把地圖塞進熱氣球旁的麻布袋當壓艙物了。' },
    ],
    spotPool: ['basket', 'haystack', 'chest', 'sack', 'bush', 'crate'],
    extraSpots: 18, junk: [['🛢️', '一罐潤滑油'], ['🦁', '一隻膽小的獅子'], ['🌪️', '一陣小旋風']],
    stars: [95, 175],
  },

  /* ======================= 27. 聖誕北極星 ======================= */
  {
    id: 'xmas', name: '聖誕北極星', emoji: '🎄', subtitle: '聖誕夜倒數',
    theme: {
      seed: 309, biomes: LAYOUT.mixed, snowLine: 0.55,
      palette: { land1: ['#f4f8ff', '#e8f0fa'], land2: ['#d8ecf8', '#c8e0f0'], peak: ['#ffffff', '#f0f6ff'], sea: ['#4a6a8a', '#3a5a7a'], shore: ['#e0eef8', '#d0e4f0'] },
      seaColor: '#a8dcf0', seaOpacity: 0.92, seaRough: 0.05, atmosphere: '#ffd8d8', background: '#060a1a',
      light: { ambient: '#e0ecff', sky: '#ffffff', ground: '#3a4a6a', sun: 2.3 },
      decor: [{ kind: 'pine', biomes: ['land1', 'land2', 'peak'], count: 70 }, { kind: 'candle', biomes: ['land1'], count: 25 }, { kind: 'star', biomes: ['land2'], count: 20 }],
    },
    npc: { emoji: '🎅', name: '聖誕老人' },
    story: '呵呵呵——糟糕！明天就是聖誕夜，可是四樣重要的東西不見了！小精靈們七嘴八舌，你得自己判斷誰說的是對的。',
    outro: '呵呵呵！雪橇準備好了！今年你的名字在「乖孩子名單」第一位喔！',
    landmarks: [
      lm('workshop', 'workshop', '玩具工坊', '小精靈們日夜趕工的地方。', 0),
      lm('tree', 'xmasTree', '北極聖誕樹', '全世界最大的聖誕樹。', 1),
      lm('sleigh', 'sleigh', '聖誕雪橇', '馴鹿們已經在旁邊熱身了。', 2),
      lm('snowman', 'snowman', '雪人郵差', '負責收全世界小朋友寄來的信。', 3),
    ],
    targets: [
      { name: '乖孩子名單', emoji: '📜', at: 'snowman', spot: 'snowpile', type: '八卦', clue: '小精靈說，雪人郵差把名單「暫時」藏進旁邊的雪堆，然後就忘了。' },
      { name: '馴鹿的鈴鐺', emoji: '🔔', at: 'sleigh', spot: 'haystack', type: '線索', clue: '雪橇旁的乾草堆是馴鹿的點心，裡面卻傳出叮叮噹噹的聲音。' },
      { name: '樹頂星星', emoji: '⭐', at: 'tree', spot: 'gift', type: '傳說', clue: '北極的老傳說：聖誕樹的星星會躲進樹下最大的禮物盒裡過冬。' },
      { name: '聖誕老人的帽子', emoji: '🎅', at: 'workshop', spot: 'sack', type: '八卦', clue: '工坊的小精靈承認，他把帽子跟禮物一起裝進門口的麻布袋了。' },
    ],
    spotPool: ['snowpile', 'haystack', 'gift', 'sack', 'crate', 'toybox'],
    extraSpots: 19, junk: [['🧦', '一隻聖誕襪'], ['🥕', '雪人的備用鼻子'], ['🍪', '咬了一口的薑餅']],
    stars: [100, 180],
  },

  /* ======================= 28. 叢林神殿 ======================= */
  {
    id: 'jungle', name: '叢林神殿', emoji: '🐍', subtitle: '失落文明的秘寶',
    theme: {
      seed: 320, biomes: LAYOUT.mixed, heights: { land2: 0.2 },
      palette: { land1: ['#3a8a3a', '#2a7a2a'], land2: ['#6a8a4a', '#5a7a3a'], peak: ['#8a9a7a', '#7a8a6a'], sea: ['#2a5a4a', '#1a4a3a'], shore: ['#8a7a4a', '#7a6a3a'] },
      seaColor: '#3ab8a0', seaOpacity: 0.8, atmosphere: '#a8ffa8', background: '#04100a',
      light: { ambient: '#c8f0c8', sky: '#e8ffe8', ground: '#1a3a1a', sun: 2.4 },
      decor: [{ kind: 'jungle', biomes: ['land1'], count: 60 }, { kind: 'fern', biomes: ['land1', 'land2'], count: 60 }, { kind: 'column', biomes: ['land2'], count: 15 }],
    },
    npc: { emoji: '🤠', name: '探險家 Lara' },
    story: '我終於找到失落文明的神殿了！只要集齊四件秘寶，神殿的大門就會打開。但這裡陷阱很多，叢林居民的話也真假難辨……',
    outro: '大門開了！裡面是……一間圖書館？原來最珍貴的寶藏是知識啊！',
    landmarks: [
      lm('pyramid', 'stepPyramid', '階梯神殿', '失落文明的神殿，頂端有金色的光。', 0),
      lm('idol', 'stoneIdol', '翡翠眼石像', '石像的眼睛會在你背後盯著你。', 1),
      lm('totem', 'totem', '彩繪圖騰柱', '記錄部落歷史的圖騰。', 2),
      lm('treehouse', 'treehouse', '探險家營地', '我的營地，裡面的地圖亂成一團。', 3),
    ],
    targets: [
      { name: '黃金面具', emoji: '🎭', at: 'pyramid', spot: 'pot', type: '傳說', clue: '壁畫上畫著：祭司把面具放進神殿階梯旁的陶罐，獻給太陽。' },
      { name: '翡翠之眼', emoji: '🟩', at: 'idol', spot: 'bush', type: '八卦', clue: '巨嘴鳥說，石像掉了一顆眼睛，滾進旁邊的草叢裡了。' },
      { name: '太陽石盤', emoji: '🌞', at: 'totem', spot: 'rock', type: '線索', clue: '圖騰柱旁有塊石頭底下透出金光。' },
      { name: '古代卷軸', emoji: '📜', at: 'treehouse', spot: 'basket', type: '八卦', clue: '偷東西的猴子把一卷紙塞進營地旁的籃子——牠以為那是香蕉皮。' },
    ],
    spotPool: ['pot', 'bush', 'rock', 'basket', 'stump', 'bones'],
    extraSpots: 20, junk: [['🐍', '一條睡著的小蛇'], ['🍌', '真正的香蕉皮'], ['🦜', '一隻學人說話的鸚鵡']],
    stars: [100, 180],
  },
];
