#!/usr/bin/env python3
"""Картинки этапа 30 из GPT Image (ElevenLabs): экраны загрузки, открытки чудищ и листы значков.

  python3 tools/pics.py <папка с исходниками PNG> [--art art/icons/raw] [--pub public/img]

Что делает:
  ld_<локация>.png   → public/img/load-<локация>.webp   экран загрузки локации (1280×720);
  card_<чудище>.png  → public/img/beasts/<чудище>.webp  открытка чудища (960×640);
  sheet_*.png        → art/icons/{raw,ranks/raw,quests/raw}/<id>.png  листы режутся по сетке на отдельные значки;
                       дальше их вырезает из фона tools/icons.py:
                         python3 tools/icons.py art/icons/raw public/img/items --only nessiebait,…
                         python3 tools/icons.py art/icons/ranks/raw public/img/ranks --size 160 --nojs
                         python3 tools/icons.py art/icons/quests/raw public/img/quests --size 128 --nojs
Исходники в репозиторий не входят.
"""
import sys, os, argparse
from PIL import Image

# листы значков: имя листа → (столбцов, строк, имена клеток по строкам)
SHEETS = {
    'sheet_baits': (4, 2, ['nessiebait', 'krakenbait', 'whalebait', 'serpentbait', 'rainbowbait', 'hozyainbait', 'lunabait', 'chudobait']),
    'sheet_ranks1': (4, 2, ['rank-novichok', 'rank-lyubitel', 'rank-rybak', 'rank-byvaly', 'rank-znatok', 'rank-master', 'rank-kapitan', 'rank-volk']),
    'sheet_ranks2': (3, 2, ['rank-legenda', 'rank-groza', 'rank-hozyain', 'rank-povelitel', 'rank-tsar', 'rank-zhivaya']),
    'sheet_quests1': (4, 2, ['q-fish', 'q-kinds', 'q-sp', 'q-zone', 'q-sell', 'q-free', 'q-kg', 'q-big']),
    'sheet_quests2': (3, 2, ['q-rare', 'q-trophy', 'q-boat', 'q-wx', 'q-tour', 'q-bonus']),
}
LOCS = ['bay', 'lake', 'keys', 'blue', 'cascade', 'mangrove', 'marina']
BEASTS = ['nessie', 'kraken', 'whale', 'serpent', 'rainbow', 'hozyain', 'luna', 'chudo']


def cover(im, w, h):
    """Подогнать под w×h с обрезкой краёв (как background-size: cover)."""
    k = max(w / im.width, h / im.height)
    r = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    x, y = (r.width - w) // 2, (r.height - h) // 2
    return r.crop((x, y, x + w, y + h))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('--art', default='art/icons/raw')
    ap.add_argument('--pub', default='public/img')
    a = ap.parse_args()
    os.makedirs(os.path.join(a.pub, 'beasts'), exist_ok=True)
    os.makedirs(a.art, exist_ok=True)
    for loc in LOCS:
        f = os.path.join(a.src, f'ld_{loc}.png')
        if not os.path.exists(f):
            continue
        out = os.path.join(a.pub, f'load-{loc}.webp')
        cover(Image.open(f).convert('RGB'), 1280, 720).save(out, 'WEBP', quality=70, method=6)
        print(out, os.path.getsize(out) // 1024, 'КБ')
    for b in BEASTS:
        f = os.path.join(a.src, f'card_{b}.png')
        if not os.path.exists(f):
            continue
        out = os.path.join(a.pub, 'beasts', f'{b}.webp')
        cover(Image.open(f).convert('RGB'), 960, 640).save(out, 'WEBP', quality=80, method=6)
        print(out, os.path.getsize(out) // 1024, 'КБ')
    for name, (cols, rows, ids) in SHEETS.items():
        f = os.path.join(a.src, name + '.png')
        if not os.path.exists(f):
            continue
        im = Image.open(f).convert('RGB')
        cw, ch = im.width / cols, im.height / rows
        # приманки — к значкам рынка (art/icons/raw), звания и задания — в свои папки: у них свои значки и размеры
        dst = a.art if 'baits' in name else os.path.join(os.path.dirname(a.art.rstrip('/')), 'ranks' if 'ranks' in name else 'quests', 'raw')
        os.makedirs(dst, exist_ok=True)
        for i, id_ in enumerate(ids):
            c, r = i % cols, i // cols
            cell = im.crop((round(c * cw), round(r * ch), round((c + 1) * cw), round((r + 1) * ch)))
            cell.save(os.path.join(dst, id_ + '.png'))
        print(name, '→', len(ids), 'значков')


if __name__ == '__main__':
    main()
