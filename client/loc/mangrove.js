// Рельеф «Мангровой протоки»: тёплая лагуна в мангровом лесу. Тот же набор имён, что у бухты (loc/bay.js):
// высота земли и дна, причалы, зоны ловли, где можно ходить и плыть.
//
// База рыбака — та же, что везде: площадка с лавкой на южном берегу, пирс на север, будка проката; к западу от неё —
// Илистая отмель (здесь вместо заводи). Лагуна неглубокая, в ней мангровые островки; на её северном берегу стоит
// хижина на сваях со своими мостками. Из лагуны уходят две протоки: узкая — на северо-запад, в глубину мангров,
// где сужается в ручей; широкая — на северо-восток, к морю: на её изгибе — Омут, в конце — Устье и открытое море.
// Берега лагуны и проток — сплошные мангры: корни стоят в воде.
import { clamp, lerp, sstep, fbm2 } from '../util.js';

/** Что есть на этой локации из того, что умеет строить мир (world.js, scenery.js и др.). */
export const HAS = { island: false, lighthouse: false, cottage: false, arch: false, reef: false, cape: false, palm: false, wreck: false, skerries: false, sea: false, farIsles: false, mountains: true, cabin: false, islet: false, gulls: false, mangrove: true };

export const DECK_Y = 1.1;
// Чего здесь нет — стоит далеко за краем мира: проверки «рядом ли» никогда не срабатывают
const NOWHERE = 1e5;
export const ISLAND = { x: NOWHERE, z: NOWHERE };
export const ARCH = { x: NOWHERE, z: NOWHERE, ry: 0, leg: 1, block: 1, w: 1, h: 1, d: 1 };
export const ARCH_LEGS = [];
export const REEF = { x: NOWHERE, z: NOWHERE };
export const CAPE = { ax: NOWHERE, az: NOWHERE, bx: NOWHERE + 1, bz: NOWHERE, r: 1 };
export const PALM = { x: NOWHERE, z: NOWHERE, rx: 1, rz: 1 };
export const WRECK = { x: NOWHERE, z: NOWHERE, r: 1 };
export const SKERRIES = [];
export const LIGHTHOUSE = { x: NOWHERE, z: NOWHERE };
export const COTTAGE = { x: NOWHERE, z: NOWHERE, s: 8.5, ry: 0, y: 0, pad: [1, 1, 1] };
export const CAMPFIRE = { x: NOWHERE, z: NOWHERE };
export const cottageUV = (x, z) => [x - COTTAGE.x, z - COTTAGE.z];
export const islandR = () => 1;
export const capeDist = () => NOWHERE;
export const palmR = () => NOWHERE;
/** Водопадов здесь нет. */
export const FALLS = [];

/** Илистая отмель к западу от базы (на других локациях здесь заводь): по колено воды, из ила торчат бугры. */
export const BACKWATER = { x: -40, z: 13, r: 14 };
export const FLATS = { x: -46, z: 2, r: 24 };
export const MARKET = { x: -5.6, z: 12.8, r: 3.2 };
export const SPAWN = { x: -2, z: 9 };
/** Лагуна: середина и полуоси овала; южный край срезан берегом у базы. */
export const LAGOON = { x: 6, z: -40, a: 70, b: 56 };
export const BOUNDS = { x0: -150, x1: 330, z0: -300, z1: 70 }; // подробный рельеф: лагуна, протоки, устье
export const WORLD = { x0: -112, x1: 318, z0: -284, z1: 40 }; // куда можно доплыть
export const SEA = { x: LAGOON.x, z: LAGOON.z, r: 1e4 }; // зыби нет: море за устьем тихое
export const MAP_VIEW = { x0: -122, x1: 326, z0: -292, z1: 46 }; // мини-карта: лагуна и обе протоки

// Протоки: середина — плавная линия через опорные точки, w — полуширина. Узкая уходит в мангры и к концу сужается
// в ручей; широкая ведёт к устью.
const smooth = (pts, n = 6) => {
  const out = [];
  const P = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [P(i - 1), P(i), P(i + 1), P(i + 2)];
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const t2 = t * t;
      const t3 = t2 * t;
      const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};
function channel(pts, w, end) {
  const p = smooth(pts);
  const seg = [];
  let L = 0;
  for (let i = 0; i < p.length - 1; i++) {
    const [ax, az] = p[i];
    const [bx, bz] = p[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    seg.push({ ax, az, dx: bx - ax, dz: bz - az, len, s0: L });
    L += len;
  }
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const [x, z] of p) {
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    z0 = Math.min(z0, z);
    z1 = Math.max(z1, z);
  }
  const m = w * 1.6 + 30;
  return { pts, p, seg, L, w, end, box: { x0: x0 - m, x1: x1 + m, z0: z0 - m, z1: z1 + m } };
}
export const NARROW = channel([[-30, -78], [-44, -102], [-40, -126], [-56, -150], [-50, -176], [-68, -200], [-64, -226], [-84, -250], [-98, -272]], 9, true);
export const WIDE = channel([[46, -72], [74, -96], [104, -112], [122, -134], [150, -148], [178, -164], [206, -178], [232, -200], [258, -222]], 15, false);
export const MOUTH = { x: 266, z: -232, a: 50, b: 40 };
/** Омут на изгибе широкой протоки: самое глубокое место, логово Хозяина протоки. */
export const OMUT = { x: 114, z: -122, r: 12 };
/** Мангровые островки в лагуне: корни по кругу в воде, посередине — кочка с деревом. */
export const ISLES = [{ x: 36, z: -52, r: 7 }, { x: -28, z: -56, r: 6 }, { x: 48, z: -16, r: 4.5 }, { x: 24, z: -80, r: 4 }];

/** До середины протоки: [расстояние, где на ней (м от начала)]. */
function chanAt(C, x, z) {
  const b = C.box;
  if (x < b.x0 || x > b.x1 || z < b.z0 || z > b.z1) return [999, 0];
  let best = Infinity;
  let bs = 0;
  for (const g of C.seg) {
    let t = ((x - g.ax) * g.dx + (z - g.az) * g.dz) / (g.len * g.len);
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const px = g.ax + g.dx * t;
    const pz = g.az + g.dz * t;
    const d = (x - px) * (x - px) + (z - pz) * (z - pz);
    if (d < best) {
      best = d;
      bs = g.s0 + t * g.len;
    }
  }
  return [Math.sqrt(best), bs];
}
/** Полуширина протоки в точке s её середины: дышит, а узкая к концу сходит в ручей. */
function chanW(C, s) {
  let w = C.w * (0.84 + 0.32 * fbm2(s * 0.021 + (C.end ? 3 : 7), 1.3, 2));
  if (C.end) w *= 0.35 + 0.65 * sstep(C.L, C.L * 0.7, s);
  return w;
}
/** Метры до берега протоки (больше нуля — вода) и где на ней точка. */
function chanD(C, x, z) {
  const [d, s] = chanAt(C, x, z);
  if (d > 900) return [-999, 0];
  return [chanW(C, s) - d, s];
}

/** Южный берег у базы: как в бухте — ровная кромка, на западе отмель уходит в сушу. */
export function shoreZ(x) {
  let s = 13 + 1.8 * Math.sin((x + 4) * 0.045) * sstep(8, 30, Math.abs(x + 4));
  const t = (x - BACKWATER.x) / 13;
  s += 11 * Math.exp(-t * t);
  return s;
}
function rim(th) {
  return 1 + 0.06 * Math.sin(3 * th + 0.7) + 0.05 * Math.sin(5 * th + 2.1) + 0.03 * Math.sin(9 * th + 0.4) + 0.02 * Math.sin(13 * th + 1.9);
}
const smin = (a, b, k) => {
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return lerp(b, a, h) - k * h * (1 - h);
};
const smax = (a, b, k) => -smin(-a, -b, k);
function lagoonD(x, z) {
  const dx = x - LAGOON.x;
  const dz = z - LAGOON.z;
  const ring = (1 - Math.hypot(dx / LAGOON.a, dz / LAGOON.b) / rim(Math.atan2(dz, dx))) * 64;
  return smin(ring, shoreZ(x) - z, 9);
}
function mouthD(x, z) {
  const dx = x - MOUTH.x;
  const dz = z - MOUTH.z;
  return (1 - Math.hypot(dx / MOUTH.a, dz / MOUTH.b) / rim(Math.atan2(dz, dx) + 1.3)) * 44;
}
/** Илистая отмель: круг к западу от базы, с юга срезанный берегом. */
function flatsD(x, z) {
  const dx = x - FLATS.x;
  const dz = z - FLATS.z;
  const r = FLATS.r * (1 + 0.1 * Math.sin(3 * Math.atan2(dz, dx) + 1.1));
  return smin(r - Math.hypot(dx, dz), shoreZ(x) - z, 6);
}
/** Море за устьем: всё, что дальше на северо-восток. */
const seaD = (x, z) => (x - 300) * 0.6 - (z + 262) * 0.8;
/** Метры до края ближнего островка (меньше нуля — на нём). */
function isleD(x, z) {
  let best = 999;
  for (const I of ISLES) {
    const dx = x - I.x;
    const dz = z - I.z;
    const r = Math.hypot(dx, dz);
    if (r > I.r + 40) continue;
    const a = Math.atan2(dz, dx);
    best = Math.min(best, r - I.r * (1 + 0.12 * Math.sin(3 * a + I.x) + 0.08 * Math.sin(5 * a + I.z)));
  }
  return best;
}

/** Насколько точка «в воде»: метры до берега, больше нуля — вода, меньше — суша. */
export function waterD(x, z) {
  let w = lagoonD(x, z);
  w = smax(w, flatsD(x, z), 6);
  w = smax(w, chanD(NARROW, x, z)[0], 6);
  w = smax(w, chanD(WIDE, x, z)[0], 8);
  w = smax(w, mouthD(x, z), 10);
  w = smax(w, seaD(x, z), 12);
  const di = isleD(x, z);
  if (di < 30) w = smin(w, di, 3);
  return w;
}

/** Берег у базы: здесь суша ровная и сухая, как на других локациях. */
const baseK = (x, z) => sstep(-74, -58, x) * (1 - sstep(50, 66, x)) * sstep(-14, 2, z);

function rawH(x, z) {
  const w = waterD(x, z);
  const nz = fbm2(x * 0.08, z * 0.08, 3);
  let h;
  if (w > 0) {
    // дно: у берега мелко, к середине глубже; у каждой воды своя глубина
    const lag = lagoonD(x, z);
    const [nw] = chanD(NARROW, x, z);
    const [ww] = chanD(WIDE, x, z);
    let D = 3.5 * Math.pow(sstep(0, 34, lag), 0.85);
    D = Math.max(D, 3.0 * sstep(0, 7, nw), 5.2 * sstep(0, 12, ww), 8.5 * sstep(0, 34, mouthD(x, z)));
    const sw = seaD(x, z);
    if (sw > 0) D = Math.max(D, sstep(0, 30, sw) * (8 + 12 * sstep(30, 200, sw)));
    D *= sstep(-1, 7, isleD(x, z)); // к островкам мелеет
    // Омут на изгибе широкой протоки
    D += 7.5 * Math.exp(-((x - OMUT.x) ** 2 + (z - OMUT.z) ** 2) / (OMUT.r * OMUT.r * 0.55)) * sstep(1, 8, ww);
    // Илистая отмель: по колено воды, из ила поднимаются бугры
    const fk = sstep(FLATS.r + 8, FLATS.r - 6, Math.hypot(x - FLATS.x, z - FLATS.z));
    if (fk > 0) {
      D = lerp(D, Math.min(D, 0.75), fk);
      D -= 1.1 * fk * sstep(0.56, 0.72, fbm2(x * 0.13 + 5, z * 0.13 + 2, 2));
    }
    h = -0.25 - D * sstep(0, 2.5, w) + (nz - 0.5) * 0.6 * sstep(3, 18, w);
  } else {
    const d = -w;
    const bk = baseK(x, z);
    // у базы — пологий сухой берег; вокруг — низкий мангровый лес по щиколотку в иле
    const base = 1.12 * sstep(-1.5, 3, d) + (d > 3 ? 0.035 * Math.min(d - 3, 30) : 0);
    const swamp = -0.25 + 0.62 * sstep(0, 10, d) + (nz - 0.5) * 0.35 * sstep(2, 12, d) + 0.012 * Math.min(d, 90);
    h = lerp(swamp, base, bk);
    // дальше от воды — пологие холмы под лесом, у горизонта — гряды
    h += 6 * sstep(150, 280, d) * (0.35 + 0.8 * fbm2(x * 0.012 + 3, z * 0.012 + 7, 3));
    const m = fbm2(x * 0.0052 + 1, z * 0.0052 + 11, 3);
    h += 30 * sstep(280, 600, d) * (0.3 + 1.1 * m);
  }
  // кочка посреди островка — сухая, на ней стоит дерево
  const di = isleD(x, z);
  if (di < 3) h = Math.max(h, -0.25 + 0.75 * sstep(1.5, -3, di));
  return h;
}
export const groundH = rawH;

/** Точка берега на луче из середины лагуны под углом th. */
export function shoreAt(th) {
  const cx = Math.cos(th);
  const cz = Math.sin(th);
  let lo = 10;
  let hi = 140;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (lagoonD(LAGOON.x + cx * m, LAGOON.z + cz * m) > 0) lo = m;
    else hi = m;
  }
  return [LAGOON.x + cx * lo, LAGOON.z + cz * lo];
}

/** Хижина на сваях: на северном берегу лагуны, фасадом на юг — на пирс базы. z — кромка воды под её мостками. */
export const HUT = (() => {
  const x = 6;
  let lo = -60;
  let hi = -140;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (waterD(x, m) > 0) lo = m;
    else hi = m;
  }
  const z = Math.round(lo * 10) / 10;
  return { x, z, floor: 2.3, w: 8, d: 6.4 };
})();

// настилы: база та же, что везде (late — кладутся отдельным проходом); мостки хижины — над водой у её крыльца
export const DECKS = [
  { id: 'deck', x0: -14, x1: 6, z0: 4, z1: 16, along: 'z' },
  { id: 'pier', x0: -1.6, x1: 1.6, z0: -22, z1: 4, along: 'z' },
  { id: 'head', x0: -6, x1: 6, z0: -27, z1: -22, along: 'x' },
  { id: 'walk', x0: -29, x1: -14, z0: 7.5, z1: 10.3, along: 'x' },
  { id: 'west', x0: -35, x1: -29, z0: 5, z1: 12.5, along: 'x' },
  { id: 'rental', x0: 1.6, x1: 5.6, z0: -8.6, z1: -4.2, along: 'z', late: true },
  { id: 'hut', x0: HUT.x - 5.5, x1: HUT.x + 5.5, z0: HUT.z + 0.4, z1: HUT.z + 4.4, along: 'x', late: true }
];
// лавка у базы и сама хижина: внутрь не зайти
export const BOXES = [{ x0: -13.4, x1: -6.9, z0: 10.0, z1: 15.7 }, { x0: HUT.x - HUT.w / 2, x1: HUT.x + HUT.w / 2, z0: HUT.z - HUT.d + 0.4, z1: HUT.z + 0.45 }];
export const CIRCLES = [
  { x: -12.4, z: 5.6, r: 0.75 }, { x: -11.2, z: 5.3, r: 0.6 }, { x: 4.6, z: 14.6, r: 0.8 }, { x: 4.9, z: 5.2, r: 0.55 },
  { x: -5.9, z: 15.2, r: 0.55 }, { x: 5.2, z: -26.2, r: 0.45 },
  { x: -5.0, z: -22.9, r: 0.5 }, { x: -29.8, z: 5.8, r: 0.5 }, { x: 4.9, z: 7.5, r: 0.55 }, { x: 7.7, z: 12.6, r: 0.5 }
];

export function deckAt(x, z, m = 0) {
  for (const d of DECKS) if (x >= d.x0 + m && x <= d.x1 - m && z >= d.z0 + m && z <= d.z1 - m) return d;
  return null;
}
function deckDist(x, z) {
  let best = 99;
  for (const d of DECKS) {
    const dx = Math.max(d.x0 - x, 0, x - d.x1);
    const dz = Math.max(d.z0 - z, 0, z - d.z1);
    best = Math.min(best, Math.hypot(dx, dz));
  }
  return best;
}
export const standY = (x, z) => (deckAt(x, z, -0.05) ? DECK_Y : groundH(x, z));
const EDGE = 0.1;
export const WADE = 0.62;
function onDecks(x, z) {
  return !!(deckAt(x - EDGE, z - EDGE) && deckAt(x + EDGE, z - EDGE) && deckAt(x - EDGE, z + EDGE) && deckAt(x + EDGE, z + EDGE));
}
export function blocksAt(x, z) {
  let out = null;
  for (const b of BOXES) if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1) (out ||= []).push(b);
  for (const c of CIRCLES) if ((x - c.x) ** 2 + (z - c.z) ** 2 < c.r * c.r) (out ||= []).push(c);
  return out;
}
/** Можно ли стоять в точке: настилы и берег у базы до забора (в воду — по колено). */
export function canStand(x, z, skip = null) {
  for (const b of BOXES) if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1 && !(skip && skip.includes(b))) return false;
  for (const c of CIRCLES) if ((x - c.x) ** 2 + (z - c.z) ** 2 < c.r * c.r && !(skip && skip.includes(c))) return false;
  if (onDecks(x, z)) return true;
  if (x < -54 || x > 47 || z < -12.6) return false;
  if (groundH(x, z) < -WADE) return false;
  return z - shoreZ(x) < 13.5;
}

// ── лодка ──
export const MOORINGS = [
  { id: 'home', name: 'Мангровая протока', rent: true, x: 4.0, z: -12, yaw: -0.6, sx: 0.95, sz: -12, syaw: -Math.PI / 2 },
  // мостки хижины: каноэ встаёт вдоль них, рыбак выходит лицом к хижине
  { id: 'hut', name: 'Хижина на сваях', x: HUT.x, z: HUT.z + 6.6, yaw: Math.PI / 2, sx: HUT.x, sz: HUT.z + 2.6, syaw: 0 }
];
export const RENT_DESK = { x: 2.3, z: -6.4, r: 2.0 };
/** Буйки: у пирса и по краю Омута. */
export const BUOYS = [[-14, -40], [16, -34], [-27, -12], [OMUT.x - 12, OMUT.z + 6], [OMUT.x + 10, OMUT.z - 9]];
export const MARKS = [];
const SAIL_BLOCKS = BUOYS.map(([x, z]) => ({ x, z, r: 1.2 }));
export function canSail(x, z) {
  if (x < WORLD.x0 || x > WORLD.x1 || z < WORLD.z0 || z > WORLD.z1) return false;
  if (groundH(x, z) > -0.6) return false;
  for (const d of DECKS) if (x > d.x0 - 0.7 && x < d.x1 + 0.7 && z > d.z0 - 0.7 && z < d.z1 + 0.7) return false;
  return !inRocks(x, z);
}
/** Корни мангров у островков и сама хижина на сваях: лодка их обходит. */
export function inRocks(x, z) {
  for (const c of SAIL_BLOCKS) if ((x - c.x) ** 2 + (z - c.z) ** 2 < c.r * c.r) return true;
  if (isleD(x, z) < 3.2) return true;
  if (Math.abs(x - HUT.x) < HUT.w / 2 + 1.2 && z > HUT.z - HUT.d - 1 && z < HUT.z + 1.2) return true;
  return false;
}

/** Метры до кромки воды, на которой стоят мангры (у базы и на отмели их нет). */
function rootsD(x, z) {
  const w = waterD(x, z);
  if (baseK(x, z) > 0.5 || Math.hypot(x - FLATS.x, z - FLATS.z) < FLATS.r + 4) return 99;
  return w;
}
/** Что за место в воде: глубина и зона ловли. null — не вода. */
export function spotAt(x, z) {
  const depth = -groundH(x, z);
  if (depth < 0.25) return null;
  const pier = deckDist(x, z) < 2.4;
  let zone;
  const [nw, ns] = chanD(NARROW, x, z);
  if (Math.hypot(x - OMUT.x, z - OMUT.z) < OMUT.r && depth > 8) zone = 'pit';
  else if (mouthD(x, z) > 0 || seaD(x, z) > 0) zone = 'mouth';
  else if (nw > 0 && ns > 26) zone = 'channel';
  else if (Math.hypot(x - FLATS.x, z - FLATS.z) < FLATS.r + 2 && depth < 1.4) zone = 'backwater';
  else if (rootsD(x, z) < 7 || isleD(x, z) < 7) zone = 'roots';
  else if (pier && depth < 3.8) zone = 'pier';
  else zone = depth < 2.5 ? 'shallow' : depth < 6 ? 'mid' : 'deep';
  return { depth, zone, pier };
}

// косяки рыбы: где они могут стоять
export const SCHOOL_HOMES = [
  [-8, -9], [9, -7], [13, -31], [-14, -39], [1, -45], [22, -23], [-20, -78], [30, -66], [-44, -30], [54, -44], [-6, -60],
  [-44, -110], [-46, -150], [-56, -196], [86, -104], [140, -142], [196, -172], [250, -216], [280, -246], [OMUT.x - 6, OMUT.z + 4]
].filter(([x, z]) => groundH(x, z) < -1.4 && !inRocks(x, z));
export const SEA_HOMES = [];
/** Дельфинов здесь нет: их «дорога» лежит далеко за краем мира. */
export const DOLPHIN_WAY = [[NOWHERE, NOWHERE], [NOWHERE + 60, NOWHERE], [NOWHERE + 60, NOWHERE + 60], [NOWHERE, NOWHERE + 60]];

// части протоки: что написать в углу экрана и чем место интересно рыбаку
export const AREAS = {
  lagoon: ['ЛАГУНА', ''],
  hut: ['ХИЖИНА НА СВАЯХ', 'Хижина на сваях: с её мостков ловят снука и луциана под корнями мангров'],
  narrow: ['УЗКАЯ ПРОТОКА', 'Узкая протока: снук, баррамунди и луциан стоят у корней, брызгун сбивает жуков с листьев'],
  wide: ['ШИРОКАЯ ПРОТОКА', 'Широкая протока: дорога к морю — красный горбыль, барракуда и каранкс'],
  omut: ['ОМУТ', 'Омут: самая глубокая вода протоки — здесь стоит тарпон, а в темноте вздыхает Хозяин протоки'],
  mouth: ['УСТЬЕ', 'Устье: протока выходит в море — тарпон, каранкс и скаты, а изредка — рыба-пила'],
  flats: ['ИЛИСТАЯ ОТМЕЛЬ', 'Илистая отмель: по колено воды — прыгуны на иле, четырёхглазки у поверхности']
};
export function areaAt(x, z) {
  if (Math.hypot(x - OMUT.x, z - OMUT.z) < OMUT.r + 8) return 'omut';
  if (mouthD(x, z) > -10 || seaD(x, z) > -10) return 'mouth';
  if (Math.hypot(x - HUT.x, z - HUT.z) < 20) return 'hut';
  if (Math.hypot(x - FLATS.x, z - FLATS.z) < FLATS.r + 6) return 'flats';
  const [nw, ns] = chanD(NARROW, x, z);
  if (nw > -6 && ns > 26) return 'narrow';
  const [ww, ws] = chanD(WIDE, x, z);
  if (ww > -6 && ws > 34) return 'wide';
  return 'lagoon';
}
