# 條款頁產生器（星球失物招領所版，改自 Company/playbooks/templates/legal_gen.py）
# 執行 python scripts/legal_gen.py → public/ 產生 pass/terms/refund/privacy/contact.html + legal.css（四語系），
# 另外把 support.html 改成轉址到 contact.html（App Store 填過的支援網址不失效）。
# App 內（Capacitor）會自動隱藏 .web-only（網頁付款、Lemon Squeezy）和完整版／退款頁連結（審查指南 3.1.1）。
import os, html
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public")
EMAIL = "hello@emptyoffice.app"
DATE = "2026-10-26"
LANGS = [("zh", "中文"), ("ja", "日本語"), ("en", "English"), ("ko", "한국어")]
NAV = {
    "pass": {"zh": "完整版介紹", "ja": "完全版について", "en": "Full Version", "ko": "정식판 안내"},
    "terms": {"zh": "服務條款", "ja": "利用規約", "en": "Terms of Service", "ko": "이용약관"},
    "refund": {"zh": "退款政策", "ja": "返金ポリシー", "en": "Refund Policy", "ko": "환불 정책"},
    "privacy": {"zh": "隱私權政策", "ja": "プライバシーポリシー", "en": "Privacy Policy", "ko": "개인정보 처리방침"},
    "contact": {"zh": "聯絡與支援", "ja": "お問い合わせ・サポート", "en": "Contact & Support", "ko": "문의 및 지원"},
}
WEB_ONLY = {"pass", "refund"}  # App 內不顯示的頁面連結
APP = {"zh": "星球失物招領所", "ja": "ほしのおとしもの係", "en": "Lost & Found in Space", "ko": "행성 분실물 센터"}
BACK = {c: f"← {APP[c]}" for c in APP}
UPDATED = {"zh": "最後更新", "ja": "最終更新", "en": "Last updated", "ko": "최종 업데이트"}
M = f'<a href="mailto:{EMAIL}">{EMAIL}</a>'
APPLE_PRIV = '<a href="https://www.apple.com/legal/privacy/">Apple</a>'

# ---------------------------------------------------------------- 各頁內容（每種語言一段 HTML）
C = {}
C["pass"] = {
"zh": f"""
<p class="lead">前 <b>4 顆星球</b>和每日挑戰免費玩。買一次「完整版」，第 5～28 顆星球全部解鎖，不用依序過關，想玩哪顆就玩哪顆。</p>
<table><tr><th></th><th>免費</th><th>完整版</th></tr>
<tr><td>星球</td><td>第 1～4 顆</td><td>再加第 5～28 顆（共 28 顆）</td></tr>
<tr><td>每日挑戰</td><td>✔</td><td>✔</td></tr>
<tr><td>Game Center 排行榜（iOS）</td><td>✔</td><td>✔（購買不影響名次）</td></tr>
<tr><td>廣告</td><td>有（可看廣告試玩付費星球）</td><td><b>永久無廣告</b></td></tr></table>
<div class="web-only">
<h2>網頁版：價格</h2><p><b>NT$90</b>（約 US$2.99），一次購買，永久使用，沒有訂閱。國外信用卡會自動換算成當地貨幣；實際金額與稅金以結帳頁為準。</p>
<h2>網頁版：如何購買與啟用</h2><ol>
<li>在遊戲裡點鎖住的星球，或「⚙️ 設定 → 完整版」，按「購買 NT$90」。</li>
<li>在 Lemon Squeezy 結帳頁付款（信用卡、PayPal 等）。</li>
<li>付款後，收據頁和 email 都會顯示一組<b>序號</b>。</li>
<li>回到遊戲，在完整版視窗輸入序號並按「啟用」，就會立即解鎖。</li></ol>
<p>同一組序號最多可在 <b>5 個裝置或瀏覽器</b>啟用。清除瀏覽器資料後，重新輸入同一組序號即可。購買後 14 天內不論原因都可以全額退款，見<a href="refund.html">退款政策</a>。</p>
<p class="note">網頁版的訂單由我們的線上經銷商 Lemon Squeezy 處理，Lemon Squeezy 是交易的登記賣方（Merchant of Record），負責收款、開立收據與稅務。</p>
</div>
<h2>iOS App</h2><p>在 App 內透過 App Store 購買，一次付費、永久擁有，價格依 App Store 顯示的當地價格為準。換手機時，用同一個 Apple ID 在「⚙️ 設定 → 完整版 → 恢復購買」即可。</p>
<p class="note">App Store 的購買和網頁版的購買分開計算：網頁版的序號不能在 iOS App 內使用，App 內的購買也不能轉到網頁版。</p>
""",
"ja": f"""
<p class="lead">最初の <b>4 つの星</b>とデイリーチャレンジは無料。「完全版」を一度購入すると 5〜28 番目の星がすべて解放され、順番に関係なく好きな星から遊べます。</p>
<table><tr><th></th><th>無料</th><th>完全版</th></tr>
<tr><td>星</td><td>1〜4</td><td>さらに 5〜28（全 28）</td></tr>
<tr><td>デイリーチャレンジ</td><td>✔</td><td>✔</td></tr>
<tr><td>Game Center ランキング（iOS）</td><td>✔</td><td>✔（購入は順位に影響しません）</td></tr>
<tr><td>広告</td><td>あり（広告を見て有料の星をお試し可）</td><td><b>ずっと広告なし</b></td></tr></table>
<div class="web-only">
<h2>Web 版：価格</h2><p><b>NT$90</b>（約 US$2.99、買い切り、サブスクリプションなし）。海外のカードは自動的に現地通貨に換算されます。実際の金額と税金は決済ページに表示されます。</p>
<h2>Web 版：購入と有効化</h2><ol>
<li>ゲーム内でロックされた星、または「⚙️ 設定 → 完全版」から「NT$90で購入」を押します。</li>
<li>Lemon Squeezy の決済ページで支払います（クレジットカード、PayPal など）。</li>
<li>領収ページとメールに<b>ライセンスキー</b>が表示されます。</li>
<li>ゲームに戻り、完全版の画面でキーを入力して「有効化」を押すと、すぐに解放されます。</li></ol>
<p>1 つのキーで最大 <b>5 台の端末・ブラウザ</b>まで有効化できます。ブラウザのデータを消去した場合は、同じキーを再入力してください。購入後 14 日以内なら理由を問わず全額返金します（<a href="refund.html">返金ポリシー</a>）。</p>
<p class="note">Web 版のご注文は当社のオンライン販売代理店 Lemon Squeezy が処理します。Lemon Squeezy は販売者（Merchant of Record）として決済・領収書・税務を担当します。</p>
</div>
<h2>iOS アプリ</h2><p>アプリ内で App Store から購入します。買い切りで、価格は App Store に表示される現地価格に従います。機種変更したときは、同じ Apple ID で「⚙️ 設定 → 完全版 → 購入を復元」を押してください。</p>
<p class="note">App Store での購入と Web 版の購入は別扱いです。Web 版のキーは iOS アプリでは使えず、アプリ内の購入を Web 版に移すこともできません。</p>
""",
"en": f"""
<p class="lead">The first <b>4 planets</b> and the Daily Challenge are free. Buy the Full Version once to unlock planets 5–28 — no need to clear them in order, play any planet you like.</p>
<table><tr><th></th><th>Free</th><th>Full Version</th></tr>
<tr><td>Planets</td><td>1–4</td><td>+ planets 5–28 (28 in all)</td></tr>
<tr><td>Daily Challenge</td><td>✔</td><td>✔</td></tr>
<tr><td>Game Center leaderboards (iOS)</td><td>✔</td><td>✔ (buying never affects your rank)</td></tr>
<tr><td>Ads</td><td>Yes (watch an ad to try a paid planet)</td><td><b>Ad-free forever</b></td></tr></table>
<div class="web-only">
<h2>Web version: price</h2><p><b>NT$90</b> (about US$2.99), a one-time purchase — no subscription. Cards from other countries are charged in your local currency after conversion; the final amount and taxes are shown at checkout.</p>
<h2>Web version: how to buy and activate</h2><ol>
<li>In the game, tap a locked planet or ⚙️ Settings → Full Version, then "Buy NT$90".</li>
<li>Pay on the Lemon Squeezy checkout page (card, PayPal and more).</li>
<li>Your <b>licence key</b> appears on the receipt page and in the email.</li>
<li>Back in the game, enter the key in the Full Version window and press "Activate" — it unlocks right away.</li></ol>
<p>One key works on up to <b>5 devices or browsers</b>. If you clear your browser data, just enter the same key again. Full refund for any reason within 14 days — see the <a href="refund.html">refund policy</a>.</p>
<p class="note">Our order process is conducted by our online reseller Lemon Squeezy, the Merchant of Record for all web orders. They handle payment, receipts and sales tax.</p>
</div>
<h2>iOS app</h2><p>Bought inside the app through the App Store — a one-time purchase at the local price shown by the App Store. On a new phone, use the same Apple ID and tap ⚙️ Settings → Full Version → Restore.</p>
<p class="note">App Store purchases and web purchases are separate: web licence keys cannot be used in the iOS app, and in-app purchases cannot be moved to the web version.</p>
""",
"ko": f"""
<p class="lead">처음 <b>4개 행성</b>과 데일리 챌린지는 무료예요. 「정식판」을 한 번 구매하면 5~28번째 행성이 모두 열리고, 순서와 관계없이 원하는 행성부터 즐길 수 있어요.</p>
<table><tr><th></th><th>무료</th><th>정식판</th></tr>
<tr><td>행성</td><td>1~4</td><td>5~28 추가 (총 28개)</td></tr>
<tr><td>데일리 챌린지</td><td>✔</td><td>✔</td></tr>
<tr><td>Game Center 랭킹 (iOS)</td><td>✔</td><td>✔ (구매는 순위에 영향 없음)</td></tr>
<tr><td>광고</td><td>있음 (광고 보고 유료 행성 체험 가능)</td><td><b>영원히 광고 없음</b></td></tr></table>
<div class="web-only">
<h2>웹 버전: 가격</h2><p><b>NT$90</b>(약 US$2.99), 한 번 구매로 영구 사용(구독 아님). 해외 카드는 현지 통화로 환산됩니다. 최종 금액과 세금은 결제 페이지에 표시됩니다.</p>
<h2>웹 버전: 구매 및 활성화</h2><ol>
<li>게임에서 잠긴 행성이나 「⚙️ 설정 → 정식판」을 누르고 「NT$90 구매」를 누릅니다.</li>
<li>Lemon Squeezy 결제 페이지에서 결제합니다 (카드, PayPal 등).</li>
<li>영수증 페이지와 이메일에 <b>라이선스 키</b>가 표시됩니다.</li>
<li>게임으로 돌아와 정식판 화면에 키를 입력하고 「활성화」를 누르면 바로 열립니다.</li></ol>
<p>키 하나로 최대 <b>5대의 기기·브라우저</b>에서 활성화할 수 있습니다. 브라우저 데이터를 지운 경우 같은 키를 다시 입력하세요. 구매 후 14일 이내에는 이유와 관계없이 전액 환불됩니다(<a href="refund.html">환불 정책</a>).</p>
<p class="note">웹 주문은 온라인 리셀러 Lemon Squeezy가 처리하며, Lemon Squeezy가 판매자(Merchant of Record)로서 결제·영수증·세금을 담당합니다.</p>
</div>
<h2>iOS 앱</h2><p>앱 안에서 App Store로 구매하며, 한 번 구매로 영구 소장입니다. 가격은 App Store에 표시되는 현지 가격을 따릅니다. 기기를 바꾸면 같은 Apple ID로 「⚙️ 설정 → 정식판 → 구매 복원」을 누르세요.</p>
<p class="note">App Store 구매와 웹 구매는 별개입니다. 웹 라이선스 키는 iOS 앱에서 쓸 수 없으며, 앱 내 구매를 웹 버전으로 옮길 수도 없습니다.</p>
""",
}

C["terms"] = {
"zh": f"""
<p>歡迎使用「{APP['zh']}」（以下稱「本服務」），本服務由個人開發者以品牌「Empty Office（無人辦公室）」經營。使用本服務即表示你同意以下條款。</p>
<h2>1. 服務內容</h2><p>本服務是低多邊形風格的 3D 星球解謎遊戲：閱讀線索，在星球上找出藏起來的物品。前 4 顆星球與每日挑戰免費，第 5～28 顆星球需購買「完整版」<span class="web-only">（見<a href="pass.html">完整版介紹</a>）</span>。</p>
<h2>2. 購買與授權</h2><ul>
<li>iOS App 內的購買由 Apple 透過 App Store 處理，適用 Apple 的媒體服務條款。</li>
<li class="web-only">網頁版的訂單由我們的線上經銷商 Lemon Squeezy 處理，Lemon Squeezy 是交易的登記賣方（Merchant of Record），負責收款、收據與稅務，並適用其條款。</li>
<li>完整版是數位內容的<b>使用授權</b>，不是所有權移轉，不得轉售或公開分享。<span class="web-only">網頁版一組序號最多可在 5 個裝置或瀏覽器啟用；公開散布或濫用的序號，我們可以停用。</span></li></ul>
<h2>3. 使用規範</h2><p>請勿以程式或任何方式竄改成績、干擾排行榜，或破解付費內容。</p>
<h2>4. 智慧財產權</h2><p>本服務的程式、3D 模型、圖示、音樂、音效與文字由開發者製作，保留所有權利。</p>
<h2>5. 免責</h2><p>本服務依現況提供。我們會盡力維持正常運作，但不保證完全不中斷、沒有錯誤。在法律允許的範圍內，我們對使用本服務所造成的間接損失不負責任。</p>
<h2>6. 變更與終止</h2><p>我們可能更新本服務或本條款，重大變更會在網站公告。若本服務未來停止營運，已購買的完整版會以合理方式處理，例如維持已下載的 App 可離線遊玩。</p>
<h2>7. 準據法</h2><p>本條款以中華民國（台灣）法律為準據法。消費者依其居住地法律享有的強制保護，不受影響。</p>
<h2>8. 聯絡</h2><p>{M}</p>
""",
"ja": f"""
<p>「{APP['ja']}」（以下「本サービス」）は、個人開発者がブランド「Empty Office（無人辦公室）」として運営しています。本サービスを利用することで、以下の規約に同意したものとみなします。</p>
<h2>1. サービス内容</h2><p>ローポリ風の 3D 惑星パズルゲームです。手がかりを読み、星に隠された落とし物を探します。最初の 4 つの星とデイリーチャレンジは無料で、5〜28 番目の星は「完全版」の購入が必要です<span class="web-only">（<a href="pass.html">完全版について</a>）</span>。</p>
<h2>2. 購入とライセンス</h2><ul>
<li>iOS アプリ内の購入は Apple が App Store を通じて処理し、Apple のメディアサービス利用規約が適用されます。</li>
<li class="web-only">Web 版のご注文はオンライン販売代理店 Lemon Squeezy が販売者（Merchant of Record）として処理し、決済・領収書・税務を担当し、同社の規約が適用されます。</li>
<li>完全版はデジタルコンテンツの<b>利用許諾</b>であり、所有権の移転ではありません。転売・公開共有はできません。<span class="web-only">Web 版のキーは最大 5 台の端末・ブラウザで有効化でき、公開・不正利用されたキーは無効化することがあります。</span></li></ul>
<h2>3. 禁止事項</h2><p>プログラム等による記録の改ざん、ランキングの妨害、有料コンテンツのクラック。</p>
<h2>4. 知的財産</h2><p>本サービスのプログラム、3D モデル、アイコン、音楽、効果音、文章は開発者が制作し、すべての権利を保有します。</p>
<h2>5. 免責</h2><p>本サービスは現状有姿で提供されます。正常な運営に努めますが、中断やエラーがないことは保証しません。法令で認められる範囲で、間接的な損害について責任を負いません。</p>
<h2>6. 変更と終了</h2><p>本サービスや本規約は更新されることがあり、重要な変更はサイトでお知らせします。将来サービスを終了する場合、購入済みの完全版については、ダウンロード済みのアプリをオフラインで遊べるようにするなど、合理的な方法で対応します。</p>
<h2>7. 準拠法</h2><p>本規約は中華民国（台湾）法を準拠法とします。お住まいの国の消費者保護法による強行的な保護は影響を受けません。</p>
<h2>8. お問い合わせ</h2><p>{M}</p>
""",
"en": f"""
<p>"{html.escape(APP['en'])}" (the "Service") is run by an individual developer under the brand "Empty Office". By using the Service you agree to these terms.</p>
<h2>1. The Service</h2><p>A low-poly 3D planet puzzle game: read the clues and find the items hidden on each planet. The first 4 planets and the Daily Challenge are free; planets 5–28 require the Full Version<span class="web-only"> (see <a href="pass.html">Full Version</a>)</span>.</p>
<h2>2. Purchases and licence</h2><ul>
<li>Purchases in the iOS app are processed by Apple through the App Store and are subject to Apple's Media Services Terms.</li>
<li class="web-only">For web purchases, our order process is conducted by our online reseller Lemon Squeezy, the Merchant of Record, who handles payment, receipts and taxes under their own terms.</li>
<li>The Full Version is a <b>licence to use</b> digital content, not a transfer of ownership. It may not be resold or shared publicly.<span class="web-only"> A web licence key works on up to 5 devices or browsers; we may disable keys that are published or abused.</span></li></ul>
<h2>3. Acceptable use</h2><p>Do not tamper with scores, interfere with leaderboards or crack paid content.</p>
<h2>4. Intellectual property</h2><p>The code, 3D models, icons, music, sounds and text of the Service are made by the developer, who reserves all rights.</p>
<h2>5. Disclaimer</h2><p>The Service is provided "as is". We work to keep it running but do not guarantee it will be uninterrupted or error-free. To the extent permitted by law, we are not liable for indirect losses arising from use of the Service.</p>
<h2>6. Changes and termination</h2><p>We may update the Service or these terms; significant changes will be announced on the site. If the Service is ever shut down, purchased Full Versions will be handled in a reasonable way, such as keeping the downloaded app playable offline.</p>
<h2>7. Governing law</h2><p>These terms are governed by the laws of Taiwan (Republic of China). Mandatory consumer protections of your country of residence are not affected.</p>
<h2>8. Contact</h2><p>{M}</p>
""",
"ko": f"""
<p>「{APP['ko']}」(이하 「서비스」)는 개인 개발자가 브랜드 「Empty Office」로 운영합니다. 서비스를 이용하면 아래 약관에 동의한 것으로 봅니다.</p>
<h2>1. 서비스 내용</h2><p>로우폴리 풍의 3D 행성 퍼즐 게임으로, 단서를 읽고 행성에 숨겨진 물건을 찾습니다. 처음 4개 행성과 데일리 챌린지는 무료이며, 5~28번째 행성은 「정식판」 구매가 필요합니다<span class="web-only">(<a href="pass.html">정식판 안내</a> 참고)</span>.</p>
<h2>2. 구매와 라이선스</h2><ul>
<li>iOS 앱 내 구매는 Apple이 App Store를 통해 처리하며 Apple 미디어 서비스 이용약관이 적용됩니다.</li>
<li class="web-only">웹 주문은 온라인 리셀러 Lemon Squeezy가 판매자(Merchant of Record)로서 처리하며 결제·영수증·세금을 담당하고 그 약관이 적용됩니다.</li>
<li>정식판은 디지털 콘텐츠의 <b>이용 허락</b>이며 소유권 이전이 아닙니다. 재판매나 공개 공유는 할 수 없습니다.<span class="web-only"> 웹 라이선스 키는 최대 5대의 기기·브라우저에서 활성화할 수 있으며, 공개되거나 남용된 키는 비활성화할 수 있습니다.</span></li></ul>
<h2>3. 이용 규칙</h2><p>프로그램 등으로 기록을 조작하거나, 랭킹을 방해하거나, 유료 콘텐츠를 크랙하지 마세요.</p>
<h2>4. 지식재산권</h2><p>서비스의 프로그램, 3D 모델, 아이콘, 음악, 효과음, 문장은 개발자가 제작했으며 모든 권리를 보유합니다.</p>
<h2>5. 면책</h2><p>서비스는 현 상태로 제공됩니다. 정상 운영을 위해 노력하지만 중단이나 오류가 없음을 보장하지 않습니다. 법이 허용하는 범위에서 간접 손해에 대해 책임지지 않습니다.</p>
<h2>6. 변경과 종료</h2><p>서비스나 약관은 갱신될 수 있으며, 중요한 변경은 사이트에 공지합니다. 향후 서비스를 종료하는 경우, 구매한 정식판은 다운로드한 앱을 오프라인으로 계속 즐길 수 있게 하는 등 합리적인 방법으로 처리합니다.</p>
<h2>7. 준거법</h2><p>본 약관은 중화민국(대만) 법을 준거법으로 합니다. 거주 국가의 소비자 보호법에 따른 강행적 보호는 영향을 받지 않습니다.</p>
<h2>8. 문의</h2><p>{M}</p>
""",
}

C["refund"] = {
"zh": f"""
<p>完整版是數位內容，付款後立即可用。我們希望每位玩家都買得安心：</p>
<div class="web-only">
<h2>網頁版：14 天內可退款</h2><ul>
<li><b>購買後 14 天內</b>，不論原因，只要來信提出，都可以全額退款。</li>
<li>超過 14 天後，如果因為技術問題無法啟用或使用，而我們也無法修好，仍然可以退款。</li></ul>
<h2>如何申請</h2><p>寄信到 {M}，附上購買時的 email 和訂單編號（在收據 email 裡）。退款由 Lemon Squeezy 退回原付款方式，入帳時間依銀行或支付方式而定，通常 5～10 個工作天。</p>
<h2>退款後</h2><p>該組序號會被停用，付費星球會在下次驗證時重新上鎖；你的遊戲進度和免費星球都會保留。</p>
</div>
<h2>iOS App（App Store 購買）</h2><p>App 內購買由 Apple 收款，退款依 Apple 的規定處理：請到 <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a> 用購買時的 Apple ID 申請。退款完成後，完整版會重新上鎖，遊戲進度會保留。遇到問題也歡迎來信 {M}，我們會協助你。</p>
""",
"ja": f"""
<p>完全版はデジタルコンテンツで、購入後すぐに利用できます。安心してご購入いただけるよう、以下のとおり対応します。</p>
<div class="web-only">
<h2>Web 版：14 日以内なら返金可能</h2><ul>
<li><b>購入後 14 日以内</b>であれば、理由を問わず、ご連絡いただければ全額返金します。</li>
<li>14 日を過ぎても、技術的な問題で有効化・利用ができず、こちらで解決できない場合は返金します。</li></ul>
<h2>申請方法</h2><p>{M} 宛てに、購入時のメールアドレスと注文番号（領収メールに記載）をお送りください。Lemon Squeezy から元の支払い方法へ返金され、反映までの期間は銀行や決済方法により異なります（通常 5〜10 営業日）。</p>
<h2>返金後</h2><p>該当のキーは無効化され、有料の星は次回の確認時に再びロックされます。ゲームの進行状況と無料の星はそのまま残ります。</p>
</div>
<h2>iOS アプリ（App Store での購入）</h2><p>アプリ内購入の代金は Apple が受け取るため、返金は Apple の規定に従います。購入時の Apple ID で <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a> から申請してください。返金後は完全版が再びロックされ、進行状況は残ります。お困りのときは {M} までご連絡ください。</p>
""",
"en": f"""
<p>The Full Version is digital content you can use as soon as you buy it. We want everyone to buy with confidence:</p>
<div class="web-only">
<h2>Web version: refunds within 14 days</h2><ul>
<li>Within <b>14 days of purchase</b>, email us for any reason and we will give you a full refund.</li>
<li>After 14 days, if a technical problem stops you activating or using it and we cannot fix it, we will still refund you.</li></ul>
<h2>How to request</h2><p>Email {M} with the email address you used and your order number (in the receipt email). Lemon Squeezy returns the money to the original payment method; timing depends on your bank or payment method, usually 5–10 business days.</p>
<h2>After a refund</h2><p>The key is disabled and the paid planets lock again at the next check. Your progress and the free planets are kept.</p>
</div>
<h2>iOS app (App Store purchases)</h2><p>In-app purchases are paid to Apple, so refunds follow Apple's rules: request one at <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a> with the Apple ID you used. After a refund the Full Version locks again and your progress is kept. If anything goes wrong, email {M} and we'll help.</p>
""",
"ko": f"""
<p>정식판은 구매 즉시 사용할 수 있는 디지털 콘텐츠입니다. 안심하고 구매하실 수 있도록 다음과 같이 처리합니다.</p>
<div class="web-only">
<h2>웹 버전: 14일 이내 환불 가능</h2><ul>
<li><b>구매 후 14일 이내</b>에는 이유와 관계없이 연락 주시면 전액 환불해 드립니다.</li>
<li>14일이 지나도 기술적인 문제로 활성화·이용이 불가능하고 저희가 해결하지 못하면 환불해 드립니다.</li></ul>
<h2>신청 방법</h2><p>{M} 로 구매 시 이메일 주소와 주문 번호(영수증 이메일에 있음)를 보내 주세요. Lemon Squeezy가 원래 결제 수단으로 환불하며, 반영 기간은 은행·결제 수단에 따라 다릅니다(보통 영업일 기준 5~10일).</p>
<h2>환불 후</h2><p>해당 키는 비활성화되며 유료 행성은 다음 확인 시 다시 잠깁니다. 게임 진행 상황과 무료 행성은 그대로 유지됩니다.</p>
</div>
<h2>iOS 앱 (App Store 구매)</h2><p>앱 내 구매 대금은 Apple이 받으므로 환불은 Apple 규정을 따릅니다. 구매한 Apple ID로 <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a> 에서 신청하세요. 환불 후 정식판은 다시 잠기며 진행 상황은 유지됩니다. 문제가 있으면 {M} 로 연락 주세요.</p>
""",
}

C["privacy"] = {
"zh": f"""
<p>本政策說明「{APP['zh']}」會處理哪些資料。簡單來說：<b>沒有帳號、不追蹤你，我們自己不收集你的個人資料；免費版的廣告由 Google 提供，見第 3-2 節。</b></p>
<h2>1. 只存在你裝置上的資料</h2><p>以下資料只存在你的裝置上（iOS 為 App 的本機儲存，網頁版為瀏覽器 localStorage），不會傳給我們或任何第三方；刪除 App 或清除瀏覽器資料就會刪除：</p><ul>
<li>各星球的最佳星數與時間、每日挑戰成績與連續天數</li>
<li>配樂、音效、震動、語言設定，以及是否看過新手教學</li>
<li>是否已購買完整版（讓你離線也能玩已購買的關卡）<span class="web-only">；網頁版另存序號與啟用紀錄</span></li></ul>
<h2>2. Apple 提供的服務（iOS）</h2><ul>
<li><b>Game Center</b>：登入 Game Center 時，你的成績會上傳到 Apple 的排行榜，由 Apple 依其隱私權政策處理。可在 iPhone「設定 → Game Center」登出或管理。</li>
<li><b>App 內購買</b>：付款完全由 Apple 處理，我們不會取得你的付款資訊。</li></ul>
<p>Apple 隱私權政策：{APPLE_PRIV}</p>
<h2>3. 網站</h2><p>網站由 Cloudflare 提供，Cloudflare 可能為了安全與防止濫用，短期處理 IP 位址等連線資訊。我們自己不使用追蹤 Cookie，也不做行為分析。</p><div class="web-only"><h2>3-1. 網頁版購買完整版</h2><ul><li>付款由 Lemon Squeezy 處理，你的姓名、email、帳單地址與付款資訊由 Lemon Squeezy 依其<a href="https://www.lemonsqueezy.com/privacy">隱私權政策</a>處理，我們不會拿到你的信用卡資料。</li><li>啟用序號時，我們的伺服器（Cloudflare）會把序號和一個裝置名稱（例如「web Win32 2026-10-26」）送到 Lemon Squeezy 驗證，並在你的瀏覽器記住啟用狀態；之後約每 7 天重新驗證一次。</li><li>我們會從 Lemon Squeezy 收到訂單資料（例如 email、訂單編號），只用於客服、退款與法定紀錄。</li></ul></div><p></p>
<h2>3-2. 廣告（只有免費版）</h2><ul>
<li>免費版會顯示廣告：玩家自己選擇觀看、換一次付費星球試玩的獎勵廣告，以及每過幾關、離開結算畫面時的插頁廣告。遊戲進行中不會出現廣告。購買完整版後永久不再顯示任何廣告。</li>
<li><b>iOS App</b>：廣告由 Google AdMob 提供。我們只要求<b>非個人化廣告</b>、內容分級為普遍級，不會請求「允許 App 追蹤」（不使用廣告識別碼 IDFA 追蹤你）。為了顯示廣告、計算次數與防止詐欺，Google 仍可能處理裝置資訊、大略位置（由 IP 推估）與廣告互動紀錄。歐盟、英國等地區會先詢問你的同意。</li>
<li><b>網頁版</b>：可能使用 Google AdSense 的遊戲廣告，Google 可能使用 Cookie 或類似技術顯示與衡量廣告；沒有 Google 廣告時，改顯示我們自己其他作品的推廣卡片，這類卡片不追蹤你。</li>
<li>Google 如何使用資料：<a href="https://policies.google.com/technologies/partner-sites">Google</a>。</li></ul>
<h2>4. 資料分享</h2><p>我們不出售任何資料。只會在提供服務所需的範圍內，與上述服務商（Apple、Google、Cloudflare<span class="web-only">、Lemon Squeezy</span>）分享，或依法律要求提供。</p>
<h2>5. 兒童</h2><p>本遊戲適合所有年齡。我們自己不收集任何人的個人資料，包括 13 歲以下的兒童；免費版只要求非個人化、普遍級的廣告。</p>
<h2>6. 聯絡與更新</h2><p>如有任何問題，請寫信到 {M}。本政策更新時，會修改本頁的「最後更新」日期。</p>
""",
"ja": f"""
<p>本ポリシーは「{APP['ja']}」が扱うデータについて説明します。要するに、<b>アカウントなし・追跡なしで、当方は個人情報を収集しません。無料版の広告は Google が配信します（3-2 を参照）。</b></p>
<h2>1. 端末内だけに保存されるデータ</h2><p>以下のデータは端末内（iOS はアプリのローカル保存、Web 版はブラウザの localStorage）にのみ保存され、当方や第三者に送信されません。アプリの削除やブラウザのデータ消去で削除されます。</p><ul>
<li>各星のベスト星数とタイム、デイリーチャレンジの記録と連続日数</li>
<li>BGM・効果音・振動・言語の設定、チュートリアルを見たかどうか</li>
<li>完全版を購入済みかどうか（オフラインでも購入済みの星を遊べるようにするため）<span class="web-only">。Web 版ではキーと有効化情報も保存します</span></li></ul>
<h2>2. Apple のサービス（iOS）</h2><ul>
<li><b>Game Center</b>：サインインしている場合、記録は Apple のランキングに送信され、Apple のプライバシーポリシーに従って扱われます。iPhone の「設定 → Game Center」から管理できます。</li>
<li><b>アプリ内課金</b>：決済はすべて Apple が行い、当方が支払い情報を受け取ることはありません。</li></ul>
<p>Apple のプライバシーポリシー：{APPLE_PRIV}</p>
<h2>3. Web サイト</h2><p>サイトは Cloudflare で提供されており、セキュリティと不正防止のため、IP アドレスなどの接続情報が短期間処理されることがあります。当方は追跡 Cookie や行動分析を使用しません。</p><div class="web-only"><h2>3-1. Web 版での完全版の購入</h2><ul><li>決済は Lemon Squeezy が行い、氏名・メール・請求先住所・支払い情報は同社の<a href="https://www.lemonsqueezy.com/privacy">プライバシーポリシー</a>に従って扱われます。当方がカード情報を受け取ることはありません。</li><li>キーの有効化時、当方のサーバー（Cloudflare）がキーと端末名（例：「web Win32 2026-10-26」）を Lemon Squeezy に送って確認し、有効化状態をブラウザに保存します。その後およそ 7 日ごとに再確認します。</li><li>Lemon Squeezy から注文情報（メール、注文番号など）を受け取り、サポート・返金・法定記録のためにのみ使用します。</li></ul></div><p></p>
<h2>3-2. 広告（無料版のみ）</h2><ul>
<li>無料版には広告が表示されます：プレイヤーが自分で選んで見る、有料の星を1回お試しできるリワード広告と、数ステージごとに結果画面を閉じるときのインタースティシャル広告です。プレイ中には表示されません。完全版を購入すると、広告はずっと表示されなくなります。</li>
<li><b>iOS アプリ</b>：広告は Google AdMob が配信します。<b>パーソナライズされていない広告</b>のみ、全年齢向けの内容に限定し、「App からのトラッキング要求」は行いません（広告識別子 IDFA で追跡しません）。広告の表示・計測・不正防止のため、Google が端末情報、おおよその位置（IP から推定）、広告の操作履歴を処理することがあります。EU・英国などでは事前に同意を確認します。</li>
<li><b>Web 版</b>：Google AdSense のゲーム向け広告を使う場合があり、Google が Cookie などで広告を表示・計測することがあります。Google の広告がないときは、当方のほかの作品の紹介カードを表示し、これは追跡を行いません。</li>
<li>Google によるデータの使用について：<a href="https://policies.google.com/technologies/partner-sites">Google</a>。</li></ul>
<h2>4. 第三者提供</h2><p>データを販売することはありません。サービス提供に必要な範囲で上記の事業者（Apple、Google、Cloudflare<span class="web-only">、Lemon Squeezy</span>）と共有するか、法令に基づき提供する場合に限ります。</p>
<h2>5. 子どもについて</h2><p>本ゲームは全年齢向けです。当方は 13 歳未満の子どもを含め、誰の個人情報も収集しません。無料版の広告はパーソナライズなし・全年齢向けに限定しています。</p>
<h2>6. お問い合わせと改定</h2><p>ご質問は {M} までお送りください。本ポリシーを改定した場合は、本ページの「最終更新」日を変更します。</p>
""",
"en": f"""
<p>This policy explains what data "{html.escape(APP['en'])}" handles. In short: <b>no account and no tracking — we don't collect your personal data ourselves. Ads in the free version are served by Google; see section 3-2.</b></p>
<h2>1. Data that stays on your device</h2><p>The following is stored only on your device (app storage on iOS, localStorage in the browser) and is never sent to us or anyone else. Deleting the app or clearing browser data removes it:</p><ul>
<li>Best stars and times for each planet, Daily Challenge results and streak</li>
<li>Music, sound, haptics and language settings, and whether you've seen the tutorial</li>
<li>Whether you own the Full Version (so purchased planets work offline)<span class="web-only">; on the web, also your licence key and activation record</span></li></ul>
<h2>2. Apple services (iOS)</h2><ul>
<li><b>Game Center</b>: if you're signed in, your scores are sent to Apple's leaderboards and handled under Apple's privacy policy. Manage it in iPhone Settings → Game Center.</li>
<li><b>In-app purchases</b>: payment is handled entirely by Apple; we never receive your payment details.</li></ul>
<p>Apple's privacy policy: {APPLE_PRIV}</p>
<h2>3. Website</h2><p>The site is served by Cloudflare, which may briefly process connection data such as IP addresses for security and abuse prevention. We ourselves use no tracking cookies and no behavioural analytics.</p><div class="web-only"><h2>3-1. Buying the Full Version on the web</h2><ul><li>Payment is handled by Lemon Squeezy. Your name, email, billing address and payment details are processed under their <a href="https://www.lemonsqueezy.com/privacy">privacy policy</a>; we never receive your card details.</li><li>When you activate a key, our server (Cloudflare) sends the key and a device label (e.g. "web Win32 2026-10-26") to Lemon Squeezy to check it, and your browser remembers that it is active. It is re-checked about every 7 days.</li><li>We receive order details from Lemon Squeezy (such as email and order number) and use them only for support, refunds and legally required records.</li></ul></div><p></p>
<h2>3-2. Ads (free version only)</h2><ul>
<li>The free version shows ads: rewarded ads that you choose to watch to try a paid planet once, and an interstitial ad every few levels when you leave the results screen. Ads never appear during play. Buying the Full Version removes all ads for good.</li>
<li><b>iOS app</b>: ads are served by Google AdMob. We request <b>non-personalised ads</b> only, rated for general audiences, and we never ask to "allow tracking" (your advertising identifier, IDFA, is not used to track you). To show and measure ads and prevent fraud, Google may still process device information, approximate location (from your IP address) and ad interactions. In the EU, UK and similar regions we ask for your consent first.</li>
<li><b>Web version</b>: may use Google AdSense game ads, and Google may use cookies or similar technologies to show and measure them. When no Google ad is available, we show a card promoting our own other games, which does not track you.</li>
<li>How Google uses data: <a href="https://policies.google.com/technologies/partner-sites">Google</a>.</li></ul>
<h2>4. Sharing</h2><p>We do not sell any data. It is shared only with the providers above (Apple, Google, Cloudflare<span class="web-only">, Lemon Squeezy</span>) as needed to run the Service, or when required by law.</p>
<h2>5. Children</h2><p>The game is suitable for all ages. We collect no personal data from anyone, including children under 13, and the free version requests only non-personalised, general-audience ads.</p>
<h2>6. Contact and changes</h2><p>Questions: {M}. When this policy changes, we update the "Last updated" date on this page.</p>
""",
"ko": f"""
<p>이 방침은 「{APP['ko']}」가 처리하는 데이터를 설명합니다. 요약하면 <b>계정 없음, 추적 없음 — 저희는 개인정보를 직접 수집하지 않습니다. 무료 버전의 광고는 Google이 제공합니다(3-2 참고).</b></p>
<h2>1. 기기에만 저장되는 데이터</h2><p>다음 데이터는 기기(iOS는 앱 로컬 저장소, 웹은 브라우저 localStorage)에만 저장되며 저희나 제3자에게 전송되지 않습니다. 앱을 삭제하거나 브라우저 데이터를 지우면 삭제됩니다.</p><ul>
<li>행성별 최고 별 개수와 기록, 데일리 챌린지 결과와 연속 일수</li>
<li>배경음악·효과음·진동·언어 설정, 튜토리얼 시청 여부</li>
<li>정식판 구매 여부 (오프라인에서도 구매한 행성을 플레이하기 위해)<span class="web-only">; 웹에서는 라이선스 키와 활성화 기록도 저장</span></li></ul>
<h2>2. Apple 서비스 (iOS)</h2><ul>
<li><b>Game Center</b>: 로그인한 경우 기록이 Apple 랭킹으로 전송되며 Apple 개인정보 처리방침에 따라 처리됩니다. iPhone 「설정 → Game Center」에서 관리할 수 있습니다.</li>
<li><b>앱 내 구매</b>: 결제는 모두 Apple이 처리하며 저희는 결제 정보를 받지 않습니다.</li></ul>
<p>Apple 개인정보 처리방침: {APPLE_PRIV}</p>
<h2>3. 웹사이트</h2><p>사이트는 Cloudflare를 통해 제공되며, 보안과 남용 방지를 위해 IP 주소 등 접속 정보가 잠시 처리될 수 있습니다. 저희는 추적 쿠키나 행동 분석을 사용하지 않습니다.</p><div class="web-only"><h2>3-1. 웹에서 정식판 구매</h2><ul><li>결제는 Lemon Squeezy가 처리하며, 이름·이메일·청구 주소·결제 정보는 Lemon Squeezy의 <a href="https://www.lemonsqueezy.com/privacy">개인정보 처리방침</a>에 따라 처리됩니다. 저희는 카드 정보를 받지 않습니다.</li><li>키를 활성화할 때 저희 서버(Cloudflare)가 키와 기기 이름(예: 「web Win32 2026-10-26」)을 Lemon Squeezy에 보내 확인하고, 활성화 상태를 브라우저에 저장합니다. 이후 약 7일마다 다시 확인합니다.</li><li>Lemon Squeezy로부터 주문 정보(이메일, 주문 번호 등)를 받으며, 고객 지원·환불·법정 기록에만 사용합니다.</li></ul></div><p></p>
<h2>3-2. 광고 (무료 버전만)</h2><ul>
<li>무료 버전에는 광고가 표시됩니다: 플레이어가 직접 선택해 보는, 유료 행성을 한 번 체험할 수 있는 보상형 광고와, 몇 단계마다 결과 화면을 나갈 때 나오는 전면 광고입니다. 플레이 중에는 광고가 나오지 않습니다. 정식판을 구매하면 광고가 영원히 사라집니다.</li>
<li><b>iOS 앱</b>: 광고는 Google AdMob이 제공합니다. <b>비맞춤형 광고</b>만, 전체 이용가 등급으로 요청하며 「앱 추적 허용」을 요청하지 않습니다(광고 식별자 IDFA로 추적하지 않음). 광고 표시·측정과 부정 방지를 위해 Google이 기기 정보, 대략적인 위치(IP 기반), 광고 상호작용 기록을 처리할 수 있습니다. EU·영국 등에서는 먼저 동의를 받습니다.</li>
<li><b>웹 버전</b>: Google AdSense 게임 광고를 사용할 수 있으며, Google이 쿠키 등으로 광고를 표시·측정할 수 있습니다. Google 광고가 없을 때는 저희의 다른 게임을 소개하는 카드를 보여 주며, 이 카드는 추적하지 않습니다.</li>
<li>Google의 데이터 사용 방식: <a href="https://policies.google.com/technologies/partner-sites">Google</a>.</li></ul>
<h2>4. 제3자 제공</h2><p>데이터를 판매하지 않습니다. 서비스 제공에 필요한 범위에서 위 사업자(Apple, Google, Cloudflare<span class="web-only">, Lemon Squeezy</span>)와 공유하거나 법에 따라 제공하는 경우에만 제공합니다.</p>
<h2>5. 아동</h2><p>본 게임은 전 연령 대상입니다. 저희는 13세 미만 아동을 포함해 누구의 개인정보도 수집하지 않으며, 무료 버전은 비맞춤형·전체 이용가 광고만 요청합니다.</p>
<h2>6. 문의 및 변경</h2><p>문의: {M}. 방침이 바뀌면 이 페이지의 「최종 업데이트」 날짜를 변경합니다.</p>
""",
}

C["contact"] = {
"zh": f"""
<p class="lead">有任何問題、建議、錯誤回報，或購買、退款相關需求，歡迎來信：</p>
<p class="big">{M}</p>
<p>我們通常在 <b>3 個工作天內</b>回覆。回報錯誤時，請附上裝置型號、系統版本和發生的星球。</p>
<h2>常見問題</h2>
<h3>怎麼玩？</h3><p>閱讀線索手冊，每條線索都會提到一個<b>地標</b>和一種<b>藏匿點</b>（例如「燈塔腳下的石頭縫」）。在星球上找到那個地標，點它旁邊對應的東西翻找。翻錯地方 +3 秒，使用提示 +15 秒，越快找齊星星越多。想再看一次教學，到「⚙️ 設定 → 新手教學」。</p>
<h3>哪些星球免費？</h3><p>前 4 顆星球和每日挑戰免費，而且不用依序過關。第 5～28 顆星球屬於「完整版」，購買一次即可永久遊玩<span class="web-only">（見<a href="pass.html">完整版介紹</a>）</span>。</p><h3 class="web-only">網頁版買了完整版，換一台電腦或手機怎麼辦？</h3><p class="web-only">在新的裝置打開遊戲，輸入同一組序號就可以了，最多 5 個裝置。序號在付款後的收據頁和收據 email 裡，找不到請檢查垃圾郵件匣，或直接來信。</p>
<h3>換了手機，完整版不見了？</h3><p>到「⚙️ 設定 → 完整版 → 恢復購買」，並使用當初購買時的 Apple ID。</p>
<h3>每日挑戰是什麼？</h3><p>每天（台灣時間 00:00 換日）全世界玩同一顆星球、同一張地圖，只有當天第一次的成績會記錄並上傳排行榜。</p>
<h3>沒有聲音？</h3><p>確認 iPhone 側邊的靜音開關沒有開啟，並到「⚙️ 設定」確認配樂與音效為「開」。</p>
<h3>可以退款嗎？</h3><p><span class="web-only">網頁版購買後 14 天內不論原因都可以全額退款，見<a href="refund.html">退款政策</a>。</span>App Store 的購買請到 <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a> 申請。</p>
<p class="note">營運者：Empty Office（無人辦公室），個人開發者，台灣。</p>
""",
"ja": f"""
<p class="lead">ご質問、ご提案、不具合の報告、購入・返金に関するご相談は、こちらまでご連絡ください。</p>
<p class="big">{M}</p>
<p>通常 <b>3 営業日以内</b>に返信します。不具合の報告には、端末の機種、OS のバージョン、発生した星を添えてください。</p>
<h2>よくある質問</h2>
<h3>遊び方は？</h3><p>手がかり帳を読みましょう。手がかりには<b>ランドマーク</b>と<b>隠し場所</b>の種類（例：「灯台のふもとの岩のすき間」）が書かれています。星の上でそのランドマークを見つけ、そばの該当するものをタップして探します。間違えると +3 秒、ヒントは +15 秒。早く見つけるほど星が増えます。チュートリアルは「⚙️ 設定 → チュートリアル」でもう一度見られます。</p>
<h3>無料で遊べる星は？</h3><p>最初の 4 つの星とデイリーチャレンジは無料で、順番に遊ぶ必要もありません。5〜28 番目の星は「完全版」で、一度購入すればずっと遊べます<span class="web-only">（<a href="pass.html">完全版について</a>）</span>。</p><h3 class="web-only">Web 版で完全版を買った後、別の端末で使うには？</h3><p class="web-only">新しい端末でゲームを開き、同じキーを入力してください（最大 5 台）。キーは購入後の領収ページと領収メールに記載されています。見つからない場合は迷惑メールフォルダを確認するか、メールでご連絡ください。</p>
<h3>機種変更したら完全版が消えた</h3><p>「⚙️ 設定 → 完全版 → 購入を復元」を、購入時と同じ Apple ID で押してください。</p>
<h3>デイリーチャレンジとは？</h3><p>毎日（台湾時間 0:00 に更新）世界中が同じ星・同じマップに挑戦します。その日の最初の記録だけがランキングに送信されます。</p>
<h3>音が出ない</h3><p>iPhone の消音スイッチがオフになっているか、「⚙️ 設定」で BGM と効果音がオンになっているか確認してください。</p>
<h3>返金できますか？</h3><p><span class="web-only">Web 版は購入後 14 日以内なら理由を問わず全額返金します（<a href="refund.html">返金ポリシー</a>）。</span>App Store での購入は <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a> から申請してください。</p>
<p class="note">運営：Empty Office（無人辦公室）、個人開発者、台湾。</p>
""",
"en": f"""
<p class="lead">Questions, ideas, bug reports, or help with a purchase or refund — please email:</p>
<p class="big">{M}</p>
<p>We usually reply within <b>3 business days</b>. For bug reports, include your device model, OS version and the planet where it happened.</p>
<h2>FAQ</h2>
<h3>How do I play?</h3><p>Read the clue notebook. Each clue names a <b>landmark</b> and a kind of <b>hiding spot</b> (e.g. "the rock crack at the foot of the lighthouse"). Find that landmark on the planet and tap the matching thing next to it. A wrong guess adds 3 seconds and a hint adds 15 — the faster you finish, the more stars you get. Replay the tutorial in ⚙️ Settings → Tutorial.</p>
<h3>Which planets are free?</h3><p>The first 4 planets and the Daily Challenge are free, and you can play them in any order. Planets 5–28 are part of the Full Version, a one-time purchase<span class="web-only"> (see <a href="pass.html">Full Version</a>)</span>.</p><h3 class="web-only">I bought the Full Version on the web — how do I use it on another device?</h3><p class="web-only">Open the game on the new device and enter the same key (up to 5 devices). The key is on the receipt page and in the receipt email — check your spam folder, or just email us.</p>
<h3>I switched phones and lost the Full Version</h3><p>Tap ⚙️ Settings → Full Version → Restore using the Apple ID you bought it with.</p>
<h3>What is the Daily Challenge?</h3><p>Every day (reset at 00:00 Taiwan time) everyone in the world plays the same planet and map. Only your first attempt of the day is recorded and sent to the leaderboard.</p>
<h3>No sound?</h3><p>Check that the iPhone's silent switch is off, and that Music and Sound are on in ⚙️ Settings.</p>
<h3>Can I get a refund?</h3><p><span class="web-only">Web purchases: a full refund for any reason within 14 days — see the <a href="refund.html">refund policy</a>. </span>For App Store purchases, request one at <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a>.</p>
<p class="note">Operated by Empty Office, an individual developer based in Taiwan.</p>
""",
"ko": f"""
<p class="lead">질문, 제안, 버그 신고, 구매·환불 관련 문의는 아래 이메일로 보내 주세요.</p>
<p class="big">{M}</p>
<p>보통 <b>영업일 기준 3일 이내</b>에 답장합니다. 버그 신고 시 기기 모델, OS 버전, 발생한 행성을 함께 알려 주세요.</p>
<h2>자주 묻는 질문</h2>
<h3>어떻게 플레이하나요?</h3><p>단서 수첩을 읽으세요. 단서마다 <b>랜드마크</b>와 <b>숨김 장소</b>의 종류(예: 「등대 아래 바위 틈」)가 나옵니다. 행성에서 그 랜드마크를 찾아 옆에 있는 해당 물건을 탭하세요. 틀리면 +3초, 힌트는 +15초이며 빨리 찾을수록 별을 더 받습니다. 튜토리얼은 「⚙️ 설정 → 튜토리얼」에서 다시 볼 수 있습니다.</p>
<h3>무료 행성은 어떤 건가요?</h3><p>처음 4개 행성과 데일리 챌린지는 무료이며, 순서대로 깰 필요도 없어요. 5~28번째 행성은 「정식판」이며 한 번 구매하면 계속 플레이할 수 있습니다<span class="web-only">(<a href="pass.html">정식판 안내</a>)</span>.</p><h3 class="web-only">웹에서 정식판을 샀는데 다른 기기에서 쓰려면?</h3><p class="web-only">새 기기에서 게임을 열고 같은 키를 입력하면 됩니다(최대 5대). 키는 결제 후 영수증 페이지와 영수증 이메일에 있어요. 찾을 수 없으면 스팸함을 확인하거나 이메일로 문의해 주세요.</p>
<h3>기기를 바꿨더니 정식판이 사라졌어요</h3><p>구매할 때 쓴 Apple ID로 「⚙️ 설정 → 정식판 → 구매 복원」을 누르세요.</p>
<h3>데일리 챌린지란?</h3><p>매일(대만 시간 0시 갱신) 전 세계가 같은 행성, 같은 지도에 도전합니다. 그날 첫 기록만 저장되어 랭킹에 올라갑니다.</p>
<h3>소리가 안 나요</h3><p>iPhone 무음 스위치가 꺼져 있는지, 「⚙️ 설정」에서 배경음악과 효과음이 켜져 있는지 확인하세요.</p>
<h3>환불되나요?</h3><p><span class="web-only">웹 구매는 14일 이내 이유와 관계없이 전액 환불됩니다(<a href="refund.html">환불 정책</a>). </span>App Store 구매는 <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a> 에서 신청하세요.</p>
<p class="note">운영: Empty Office, 대만의 개인 개발자.</p>
""",
}

TITLE_TAIL = {c: APP[c] if c != "en" else "Lost & Found in Space" for c in APP}

def page(key):
    sections = []
    for code, _ in LANGS:
        nav = "".join(f'<a href="{k}.html" class="{"on" if k == key else ""}{" web-only" if k in WEB_ONLY else ""}">{html.escape(NAV[k][code])}</a>' for k in NAV)
        sections.append(f'''<section lang="{code}" data-l="{code}">
  <nav class="top"><a href="./" class="back">{html.escape(BACK[code])}</a></nav>
  <h1>{html.escape(NAV[key][code])}</h1>
  <p class="upd">{UPDATED[code]}：{DATE}</p>
  {C[key][code]}
  <footer><nav>{nav}</nav><p>Empty Office · {M}</p></footer>
</section>''')
    switch = "".join(f'<button data-l="{c}">{n}</button>' for c, n in LANGS)
    titles = ", ".join(f"{c}: {(NAV[key][c] + ' · ' + TITLE_TAIL[c])!r}" for c, _ in LANGS)
    return f'''<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(NAV[key]["zh"] + " · " + TITLE_TAIL["zh"])}</title>
<meta name="description" content="{html.escape(NAV[key]["en"])} — Lost &amp; Found in Space by Empty Office">
<link rel="icon" href="icons/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="stylesheet" href="legal.css">
<script>
// App 內（Capacitor）隱藏網頁付款相關內容；遊戲內連結也會帶 ?app=1
(function () {{
  var app = /[?&]app=1/.test(location.search) || !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  try {{ if (app) sessionStorage.setItem('inApp', '1'); else app = sessionStorage.getItem('inApp') === '1'; }} catch (e) {{}}
  if (app) document.documentElement.className = 'in-app';
}})();
</script></head>
<body><div class="langs">{switch}</div>
{"".join(sections)}
<script>
(function () {{
  var KEY = 'planet-lost-found.legal-lang', TITLES = {{{titles}}};
  function pick() {{
    var q = new URLSearchParams(location.search).get('lang'); if (TITLES[q]) return q;
    try {{ var s = localStorage.getItem(KEY); if (TITLES[s]) return s; }} catch (e) {{}}
    var n = (navigator.language || '').toLowerCase();
    return n.indexOf('ja') === 0 ? 'ja' : n.indexOf('ko') === 0 ? 'ko' : n.indexOf('zh') === 0 ? 'zh' : 'en';
  }}
  function show(l) {{
    document.querySelectorAll('section[data-l]').forEach(function (s) {{ s.hidden = s.getAttribute('data-l') !== l; }});
    document.querySelectorAll('.langs button').forEach(function (b) {{ b.classList.toggle('on', b.getAttribute('data-l') === l); }});
    document.documentElement.lang = l === 'zh' ? 'zh-Hant' : l; document.title = TITLES[l];
  }}
  document.querySelector('.langs').addEventListener('click', function (e) {{
    var b = e.target.closest('button'); if (!b) return; var l = b.getAttribute('data-l');
    try {{ localStorage.setItem(KEY, l); }} catch (err) {{}} show(l);
  }});
  show(pick());
}})();
</script></body></html>
'''

# 支援頁轉址：App Store 的支援網址可能已填 /support，保留舊網址並保留 ?lang 參數
SUPPORT = '''<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>聯絡與支援 · 星球失物招領所</title>
<meta http-equiv="refresh" content="0; url=contact.html">
<link rel="canonical" href="https://planet.emptyoffice.app/contact">
<script>location.replace('contact.html' + location.search);</script>
</head><body><p><a href="contact.html">聯絡與支援 Contact &amp; Support</a></p></body></html>
'''

# 與遊戲同色系：深藍夜空底、奶油色紙卡、粗墨線
CSS = """/* 條款頁共用樣式（scripts/legal_gen.py 產生，與遊戲介面同色系） */
:root { --ink: #1d1b3a; --paper: #fff8e7; --dim: #77708f; --accent: #3a5fd0; --yellow: #ffd23a; --line: #e4dccb; }
* { box-sizing: border-box; }
body { margin: 0; background: #070b1a; color: var(--ink); font: 16px/1.75 system-ui, -apple-system, "Segoe UI", "PingFang TC", "Microsoft JhengHei", "Noto Sans TC", "Hiragino Sans", "Noto Sans JP", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif; }
section { max-width: 760px; margin: 18px auto 40px; padding: 22px 22px 30px; background: var(--paper); border: 4px solid var(--ink); border-radius: 20px; box-shadow: 0 8px 0 var(--ink); }
.langs { position: sticky; top: 0; z-index: 2; display: flex; gap: 6px; justify-content: flex-end; padding: 10px 16px; padding-top: max(10px, env(safe-area-inset-top)); background: rgba(7, 11, 26, .92); }
.langs button { border: 2px solid var(--ink); background: var(--paper); color: var(--ink); border-radius: 999px; padding: 2px 12px; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
.langs button.on { background: var(--yellow); }
.top .back { font-size: 14px; font-weight: 700; color: var(--dim); text-decoration: none; }
h1 { font-size: 30px; line-height: 1.3; margin: 12px 0 2px; }
h2 { font-size: 19px; margin: 26px 0 6px; padding-top: 10px; border-top: 2px dashed var(--line); }
h3 { font-size: 16px; margin: 18px 0 2px; }
.upd { color: var(--dim); font-size: 13px; margin: 0 0 18px; }
.lead { font-size: 17px; }
.big { font-size: 22px; font-weight: 700; word-break: break-all; }
.note { font-size: 13.5px; color: #4e4868; background: #fff; border: 2px solid var(--line); border-radius: 12px; padding: 10px 14px; }
a { color: var(--accent); }
table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 14.5px; background: #fff; border: 2px solid var(--ink); border-radius: 12px; overflow: hidden; border-spacing: 0; }
th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
th { background: var(--yellow); }
td:first-child { font-weight: 700; }
footer { margin-top: 36px; padding-top: 14px; border-top: 2px solid var(--ink); font-size: 13.5px; color: #4e4868; }
footer nav { display: flex; flex-wrap: wrap; gap: 2px 16px; }
footer nav a { color: inherit; }
footer nav a.on { font-weight: 700; color: var(--ink); text-decoration: none; }
.in-app .web-only { display: none !important; }
@media (max-width: 560px) { section { margin: 12px 10px 28px; padding: 18px 16px 24px; } h1 { font-size: 25px; } table { font-size: 13.5px; } }
"""

open(os.path.join(OUT, "legal.css"), "w", encoding="utf-8", newline="\n").write(CSS)
for k in NAV:
    open(os.path.join(OUT, f"{k}.html"), "w", encoding="utf-8", newline="\n").write(page(k))
    print("wrote", k)
open(os.path.join(OUT, "support.html"), "w", encoding="utf-8", newline="\n").write(SUPPORT)
print("wrote support (redirect)")
