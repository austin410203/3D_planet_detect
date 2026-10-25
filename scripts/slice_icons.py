"""
slice_icons.py — 把 Gemini 生成的 4×4 圖示表切成單張、去背的遊戲圖示
--------------------------------------------------
用法：python scripts/slice_icons.py <圖示表 PNG> <第幾張表（從 1 起算）>
  - 依 design/icons/catalog.json 的 sheets[n] 決定每一格是哪個 emoji
  - 每格：從格子邊緣往內填滿接近白色的背景 → 透明（圖示內部的白色保留）
  - 去掉白邊殘留：邊緣 1px 收縮並柔化
  - 裁到圖示範圍、置中補成正方形，輸出 256×256 WebP 到 public/icons/game/<碼位>.webp
  - 更新 src/icon-list.js（目前有哪些圖示，遊戲據此把 emoji 換成圖片）
  - 另存一張深色底的檢查圖 design/icons/check-<n>.png，方便看去背是否乾淨
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "icons" / "game"
SIZE = 256
WHITE_TOL = 28  # 與純白的差距在此之內視為背景


def cut_background(cell: Image.Image) -> Image.Image:
    rgb = np.asarray(cell.convert("RGB")).astype(np.int16)
    near_white = (255 - rgb).max(axis=2) <= WHITE_TOL
    # 只移除「和格子邊緣相連」的白色區域，圖示裡的白色（反光、紙張）保留
    labels, _ = ndimage.label(near_white)
    edge = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    bg = np.isin(labels, edge[edge > 0])
    # 被物品圍住的大塊「幾乎純白」區域（項鍊、眼罩帶子圍出的空洞）也是背景；
    # 紙張、書頁有陰影與紋理，不會整塊都這麼白，所以不受影響
    pure = (255 - rgb).max(axis=2) <= 8
    holes, n = ndimage.label(pure & ~bg)
    if n:
        sizes = ndimage.sum(np.ones_like(holes), holes, index=range(1, n + 1))
        big = [i + 1 for i, s in enumerate(sizes) if s > holes.size * 0.012]
        bg |= np.isin(holes, big)
    alpha = Image.fromarray(np.where(bg, 0, 255).astype(np.uint8))
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    out = cell.convert("RGBA")
    out.putalpha(alpha)
    return out


def fit_square(icon: Image.Image) -> Image.Image:
    box = icon.getchannel("A").point(lambda a: 255 if a > 24 else 0).getbbox()
    if not box:
        return Image.new("RGBA", (SIZE, SIZE))
    icon = icon.crop(box)
    w, h = icon.size
    side = int(max(w, h) * 1.08)  # 留一點邊
    canvas = Image.new("RGBA", (side, side))
    canvas.paste(icon, ((side - w) // 2, (side - h) // 2))
    return canvas.resize((SIZE, SIZE), Image.LANCZOS)


def main():
    sheet_path, n = Path(sys.argv[1]), int(sys.argv[2])
    catalog = json.loads((ROOT / "design" / "icons" / "catalog.json").read_text(encoding="utf-8"))
    files = catalog["sheets"][n - 1]
    sheet = Image.open(sheet_path).convert("RGB")
    W, H = sheet.size
    OUT.mkdir(parents=True, exist_ok=True)
    check = Image.new("RGBA", (4 * 140, ((len(files) + 3) // 4) * 140), (29, 27, 58, 255))
    for i, f in enumerate(files):
        r, c = divmod(i, 4)
        cell = sheet.crop((c * W // 4, r * H // 4, (c + 1) * W // 4, (r + 1) * H // 4))
        icon = fit_square(cut_background(cell))
        icon.save(OUT / f"{f}.webp", quality=88, method=6)
        check.alpha_composite(icon.resize((128, 128), Image.LANCZOS), (c * 140 + 6, r * 140 + 6))
    check.save(ROOT / "design" / "icons" / f"check-{n}.png")
    write_icon_list()
    print(f"第 {n} 張：切出 {len(files)} 個圖示 → {OUT}")


def write_icon_list():
    """依 public/icons/game/ 目前有的圖示，重寫 src/icon-list.js"""
    names = sorted(p.stem for p in OUT.glob("*.webp"))
    body = ",\n".join(f"  '{n}'" for n in names)
    (ROOT / "src" / "icon-list.js").write_text(
        "// 由 scripts/slice_icons.py 自動產生，請勿手動修改：已有圖示的 emoji 碼位（public/icons/game/<碼位>.webp）\n"
        f"export const ICON_FILES = new Set([\n{body},\n]);\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
