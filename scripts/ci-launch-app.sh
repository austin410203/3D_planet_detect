#!/bin/bash
# ci-launch-app.sh — 在 iOS 模擬器啟動 App，並把 App 的輸出即時寫入紀錄檔（給 .github/workflows/ios.yml 用）
# 用法：bash scripts/ci-launch-app.sh <模擬器 UDID> <紀錄檔>
# - Capacitor 用 print() 輸出 JS console 與外掛呼叫（⚡️ 開頭），導向檔案會被緩衝，
#   所以用 simctl --console-pty，再用 script -F 提供終端機並即時寫入
# - simctl launch 偶爾會失敗（模擬器還沒完全就緒），等不到「WebView loaded」就結束 App 重試，最多 3 次
UDID="$1"
LOG="$2"
BUNDLE=com.austin410203.planetlostfound

for attempt in 1 2 3; do
  : > "$LOG"
  script -q -F "$LOG" xcrun simctl launch --console-pty "$UDID" "$BUNDLE" > /dev/null 2>&1 &
  for t in $(seq 1 30); do
    if grep -q "WebView loaded" "$LOG"; then
      echo "App 已啟動（第 $attempt 次）"
      exit 0
    fi
    sleep 1
  done
  echo "第 $attempt 次啟動沒有成功，紀錄最後幾行："
  tail -5 "$LOG"
  xcrun simctl terminate "$UDID" "$BUNDLE" > /dev/null 2>&1 || true
  sleep 3
done
echo "::error::App 在模擬器上啟動 3 次都失敗"
exit 1
