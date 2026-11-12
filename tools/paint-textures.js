// Рисует «рисованные» текстуры земли, камня и дерева — траву, скалу, песок, тропу, доску — и кладёт их в public/tex/.
//
//   node tools/paint-textures.js [куда положить картинки для просмотра]
//
// Мир из кода (рельеф, утёсы, арка) был залит ровным цветом, а модели Tripo — расписаны кистью, и рядом это бросалось
// в глаза. Здесь те же приёмы, что у художника: пятна света и тени, пучки мазков-травинок, каменные плиты с тёмными
// трещинами и светлой кромкой. Всё рисуется кодом, поэтому повторяется без швов (рисунок заворачивается через край)
// и одинаково при каждом запуске.
//
// В файл пишется не цвет, а «во сколько раз светлее или темнее среднего» (среднее = 0,5): в игре текстура умножается
// на цвет поверхности, так что оттенок травы и камня по-прежнему задаёт мир, а рисунок — текстура.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public/tex');
const PREVIEW = process.argv[2] || null;
fs.mkdirSync(OUT, { recursive: true });
if (PREVIEW) fs.mkdirSync(PREVIEW, { recursive: true });

const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const mixC = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const mulC = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(ix, iy, seed) {
  let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
/** Плавный шум с периодом p клеток по обеим осям (x, y — в клетках). */
function vnoise(x, y, p, seed) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const xa = ((x0 % p) + p) % p;
  const xb = (xa + 1) % p;
  const ya = ((y0 % p) + p) % p;
  const yb = (ya + 1) % p;
  const a = hash(xa, ya, seed);
  const b = hash(xb, ya, seed);
  const c = hash(xa, yb, seed);
  const d = hash(xb, yb, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
/** Плавный шум с разным числом клеток по осям: вытянутые пятна (волокна дерева). u, v — от 0 до 1. */
function vnoise2(u, v, px, py, seed) {
  const x = u * px;
  const y = v * py;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const xa = ((x0 % px) + px) % px;
  const xb = (xa + 1) % px;
  const ya = ((y0 % py) + py) % py;
  const yb = (ya + 1) % py;
  const a = hash(xa, ya, seed);
  const b = hash(xb, ya, seed);
  const c = hash(xa, yb, seed);
  const d = hash(xb, yb, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
/** Несколько слоёв шума; u, v — от 0 до 1 по текстуре, f — сколько клеток у первого слоя. Около 0…1. */
function fbm(u, v, f, oct, seed) {
  let s = 0;
  let a = 0.5;
  let n = 0;
  for (let i = 0; i < oct; i++) {
    s += a * vnoise(u * f, v * f, f, seed + i * 17);
    n += a;
    a *= 0.5;
    f *= 2;
  }
  return s / n;
}

/** Холст: цвета как на экране (sRGB, 0…1), рисунок заворачивается через край. */
class Canvas {
  constructor(size, color) {
    this.n = size;
    this.d = new Float32Array(size * size * 3);
    for (let i = 0; i < size * size; i++) this.d.set(color, i * 3);
  }
  /** Каждой точке — свой цвет: fn(u, v, x, y, прежний цвет) → [r, g, b]. */
  each(fn) {
    const n = this.n;
    const c = [0, 0, 0];
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const k = (y * n + x) * 3;
        c[0] = this.d[k];
        c[1] = this.d[k + 1];
        c[2] = this.d[k + 2];
        const o = fn(x / n, y / n, x, y, c);
        this.d[k] = o[0];
        this.d[k + 1] = o[1];
        this.d[k + 2] = o[2];
      }
  }
  /** Мягкое пятно-эллипс: hard 0 — размытое до края, 1 — с чётким краем. */
  blob(cx, cy, rx, ry, rot, color, alpha, hard = 0) {
    const n = this.n;
    const R = Math.max(rx, ry);
    const cs = Math.cos(rot);
    const sn = Math.sin(rot);
    const x0 = Math.floor(cx - R);
    const x1 = Math.ceil(cx + R);
    const y0 = Math.floor(cy - R);
    const y1 = Math.ceil(cy + R);
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const u = (dx * cs + dy * sn) / rx;
        const v = (-dx * sn + dy * cs) / ry;
        const q = u * u + v * v;
        if (q >= 1) continue;
        const a = alpha * (1 - sstep(hard * hard, 1, q));
        const k = ((((y % n) + n) % n) * n + (((x % n) + n) % n)) * 3;
        this.d[k] += (color[0] - this.d[k]) * a;
        this.d[k + 1] += (color[1] - this.d[k + 1]) * a;
        this.d[k + 2] += (color[2] - this.d[k + 2]) * a;
      }
  }
  /** Мазок кистью: от (x, y) под углом ang, длиной len, толщина от w0 к w1, bend — насколько изогнут. */
  stroke(x, y, ang, len, w0, w1, bend, color, alpha) {
    const steps = Math.max(3, Math.ceil(len / Math.max(1, Math.min(w0, w1 || w0) * 0.7)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = ang + bend * t;
      const px = x + Math.cos(a) * len * t;
      const py = y + Math.sin(a) * len * t;
      const w = w0 + (w1 - w0) * t;
      this.blob(px, py, w, w, 0, color, alpha, 0.55);
    }
  }
  /** Размытие (для мягких теней и пятен): несколько проходов «коробкой» с заворотом. */
  blurred(r) {
    const n = this.n;
    let src = this.d;
    for (let pass = 0; pass < 3; pass++) {
      const tmp = new Float32Array(src.length);
      const dst = new Float32Array(src.length);
      const w = 2 * r + 1;
      for (let y = 0; y < n; y++)
        for (let ch = 0; ch < 3; ch++) {
          let s = 0;
          for (let i = -r; i <= r; i++) s += src[(y * n + ((i + n * 8) % n)) * 3 + ch];
          for (let x = 0; x < n; x++) {
            tmp[(y * n + x) * 3 + ch] = s / w;
            s += src[(y * n + ((x + r + 1) % n)) * 3 + ch] - src[(y * n + ((x - r + n * 8) % n)) * 3 + ch];
          }
        }
      for (let x = 0; x < n; x++)
        for (let ch = 0; ch < 3; ch++) {
          let s = 0;
          for (let i = -r; i <= r; i++) s += tmp[(((i + n * 8) % n) * n + x) * 3 + ch];
          for (let y = 0; y < n; y++) {
            dst[(y * n + x) * 3 + ch] = s / w;
            s += tmp[(((y + r + 1) % n) * n + x) * 3 + ch] - tmp[(((y - r + n * 8) % n) * n + x) * 3 + ch];
          }
        }
      src = dst;
    }
    return src;
  }
}

const toLin = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
/** Сохраняет холст как множитель (среднее 0,5 в каждом канале, значения — линейные) и картинку для просмотра. */
async function save(cv, name, { quality = 90 } = {}) {
  const n = cv.n;
  const lin = new Float32Array(cv.d.length);
  const mean = [0, 0, 0];
  for (let i = 0; i < cv.d.length; i++) {
    lin[i] = toLin(clamp(cv.d[i]));
    mean[i % 3] += lin[i];
  }
  for (let c = 0; c < 3; c++) mean[c] /= n * n;
  const out = Buffer.alloc(n * n * 3);
  let clip = 0;
  for (let i = 0; i < lin.length; i++) {
    const v = (lin[i] / mean[i % 3]) * 0.5;
    if (v > 1) clip++;
    out[i] = Math.round(clamp(v) * 255);
  }
  const file = path.join(OUT, `${name}.webp`);
  await sharp(out, { raw: { width: n, height: n, channels: 3 } }).webp({ quality, effort: 6 }).toFile(file);
  const srgb = Buffer.alloc(n * n * 3);
  for (let i = 0; i < cv.d.length; i++) srgb[i] = Math.round(clamp(cv.d[i]) * 255);
  const meanS = mean.map((v) => Math.round((v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255));
  console.log(`${name}: ${n}×${n}, ${(fs.statSync(file).size / 1024).toFixed(0)} КБ, средний цвет ${meanS.join(' ')}, обрезано светлых ${((clip / lin.length) * 100).toFixed(2)}%`);
  if (PREVIEW) {
    const one = await sharp(srgb, { raw: { width: n, height: n, channels: 3 } }).png().toBuffer();
    await sharp(one).toFile(path.join(PREVIEW, `${name}.png`));
    // четыре плитки рядом: видно, есть ли швы и бросается ли в глаза повтор
    await sharp({ create: { width: n * 2, height: n * 2, channels: 3, background: '#000' } })
      .composite([0, 1, 2, 3].map((i) => ({ input: one, left: (i % 2) * n, top: (i >> 1) * n })))
      .resize(n, n)
      .jpeg({ quality: 88 })
      .toFile(path.join(PREVIEW, `${name}-2x2.jpg`));
  }
  return { mean: meanS };
}

// ───── трава ─────
function grass(n = 1024) {
  const r = rng(11);
  const base = hex('#73a53c');
  const cv = new Canvas(n, base);
  const dark = hex('#4c8433');
  const cool = hex('#44803f');
  const light = hex('#98c44a');
  const sun = hex('#b9d65c');
  // крупные пятна света и тени — по шуму, без жёстких границ
  cv.each((u, v, x, y, c) => {
    const a = fbm(u, v, 3, 4, 21);
    const b = fbm(u + 0.37, v + 0.11, 5, 3, 55);
    let o = mixC(c, dark, sstep(0.5, 0.74, a) * 0.5);
    o = mixC(o, light, sstep(0.5, 0.72, 1 - a) * 0.4);
    o = mixC(o, cool, sstep(0.56, 0.8, b) * 0.28);
    return o;
  });
  // пучки: тень у основания, потом веер мазков-травинок снизу вверх (вверх по картинке)
  const tufts = Math.round(1500 * (n / 1024) ** 2);
  const list = [];
  for (let i = 0; i < tufts; i++) list.push([r() * n, r() * n, r()]);
  list.sort((a, b) => a[1] - b[1]); // дальние (верхние) рисуются раньше — ближние ложатся поверх
  const s = n / 1024;
  for (const [x, y, k] of list) {
    const shade = fbm(x / n, y / n, 3, 4, 21);
    const lit = 1 - sstep(0.45, 0.75, shade); // в тёмных пятнах травинки темнее
    cv.blob(x, y + 5 * s, (15 + k * 12) * s, (8 + k * 5) * s, 0, mulC(dark, 0.86), 0.38, 0);
    const blades = 6 + Math.floor(r() * 7);
    for (let j = 0; j < blades; j++) {
      const t = blades > 1 ? j / (blades - 1) - 0.5 : 0;
      const ang = -Math.PI / 2 + t * (1.0 + r() * 0.5) + (r() - 0.5) * 0.25;
      const len = (15 + r() * 24) * (0.7 + k * 0.6) * s;
      const tone = r();
      let col = tone < 0.3 ? mixC(dark, base, 0.3 + r() * 0.5) : tone < 0.82 ? mixC(base, light, 0.35 + r() * 0.65) : mixC(light, sun, 0.3 + r() * 0.7);
      col = mulC(col, 0.86 + 0.2 * lit + (r() - 0.5) * 0.08);
      cv.stroke(x + t * (10 + k * 8) * s, y, ang, len, (2.5 + r() * 1.8) * s, 0.7 * s, (r() - 0.5) * 0.9 + t * 0.5, col, 0.78 + r() * 0.2);
    }
  }
  // редкие светлые блики-штрихи поверх и мелкая «рябь» кисти
  for (let i = 0; i < 900 * s * s; i++) cv.stroke(r() * n, r() * n, -Math.PI / 2 + (r() - 0.5) * 1.4, (8 + r() * 14) * s, 1.4 * s, 0.5 * s, (r() - 0.5) * 0.8, mixC(light, sun, r()), 0.35 + r() * 0.3);
  cv.each((u, v, x, y, c) => mulC(c, 0.965 + 0.07 * fbm(u, v, 96, 2, 91)));
  return cv;
}

// ───── камень: угловатые грани разного размера, каждая под своим углом к свету; тёмные щели, светлые рёбра ─────
/** Ближайшая и вторая ячейки среди точек pts (с заворотом). Точка: { x, y, ax, ay, cs, sn } — у каждой своя вытянутость. */
function cells(pts, u, v, grid, G) {
  let d1 = 9;
  let d2 = 9;
  let i1 = -1;
  let i2 = -1;
  const ci = Math.floor(u * G);
  const cj = Math.floor(v * G);
  for (let dj = -2; dj <= 2; dj++)
    for (let di = -2; di <= 2; di++) {
      const cell = grid[((((cj + dj) % G) + G) % G) * G + ((((ci + di) % G) + G) % G)];
      for (const i of cell) {
        const p = pts[i];
        let dx = u - p.x;
        let dy = v - p.y;
        dx -= Math.round(dx);
        dy -= Math.round(dy);
        const a = (dx * p.cs + dy * p.sn) * p.ax;
        const b = (-dx * p.sn + dy * p.cs) * p.ay;
        const d = Math.hypot(a, b);
        if (d < d1) {
          d2 = d1;
          i2 = i1;
          d1 = d;
          i1 = i;
        } else if (d < d2) {
          d2 = d;
          i2 = i;
        }
      }
    }
  return { i1, i2, edge: d2 - d1 };
}
function scatterPts(r, count, G, stretch) {
  const pts = [];
  const grid = Array.from({ length: G * G }, () => []);
  // мера расстояния одна на все точки (вытянута вдоль пластов): тогда границы граней прямые — камень выходит колотым, а не «пузырями»
  const rot = (r() - 0.5) * 0.3;
  for (let i = 0; i < count; i++) {
    const p = { x: r(), y: r(), cs: Math.cos(rot), sn: Math.sin(rot), ax: 1 / stretch, ay: 1, lit: r(), warm: r(), nx: (r() - 0.5) * 2, ny: (r() - 0.5) * 2, split: r() };
    grid[Math.floor(p.y * G) * G + Math.floor(p.x * G)].push(i);
    pts.push(p);
  }
  return { pts, grid, G };
}
function rock(n = 1024) {
  const r = rng(29);
  const A = scatterPts(r, 26, 4, 1.7); // крупные глыбы
  const B = scatterPts(r, 150, 9, 1.35); // мелкие грани внутри расколотых глыб
  // тона — как у утёсов-моделей (env-cliff*): тёплый серый, без синевы; иначе обрыв из кода рядом с ними — «чужой»
  const base = hex('#8d8c88');
  const cool = hex('#7b7d80');
  const warm = hex('#a39884');
  const dark = hex('#37383b');
  const cv = new Canvas(n, base);
  cv.each((u, v) => {
    // границы неровные: сетку слегка «мнём»
    const wu = u + (fbm(u, v, 7, 3, 5) - 0.5) * 0.05;
    const wv = v + (fbm(u + 0.5, v + 0.2, 7, 3, 9) - 0.5) * 0.05;
    const a = cells(A.pts, wu, wv, A.grid, A.G);
    const pa = A.pts[a.i1];
    const ea = a.edge * n; // расстояние до щели между глыбами, примерно в точках
    // расколотая глыба делится на мелкие грани
    let face = pa;
    let eb = 1e3;
    if (pa.split < 0.6) {
      const b = cells(B.pts, wu, wv, B.grid, B.G);
      face = B.pts[b.i1];
      eb = b.edge * n * 2.2;
    }
    // грань — плоскость со своим наклоном: от него зависит, сколько на неё падает света
    const lit = clamp(0.55 + 0.38 * (face.nx * -0.55 + face.ny * -0.75) + 0.16 * (pa.lit - 0.5), 0.2, 1.05);
    let c = mixC(base, cool, clamp(0.2 + pa.warm * 0.5));
    c = mixC(c, warm, face.warm < 0.16 ? 0.5 : pa.warm < 0.2 ? 0.28 : 0.04);
    c = mulC(c, 0.72 + 0.5 * lit);
    c = mulC(c, 0.94 + 0.12 * fbm(u, v, 22, 3, 33)); // мазки
    const wob = 0.55 + 0.9 * fbm(u, v, 24, 2, 13);
    // щели: широкая мягкая тень вглубь и узкая тёмная линия; у мелких граней — тоньше и бледнее
    const aoA = 1 - sstep(0, 26 * wob, ea);
    const lineA = 1 - sstep(1.2 * wob, 5.5 * wob, ea);
    const aoB = 1 - sstep(0, 12 * wob, eb);
    const lineB = 1 - sstep(0.6 * wob, 3.2 * wob, eb);
    // светлое ребро рядом со щелью — там, где грань повёрнута к свету
    const rim = sstep(4 * wob, 8 * wob, Math.min(ea, eb * 1.6)) * (1 - sstep(9 * wob, 20 * wob, Math.min(ea, eb * 1.6)));
    c = mulC(c, 1 + rim * 0.22 * sstep(0.45, 0.9, lit));
    c = mulC(c, 1 - 0.28 * aoA - 0.14 * aoB);
    c = mixC(c, dark, clamp(lineA * 0.9 + lineB * 0.55));
    return c;
  });
  const s = n / 1024;
  // сколы и крапины
  for (let i = 0; i < 160 * s * s; i++) {
    const x = r() * n;
    const y = r() * n;
    const a = r() * TAU;
    const len = (5 + r() * 16) * s;
    cv.stroke(x + 1.4 * s, y + 1.4 * s, a, len, 1.0 * s, 0.4 * s, (r() - 0.5) * 1.0, hex('#b9bdc2'), 0.25);
    cv.stroke(x, y, a, len, 1.3 * s, 0.4 * s, (r() - 0.5) * 1.0, hex('#434955'), 0.45);
  }
  for (let i = 0; i < 500 * s * s; i++) cv.blob(r() * n, r() * n, (1 + r() * 2.6) * s, (1 + r() * 2) * s, r() * 3, r() < 0.5 ? hex('#5d646f') : hex('#b3b6bb'), 0.3, 0.4);
  return cv;
}

// ───── дерево ─────
// Доска расписана кистью: длинные мазки вдоль волокон, тёмные прожилки, сучки, выгоревшие полосы.
// Волокна идут вдоль u. В игре плитка ложится так: по u — 2,5 м вдоль доски, по v — 0,6 м поперёк
// (точка текстуры вчетверо длиннее вдоль волокон, чем поперёк, — поэтому сучки здесь нарисованы «сплюснутыми»).
function wood(n = 1024) {
  const r = rng(71);
  const base = hex('#c58d54');
  const dark = hex('#6f4526');
  const deep = hex('#8f5c33');
  const light = hex('#e8bf87');
  const red = hex('#b9713d');
  const cv = new Canvas(n, base);
  // сучки: где они и какого размера (волокна их огибают)
  const knots = [];
  for (let i = 0; i < 2; i++) knots.push({ u: r(), v: r(), ru: 0.006 + r() * 0.006, rv: 0.022 + r() * 0.03 });
  const wrap = (d) => d - Math.round(d);
  cv.each((u, v) => {
    // волокна огибают сучки
    let bend = 0;
    let knot = 0;
    let ring = 0;
    for (const k of knots) {
      const du = wrap(u - k.u) / k.ru;
      const dv = wrap(v - k.v) / k.rv;
      const q = du * du + dv * dv;
      if (q < 30) {
        bend += (Math.sign(dv) || 1) * k.rv * 0.9 * Math.exp(-q * 0.22);
        knot = Math.max(knot, 1 - sstep(0.5, 1.15, q));
        ring = Math.max(ring, sstep(1.0, 1.5, q) * (1 - sstep(1.5, 2.6, q)));
      }
    }
    const vv = v + bend + (vnoise2(u, v, 3, 6, 5) - 0.5) * 0.035 + (vnoise2(u, v, 9, 12, 7) - 0.5) * 0.012;
    // широкие полосы тона: выгоревшие и тёмные доски «годовых слоёв»
    const tone = vnoise2(u, vv, 2, 9, 11) * 0.6 + vnoise2(u, vv, 5, 26, 13) * 0.4;
    let c = mixC(base, light, sstep(0.52, 0.9, tone) * 0.55);
    c = mixC(c, deep, sstep(0.5, 0.12, tone) * 0.55);
    c = mixC(c, red, sstep(0.55, 0.85, vnoise2(u, vv, 3, 17, 23)) * 0.22);
    // прожилки: тонкие тёмные линии вдоль волокон, каждая своей силы, местами прерываются
    const lines = 46;
    const gi = Math.floor(vv * lines);
    const gf = vv * lines - gi;
    const str = hash(((gi % lines) + lines) % lines, 7, 99);
    const gap = sstep(0.25, 0.6, vnoise2(u, vv, 7, lines, 41));
    const line = (1 - sstep(0.04, 0.2, Math.abs(gf - 0.5))) * sstep(0.35, 0.9, str) * gap;
    c = mixC(c, dark, line * 0.55);
    // мазок кисти: мелкая вытянутая рябь
    c = mulC(c, 0.93 + 0.14 * vnoise2(u, vv, 24, 150, 17));
    // сучок: тёмная сердцевина и кольцо вокруг
    c = mixC(c, dark, knot * 0.62);
    c = mixC(c, deep, ring * 0.4);
    return c;
  });
  const s = n / 1024;
  // светлые потёртости и тонкие трещины вдоль волокон
  for (let i = 0; i < 70 * s; i++) cv.stroke(r() * n, r() * n, (r() - 0.5) * 0.02, (120 + r() * 320) * s, (2 + r() * 5) * s, 1 * s, (r() - 0.5) * 0.02, light, 0.16);
  for (let i = 0; i < 26 * s; i++) {
    const x = r() * n;
    const y = r() * n;
    const len = (90 + r() * 260) * s;
    cv.stroke(x, y + 2 * s, 0, len, 1.6 * s, 0.6 * s, (r() - 0.5) * 0.03, light, 0.3);
    cv.stroke(x, y, 0, len, 1.5 * s, 0.5 * s, (r() - 0.5) * 0.03, dark, 0.6);
  }
  return cv;
}

// ───── песок ─────
function sand(n = 512) {
  const r = rng(47);
  const base = hex('#ecdcae');
  const cv = new Canvas(n, base);
  const warm = hex('#dcc68e');
  const pale = hex('#f7ecc8');
  cv.each((u, v, x, y, c) => {
    // рябь: волнистые полосы, которые ветер оставляет на песке
    const w = fbm(u, v, 3, 3, 3) * 2.2;
    const rip = 0.5 + 0.5 * Math.sin((v * 13 + w) * TAU);
    let o = mixC(c, warm, sstep(0.35, 0.95, rip) * 0.3);
    o = mixC(o, pale, sstep(0.55, 1, 1 - rip) * 0.3);
    o = mixC(o, warm, sstep(0.55, 0.8, fbm(u + 0.2, v + 0.6, 4, 3, 19)) * 0.3);
    return mulC(o, 0.955 + 0.09 * fbm(u, v, 128, 2, 7));
  });
  const s = n / 512;
  for (let i = 0; i < 220 * s * s; i++) {
    const x = r() * n;
    const y = r() * n;
    const q = (1.2 + r() * 2.6) * s;
    cv.blob(x + q * 0.5, y + q * 0.6, q * 1.2, q * 0.9, 0, hex('#bfa56f'), 0.4, 0.2);
    cv.blob(x, y, q, q * (0.6 + r() * 0.4), r() * 3, r() < 0.3 ? hex('#fbf6e6') : r() < 0.6 ? hex('#b9a27c') : hex('#9c9488'), 0.85, 0.6);
  }
  return cv;
}

// ───── утоптанная тропа ─────
function dirt(n = 512) {
  const r = rng(63);
  const base = hex('#c9b27c');
  const cv = new Canvas(n, base);
  cv.each((u, v, x, y, c) => {
    let o = mixC(c, hex('#b09763'), sstep(0.45, 0.8, fbm(u, v, 4, 4, 5)) * 0.55);
    o = mixC(o, hex('#dccb96'), sstep(0.5, 0.8, fbm(u + 0.4, v + 0.3, 6, 3, 23)) * 0.45);
    return mulC(o, 0.95 + 0.1 * fbm(u, v, 110, 2, 41));
  });
  const s = n / 512;
  // камешки с тенью и светлым боком
  for (let i = 0; i < 150 * s * s; i++) {
    const x = r() * n;
    const y = r() * n;
    const q = (2 + r() * 6) * s;
    const col = mulC(r() < 0.5 ? hex('#a7a59c') : hex('#b9a888'), 0.85 + r() * 0.3);
    cv.blob(x + q * 0.35, y + q * 0.45, q * 1.15, q * 0.85, 0, hex('#8f7a4f'), 0.55, 0.2);
    cv.blob(x, y, q, q * (0.6 + r() * 0.35), r() * 3, col, 0.95, 0.7);
    cv.blob(x - q * 0.25, y - q * 0.25, q * 0.5, q * 0.35, 0, mulC(col, 1.18), 0.6, 0.2);
  }
  // сухие травинки, втоптанные в землю
  for (let i = 0; i < 260 * s * s; i++) cv.stroke(r() * n, r() * n, r() * TAU, (6 + r() * 12) * s, 0.9 * s, 0.4 * s, (r() - 0.5) * 1.5, r() < 0.5 ? hex('#a58a55') : hex('#d8c89a'), 0.5);
  return cv;
}

const t0 = Date.now();
const out = {};
for (const [name, fn] of [['grass', grass], ['rock', rock], ['sand', sand], ['dirt', dirt], ['wood', wood]]) out[name] = await save(fn(), name);
console.log(`готово за ${((Date.now() - t0) / 1000).toFixed(1)} с →`, path.relative(ROOT, OUT));
