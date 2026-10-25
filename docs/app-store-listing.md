# App Store 商店頁資料

在 App Store Connect →（App）→ App 資訊／價格與供應狀況／App 隱私權／版本頁面填寫。
字數限制：名稱、副標題各 30 字元；宣傳文字 170；關鍵字 100（以半形逗號分隔、不加空格）；描述 4000。

## 基本資訊

| 欄位 | 內容 |
|---|---|
| Bundle ID | `com.austin410203.planetlostfound` |
| SKU | `planet-lost-found-001` |
| 主要語言 | 繁體中文 |
| 主要類別 | 遊戲 → 解謎 |
| 次要類別 | 遊戲 → 休閒 |
| 價格 | 免費（含 App 內購買「完整版」，見 `docs/in-app-purchase.md`） |
| 隱私權政策網址 | `https://3dplanetdetect.vercel.app/privacy.html` |
| 支援網址 | `https://3dplanetdetect.vercel.app/support.html` |
| 行銷網址（選填） | `https://3dplanetdetect.vercel.app/` |
| 版權 | `2026 austin410203` |

## 繁體中文（主要語言）

**名稱**（7）：星球失物招領所

**副標題**（14）：讀線索、翻星球，找回所有失物

**宣傳文字**（可隨時修改，不需送審）：
> 28 顆主題星球、每日挑戰全世界同一張地圖！讀懂線索、傳說與八卦，用最快的速度把失物找回來。

**關鍵字**：
```
解謎,推理,找東西,尋物,偵探,線索,星球,3D,休閒,益智,冒險,可愛,動腦,每日挑戰,失物,宇宙,太空,單機,離線,找找看
```

**描述**：
```
星球上的居民又弄丟東西了！
郵差的信、火焰祭典的聖物、海龜奶奶的派對道具……身為「星球失物招領所」的探員，你要讀懂居民留下的線索、古老的傳說和鄰居的八卦，推理出失物藏在「哪個地標旁的哪種東西裡」，越快找齊，星星越多！

【玩法】
・旋轉 3D 小星球，找到線索提到的地標
・地標旁的石頭縫、木桶、草叢、寶箱……點下去翻翻看
・翻錯地方加 3 秒，卡關可以用提示，但也要加時間
・依完成時間拿到 1～3 顆星，挑戰自己的最佳紀錄

【每局都不一樣】
物品每次都會藏到不同的地方，地標位置也會互換，線索會依新位置重新產生。就算重玩同一顆星球，也要重新推理！

【28 顆主題星球】
綠野星、熔岩星、汪洋星、糖果星、冰晶星……再到骷髏海盜灣、亞特蘭提斯、巨龍之巢、南瓜鬼鎮、聖誕北極星。每顆星球都有自己的居民、地標、配色和音樂。

【每日挑戰】
每天全世界玩同一顆星球、同一張地圖，只有第一次的成績算數。登上 Game Center 排行榜，和大家比誰最快！連續挑戰還能累積天數。

【特色】
・可愛的手繪風 3D 星球，粗線條、亮色系
・每顆星球專屬的配樂與音效，搭配震動回饋
・不需要網路，隨時隨地都能玩
・沒有廣告、不收集任何個人資料

前 8 顆星球免費遊玩；購買一次「完整版」即可永久解鎖第 9～28 顆星球。
```

**此版本新增內容**（第一版可省略）：首次推出！

## English

**Name**: Lost & Found in Space

**Subtitle**: Cozy 3D clue-solving puzzles

**Promotional text**:
> 28 themed planets and a daily challenge where everyone plays the same map. Read the clues, legends and gossip — and find the lost items fast!

**Keywords**:
```
puzzle,detective,hidden,clue,find,lost,planet,3D,casual,cozy,brain,daily,logic,mystery,offline,space
```

**Description**:
```
The residents of tiny planets keep losing things — and you run the Lost & Found!
Read the clues, legends and neighbourly gossip, figure out which landmark and which hiding spot each item is in, and find everything as fast as you can.

HOW TO PLAY
• Spin a little 3D planet to find the landmark a clue mentions
• Tap rocks, barrels, bushes and chests next to it to search
• Wrong guesses add 3 seconds; hints help but cost time
• Earn 1–3 stars based on your time

EVERY ROUND IS DIFFERENT
Items move to new hiding spots, landmarks swap places, and clues are rewritten every time you play.

28 THEMED PLANETS
From grassy meadows and lava worlds to a pirate cove, Atlantis, a dragon's lair, a pumpkin ghost town and the North Pole at Christmas.

DAILY CHALLENGE
Everyone in the world plays the same planet and map each day. Only your first run counts — climb the Game Center leaderboard and keep your streak alive.

• Chunky hand-drawn 3D style with bold outlines
• Music and sound for every planet, plus haptics
• Plays fully offline — no ads, no data collection

The first 8 planets are free. A one-time "Full Version" purchase unlocks planets 9–28 forever.
```

## 截圖標題（scripts/make-store-shots.mjs 會疊在截圖上方）

| 畫面 | 繁中 | English |
|---|---|---|
| select | 28 顆主題星球等你探索 | Explore 28 themed planets |
| intro | 居民又弄丟東西了！ | Help the locals find what they lost |
| play | 讀懂線索，翻遍星球 | Read the clues, search the planet |
| result | 越快找齊，星星越多 | Find everything fast for 3 stars |
| daily | 每日挑戰，全世界同一張地圖 | One map for the whole world, every day |

## 年齡分級問卷（建議答案 → 4+）

所有「卡通或奇幻暴力、寫實暴力、性與裸露、褻瀆或粗俗幽默、恐怖主題、成熟主題、醫療、酒精菸草藥物、模擬賭博、比賽、競賽」都選 **無**。
「無限制的網頁存取」：否。「使用者產生內容」：否。「家長控制」：否。「抽獎或付費隨機物品（Loot box）」：否。

## App 隱私權（營養標籤）

「你或第三方合作夥伴是否從此 App 收集資料？」→ **否，我們不會從此 App 收集資料**。
（Game Center 與 App 內購買由 Apple 處理，不算開發者收集。）

## 審查備註（App Review Information → Notes）

```
No account or login is required.
- Planets 1–8 are free. Planets 9–28 require the non-consumable in-app purchase "Full Version"
  (com.austin410203.planetlostfound.fullunlock). Tap a locked planet → "解鎖完整版" to see the purchase sheet.
- Restore Purchases: Settings (⚙️ 設定) → 完整版 → 恢復購買, or the link at the bottom of the purchase sheet.
- The Daily Challenge (📅 每日) is free and may feature any planet.
- Game Center leaderboards: 🏆 排行 on the level-select screen.
The game works fully offline and collects no user data.
```
