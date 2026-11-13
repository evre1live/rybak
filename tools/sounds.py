#!/usr/bin/env python3
"""Звуки игры из исходных записей (сделаны в ElevenLabs, mp3): нарезка, выравнивание громкости, петли, сборка.

  python3 tools/sounds.py <папка с исходниками> <папка для готового> [--sfx имя,имя,…] [--kbps 40] [--frame 20] [--no-loops]

--sfx — собрать дорожку только из перечисленных коротких звуков; --no-loops — петли не трогать (пересобрать только
общую дорожку: в описи остаются прежние петли);
--kbps и --frame — сжатие общей дорожки: килобит в секунду и длина кадра Opus в миллисекундах.
Готовое:
  sfx.webm          все короткие звуки подряд одной дорожкой;
  loop-<имя>.webm   петли: море, дождь, ветер, сверчки, мотор, водопад, костёр;
  sounds.json       где в sfx.webm лежит каждый звук и откуда докуда крутить каждую петлю.
Нужны ffmpeg (с libopus), numpy и scipy. Сами исходники в игру не входят.
"""
import sys, os, json, subprocess
import numpy as np
from scipy.signal import butter, sosfiltfilt
from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d

SR = 48000
db = lambda x: 20 * np.log10(max(float(x), 1e-9))
amp = lambda d: 10 ** (d / 20)


def dec(path, ch=1):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', str(ch), '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    y = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    return y.reshape(-1, ch) if ch > 1 else y


def enc(path, y, kbps, frame=20):
    ch = 1 if y.ndim == 1 else y.shape[1]
    raw = np.clip(y, -1, 1).astype(np.float32).tobytes()
    # bitexact — без случайных меток в файле: из тех же исходников тем же ffmpeg выходит тот же файл, байт в байт
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', str(ch), '-i', '-', '-c:a', 'libopus', '-b:a', f'{kbps}k', '-vbr', 'on',
                    '-compression_level', '10', '-application', 'audio', '-frame_duration', str(frame), '-fflags', '+bitexact', '-flags:a', '+bitexact', path], input=raw, check=True)


def hp(y, hz):
    return sosfiltfilt(butter(2, hz, 'hp', fs=SR, output='sos'), y, axis=0)


def rms_env(y, win, hop):
    m = y if y.ndim == 1 else y.mean(axis=1)
    return np.array([np.sqrt(np.mean(m[i:i + win] ** 2)) for i in range(0, max(1, len(m) - win), hop)])


def segments(y):
    """Отдельные звуки в записи: [начало, конец) в секундах. Паузы короче 120 мс звук не делят."""
    hop = 480
    e = rms_env(y, hop, hop)
    thr = max(np.max(np.abs(y)) * 0.02, amp(-50))
    out, s, gap = [], None, 0
    for i, v in enumerate(e > thr):
        if v:
            if s is None:
                s = i
            gap = 0
        elif s is not None:
            gap += 1
            if gap >= 12:
                out.append((s, i - gap + 1))
                s, gap = None, 0
    if s is not None:
        out.append((s, len(e)))
    return [(a * hop / SR, b * hop / SR) for a, b in out if (b - a) * hop / SR >= 0.03]


def cut(y, a, b, limit, tail=0.6):
    """Вырезать звук [a, b]: чуть раньше начала, с хвостом до тишины (но не дальше limit), с мягкими краями."""
    i0 = max(0, int((a - 0.008) * SR))
    pk = np.max(np.abs(y[i0:int(b * SR)]))
    e = rms_env(y, 240, 240)
    j = int(b * SR) // 240
    jmax = min(len(e), int(min(limit, b + tail) * SR) // 240)
    while j < jmax and e[j] > pk * amp(-50):
        j += 1
    i1 = min(len(y), j * 240 + 480)
    z = y[i0:i1].copy()
    fi = min(len(z) // 4, int(0.003 * SR))
    fo = min(len(z) // 3, int(0.06 * SR))
    z[:fi] *= np.linspace(0, 1, fi)
    z[-fo:] *= 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, fo))
    return z, i0 / SR, i1 / SR


def layer(src, name, t0, t1, o):
    """Слой составного звука: кусок записи [t0, t1] с фильтрами (hp, lp — срез в герцах), приведённый к пику 1."""
    y = dec(os.path.join(src, name + '.mp3'))
    if o.get('hp'):
        y = sosfiltfilt(butter(2, o['hp'], 'hp', fs=SR, output='sos'), y)
    if o.get('lp'):
        y = sosfiltfilt(butter(2, o['lp'], 'lp', fs=SR, output='sos'), y)
    z = y[int(t0 * SR):int(t1 * SR)].copy()
    fi, fo = int(0.002 * SR), int(o.get('fout', 0.03) * SR)
    z[:fi] *= np.linspace(0, 1, fi)
    z[-fo:] *= np.linspace(1, 0, fo) ** 2
    return z / (np.max(np.abs(z)) + 1e-9)


def blend(src, layers):
    """Один звук из слоёв (запись, начало, конец, настройки; gain — громкость слоя в дБ): начала ударов ставятся в одну точку."""
    zs = [(layer(src, n, t0, t1, o), o.get('gain', 0)) for n, t0, t1, o in layers]
    p0 = int(0.004 * SR)
    m = np.zeros(max(len(z) for z, _ in zs) + p0)
    for z, g in zs:
        on = int(np.argmax(np.abs(z) > 0.1))
        z = z[max(0, on - p0):]
        at = max(0, p0 - on)
        m[at:at + len(z)] += z * amp(g)
    return m


def loud50(y):
    """Громкость самого громкого куска в 50 мс — по ней короткие звуки приводятся к одному уровню."""
    return float(np.max(rms_env(y, 2400, 240))) if len(y) > 2400 else float(np.sqrt(np.mean(y ** 2)))


# ───── короткие звуки: имя в игре, исходник, какие куски записи взять ─────
# 'all' — от первого звука до последнего одним куском; список номеров — каждый кусок отдельным вариантом;
# 'mix' — звук собирается из слоёв разных записей (настройка mix: по списку слоёв на каждый вариант).
ONE = [
    ('cast', 'cast', 'all', {}), ('nibble', 'nibble', [0, 1], {}), ('bite', 'bite', 'all', {}), ('hook', 'hook', 'all', {}),
    ('net', 'net', 'all', {}), ('flop', 'flop', [0, 1], {}), ('keep', 'keep2', 'all', {}), ('thrash', 'thrash', 'all', {}),
    ('bubbles', 'bubbles', 'all', {}), ('scrape', 'scrape', 'all', {}),
    ('coin', 'coins', 'all', {}), ('buy', 'buy', 'all', {}), ('ui', 'ui2', [0, 1], {}), ('error', 'error2', 'all', {}),
    ('page', 'page', 'all', {}), ('shutter', 'shutter', 'all', {}),
    ('step_wood', 'steps_wood', [0, 1, 2, 3, 4, 5], {}), ('step_sand', 'steps_sand', [1, 2, 3], {'tail': 0.15}),
    ('land', 'land2', 'all', {}), ('creak', 'creak', [0, 1, 2], {'ch': 'mix'}),
    ('gull', 'gulls', [0, 1, 2, 3, 4], {}), ('thunder', 'thunder2', 'all', {'tail': 1.0, 'level': -11}),
    ('bell', 'bell', 'all', {'tail': 1.2}), ('horn', 'horn', 'all', {}), ('jingle', 'jingle', 'all', {'tail': 1.0}),
    # Удар лодки о преграду — один тяжёлый удар, собранный из слоёв: низ и тело — от удара о сваю (bump4a, bump4b),
    # треск дерева — от удара о камень (bump3a). Целиком записи «о камень» не годятся: в них ударов по нескольку,
    # а несколько ударов подряд слышатся как стук в дверь (первая запись, bump, была именно такой).
    ('bump', None, 'mix', {'level': -9, 'mix': [
        [('bump4b', 0.0, 0.72, {'hp': 28}), ('bump3a', 0.168, 0.36, {'hp': 500, 'fout': 0.06, 'gain': -5})],
        [('bump4a', 0.015, 0.70, {'hp': 28}), ('bump3a', 0.0, 0.165, {'hp': 350, 'fout': 0.07, 'gain': -4})],
    ]}),
]
LEVEL = -14.0  # дБ: громкость самого громкого куска у каждого короткого звука
PEAK = -1.0  # дБ: выше этого пики не поднимаются
GAP = 0.08  # тишина между звуками в общей дорожке

# ───── петли: имя, исходник, каналов, кбит/с (если на шве выходит ступенька, сжатие само ослабляется), как сшивать ─────
# noise — шум без рисунка: края записи срезаются, конец плавно переходит в начало (x секунд).
# match — звук с ритмом: конец петли ищется там, где запись больше всего похожа на её начало.
LOOPS = [
    ('waves', 'waves', 2, 72, {'mode': 'noise', 'x': 1.2}), ('rain', 'rain', 2, 72, {'mode': 'noise', 'x': 0.6}),
    ('wind', 'wind2', 2, 96, {'mode': 'noise', 'x': 0.8}), ('waterfall', 'waterfall', 1, 48, {'mode': 'noise', 'x': 0.5}),
    ('fire', 'fire2', 1, 48, {'mode': 'noise', 'x': 0.5, 'squash': 14}),
    ('crickets', 'crickets', 1, 40, {'mode': 'match', 'x': 0.05}), ('motor', 'motor', 1, 40, {'mode': 'match', 'x': 0.03}),
]
LOOP_LEVEL = -20.0  # дБ: средняя громкость петли
GUARD = 0.25  # запас записи до и после петли: кодек не слышит её краёв
EDGE = 0.09  # у исходных записей первые и последние сотые доли секунды тише остального — их срезаем


def squash(y, over):
    """Придавить выстрелы костра: всё, что громче среднего треска на over дБ, прижимается к этому порогу."""
    m = np.abs(y)
    bed = np.sqrt(np.mean(np.minimum(m, np.percentile(m, 99)) ** 2))
    top = bed * amp(over)
    g = np.minimum(1.0, top / np.maximum(maximum_filter1d(m, 96), 1e-9))
    g = uniform_filter1d(minimum_filter1d(g, 480), 480)
    return y * g


def make_loop(y, o):
    """Петля без шва: [запас][тело][запас]; → (запись, длина тела, насколько конец похож на начало)."""
    m = y if y.ndim == 1 else y.mean(axis=1)
    n = len(m)
    s0 = int(EDGE * SR)
    X = int(o['x'] * SR)
    if o['mode'] == 'match':
        W = int(0.15 * SR)
        ref = m[s0:s0 + W]
        lo, hi = n - int(1.5 * SR), n - int(EDGE * SR) - max(W, X) - int(GUARD * SR)
        best, e = -2.0, hi
        rn = np.sqrt(np.sum(ref ** 2))
        for i in range(lo, hi, 4):
            w = m[i:i + W]
            c = float(np.sum(w * ref) / (rn * np.sqrt(np.sum(w ** 2)) + 1e-12))
            if c > best:
                best, e = c, i
        for i in range(max(lo, e - 4), min(hi, e + 5)):
            w = m[i:i + W]
            c = float(np.sum(w * ref) / (rn * np.sqrt(np.sum(w ** 2)) + 1e-12))
            if c > best:
                best, e = c, i
    else:
        e = n - int(EDGE * SR) - X - int(GUARD * SR)
        a, b = m[e:e + X], m[s0:s0 + X]
        best = float(np.sum(a * b) / (np.sqrt(np.sum(a ** 2) * np.sum(b ** 2)) + 1e-12))
    c = min(1.0, max(0.0, best))
    t = np.linspace(0, 1, X, endpoint=False)
    wi, wo = np.sin(t * np.pi / 2), np.cos(t * np.pi / 2)
    k = 1 / np.sqrt(wi ** 2 + wo ** 2 + 2 * wi * wo * c)  # сумма весов такая, чтобы громкость на стыке не проседала и не росла
    wi, wo = wi * k, wo * k
    if y.ndim > 1:
        wi, wo = wi[:, None], wo[:, None]
    body = y[s0:e].copy()
    body[:X] = y[e:e + X] * wo + y[s0:s0 + X] * wi
    G = int(GUARD * SR)
    return np.concatenate([body[-G:], body, body[:G]]), len(body), best


def main(src, out, only=None, kbps=40, loops=True, frame=20):
    os.makedirs(out, exist_ok=True)
    man = {'sfx': {}, 'loops': {}}
    rows = []
    tape = [np.zeros(int(0.05 * SR))]
    pos = len(tape[0])
    for name, s, pick, o in ONE:
        if only and name not in only:
            continue
        if pick == 'mix':
            cuts = [(blend(src, layers), '+'.join(l[0] for l in layers), 0.0, 0.0) for layers in o['mix']]
        else:
            y = hp(dec(os.path.join(src, s + '.mp3')), 40)
            segs = segments(y)
            if pick == 'all':
                parts = [(segs[0][0], segs[-1][1], len(y) / SR)]
            else:
                parts = [(segs[i][0], segs[i][1], segs[i + 1][0] - 0.02 if i + 1 < len(segs) else len(y) / SR) for i in pick]
            cuts = [cut(y, a, b, lim, o.get('tail', 0.6)) for a, b, lim in parts]
            cuts = [(z, s, t0, t1) for z, t0, t1 in cuts]
        man['sfx'][name] = []
        for k, (z, what, t0, t1) in enumerate(cuts):
            pk, l50 = np.max(np.abs(z)), loud50(z)
            g = min(amp(o.get('level', LEVEL)) / l50, amp(PEAK) / pk)
            z = z * g
            man['sfx'][name].append([round(pos / SR, 4), round(len(z) / SR, 4)])
            rows.append(f"{name}{k + 1 if len(cuts) > 1 else '':<2} {what:<11} {t0:5.2f}-{t1:5.2f} {len(z) / SR:5.2f}с пик{db(np.max(np.abs(z))):6.1f} гр{db(loud50(z)):6.1f} усил{db(g):+6.1f}")
            tape += [z, np.zeros(int(GAP * SR))]
            pos += len(z) + int(GAP * SR)
    sfx = np.concatenate(tape)
    enc(os.path.join(out, 'sfx.webm'), sfx, kbps, frame)
    man['sfxLen'] = round(len(sfx) / SR, 3)
    rows.append(f"sfx.webm: {len(sfx) / SR:.2f} с, звуков {sum(len(v) for v in man['sfx'].values())}")
    for name, s, ch, kbps, o in LOOPS if loops else []:
        y = hp(dec(os.path.join(src, s + '.mp3'), ch), 30)
        if 'squash' in o:
            y = squash(y, o['squash'])
        z, L, c = make_loop(y, o)
        body = z[int(GUARD * SR):int(GUARD * SR) + L]
        g = min(amp(LOOP_LEVEL) / np.sqrt(np.mean(body ** 2)), amp(PEAK) / np.max(np.abs(z)))
        z = z * g
        f = f'loop-{name}.webm'
        a0, a1 = int(GUARD * SR), int(GUARD * SR) + L
        # Сжатие чуть меняет запись, и на стыке конца петли с началом может выйти ступенька. Готовый файл читаем обратно
        # и меряем её против обычных шагов между соседними отсчётами; если она больше — сжимаем слабее, до +24 кбит/с.
        tries = []
        for k in (kbps, kbps + 8, kbps + 16, kbps + 24):
            enc(os.path.join(out, f), z, k)
            d = dec(os.path.join(out, f), ch)
            dm = d if d.ndim == 1 else d.mean(axis=1)
            jump = abs(float(dm[a0] - dm[a1 - 1])) / (float(np.percentile(np.abs(np.diff(dm[a0:a1])), 99)) + 1e-12)
            tries.append((jump, k))
            if jump <= 1:
                break
        else:
            jump, k = min(tries)
            enc(os.path.join(out, f), z, k)
            d = dec(os.path.join(out, f), ch)
            dm = d if d.ndim == 1 else d.mean(axis=1)
        man['loops'][name] = {'file': f, 'start': GUARD, 'end': round(GUARD + L / SR, 6), 'ch': ch}
        # шов: громкость в 40 мс вокруг стыка против обычной
        wrap = np.concatenate([dm[a1 - 960:a1], dm[a0:a0 + 960]])
        ev = rms_env(dm[a0:a1], 1920, 1920)
        # щелчок на шве: верхние частоты (от 3 кГц) в 4 мс вокруг стыка против таких же кусков по всей петле
        hf = hp(np.concatenate([dm[a0:a1], dm[a0:a0 + 4800]]), 3000)
        he = rms_env(hf, 192, 96)
        click = float(np.max(he[-(4800 // 96) - 4:-(4800 // 96) + 4]))
        rows.append(f"{f:<20} тело {L / SR:6.3f}с файл {len(d) / SR:6.3f}с сходство {c:5.2f} гр{db(np.sqrt(np.mean(body ** 2)) * g):6.1f} пик{db(np.max(np.abs(z))):6.1f} шов{db(np.sqrt(np.mean(wrap ** 2))):6.1f} (обычно {db(np.median(ev)):.1f}, от {db(np.min(ev)):.1f} до {db(np.max(ev)):.1f}) скачок×{jump:.2f} щелчок{db(click):6.1f} (верх обычно {db(np.median(he)):.1f}, 99% — до {db(np.percentile(he, 99)):.1f}) {k} кбит/с {os.path.getsize(os.path.join(out, f)) // 1024}КБ")
    if not loops:
        # петли не пересобирались: в описи остаются прежние (файлы loop-*.webm лежат в той же папке нетронутыми)
        try:
            with open(os.path.join(out, 'sounds.json'), encoding='utf-8') as fh:
                man['loops'] = json.load(fh).get('loops', {})
        except (OSError, ValueError):
            pass
    with open(os.path.join(out, 'sounds.json'), 'w') as fh:
        json.dump(man, fh, ensure_ascii=False, separators=(',', ':'))
    print('\n'.join(rows))
    print('размеры:', ' '.join(f"{f}={os.path.getsize(os.path.join(out, f))}" for f in sorted(os.listdir(out))))


if __name__ == '__main__':
    a = sys.argv[1:]
    opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
    main(a[0], a[1], only=set(opt('--sfx').split(',')) if opt('--sfx') else None, kbps=int(opt('--kbps', 40)), loops='--no-loops' not in a, frame=int(opt('--frame', 20)))
