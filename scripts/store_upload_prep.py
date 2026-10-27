"""
store_upload_prep.py — 把合成好的商店截圖轉成 App Store Connect 收得下的檔案
--------------------------------------------------
App Store Connect 的限制：
  1. 截圖不可有透明通道（resvg 輸出的是 RGBA），一律轉成 RGB。
  2. 2026 年起 iPhone 主要欄位是「iPhone with Dynamic Island（中尺寸，6.1／6.3 吋）」，
     只收 1206×2622 或 1179×2556；6.9 吋 1320×2868 比例幾乎相同，直接縮成 1206×2622。
  iPad 13 吋（2064×2752）只轉 RGB。
用法：python scripts/store_upload_prep.py（先跑 npm run store-shots 合成）
輸出：store-shots/upload/iphone63/<語言>/、store-shots/upload/ipad13/<語言>/
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / 'store-shots'
TARGETS = {'iphone69': ('iphone63', (1206, 2622)), 'ipad13': ('ipad13', None)}

for src_dev, (out_dev, size) in TARGETS.items():
    for f in sorted((ROOT / src_dev).glob('*/*.png')):
        out = ROOT / 'upload' / out_dev / f.parent.name / f.name
        out.parent.mkdir(parents=True, exist_ok=True)
        im = Image.open(f).convert('RGB')
        if size:
            im = im.resize(size, Image.LANCZOS)
        im.save(out, optimize=True)
        print(f'✔ {out.relative_to(ROOT)} {im.size}')
