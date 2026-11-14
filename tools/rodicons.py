#!/usr/bin/env python3
"""Значки удочек для рынка из картинок сбоку (art/rods/raw): рукоять и первые кольца, по диагонали —
торец внизу слева, кончик уходит вверх вправо за край. Пишет public/img/items/rodN.webp (256×256).

  python3 tools/rodicons.py [--part 0.6] [--sheet лист.png]"""
import sys, os, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image
import icons

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
ap = argparse.ArgumentParser()
ap.add_argument('--part', type=float, default=0.6)
ap.add_argument('--angle', type=float, default=38)
ap.add_argument('--sheet', default=None)
a = ap.parse_args()
cells = []
for i in range(1, 11):
    id = f'rod{i}'
    cut, kind, K = icons.key(Image.open(os.path.join(ROOT, 'art/rods/raw', id + '.png')))
    al = np.asarray(cut)[..., 3]
    xs = np.where(al.max(0) > 24)[0]
    x0, x1 = xs.min(), xs.max()
    part = cut.crop((x0, 0, int(x0 + a.part * (x1 - x0)), cut.size[1]))
    rot = part.rotate(a.angle, resample=Image.BICUBIC, expand=True)
    ic = icons.fit(rot, 256, 0.03)
    ic.save(os.path.join(ROOT, 'public/img/items', id + '.webp'), 'WEBP', quality=88, method=6, alpha_quality=90)
    cells.append(ic)
    print(id)
if a.sheet:
    sh = Image.new('RGBA', (256 * 5, 256 * 2), (29, 42, 54, 255))
    for i, c in enumerate(cells): sh.alpha_composite(c, ((i % 5) * 256, (i // 5) * 256))
    sh.convert('RGB').save(a.sheet)
