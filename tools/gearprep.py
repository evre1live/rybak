#!/usr/bin/env python3
"""Образцы для моделей Tripo из картинок рынка: фон-хромакей вырезается, предмет кладётся на ровный светло-серый
фон с полями (так Tripo лучше отделяет предмет), 1024×1024.

  python3 tools/gearprep.py art/icons/raw art/gear/in reel1 float2 …
  python3 tools/gearprep.py art/rods/raw art/gear/in rod5 --crop 0,0.42   (для удочек: левая часть — рукоять)

Исходники и образцы в репозиторий не входят."""
import sys, os, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
import icons

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('dst'); ap.add_argument('ids', nargs='+')
ap.add_argument('--size', type=int, default=1024)
ap.add_argument('--pad', type=float, default=0.08)
ap.add_argument('--crop', default=None, help='доля ширины картинки: от,до (после вырезания фона)')
ap.add_argument('--bg', default='#d9dde2')
a = ap.parse_args()
os.makedirs(a.dst, exist_ok=True)
for id in a.ids:
    cut, kind, K = icons.key(Image.open(os.path.join(a.src, id + '.png')))
    if a.crop:
        f0, f1 = (float(v) for v in a.crop.split(','))
        w, h = cut.size
        cut = cut.crop((round(w * f0), 0, round(w * f1), h))
    sq = icons.fit(cut, a.size, a.pad)
    out = Image.new('RGBA', sq.size, a.bg)
    out.alpha_composite(sq)
    p = os.path.join(a.dst, id + '.png')
    out.convert('RGB').save(p)
    print(id, kind, p)
