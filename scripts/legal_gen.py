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
"zh": """
<p class="lead">前 <b>8 顆星球</b>免費玩，每日挑戰也免費。買一次「完整版」，就能解鎖第 9～28 顆星球。</p>
<table><tr><th></th><th>免費</th><th>完整版</th></tr>
<tr><td>星球</td><td>第 1～8 顆</td><td>再加第 9～28 顆（共 28 顆）</td></tr>
<tr><td>每日挑戰</td><td>✔</td><td>✔</td></tr>
<tr><td>Game Center 排行榜（iOS）</td><td>✔</td><td>✔（購買不影響名次）</td></tr>
<tr><td>廣告</td><td>沒有</td><td>沒有</td></tr></table>
<h2>iOS App</h2><p>在 App 內透過 App Store 購買，一次付費、永久擁有，沒有訂閱。價格依 App Store 顯示的當地價格為準。換手機時，用同一個 Apple ID 在「⚙️ 設定 → 完整版 → 恢復購買」即可。</p>
<h2>網頁版</h2><p>網頁版目前全部星球免費開放遊玩。如果日後網頁版開始收費，會在這裡公告價格與購買方式；網頁訂單將由我們的線上經銷商 Lemon Squeezy 處理，由 Lemon Squeezy 擔任登記賣方（Merchant of Record）。</p>
<p class="note">App Store 的購買和網頁版的購買分開計算：網頁版的序號不能在 iOS App 內使用，App 內的購買也不能轉到網頁版。</p>
""",
"ja": """
<p class="lead">最初の <b>8 つの星</b>は無料で遊べ、デイリーチャレンジも無料です。「完全版」を一度購入すると、9〜28 番目の星が解放されます。</p>
<table><tr><th></th><th>無料</th><th>完全版</th></tr>
<tr><td>星</td><td>1〜8</td><td>さらに 9〜28（全 28）</td></tr>
<tr><td>デイリーチャレンジ</td><td>✔</td><td>✔</td></tr>
<tr><td>Game Center ランキング（iOS）</td><td>✔</td><td>✔（購入は順位に影響しません）</td></tr>
<tr><td>広告</td><td>なし</td><td>なし</td></tr></table>
<h2>iOS アプリ</h2><p>アプリ内で App Store から購入します。買い切りでサブスクリプションはありません。価格は App Store に表示される現地価格に従います。機種変更したときは、同じ Apple ID で「⚙️ 設定 → 完全版 → 購入を復元」を押してください。</p>
<h2>Web 版</h2><p>Web 版は現在すべての星を無料で公開しています。今後 Web 版を有料化する場合は、価格と購入方法をこのページでお知らせします。Web 版のご注文は当社のオンライン販売代理店 Lemon Squeezy が販売者（Merchant of Record）として処理します。</p>
<p class="note">App Store での購入と Web 版の購入は別扱いです。Web 版のキーは iOS アプリでは使えず、アプリ内の購入を Web 版に移すこともできません。</p>
""",
"en": """
<p class="lead">The first <b>8 planets</b> are free, and so is the Daily Challenge. Buy the Full Version once to unlock planets 9–28.</p>
<table><tr><th></th><th>Free</th><th>Full Version</th></tr>
<tr><td>Planets</td><td>1–8</td><td>+ planets 9–28 (28 in all)</td></tr>
<tr><td>Daily Challenge</td><td>✔</td><td>✔</td></tr>
<tr><td>Game Center leaderboards (iOS)</td><td>✔</td><td>✔ (buying never affects your rank)</td></tr>
<tr><td>Ads</td><td>None</td><td>None</td></tr></table>
<h2>iOS app</h2><p>Bought inside the app through the App Store — a one-time purchase, no subscription. The price is the local price shown by the App Store. On a new phone, use the same Apple ID and tap ⚙️ Settings → Full Version → Restore.</p>
<h2>Web version</h2><p>All planets are currently free to play on the web. If the web version ever becomes paid, the price and how to buy will be announced here; web orders would be processed by our online reseller Lemon Squeezy, the Merchant of Record.</p>
<p class="note">App Store purchases and web purchases are separate: web licence keys cannot be used in the iOS app, and in-app purchases cannot be moved to the web version.</p>
""",
"ko": """
<p class="lead">처음 <b>8개 행성</b>은 무료이며, 데일리 챌린지도 무료입니다. 「정식판」을 한 번 구매하면 9~28번째 행성이 열립니다.</p>
<table><tr><th></th><th>무료</th><th>정식판</th></tr>
<tr><td>행성</td><td>1~8</td><td>9~28 추가 (총 28개)</td></tr>
<tr><td>데일리 챌린지</td><td>✔</td><td>✔</td></tr>
<tr><td>Game Center 랭킹 (iOS)</td><td>✔</td><td>✔ (구매는 순위에 영향 없음)</td></tr>
<tr><td>광고</td><td>없음</td><td>없음</td></tr></table>
<h2>iOS 앱</h2><p>앱 안에서 App Store로 구매하며, 한 번 구매로 영구 소장(구독 아님)입니다. 가격은 App Store에 표시되는 현지 가격을 따릅니다. 기기를 바꾸면 같은 Apple ID로 「⚙️ 설정 → 정식판 → 구매 복원」을 누르세요.</p>
<h2>웹 버전</h2><p>웹 버전은 현재 모든 행성을 무료로 공개하고 있습니다. 앞으로 웹 버전이 유료화되면 가격과 구매 방법을 이 페이지에 안내하며, 웹 주문은 온라인 리셀러 Lemon Squeezy가 판매자(Merchant of Record)로서 처리합니다.</p>
<p class="note">App Store 구매와 웹 구매는 별개입니다. 웹 라이선스 키는 iOS 앱에서 쓸 수 없으며, 앱 내 구매를 웹 버전으로 옮길 수도 없습니다.</p>
""",
}

C["terms"] = {
"zh": f"""
<p>歡迎使用「{APP['zh']}」（以下稱「本服務」），本服務由個人開發者以品牌「Empty Office（無人辦公室）」經營。使用本服務即表示你同意以下條款。</p>
<h2>1. 服務內容</h2><p>本服務是低多邊形風格的 3D 星球解謎遊戲：閱讀線索，在星球上找出藏起來的物品。前 8 顆星球與每日挑戰免費，第 9～28 顆星球需購買「完整版」<span class="web-only">（見<a href="pass.html">完整版介紹</a>）</span>。</p>
<h2>2. 購買與授權</h2><ul>
<li>iOS App 內的購買由 Apple 透過 App Store 處理，適用 Apple 的媒體服務條款。</li>
<li class="web-only">網頁版如提供購買，訂單由我們的線上經銷商 Lemon Squeezy 處理，Lemon Squeezy 是交易的登記賣方（Merchant of Record），負責收款、收據與稅務，並適用其條款。</li>
<li>完整版是數位內容的<b>使用授權</b>，不是所有權移轉，不得轉售或公開分享。</li></ul>
<h2>3. 使用規範</h2><p>請勿以程式或任何方式竄改成績、干擾排行榜，或破解付費內容。</p>
<h2>4. 智慧財產權</h2><p>本服務的程式、3D 模型、圖示、音樂、音效與文字由開發者製作，保留所有權利。</p>
<h2>5. 免責</h2><p>本服務依現況提供。我們會盡力維持正常運作，但不保證完全不中斷、沒有錯誤。在法律允許的範圍內，我們對使用本服務所造成的間接損失不負責任。</p>
<h2>6. 變更與終止</h2><p>我們可能更新本服務或本條款，重大變更會在網站公告。若本服務未來停止營運，已購買的完整版會以合理方式處理，例如維持已下載的 App 可離線遊玩。</p>
<h2>7. 準據法</h2><p>本條款以中華民國（台灣）法律為準據法。消費者依其居住地法律享有的強制保護，不受影響。</p>
<h2>8. 聯絡</h2><p>{M}</p>
""",
"ja": f"""
<p>「{APP['ja']}」（以下「本サービス」）は、個人開発者がブランド「Empty Office（無人辦公室）」として運営しています。本サービスを利用することで、以下の規約に同意したものとみなします。</p>
<h2>1. サービス内容</h2><p>ローポリ風の 3D 惑星パズルゲームです。手がかりを読み、星に隠された落とし物を探します。最初の 8 つの星とデイリーチャレンジは無料で、9〜28 番目の星は「完全版」の購入が必要です<span class="web-only">（<a href="pass.html">完全版について</a>）</span>。</p>
<h2>2. 購入とライセンス</h2><ul>
<li>iOS アプリ内の購入は Apple が App Store を通じて処理し、Apple のメディアサービス利用規約が適用されます。</li>
<li class="web-only">Web 版で購入を提供する場合、ご注文はオンライン販売代理店 Lemon Squeezy が販売者（Merchant of Record）として処理し、決済・領収書・税務を担当し、同社の規約が適用されます。</li>
<li>完全版はデジタルコンテンツの<b>利用許諾</b>であり、所有権の移転ではありません。転売・公開共有はできません。</li></ul>
<h2>3. 禁止事項</h2><p>プログラム等による記録の改ざん、ランキングの妨害、有料コンテンツのクラック。</p>
<h2>4. 知的財産</h2><p>本サービスのプログラム、3D モデル、アイコン、音楽、効果音、文章は開発者が制作し、すべての権利を保有します。</p>
<h2>5. 免責</h2><p>本サービスは現状有姿で提供されます。正常な運営に努めますが、中断やエラーがないことは保証しません。法令で認められる範囲で、間接的な損害について責任を負いません。</p>
<h2>6. 変更と終了</h2><p>本サービスや本規約は更新されることがあり、重要な変更はサイトでお知らせします。将来サービスを終了する場合、購入済みの完全版については、ダウンロード済みのアプリをオフラインで遊べるようにするなど、合理的な方法で対応します。</p>
<h2>7. 準拠法</h2><p>本規約は中華民国（台湾）法を準拠法とします。お住まいの国の消費者保護法による強行的な保護は影響を受けません。</p>
<h2>8. お問い合わせ</h2><p>{M}</p>
""",
"en": f"""
<p>"{html.escape(APP['en'])}" (the "Service") is run by an individual developer under the brand "Empty Office". By using the Service you agree to these terms.</p>
<h2>1. The Service</h2><p>A low-poly 3D planet puzzle game: read the clues and find the items hidden on each planet. The first 8 planets and the Daily Challenge are free; planets 9–28 require the Full Version<span class="web-only"> (see <a href="pass.html">Full Version</a>)</span>.</p>
<h2>2. Purchases and licence</h2><ul>
<li>Purchases in the iOS app are processed by Apple through the App Store and are subject to Apple's Media Services Terms.</li>
<li class="web-only">If purchases are offered on the web, our order process is conducted by our online reseller Lemon Squeezy, the Merchant of Record, who handles payment, receipts and taxes under their own terms.</li>
<li>The Full Version is a <b>licence to use</b> digital content, not a transfer of ownership. It may not be resold or shared publicly.</li></ul>
<h2>3. Acceptable use</h2><p>Do not tamper with scores, interfere with leaderboards or crack paid content.</p>
<h2>4. Intellectual property</h2><p>The code, 3D models, icons, music, sounds and text of the Service are made by the developer, who reserves all rights.</p>
<h2>5. Disclaimer</h2><p>The Service is provided "as is". We work to keep it running but do not guarantee it will be uninterrupted or error-free. To the extent permitted by law, we are not liable for indirect losses arising from use of the Service.</p>
<h2>6. Changes and termination</h2><p>We may update the Service or these terms; significant changes will be announced on the site. If the Service is ever shut down, purchased Full Versions will be handled in a reasonable way, such as keeping the downloaded app playable offline.</p>
<h2>7. Governing law</h2><p>These terms are governed by the laws of Taiwan (Republic of China). Mandatory consumer protections of your country of residence are not affected.</p>
<h2>8. Contact</h2><p>{M}</p>
""",
"ko": f"""
<p>「{APP['ko']}」(이하 「서비스」)는 개인 개발자가 브랜드 「Empty Office」로 운영합니다. 서비스를 이용하면 아래 약관에 동의한 것으로 봅니다.</p>
<h2>1. 서비스 내용</h2><p>로우폴리 풍의 3D 행성 퍼즐 게임으로, 단서를 읽고 행성에 숨겨진 물건을 찾습니다. 처음 8개 행성과 데일리 챌린지는 무료이며, 9~28번째 행성은 「정식판」 구매가 필요합니다<span class="web-only">(<a href="pass.html">정식판 안내</a> 참고)</span>.</p>
<h2>2. 구매와 라이선스</h2><ul>
<li>iOS 앱 내 구매는 Apple이 App Store를 통해 처리하며 Apple 미디어 서비스 이용약관이 적용됩니다.</li>
<li class="web-only">웹에서 구매를 제공하는 경우, 주문은 온라인 리셀러 Lemon Squeezy가 판매자(Merchant of Record)로서 처리하며 결제·영수증·세금을 담당하고 그 약관이 적용됩니다.</li>
<li>정식판은 디지털 콘텐츠의 <b>이용 허락</b>이며 소유권 이전이 아닙니다. 재판매나 공개 공유는 할 수 없습니다.</li></ul>
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
<h2>iOS App（App Store 購買）</h2><p>App 內購買由 Apple 收款，退款依 Apple 的規定處理：請到 <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a> 用購買時的 Apple ID 申請。退款完成後，完整版會重新上鎖，遊戲進度會保留。遇到問題也歡迎來信 {M}，我們會協助你。</p>
<h2>網頁版</h2><p>網頁版目前免費，不需要退款。日後若開始收費，網頁訂單適用以下規則：</p><ul>
<li><b>購買後 14 天內</b>，不論原因，只要來信提出，都可以全額退款。</li>
<li>超過 14 天後，如果因為技術問題無法使用，而我們也無法修好，仍然可以退款。</li>
<li>寄信到 {M}，附上購買時的 email 和訂單編號；退款由 Lemon Squeezy 退回原付款方式，通常 5～10 個工作天入帳。</li>
<li>退款後序號會被停用、付費內容重新上鎖，遊戲進度保留。</li></ul>
""",
"ja": f"""
<h2>iOS アプリ（App Store での購入）</h2><p>アプリ内購入の代金は Apple が受け取るため、返金は Apple の規定に従います。購入時の Apple ID で <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a> から申請してください。返金後は完全版が再びロックされ、進行状況は残ります。お困りのときは {M} までご連絡ください。</p>
<h2>Web 版</h2><p>Web 版は現在無料のため返金の必要はありません。今後有料化した場合、Web 版のご注文には以下が適用されます。</p><ul>
<li><b>購入後 14 日以内</b>であれば、理由を問わず、ご連絡いただければ全額返金します。</li>
<li>14 日を過ぎても、技術的な問題で利用できず、こちらで解決できない場合は返金します。</li>
<li>{M} 宛てに購入時のメールアドレスと注文番号をお送りください。Lemon Squeezy から元の支払い方法へ返金されます（通常 5〜10 営業日）。</li>
<li>返金後はキーが無効化され、有料コンテンツは再びロックされます。進行状況は残ります。</li></ul>
""",
"en": f"""
<h2>iOS app (App Store purchases)</h2><p>In-app purchases are paid to Apple, so refunds follow Apple's rules: request one at <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a> with the Apple ID you used. After a refund the Full Version locks again and your progress is kept. If anything goes wrong, email {M} and we'll help.</p>
<h2>Web version</h2><p>The web version is currently free, so there is nothing to refund. If it ever becomes paid, web orders follow these rules:</p><ul>
<li>Within <b>14 days of purchase</b>, email us for any reason and we will give you a full refund.</li>
<li>After 14 days, if a technical problem stops you using it and we cannot fix it, we will still refund you.</li>
<li>Email {M} with the email address you used and your order number; Lemon Squeezy returns the money to the original payment method, usually within 5–10 business days.</li>
<li>After a refund the key is disabled and paid content locks again; your progress is kept.</li></ul>
""",
"ko": f"""
<h2>iOS 앱 (App Store 구매)</h2><p>앱 내 구매 대금은 Apple이 받으므로 환불은 Apple 규정을 따릅니다. 구매한 Apple ID로 <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a> 에서 신청하세요. 환불 후 정식판은 다시 잠기며 진행 상황은 유지됩니다. 문제가 있으면 {M} 로 연락 주세요.</p>
<h2>웹 버전</h2><p>웹 버전은 현재 무료라 환불할 것이 없습니다. 앞으로 유료화되면 웹 주문에는 다음 규칙이 적용됩니다.</p><ul>
<li><b>구매 후 14일 이내</b>에는 이유와 관계없이 연락 주시면 전액 환불해 드립니다.</li>
<li>14일이 지나도 기술적인 문제로 이용할 수 없고 저희가 해결하지 못하면 환불해 드립니다.</li>
<li>{M} 로 구매 이메일과 주문 번호를 보내 주세요. Lemon Squeezy가 원래 결제 수단으로 환불하며 보통 영업일 기준 5~10일 걸립니다.</li>
<li>환불 후 키는 비활성화되고 유료 콘텐츠는 다시 잠기며, 진행 상황은 유지됩니다.</li></ul>
""",
}

C["privacy"] = {
"zh": f"""
<p>本政策說明「{APP['zh']}」會處理哪些資料。簡單來說：<b>沒有帳號、沒有廣告、沒有追蹤，我們不收集你的個人資料。</b></p>
<h2>1. 只存在你裝置上的資料</h2><p>以下資料只存在你的裝置上（iOS 為 App 的本機儲存，網頁版為瀏覽器 localStorage），不會傳給我們或任何第三方；刪除 App 或清除瀏覽器資料就會刪除：</p><ul>
<li>各星球的最佳星數與時間、每日挑戰成績與連續天數</li>
<li>配樂、音效、震動、語言設定，以及是否看過新手教學</li>
<li>是否已購買完整版（讓你離線也能玩已購買的關卡）</li></ul>
<h2>2. Apple 提供的服務（iOS）</h2><ul>
<li><b>Game Center</b>：登入 Game Center 時，你的成績會上傳到 Apple 的排行榜，由 Apple 依其隱私權政策處理。可在 iPhone「設定 → Game Center」登出或管理。</li>
<li><b>App 內購買</b>：付款完全由 Apple 處理，我們不會取得你的付款資訊。</li></ul>
<p>Apple 隱私權政策：{APPLE_PRIV}</p>
<h2>3. 網站</h2><p>網站由 Cloudflare 提供，Cloudflare 可能為了安全與防止濫用，短期處理 IP 位址等連線資訊。我們不使用追蹤 Cookie，也不做廣告或行為分析。<span class="web-only">網頁版如日後提供購買，付款由 Lemon Squeezy 依其<a href="https://www.lemonsqueezy.com/privacy">隱私權政策</a>處理，我們只會收到 email、訂單編號等客服與法定紀錄需要的資料。</span></p>
<h2>4. 資料分享</h2><p>我們不出售任何資料，也沒有可分享的個人資料。</p>
<h2>5. 兒童</h2><p>本遊戲適合所有年齡，不收集任何人的個人資料，包括 13 歲以下的兒童。</p>
<h2>6. 聯絡與更新</h2><p>如有任何問題，請寫信到 {M}。本政策更新時，會修改本頁的「最後更新」日期。</p>
""",
"ja": f"""
<p>本ポリシーは「{APP['ja']}」が扱うデータについて説明します。要するに、<b>アカウントなし・広告なし・追跡なしで、個人情報は収集しません。</b></p>
<h2>1. 端末内だけに保存されるデータ</h2><p>以下のデータは端末内（iOS はアプリのローカル保存、Web 版はブラウザの localStorage）にのみ保存され、当方や第三者に送信されません。アプリの削除やブラウザのデータ消去で削除されます。</p><ul>
<li>各星のベスト星数とタイム、デイリーチャレンジの記録と連続日数</li>
<li>BGM・効果音・振動・言語の設定、チュートリアルを見たかどうか</li>
<li>完全版を購入済みかどうか（オフラインでも購入済みの星を遊べるようにするため）</li></ul>
<h2>2. Apple のサービス（iOS）</h2><ul>
<li><b>Game Center</b>：サインインしている場合、記録は Apple のランキングに送信され、Apple のプライバシーポリシーに従って扱われます。iPhone の「設定 → Game Center」から管理できます。</li>
<li><b>アプリ内課金</b>：決済はすべて Apple が行い、当方が支払い情報を受け取ることはありません。</li></ul>
<p>Apple のプライバシーポリシー：{APPLE_PRIV}</p>
<h2>3. Web サイト</h2><p>サイトは Cloudflare で提供されており、セキュリティと不正防止のため、IP アドレスなどの接続情報が短期間処理されることがあります。追跡 Cookie、広告や行動分析は使用しません。<span class="web-only">今後 Web 版で購入を提供する場合、決済は Lemon Squeezy が同社の<a href="https://www.lemonsqueezy.com/privacy">プライバシーポリシー</a>に従って行い、当方はサポートと法定記録に必要なメールアドレスや注文番号のみを受け取ります。</span></p>
<h2>4. 第三者提供</h2><p>データを販売することはなく、共有できる個人情報も保有していません。</p>
<h2>5. 子どもについて</h2><p>本ゲームは全年齢向けで、13 歳未満の子どもを含め、誰の個人情報も収集しません。</p>
<h2>6. お問い合わせと改定</h2><p>ご質問は {M} までお送りください。本ポリシーを改定した場合は、本ページの「最終更新」日を変更します。</p>
""",
"en": f"""
<p>This policy explains what data "{html.escape(APP['en'])}" handles. In short: <b>no account, no ads, no tracking — we don't collect your personal data.</b></p>
<h2>1. Data that stays on your device</h2><p>The following is stored only on your device (app storage on iOS, localStorage in the browser) and is never sent to us or anyone else. Deleting the app or clearing browser data removes it:</p><ul>
<li>Best stars and times for each planet, Daily Challenge results and streak</li>
<li>Music, sound, haptics and language settings, and whether you've seen the tutorial</li>
<li>Whether you own the Full Version (so purchased planets work offline)</li></ul>
<h2>2. Apple services (iOS)</h2><ul>
<li><b>Game Center</b>: if you're signed in, your scores are sent to Apple's leaderboards and handled under Apple's privacy policy. Manage it in iPhone Settings → Game Center.</li>
<li><b>In-app purchases</b>: payment is handled entirely by Apple; we never receive your payment details.</li></ul>
<p>Apple's privacy policy: {APPLE_PRIV}</p>
<h2>3. Website</h2><p>The site is served by Cloudflare, which may briefly process connection data such as IP addresses for security and abuse prevention. We use no tracking cookies and no advertising or behavioural analytics.<span class="web-only"> If purchases are ever offered on the web, payment would be handled by Lemon Squeezy under their <a href="https://www.lemonsqueezy.com/privacy">privacy policy</a>; we would receive only what support and legal records need, such as your email and order number.</span></p>
<h2>4. Sharing</h2><p>We do not sell any data, and we hold no personal data to share.</p>
<h2>5. Children</h2><p>The game is suitable for all ages and collects no personal data from anyone, including children under 13.</p>
<h2>6. Contact and changes</h2><p>Questions: {M}. When this policy changes, we update the "Last updated" date on this page.</p>
""",
"ko": f"""
<p>이 방침은 「{APP['ko']}」가 처리하는 데이터를 설명합니다. 요약하면 <b>계정 없음, 광고 없음, 추적 없음 — 개인정보를 수집하지 않습니다.</b></p>
<h2>1. 기기에만 저장되는 데이터</h2><p>다음 데이터는 기기(iOS는 앱 로컬 저장소, 웹은 브라우저 localStorage)에만 저장되며 저희나 제3자에게 전송되지 않습니다. 앱을 삭제하거나 브라우저 데이터를 지우면 삭제됩니다.</p><ul>
<li>행성별 최고 별 개수와 기록, 데일리 챌린지 결과와 연속 일수</li>
<li>배경음악·효과음·진동·언어 설정, 튜토리얼 시청 여부</li>
<li>정식판 구매 여부 (오프라인에서도 구매한 행성을 플레이하기 위해)</li></ul>
<h2>2. Apple 서비스 (iOS)</h2><ul>
<li><b>Game Center</b>: 로그인한 경우 기록이 Apple 랭킹으로 전송되며 Apple 개인정보 처리방침에 따라 처리됩니다. iPhone 「설정 → Game Center」에서 관리할 수 있습니다.</li>
<li><b>앱 내 구매</b>: 결제는 모두 Apple이 처리하며 저희는 결제 정보를 받지 않습니다.</li></ul>
<p>Apple 개인정보 처리방침: {APPLE_PRIV}</p>
<h2>3. 웹사이트</h2><p>사이트는 Cloudflare를 통해 제공되며, 보안과 남용 방지를 위해 IP 주소 등 접속 정보가 잠시 처리될 수 있습니다. 추적 쿠키, 광고·행동 분석은 사용하지 않습니다.<span class="web-only"> 앞으로 웹에서 구매를 제공하는 경우 결제는 Lemon Squeezy가 그 <a href="https://www.lemonsqueezy.com/privacy">개인정보 처리방침</a>에 따라 처리하며, 저희는 고객 지원과 법정 기록에 필요한 이메일과 주문 번호만 받습니다.</span></p>
<h2>4. 제3자 제공</h2><p>어떤 데이터도 판매하지 않으며, 공유할 개인정보도 보유하지 않습니다.</p>
<h2>5. 아동</h2><p>본 게임은 전 연령 대상이며 13세 미만 아동을 포함해 누구의 개인정보도 수집하지 않습니다.</p>
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
<h3>怎麼解鎖下一顆星球？</h3><p>在上一顆星球拿到至少 1 顆星就會解鎖。第 9～28 顆星球屬於「完整版」，購買一次即可永久遊玩。</p>
<h3>換了手機，完整版不見了？</h3><p>到「⚙️ 設定 → 完整版 → 恢復購買」，並使用當初購買時的 Apple ID。</p>
<h3>每日挑戰是什麼？</h3><p>每天（台灣時間 00:00 換日）全世界玩同一顆星球、同一張地圖，只有當天第一次的成績會記錄並上傳排行榜。</p>
<h3>沒有聲音？</h3><p>確認 iPhone 側邊的靜音開關沒有開啟，並到「⚙️ 設定」確認配樂與音效為「開」。</p>
<h3>可以退款嗎？</h3><p>App Store 的購買請到 <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a> 申請<span class="web-only">，詳見<a href="refund.html">退款政策</a></span>。</p>
<p class="note">營運者：Empty Office（無人辦公室），個人開發者，台灣。</p>
""",
"ja": f"""
<p class="lead">ご質問、ご提案、不具合の報告、購入・返金に関するご相談は、こちらまでご連絡ください。</p>
<p class="big">{M}</p>
<p>通常 <b>3 営業日以内</b>に返信します。不具合の報告には、端末の機種、OS のバージョン、発生した星を添えてください。</p>
<h2>よくある質問</h2>
<h3>遊び方は？</h3><p>手がかり帳を読みましょう。手がかりには<b>ランドマーク</b>と<b>隠し場所</b>の種類（例：「灯台のふもとの岩のすき間」）が書かれています。星の上でそのランドマークを見つけ、そばの該当するものをタップして探します。間違えると +3 秒、ヒントは +15 秒。早く見つけるほど星が増えます。チュートリアルは「⚙️ 設定 → チュートリアル」でもう一度見られます。</p>
<h3>次の星を解放するには？</h3><p>前の星で 1 つ以上星を取ると解放されます。9〜28 番目の星は「完全版」で、一度購入すればずっと遊べます。</p>
<h3>機種変更したら完全版が消えた</h3><p>「⚙️ 設定 → 完全版 → 購入を復元」を、購入時と同じ Apple ID で押してください。</p>
<h3>デイリーチャレンジとは？</h3><p>毎日（台湾時間 0:00 に更新）世界中が同じ星・同じマップに挑戦します。その日の最初の記録だけがランキングに送信されます。</p>
<h3>音が出ない</h3><p>iPhone の消音スイッチがオフになっているか、「⚙️ 設定」で BGM と効果音がオンになっているか確認してください。</p>
<h3>返金できますか？</h3><p>App Store での購入は <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a> から申請してください<span class="web-only">（<a href="refund.html">返金ポリシー</a>）</span>。</p>
<p class="note">運営：Empty Office（無人辦公室）、個人開発者、台湾。</p>
""",
"en": f"""
<p class="lead">Questions, ideas, bug reports, or help with a purchase or refund — please email:</p>
<p class="big">{M}</p>
<p>We usually reply within <b>3 business days</b>. For bug reports, include your device model, OS version and the planet where it happened.</p>
<h2>FAQ</h2>
<h3>How do I play?</h3><p>Read the clue notebook. Each clue names a <b>landmark</b> and a kind of <b>hiding spot</b> (e.g. "the rock crack at the foot of the lighthouse"). Find that landmark on the planet and tap the matching thing next to it. A wrong guess adds 3 seconds and a hint adds 15 — the faster you finish, the more stars you get. Replay the tutorial in ⚙️ Settings → Tutorial.</p>
<h3>How do I unlock the next planet?</h3><p>Earn at least 1 star on the previous planet. Planets 9–28 are part of the Full Version, a one-time purchase.</p>
<h3>I switched phones and lost the Full Version</h3><p>Tap ⚙️ Settings → Full Version → Restore using the Apple ID you bought it with.</p>
<h3>What is the Daily Challenge?</h3><p>Every day (reset at 00:00 Taiwan time) everyone in the world plays the same planet and map. Only your first attempt of the day is recorded and sent to the leaderboard.</p>
<h3>No sound?</h3><p>Check that the iPhone's silent switch is off, and that Music and Sound are on in ⚙️ Settings.</p>
<h3>Can I get a refund?</h3><p>For App Store purchases, request one at <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a><span class="web-only"> — see the <a href="refund.html">refund policy</a></span>.</p>
<p class="note">Operated by Empty Office, an individual developer based in Taiwan.</p>
""",
"ko": f"""
<p class="lead">질문, 제안, 버그 신고, 구매·환불 관련 문의는 아래 이메일로 보내 주세요.</p>
<p class="big">{M}</p>
<p>보통 <b>영업일 기준 3일 이내</b>에 답장합니다. 버그 신고 시 기기 모델, OS 버전, 발생한 행성을 함께 알려 주세요.</p>
<h2>자주 묻는 질문</h2>
<h3>어떻게 플레이하나요?</h3><p>단서 수첩을 읽으세요. 단서마다 <b>랜드마크</b>와 <b>숨김 장소</b>의 종류(예: 「등대 아래 바위 틈」)가 나옵니다. 행성에서 그 랜드마크를 찾아 옆에 있는 해당 물건을 탭하세요. 틀리면 +3초, 힌트는 +15초이며 빨리 찾을수록 별을 더 받습니다. 튜토리얼은 「⚙️ 설정 → 튜토리얼」에서 다시 볼 수 있습니다.</p>
<h3>다음 행성은 어떻게 여나요?</h3><p>이전 행성에서 별을 1개 이상 받으면 열립니다. 9~28번째 행성은 「정식판」이며 한 번 구매하면 계속 플레이할 수 있습니다.</p>
<h3>기기를 바꿨더니 정식판이 사라졌어요</h3><p>구매할 때 쓴 Apple ID로 「⚙️ 설정 → 정식판 → 구매 복원」을 누르세요.</p>
<h3>데일리 챌린지란?</h3><p>매일(대만 시간 0시 갱신) 전 세계가 같은 행성, 같은 지도에 도전합니다. 그날 첫 기록만 저장되어 랭킹에 올라갑니다.</p>
<h3>소리가 안 나요</h3><p>iPhone 무음 스위치가 꺼져 있는지, 「⚙️ 설정」에서 배경음악과 효과음이 켜져 있는지 확인하세요.</p>
<h3>환불되나요?</h3><p>App Store 구매는 <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a> 에서 신청하세요<span class="web-only">(<a href="refund.html">환불 정책</a> 참고)</span>.</p>
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
