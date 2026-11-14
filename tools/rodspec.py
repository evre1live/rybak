#!/usr/bin/env python3
"""Разбор картинок удочек сбоку (art/rods/raw/rodN.png, GPT Image на хромакее): где кончается рукоять, где
катушкодержатель, толщина бланка у рукояти и у кончика, где висят пропускные кольца и какого они размера, цвета
бланка, обмоток и колец. Пишет client/rodspec.js (размеры — в метрах в осях удочки, см. gear3d.js) и образцы
рукоятей для Tripo (art/gear/in/rodN.png), лист проверки — по --sheet.

  python3 tools/rodspec.py [--sheet лист.png] [rod1 …]
"""
import sys, os, json, argparse
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import icons

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
LTOT = 2.3   # длина удочки от торца до кончика, м
SEAT_Y = 0.03  # середина катушкодержателя в осях удочки

ap = argparse.ArgumentParser()
ap.add_argument('ids', nargs='*')
ap.add_argument('--sheet', default=None)
a = ap.parse_args()
ids = a.ids or [f'rod{i}' for i in range(1, 11)]
# где разбор по цвету ошибается (ручки и катушкодержатель одного цвета) — доли длины удочки от торца, по картинке
OVR = {'rod5': {'seat': 0.205, 'end': 0.356}}

def hexc(c):
    return '#%02x%02x%02x' % tuple(int(round(v)) for v in c)

def smooth(v, k):
    p = np.pad(v.astype(float), k, mode='edge')
    return np.array([np.median(p[i:i + 2 * k + 1]) for i in range(len(v))])

specs = {}
cells = []
for id in ids:
    cut, kind, K = icons.key(Image.open(os.path.join(ROOT, 'art/rods/raw', id + '.png')))
    rgba = np.asarray(cut).astype(float)
    al = rgba[..., 3] > 128
    H, W = al.shape
    cols = np.where(al.any(0))[0]
    x0, x1 = int(cols.min()), int(cols.max())
    L = x1 - x0
    top = np.zeros(W, int); bot = np.zeros(W, int); low = np.zeros(W, int)
    for x in range(x0, x1 + 1):
        ys = np.where(al[:, x])[0]
        if not len(ys): continue
        t = ys[0]; r = t
        while r + 1 < H and al[r + 1, x]: r += 1
        top[x], bot[x], low[x] = t, r, ys[-1]
    th = (bot - top + 1).astype(float)
    ths = smooth(th[x0:x1 + 1], 6)
    # бланк: на последних двух третях — прямая по медианам; рукоять кончается там, где толщина впервые
    # (если идти от торца) падает ниже полуторной толщины бланка в этом месте и дальше так и остаётся
    xs = np.arange(x0, x1 + 1)
    seg = (xs > x0 + 0.5 * L) & (xs < x1 - 0.03 * L)
    fit = np.polyfit(xs[seg], ths[seg], 1)
    blank = np.polyval(fit, xs)
    # рукоять по цвету середины: задняя ручка — цвет у 12 % длины; её конец — где цвет ушёл больше чем на 1 % длины;
    # передняя ручка — снова этот цвет на 2 % длины и больше; катушкодержатель — между ручками
    yc = (top + bot) / 2
    def colat(xx):
        h = max(2, int(th[xx] * 0.25))
        c = int(yc[xx])
        return np.median(rgba[c - h:c + h + 1, xx, :3], 0)
    C = np.array([colat(x) for x in xs])
    g0 = C[int(0.12 * L)]
    same = np.linalg.norm(C - g0, axis=1) < 46
    i = int(0.12 * L)
    gap = int(0.01 * L)
    while i < len(xs) and (same[i] or same[i:i + gap].any()):
        i += 1
    rear_end = i
    lim = int(0.6 * L)
    while i < lim and not same[i:i + int(0.02 * L)].mean() > 0.8:
        i += 1
    fore_start = i
    while i < len(xs) and (same[i] or same[i:i + gap].any()):
        i += 1
    fore_end = i
    # за передней ручкой может быть кольцо-заглушка: рукоять кончается там, где толщина спала до бланка
    while i < len(xs) and ths[i] > blank[i] * 1.3:
        i += 1
    xe = xs[min(i, len(xs) - 1)]
    he = (xe - x0) / L
    xseat = x0 + (rear_end + fore_start) // 2
    if id in OVR:
        xseat = x0 + int(OVR[id]['seat'] * L)
        xe = x0 + int(OVR[id]['end'] * L)
        he = OVR[id]['end']
    # кольца: столбцы, где под бланком (ниже нижнего края первого куска) есть ещё предмет
    hang = (low - bot) > 4
    hang[:xe + 4] = False
    guides = []
    x = xe + 4
    while x <= x1:
        if hang[x]:
            s = x
            while x <= x1 and hang[x]: x += 1
            e = x - 1
            if e - s >= 3:
                # дырка кольца делит его на две половинки: близкие куски — одно кольцо
                if guides and s - guides[-1][1] < 0.014 * L:
                    s = guides.pop()[0]
                guides.append([s, e])
        x += 1
    guides = [((s + e) / 2, e - s + 1, int(max(low[s:e + 1] - bot[s:e + 1]))) for s, e in guides]
    # кольцо на самом кончике (тюльпан) — у самого конца, его «под бланком» почти нет
    m = LTOT / L  # метров в пикселе
    yof = lambda xx: SEAT_Y + (xx - xseat) * m
    # цвета: бланк — середина верхней половины бланка между кольцами, обмотки — у колец, кольца — внизу петли
    def sample(xa, xb, ya, yb):
        pts = []
        for xx in range(int(xa), int(xb)):
            for yy in range(int(ya(xx)), int(yb(xx)) + 1):
                if 0 <= yy < H and rgba[yy, xx, 3] > 200: pts.append(rgba[yy, xx, :3])
        return np.median(np.array(pts), 0) if pts else np.array([128, 128, 128])
    gx = [g[0] for g in guides]
    mids = [((gx[i] + gx[i + 1]) / 2) for i in range(len(gx) - 1)] or [xe + 0.2 * L]
    bc = np.median([sample(mx - 6, mx + 6, lambda xx: yc[xx] - 2, lambda xx: yc[xx] + 1) for mx in mids[:4]], 0)
    spec = {
        'seat': round(xseat / 1, 1),
        'butt': round(yof(x0), 4), 'end': round(yof(xe), 4), 'tip': round(yof(x1), 4),
        'r0': round(np.polyval(fit, xe) * m / 2, 4), 'r1': round(max(4, np.polyval(fit, x1 - 0.02 * L)) * m / 2, 4),
        'guides': [[round(yof(g[0]), 4), round(min(g[1] / 2, g[2] * 0.36) * m, 4), round(g[2] * m, 4)] for g in guides],
        'blank': hexc(bc), 'seatR': round(float(np.median(th[xseat - 8:xseat + 9])) * m / 2, 4),
    }
    spec.pop('seat')
    specs[id] = spec
    # образец рукояти для Tripo: от торца до конца рукояти и чуть бланка
    crop = cut.crop((max(0, x0 - 6), 0, min(W, int(xe + 0.006 * L)), H))
    sq = icons.fit(crop, 1024, 0.04)
    bg = Image.new('RGBA', sq.size, '#d9dde2'); bg.alpha_composite(sq)
    os.makedirs(os.path.join(ROOT, 'art/gear/in'), exist_ok=True)
    bg.convert('RGB').save(os.path.join(ROOT, 'art/gear/in', id + '.png'))
    spec['hlen'] = round(crop.size[0] * m, 4)  # длина модели рукояти (образец — от торца до конца рукояти)
    print(id, json.dumps(spec, ensure_ascii=False))
    if a.sheet:
        im = Image.new('RGBA', (W, H), (40, 50, 64, 255)); im.alpha_composite(cut)
        d = ImageDraw.Draw(im)
        d.line([(xseat, 0), (xseat, H)], fill=(255, 220, 0, 255), width=5)
        d.line([(xe, 0), (xe, H)], fill=(255, 60, 60, 255), width=5)
        for g in guides: d.line([(g[0], H - 30), (g[0], H)], fill=(80, 255, 120, 255), width=5)
        cells.append(im.resize((W // 3, H // 3)))
out = os.path.join(ROOT, 'client/rodspec.js')
old = {}
if os.path.exists(out) and a.ids:
    txt = open(out).read()
    old = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])
old.update(specs)
with open(out, 'w') as f:
    f.write('// Создаётся tools/rodspec.py по картинкам удочек сбоку: где конец рукояти, толщина бланка, кольца и цвета.\n')
    f.write('// Метры в осях удочки (gear3d.js): +Y — к кончику, середина катушкодержателя на y = 0,03.\n')
    f.write('// guides: [y, радиус кольца, высота лапки с кольцом]\n')
    f.write('export const ROD_SPEC = ' + json.dumps(old, ensure_ascii=False) + ';\n')
if cells:
    sh = Image.new('RGBA', (cells[0].size[0], sum(c.size[1] for c in cells)), (0, 0, 0, 255))
    y = 0
    for c in cells: sh.alpha_composite(c, (0, y)); y += c.size[1]
    sh.convert('RGB').save(a.sheet)
