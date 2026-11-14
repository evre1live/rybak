#!/usr/bin/env python3
"""Текстуры земли, камня и дерева из картинок GPT Image (art/tex/raw/<имя>.webp): делает их бесшовными и пишет
в public/tex/<имя>.webp «во сколько раз светлее или темнее среднего» (среднее = 0,5) — как ждёт игра (client/surface.js):
там текстура умножается на цвет поверхности, так что оттенок травы и камня задаёт локация, а рисунок — текстура.

  python3 tools/textures.py [--sheet лист.png]

Бесшовность: картинка смешивается со своей копией, сдвинутой на полразмера; у краёв берётся копия (у неё края — бывшая
середина, сшитая сама с собой), в середине — оригинал."""
import os, sys, argparse
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
ap = argparse.ArgumentParser()
ap.add_argument('--sheet', default=None)
a = ap.parse_args()
# контраст рисунка: трава и песок спокойнее (их много и они близко), камень и тропа — как есть
K = {'rock': 1.0, 'grass': 0.85, 'sand': 0.8, 'dirt': 0.9, 'wood': 0.95}
# сколько оттенка картинки оставить (0 — только светлее/темнее)
HUE = {'rock': 0.35, 'grass': 0.22, 'sand': 0.25, 'dirt': 0.3, 'wood': 0.25}
cells = []
for name, k in K.items():
    src = os.path.join(ROOT, 'art/tex/raw', name + '.webp')
    if not os.path.exists(src):
        continue
    x = np.asarray(Image.open(src).convert('RGB').resize((1024, 1024), Image.LANCZOS)).astype(np.float32) / 255
    n = x.shape[0]
    sh = np.roll(np.roll(x, n // 2, 0), n // 2, 1)
    # вес оригинала: 1 в середине, 0 у краёв (полоса смешивания — 18 % стороны)
    t = np.minimum(np.arange(n), n - 1 - np.arange(n)) / (n * 0.18)
    t = np.clip(t, 0, 1)
    t = t * t * (3 - 2 * t)
    w = np.minimum(t[:, None], t[None, :])[..., None]
    y = x * w + sh * (1 - w)
    # средний цвет → 0,5; рисунок вокруг него с заданным контрастом
    mean = y.reshape(-1, 3).mean(0)
    # рисунок — в основном яркость; оттенок картинки берём лишь отчасти (HUE), иначе тени травы уходили в синеву
    lum = (y * np.array([0.2126, 0.7152, 0.0722])).sum(-1, keepdims=True)
    ratio = lum / (mean * np.array([0.2126, 0.7152, 0.0722])).sum() * (1 - HUE[name]) + y / mean * HUE[name]
    m = 0.5 + (ratio * 0.5 - 0.5) * k
    m = np.clip(m, 0, 1)
    out = Image.fromarray((m * 255 + 0.5).astype(np.uint8), 'RGB')
    p = os.path.join(ROOT, 'public/tex', name + '.webp')
    out.save(p, 'WEBP', quality=88, method=6)
    cells.append((name, out))
    print(name, 'средний цвет', np.round(mean * 255).astype(int).tolist(), os.path.getsize(p) // 1024, 'КБ')
if a.sheet:
    # каждую — плиткой 2×2: видно, нет ли шва
    S = 384
    sheet = Image.new('RGB', (S * len(cells), S), 'black')
    for i, (name, im) in enumerate(cells):
        t = im.resize((S // 2, S // 2))
        for dx in (0, 1):
            for dy in (0, 1):
                sheet.paste(t, (i * S + dx * S // 2, dy * S // 2))
    sheet.save(a.sheet)
