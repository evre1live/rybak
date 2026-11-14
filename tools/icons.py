#!/usr/bin/env python3
"""Значки рынка из картинок GPT Image: вырезает однотонный фон (зелёный или пурпурный),
убирает его отсвет с краёв, подгоняет предмет в квадрат и пишет webp.

  python3 tools/icons.py art/icons/raw public/img/items [--size 256] [--sheet лист.png]

Исходники (PNG на зелёном #00FF00 или пурпурном #FF00FF фоне) в репозиторий не входят."""
import sys, os, glob, argparse
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('dst')
ap.add_argument('--size', type=int, default=256)
ap.add_argument('--pad', type=float, default=0.04)
ap.add_argument('--sheet', default=None)
ap.add_argument('--only', default=None)
a = ap.parse_args()
os.makedirs(a.dst, exist_ok=True)

def key(im):
    x = np.asarray(im.convert('RGB')).astype(np.float32) / 255
    h, w, _ = x.shape
    b = np.concatenate([x[:6].reshape(-1, 3), x[-6:].reshape(-1, 3), x[:, :6].reshape(-1, 3), x[:, -6:].reshape(-1, 3)])
    K = np.median(b, 0)
    r, g, bl = x[..., 0], x[..., 1], x[..., 2]
    green = K[1] > K[0] and K[1] > K[2]
    # «насколько пиксель похож на фон»: для зелёного — перевес зелёного над прочими, для пурпурного — красного и синего над зелёным
    if green:
        s = g - np.maximum(r, bl); s0 = K[1] - max(K[0], K[2])
    else:
        s = np.minimum(r, bl) - g; s0 = min(K[0], K[2]) - K[1]
    k = np.clip(s / max(s0, 1e-3), 0, 1.2)
    lo, hi = 0.22, 0.9
    alpha = 1 - np.clip((k - lo) / (hi - lo), 0, 1)
    # цвет без примеси фона: C = (I - (1 - α)·K) / α
    A = alpha[..., None]
    C = np.where(A > 0.02, (x - (1 - A) * K) / np.maximum(A, 0.02), x)
    C = np.clip(C, 0, 1)
    # остаточный отсвет фона
    r, g, bl = C[..., 0], C[..., 1], C[..., 2]
    if green:
        g2 = np.minimum(g, np.maximum(r, bl) + 0.04); C[..., 1] = np.where(alpha < 0.999, g2, np.minimum(g, np.maximum(r, bl) + 0.25))
    else:
        m = np.minimum(r, bl); over = np.clip(m - g - 0.04, 0, None)
        lim = np.where(alpha < 0.999, over, np.clip(m - g - 0.3, 0, None))
        C[..., 0] = r - lim; C[..., 2] = bl - lim
    alpha[alpha < 0.03] = 0
    out = np.dstack([C, alpha])
    return Image.fromarray((out * 255 + 0.5).astype(np.uint8), 'RGBA'), ('green' if green else 'magenta'), K

def fit(im, size, pad):
    al = np.asarray(im)[..., 3]
    ys, xs = np.where(al > 24)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    crop = im.crop((x0, y0, x1, y1))
    s = size * (1 - 2 * pad) / max(x1 - x0, y1 - y0)
    cw, ch = max(1, round((x1 - x0) * s)), max(1, round((y1 - y0) * s))
    crop = crop.resize((cw, ch), Image.LANCZOS)
    c = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    c.alpha_composite(crop, ((size - cw) // 2, (size - ch) // 2))
    return c

files = sorted(glob.glob(os.path.join(a.src, '*.png')))
if a.only: files = [f for f in files if os.path.basename(f)[:-4] in a.only.split(',')]
cells = []
for f in files:
    name = os.path.basename(f)[:-4]
    cut, kind, K = key(Image.open(f))
    ic = fit(cut, a.size, a.pad)
    p = os.path.join(a.dst, name + '.webp')
    ic.save(p, 'WEBP', quality=86, method=6, alpha_quality=90)
    cells.append((name, ic))
    print(f'{name}: фон {kind} {np.round(K * 255).astype(int).tolist()}, {os.path.getsize(p) // 1024} КБ')
# список значков для клиента: какие предметы рисуются картинкой (client/itemimg.js)
if not a.only:
    ids = sorted(os.path.basename(f)[:-5] for f in glob.glob(os.path.join(a.dst, '*.webp')))
    js = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'client', 'itemimg.js')
    with open(js, 'w') as fh:
        fh.write('// Создаётся tools/icons.py: предметы рынка, у которых есть картинка public/img/items/<id>.webp\n')
        fh.write('export const ITEM_IMG = new Set(' + repr(ids).replace("'", '"') + ');\n')
    print('client/itemimg.js:', len(ids), 'значков')
if a.sheet:
    n = len(cells); cols = 9; S = 128; rows = (n + cols - 1) // cols
    sh = Image.new('RGBA', (cols * S, rows * S * 2), (0, 0, 0, 255))
    for i, (name, ic) in enumerate(cells):
        t = ic.resize((S, S), Image.LANCZOS)
        cx, cy = (i % cols) * S, (i // cols) * S
        for bg, dy in (((29, 42, 54, 255), 0), ((236, 226, 205, 255), rows * S)):
            tile = Image.new('RGBA', (S, S), bg); tile.alpha_composite(t)
            sh.paste(tile, (cx, cy + dy))
    sh.convert('RGB').save(a.sheet)
    print('лист:', a.sheet)
