#!/usr/bin/env python3
"""Музыка игры из записей (сделаны в ElevenLabs Music, mp3): петли без шва, выравнивание громкости, сжатие.

  python3 tools/music.py <папка с исходниками> <папка для готового> [--kbps 56] [--only имя,имя]

Готовое:
  music-<имя>.webm  дорожка: у петли — вступление и тело петли (дальше тела запись не нужна), у короткой — вся;
  music.json        откуда докуда крутить петлю (start, end в секундах) и длина каждой дорожки.

Петля ищется по долям такта: дорожка разбивается на доли (librosa), у каждой — гармония (хрома), тембр (MFCC) и
сила ударов. Начало петли S и конец E — доли с целым числом тактов между ними, у которых и то, что звучит перед
ними, и то, что после, больше всего похоже. Конец уточняется по самой записи (сдвиг в пределах ±30 мс, где волна
перед E лучше всего совпадает с волной перед S), а последние 40 мс тела плавно переходят в то, что звучит перед S:
когда игра прыгает с E на S, музыка продолжается без щелчка и без сбоя ритма.
Нужны ffmpeg (с libopus), numpy, scipy и librosa. Сами исходники в игру не входят.
"""
import sys, os, json, subprocess
import numpy as np

SR = 48000
db = lambda x: 20 * np.log10(max(float(x), 1e-9))
amp = lambda d: 10 ** (d / 20)

# имя в игре, исходник, петля ли: (откуда искать начало, докуда искать конец, наименьшая длина тела) в секундах
TRACKS = [
    # заставка: вступление один раз, дальше по кругу середина; две темы — игра берёт то одну, то другую
    ('title1', 'm_title_1', (16, 86, 36)), ('title2', 'm_title_2', (16, 86, 36)),
    # бой с чудищем или гигантом: 92 и 144 удара в минуту
    ('beast1', 'm_beast_1', (1, 75, 40)), ('beast2', 'm_beast_2', (1, 75, 40)),
    ('trophy', 'm_trophy', None),  # фанфары трофея
    ('legend', 'm_legend', None),  # аккорд легенды: легендарная рыба, взятое чудище
]
LEVEL = -17.0  # дБ: средняя громкость петли
ONE_LEVEL = -12.0  # дБ: громкость самой громкой полусекунды у короткой дорожки
PEAK = -1.0
X = 0.04  # перехлёст на шве петли, с
GUARD = 0.25  # запас записи после конца петли: кодек не слышит её края


def dec(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64).reshape(-1, 2)


def enc(path, y, kbps):
    raw = np.clip(y, -1, 1).astype(np.float32).tobytes()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'libopus', '-b:a', f'{kbps}k', '-vbr', 'on',
                    '-compression_level', '10', '-application', 'audio', '-fflags', '+bitexact', '-flags:a', '+bitexact', path], input=raw, check=True)


def beats(m):
    """Доли такта (секунды) и признаки каждой доли: хрома, MFCC, сила ударов — нормированные построчно."""
    import librosa
    sr = 22050
    y = librosa.resample(m.astype(np.float32), orig_sr=SR, target_sr=sr)
    hop = 512
    oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    tempo, bf = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, hop_length=hop)
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, hop_length=hop, n_mfcc=13)[1:]
    F = np.vstack([chroma, mfcc / 40, oenv[None, :] / (oenv.max() + 1e-9)])
    sync = librosa.util.sync(F, bf, aggregate=np.mean)
    t = librosa.frames_to_time(bf, sr=sr, hop_length=hop)
    sync = sync[:, :len(t)]
    sync = sync / (np.linalg.norm(sync, axis=0, keepdims=True) + 1e-9)
    return float(np.atleast_1d(tempo)[0]), t, sync


def find_loop(y, s_lo, e_hi, min_len, w=8):
    """Лучшая пара долей (S, E): между ними целое число тактов, вокруг них звучит похожее. → (S, E в отсчётах, сходство)."""
    m = y.mean(axis=1)
    tempo, t, F = beats(m)
    n = len(t)
    best = (-1, 0, 0)
    for i in range(w, n - w):
        if t[i] < s_lo:
            continue
        if t[i] > e_hi - min_len:
            break
        for j in range(i + 4, n):
            if (j - i) % 4 or t[j] - t[i] < min_len:
                continue
            if t[j] > e_hi:
                break
            a = min(w, n - j)  # после E записи может остаться меньше
            before = float(np.mean(np.sum(F[:, i - w:i] * F[:, j - w:j], axis=0)))
            after = float(np.mean(np.sum(F[:, i:i + a] * F[:, j:j + a], axis=0))) if a >= 2 else before
            sc = 0.5 * before + 0.5 * after
            if sc > best[0]:
                best = (sc, i, j)
    sc, i, j = best
    S, E = int(t[i] * SR), int(t[j] * SR)
    # Уточнить E по ударам: огибающая верхних частот (шаг 1 мс) за 2 с до E должна лечь на такую же перед S.
    # Сама волна густой музыки на повторе совпадает плохо (другие голоса, другая фаза), а удары — точно.
    from scipy.signal import butter, sosfiltfilt
    hf = np.abs(sosfiltfilt(butter(2, 2500, 'hp', fs=SR, output='sos'), m))
    H = 48
    env = np.sqrt(np.convolve(hf ** 2, np.ones(H) / H, 'same')[::H])
    W, D = 2000, 30
    a = env[S // H - W:S // H]
    a = (a - a.mean()) / (a.std() + 1e-12)
    cs = []
    for d in range(-D, D + 1):
        b = env[E // H + d - W:E // H + d]
        b = (b - b.mean()) / (b.std() + 1e-12)
        cs.append((float(np.mean(a * b)), d))
    ce, d = max(cs)
    E += d * H
    # тонкая подгонка по самой волне в пределах ±1 мс (до совпадения фазы низов)
    Wn = int(0.25 * SR)
    ref = m[S - Wn:S]
    rn = np.sqrt(np.sum(ref ** 2)) + 1e-12
    c, dd = max((float(np.sum(m[E + k - Wn:E + k] * ref) / (rn * np.sqrt(np.sum(m[E + k - Wn:E + k] ** 2)) + 1e-12)), k) for k in range(-48, 49))
    return S, E + dd, sc, max(0.0, c), tempo, t[i], t[j], ce, d


def bake(y, S, E, c):
    """Тело петли [S, E): последние X секунд тела плавно переходят в то, что звучит перед S."""
    Xn = int(X * SR)
    t = np.linspace(0, 1, Xn, endpoint=False)
    wi, wo = np.sin(t * np.pi / 2), np.cos(t * np.pi / 2)
    c = min(1.0, max(0.0, c))
    k = 1 / np.sqrt(wi ** 2 + wo ** 2 + 2 * wi * wo * c)
    wi, wo = (wi * k)[:, None], (wo * k)[:, None]
    z = y[:E].copy()
    z[E - Xn:E] = y[E - Xn:E] * wo + y[S - Xn:S] * wi
    G = int(GUARD * SR)
    return np.concatenate([z, y[S:S + G]])


def seam(path, S, E):
    """Скачок на шве после сжатия: разница отсчётов на стыке против обычных шагов между соседними отсчётами."""
    d = dec(path).mean(axis=1)
    jump = abs(float(d[E - 1] - d[S - 1])) / (float(np.percentile(np.abs(np.diff(d[S:E])), 99)) + 1e-12)
    return jump


def main(src, out, kbps=56, only=None):
    os.makedirs(out, exist_ok=True)
    man = {}
    path = os.path.join(out, 'music.json')
    if only and os.path.exists(path):
        with open(path, encoding='utf-8') as fh:
            man = json.load(fh)
    for name, s, lp in TRACKS:
        if only and name not in only:
            continue
        y = dec(os.path.join(src, s + '.mp3'))
        f = f'music-{name}.webm'
        if lp:
            S, E, sc, c, tempo, ts, te, ce, dms = find_loop(y, *lp)
            z = bake(y, S, E, c)
            body = z[S:E]
            g = min(amp(LEVEL) / np.sqrt(np.mean(body ** 2)), amp(PEAK) / np.max(np.abs(z)))
            z = z * g
            enc(os.path.join(out, f), z, kbps)
            j = seam(os.path.join(out, f), S, E)
            man[name] = {'file': f, 'start': round(S / SR, 6), 'end': round(E / SR, 6), 'len': round(len(z) / SR, 3), 'loop': True}
            print(f'{f:20} {tempo:5.1f} уд/мин петля {S / SR:6.2f}–{E / SR:6.2f} с (доли {ts:.2f}–{te:.2f}, тело {(E - S) / SR:5.1f} с) '
                  f'сходство долей {sc:.3f} ударов {ce:.2f} (сдвиг {dms:+d} мс) волны {c:.2f} скачок×{j:.2f} гр{db(np.sqrt(np.mean(body ** 2)) * g):6.1f} '
                  f'пик{db(np.max(np.abs(z))):6.1f} {os.path.getsize(os.path.join(out, f)) // 1024} КБ')
        else:
            m = y.mean(axis=1)
            e = np.array([np.sqrt(np.mean(m[i:i + 2400] ** 2)) for i in range(0, len(m) - 2400, 480)])
            on = int(np.argmax(e > e.max() * amp(-40))) * 480
            end = len(m) - int(np.argmax(e[::-1] > e.max() * amp(-60))) * 480 + 2400
            z = y[max(0, on - 480):min(len(y), end)].copy()
            fo = int(0.3 * SR)
            z[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2
            loud = max(float(np.sqrt(np.mean(z[i:i + SR // 2].mean(axis=1) ** 2))) for i in range(0, max(1, len(z) - SR // 2), 2400))
            g = min(amp(ONE_LEVEL) / loud, amp(PEAK) / np.max(np.abs(z)))
            z = z * g
            enc(os.path.join(out, f), z, kbps)
            man[name] = {'file': f, 'len': round(len(z) / SR, 3), 'loop': False}
            print(f'{f:20} {len(z) / SR:5.2f} с (из {len(y) / SR:.2f}) пик{db(np.max(np.abs(z))):6.1f} {os.path.getsize(os.path.join(out, f)) // 1024} КБ')
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(man, fh, ensure_ascii=False, separators=(',', ':'))


if __name__ == '__main__':
    a = sys.argv[1:]
    opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
    main(a[0], a[1], kbps=int(opt('--kbps', 56)), only=set(opt('--only').split(',')) if opt('--only') else None)
