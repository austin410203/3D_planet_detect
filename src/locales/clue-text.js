/**
 * clue-text.js — 自動產生線索用的文字（各語言）
 * --------------------------------------------------
 * spots：藏匿點名稱（繁中原始名稱在 props.js 的 SPOTS，這裡只放其他語言）
 * inside：藏匿點在句子裡的說法；沒列到的用 insideDefault（{spot} 代入名稱）
 * templates：線索／傳說／八卦三種語氣；{item} 物品（含 emoji）、{lm} 地標（含引號）、
 *            {spot} 藏匿點、{in} 藏匿點說法、{who} 愛八卦的居民
 * quote：地標名稱前後的引號
 */
export const CLUE_TEXT = {
  zh: {
    quote: ['「', '」'],
    spots: {},
    inside: {
      rock: '石頭底下', bush: '草叢裡', haystack: '乾草堆裡', mound: '沙堆裡', snowpile: '雪堆裡',
      iceblock: '冰塊裡', coral: '珊瑚叢裡', clam: '大貝殼裡', stump: '樹樁的洞裡', shroom: '大蘑菇底下',
      lavarock: '熔岩石的裂縫裡', ashpile: '灰燼堆裡', vent: '排氣管裡', tombstone: '墓碑後面',
      bones: '骨頭堆裡', crystal: '水晶簇後面', cloud: '雲朵裡', pumpkin: '南瓜裡', basket: '籃子裡',
    },
    insideDefault: '{spot}裡',
    templates: {
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
    },
    gossipers: ['隔壁的大嬸', '愛八卦的鸚鵡', '路過的旅人', '調皮的小精靈', '值夜班的守衛', '話很多的松鼠'],
  },

  en: {
    quote: ['"', '"'],
    spots: {
      bush: 'bush', rock: 'rock', barrel: 'barrel', crate: 'crate', chest: 'chest', pot: 'clay pot',
      haystack: 'haystack', mound: 'sand pile', snowpile: 'snow pile', iceblock: 'ice block', gift: 'gift box',
      cupcake: 'cupcake', jar: 'candy jar', clam: 'giant clam', coral: 'coral', stump: 'tree stump',
      shroom: 'giant mushroom', trashcan: 'trash can', drum: 'oil drum', vent: 'vent', lavarock: 'lava rock',
      ashpile: 'ash pile', sack: 'sack', basket: 'basket', tombstone: 'tombstone', bones: 'bone pile',
      crystal: 'crystal cluster', cloud: 'cloud', pumpkin: 'pumpkin', toybox: 'toy box', teapot: 'giant teapot',
    },
    inside: {
      rock: 'under the rock', bush: 'in the bush', haystack: 'in the haystack', mound: 'in the sand pile',
      snowpile: 'in the snow pile', iceblock: 'inside the ice block', coral: 'in the coral', clam: 'inside the giant clam',
      stump: 'in the hole of the tree stump', shroom: 'under the giant mushroom', lavarock: 'in a crack of the lava rock',
      ashpile: 'in the ash pile', vent: 'inside the vent', tombstone: 'behind the tombstone', bones: 'in the bone pile',
      crystal: 'behind the crystal cluster', cloud: 'inside the cloud', pumpkin: 'inside the pumpkin', basket: 'in the basket',
    },
    insideDefault: 'inside the {spot}',
    templates: {
      線索: [
        'Someone saw the {item} fall {in} next to {lm}.',
        'A trail of tiny footprints leads to {lm} and stops right in front of a {spot}.',
        'The {spot} near {lm} just wobbled — the {item} might be inside!',
        'Marks on the ground lead from the {item}\'s last spot to the {spot} by {lm}.',
        'A witness says the {item} was last seen at {lm}, right by that {spot}.',
        'The {spot} beside {lm} feels heavier than usual. Someone has been up to something.',
      ],
      傳說: [
        'An old song goes: "What {lm} guards sleeps {in}."',
        'Legend says the {spot} beside {lm} is magic — anything that falls in gets hidden.',
        'The elders say that at every full moon the {spot} by {lm} glows. That\'s the {item} shining.',
        'They say the builder of {lm} hid every treasure {in}.',
        'There\'s an old saying on this planet: "To find what\'s lost, search the {spot} at {lm} first."',
      ],
      八卦: [
        'Psst — I heard {who} stuffed the {item} {in} by {lm}. You didn\'t hear it from me!',
        '{who} keeps sneaking around {lm}, staring at that {spot}…',
        'Everyone\'s saying there\'s something good in the {spot} next to {lm}. Bet it\'s the {item}!',
        'Yesterday I saw a little critter carry the {item} to {lm} and crawl {in}.',
        '{who} swears they heard the {item} rattling inside the {spot} by {lm} at midnight.',
      ],
    },
    gossipers: ['the lady next door', 'the gossipy parrot', 'a passing traveler', 'a cheeky sprite', 'the night watchman', 'the chatty squirrel'],
  },

  ja: {
    quote: ['「', '」'],
    spots: {
      bush: '草むら', rock: '岩', barrel: '木だる', crate: '木箱', chest: '宝箱', pot: '土器のつぼ',
      haystack: '干し草の山', mound: '砂山', snowpile: '雪山', iceblock: '氷のかたまり', gift: 'プレゼント箱',
      cupcake: 'カップケーキ', jar: 'キャンディのびん', clam: '大きな貝', coral: 'サンゴ', stump: '切り株',
      shroom: '大きなキノコ', trashcan: 'ゴミ箱', drum: 'ドラム缶', vent: '排気口', lavarock: '溶岩石',
      ashpile: '灰の山', sack: '麻袋', basket: 'かご', tombstone: '墓石', bones: '骨の山',
      crystal: '水晶のかたまり', cloud: '雲', pumpkin: 'カボチャ', toybox: 'おもちゃ箱', teapot: '大きなティーポット',
    },
    inside: {
      rock: '岩の下', bush: '草むらの中', haystack: '干し草の山の中', mound: '砂山の中', snowpile: '雪山の中',
      iceblock: '氷のかたまりの中', coral: 'サンゴのしげみの中', clam: '大きな貝の中', stump: '切り株の穴の中',
      shroom: '大きなキノコの下', lavarock: '溶岩石のすき間', ashpile: '灰の山の中', vent: '排気口の中',
      tombstone: '墓石のうしろ', bones: '骨の山の中', crystal: '水晶のかたまりのうしろ', cloud: '雲の中',
      pumpkin: 'カボチャの中', basket: 'かごの中',
    },
    insideDefault: '{spot}の中',
    templates: {
      線索: [
        '{item}が{lm}のそばの{in}に落ちるのを見た人がいる。',
        '小さな足あとが{lm}へ続いていて、ある{spot}の前で止まっている。',
        '{lm}の近くの{spot}がさっき動いた。中に{item}があるかも！',
        '地面に{item}のあとが残っていて、{lm}のそばの{spot}へ続いている。',
        '目撃者いわく、{item}を最後に見たのは{lm}、あの{spot}のそばだって。',
        '{lm}のそばの{spot}がいつもより少し重い。だれかが何かしたみたい。',
      ],
      傳說: [
        '古い歌にこうある。『{lm}が守るもの、{in}に眠る』',
        '{lm}のそばの{spot}には魔力があって、落ちたものはみんな隠されてしまうという言い伝えがある。',
        'お年寄りいわく、満月の夜には{lm}のそばの{spot}がほのかに光る——それは{item}の光だそうだ。',
        '{lm}を建てた人は、いちばん大切なものを{in}に隠したと伝えられている。',
        'この星にはこんなことわざがある。『なくし物は、まず{lm}の{spot}を探せ』',
      ],
      八卦: [
        'しーっ……{who}が{item}を{lm}のそばの{in}に押しこんだんだって。わたしが言ったって内緒ね！',
        '{who}が最近{lm}のあたりでこそこそして、あの{spot}をじっと見てるの……',
        'みんなのうわさ：{lm}の横の{spot}にいいものが隠れてる。きっと{item}だよ！',
        'きのう、小さな動物が{item}をくわえて{lm}へ走っていって、{in}にもぐりこんだのを見たよ。',
        '{who}は、真夜中に{lm}のそばの{spot}から{item}の音がしたって言いはってる。',
      ],
    },
    gossipers: ['となりのおばさん', 'うわさ好きのオウム', '通りすがりの旅人', 'いたずらな妖精', '夜番の見張り', 'おしゃべりなリス'],
  },

  ko: {
    quote: ['"', '"'],
    spots: {
      bush: '덤불', rock: '바위', barrel: '나무통', crate: '나무 상자', chest: '보물 상자', pot: '항아리',
      haystack: '건초 더미', mound: '모래 더미', snowpile: '눈 더미', iceblock: '얼음덩어리', gift: '선물 상자',
      cupcake: '컵케이크', jar: '사탕 병', clam: '커다란 조개', coral: '산호', stump: '그루터기',
      shroom: '커다란 버섯', trashcan: '쓰레기통', drum: '드럼통', vent: '환풍구', lavarock: '용암석',
      ashpile: '잿더미', sack: '마대 자루', basket: '바구니', tombstone: '묘비', bones: '뼈 더미',
      crystal: '수정 무더기', cloud: '구름', pumpkin: '호박', toybox: '장난감 상자', teapot: '커다란 찻주전자',
    },
    inside: {
      rock: '바위 밑', bush: '덤불 속', haystack: '건초 더미 속', mound: '모래 더미 속', snowpile: '눈 더미 속',
      iceblock: '얼음덩어리 속', coral: '산호 숲 속', clam: '커다란 조개 속', stump: '그루터기 구멍 속',
      shroom: '커다란 버섯 밑', lavarock: '용암석 틈새', ashpile: '잿더미 속', vent: '환풍구 속',
      tombstone: '묘비 뒤', bones: '뼈 더미 속', crystal: '수정 무더기 뒤', cloud: '구름 속',
      pumpkin: '호박 속', basket: '바구니 속',
    },
    insideDefault: '{spot} 속',
    templates: {
      線索: [
        '누군가 {item}이(가) {lm} 옆 {in}에 떨어지는 걸 봤대요.',
        '작은 발자국이 {lm}까지 이어지다가 어느 {spot} 앞에서 멈췄어요.',
        '{lm} 근처의 {spot}이(가) 방금 움찔했어요. 안에 {item}이(가) 있을지도!',
        '땅에 남은 {item}의 흔적이 {lm} 옆 {spot}까지 이어져 있어요.',
        '목격자 말로는 {item}을(를) 마지막으로 본 곳이 {lm}, 바로 그 {spot} 옆이래요.',
        '{lm} 옆 {spot}이(가) 평소보다 조금 무거워요. 누가 손을 댄 것 같아요.',
      ],
      傳說: [
        '옛 노래에 이런 구절이 있어요. 『{lm}이(가) 지키는 것, {in}에 잠들다.』',
        '전설에 따르면 {lm} 옆 {spot}에는 마법이 있어서 빠진 물건은 모두 숨겨진대요.',
        '어르신들 말씀으로는 보름달마다 {lm} 옆 {spot}이(가) 은은하게 빛난대요. 그게 바로 {item}의 빛이래요.',
        '{lm}을(를) 지은 사람은 가장 소중한 것을 모두 {in}에 숨겼다고 전해져요.',
        '이 행성에는 이런 속담이 있어요. 『잃어버린 물건은 {lm}의 {spot}부터 뒤져라.』',
      ],
      八卦: [
        '쉿— {who}이(가) {item}을(를) {lm} 옆 {in}에 쑤셔 넣었대요. 내가 말한 건 비밀이에요!',
        '요즘 {who}이(가) {lm} 근처에서 수상하게 그 {spot}만 쳐다보고 있어요……',
        '다들 그러던데요, {lm} 옆 {spot}에 좋은 게 숨겨져 있대요. 분명 {item}일 거예요!',
        '어제 작은 동물이 {item}을(를) 물고 {lm}(으)로 달려가더니 {in}(으)로 쏙 들어갔어요.',
        '{who}은(는) 한밤중에 {lm} 옆 {spot}에서 {item} 소리를 들었다고 맹세했어요.',
      ],
    },
    gossipers: ['옆집 아주머니', '수다쟁이 앵무새', '지나가던 여행자', '장난꾸러기 요정', '야간 경비원', '말 많은 다람쥐'],
  },
};
