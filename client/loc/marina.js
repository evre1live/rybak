// Рельеф «Пальмовой марины»: ночная гавань курортного города. Тот же набор имён, что у бухты (loc/bay.js):
// высота земли и дна, причалы, зоны ловли, где можно ходить и плыть.
//
// База рыбака — та же, что везде: площадка с лавкой на южном берегу, пирс на север, будка проката; к западу от неё —
// маленький городской пляж (здесь вместо заводи). Гавань — почти прямоугольная, в каменных набережных: на северной
// стоит город (дома ар-деко с неоном, пальмы в гирляндах, фонари), от неё в гавань уходят понтоны с яхтами. В
// северо-западном углу гавань продолжается каналом, у самого входа в него — арочный мост, рядом с мостом —
// рыбацкий пирс. С востока гавань закрывает каменный мол; между его концом и концом набережной — выход в море.
import { clamp, lerp, sstep, fbm2 } from '../util.js';

/** Что есть на этой локации из того, что умеет строить мир (world.js, scenery.js и др.). */
export const HAS = { island: false, lighthouse: false, cottage: false, arch: false, reef: false, cape: false, palm: false, wreck: false, skerries: false, sea: true, farIsles: false, mountains: false, cabin: false, islet: false, gulls: true, marina: true };

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

/** Городской пляж к западу от базы (на других локациях здесь заводь): песок, по колено воды. */
export const BACKWATER = { x: -40, z: 13, r: 14 };
export const MARKET = { x: -5.6, z: 12.8, r: 3.2 };
export const SPAWN = { x: -2, z: 9 };

/** Гавань: западная набережная — x0, северная — z0; с юга — берег базы, с востока — мол. */
export const HARBOR = { x0: -104, z0: -125 };
/** Верх набережных над водой: город стоит на ровной площадке. */
export const QUAY_Y = 2.1;
/** Мол: от берега на север, гребень из камня. */
export const MOLE = { x: 130, z0: 24, z1: -70, w: 7, y: 2.6 };
/** Северная набережная кончается круглым мысом с зелёным огнём, мол — с красным. */
export const QUAY_END = { x: 124, z: HARBOR.z0 };
export const BEACONS = [{ x: MOLE.x, z: MOLE.z1 - 1, c: '#ff3b3b' }, { x: QUAY_END.x - 2.5, z: QUAY_END.z - 2.5, c: '#3bff7a' }];
export const BOUNDS = { x0: -340, x1: 380, z0: -340, z1: 70 }; // подробный рельеф: гавань, канал, город, море у входа
export const WORLD = { x0: -296, x1: 340, z0: -300, z1: 40 }; // куда можно доплыть
// Зыбь — только за молом: в гавани и в канале вода спокойная
export const SEA = { x: -150, z: -80, r: 280 };
export const MAP_VIEW = { x0: -214, x1: 330, z0: -225, z1: 46 }; // мини-карта: гавань, мост, вход и море за ним

// Канал: середина — плавная линия через опорные точки, w — полуширина. Уходит на запад из угла гавани и
// заворачивает к северу, за дома.
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
function channel(pts, w) {
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
  const m = w + 40;
  return { pts, p, seg, L, w, box: { x0: x0 - m, x1: x1 + m, z0: z0 - m, z1: z1 + m } };
}
export const CANAL = channel([[-80, -103], [-130, -103], [-180, -105], [-226, -115], [-262, -137], [-290, -171], [-306, -211]], 13);
/** Арочный мост через канал у самого входа в него (y — верх настила посередине); под ним — яма, логово групера. */
export const BRIDGE = { x: -122, z: -103, len: 34, w: 8, y: 5.6 };
/** Рыбацкий пирс: от северной набережной на юг, с площадкой на конце — рядом с мостом. */
export const FPIER = { x: -88, z0: HARBOR.z0, z1: HARBOR.z0 + 29, w: 2.8, hw: 7, hd: 4.6 };
/** Понтоны яхт-клуба: от северной набережной в гавань. */
export const PONTOONS = [
  { x: -58, z1: HARBOR.z0 + 30 },
  { x: -20, z1: HARBOR.z0 + 34 },
  { x: 18, z1: HARBOR.z0 + 34 },
  { x: 56, z1: HARBOR.z0 + 38 },
  { x: 94, z1: HARBOR.z0 + 30 }
].map((p) => ({ ...p, z0: HARBOR.z0, w: 2.4 }));
/**
 * Яхты у понтонов: kind — 'yacht' (моторная, 15 м) или 'sail' (парусная, 10 м); x, z — середина, ry — куда смотрит нос.
 * Стоят носом к набережной; между понтонами остаётся проход для лодки.
 */
export const YACHTS = (() => {
  const out = [];
  const R = [0.13, 0.71, 0.42, 0.88, 0.27, 0.55, 0.06, 0.93, 0.64, 0.35];
  PONTOONS.forEach((p, i) => {
    const len = -p.z1 + p.z0; // длина понтона (z0 < z1 < 0)
    const along = (k) => p.z0 + 4 + k; // от набережной
    // к востоку от понтона — моторные, к западу — парусные; не на каждом месте
    const sides = [
      ['yacht', 1, 15, 2.9],
      ['sail', -1, 10.5, 2.3]
    ];
    for (const [kind, side, L, half] of sides) {
      let z = along(L / 2 + 1);
      let n = 0;
      while (z + L / 2 < p.z1 + 2 && n < 2) {
        if (R[(i * 3 + n + (side > 0 ? 0 : 5)) % R.length] > 0.2) out.push({ kind, x: p.x + side * (p.w / 2 + half + 0.5), z, ry: 0, len: L, half });
        z += L + 3;
        n++;
      }
    }
    void len;
  });
  // ещё две большие яхты у северной набережной к востоку от понтонов — бортом к стенке
  out.push({ kind: 'yacht', x: 112, z: HARBOR.z0 + 4.2, ry: Math.PI / 2, len: 15, half: 2.9 });
  out.push({ kind: 'yacht', x: -76, z: HARBOR.z0 + 4.2, ry: -Math.PI / 2, len: 15, half: 2.9 });
  return out;
})();

/** До середины канала: [расстояние, где на нём (м от начала)]. */
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
/** Метры до стенки канала (больше нуля — вода) и где на нём точка. */
export function canalD(x, z) {
  const [d, s] = chanAt(CANAL, x, z);
  if (d > 900) return [-999, 0];
  return [CANAL.w - d, s];
}

/** Южный берег у базы: как в бухте — ровная кромка, на западе пляж уходит в сушу. */
export function shoreZ(x) {
  let s = 13 + 1.8 * Math.sin((x + 4) * 0.045) * sstep(8, 30, Math.abs(x + 4));
  const t = (x - BACKWATER.x) / 13;
  s += 11 * Math.exp(-t * t);
  return s;
}
const smin = (a, b, k) => {
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return lerp(b, a, h) - k * h * (1 - h);
};
const smax = (a, b, k) => -smin(-a, -b, k);

/** Гавань: стенки набережных прямые (на севере и западе), с юга — берег базы. */
function harborD(x, z) {
  // северная набережная кончается у входа в гавань; восточнее её конца — уже берег моря (seaD)
  const north = x < QUAY_END.x ? z - HARBOR.z0 : Math.sign(z - HARBOR.z0) * Math.hypot(x - QUAY_END.x, z - HARBOR.z0);
  return Math.min(x - HARBOR.x0, north, shoreZ(x) - z);
}
/** Метры до мола (меньше нуля — на нём). */
export function moleD(x, z) {
  const t = clamp((z - MOLE.z1) / (MOLE.z0 - MOLE.z1), 0, 1);
  const pz = MOLE.z1 + t * (MOLE.z0 - MOLE.z1);
  return Math.hypot(x - MOLE.x, z - pz) - MOLE.w;
}
/** Открытое море: к востоку от мола и к северо-востоку от конца набережной. */
function seaD(x, z) {
  if (z < HARBOR.z0) return x - (QUAY_END.x + 0.62 * (HARBOR.z0 - z));
  return Math.min(x - (MOLE.x + 10), 13 + 0.3 * Math.max(0, x - MOLE.x) - z);
}

/** Насколько точка «в воде»: метры до берега, больше нуля — вода, меньше — суша. */
export function waterD(x, z) {
  let w = harborD(x, z);
  w = smax(w, canalD(x, z)[0], 2);
  w = smax(w, seaD(x, z), 6);
  return smin(w, moleD(x, z), 2);
}
/** Город: суша севернее гавани, за западной набережной и вдоль канала. Там земля — ровная мостовая на высоте набережных. */
export const cityK = (x, z) => Math.max(sstep(HARBOR.z0 + 24, HARBOR.z0 + 4, z), sstep(-100, -110, x) * sstep(-20, -50, z));

function rawH(x, z) {
  const w = waterD(x, z);
  const nz = fbm2(x * 0.06, z * 0.06, 3);
  let h;
  if (w > 0) {
    // дно: у южного берега и на пляже мелко, в гавани ровно (её углубляли), к выходу — глубже, в море — обрыв
    const dS = shoreZ(x) - z;
    let D = lerp(0.8, 6.8, sstep(4, 80, dS));
    const [cw] = canalD(x, z);
    if (cw > 0) D = Math.max(D, 4.6 * sstep(0, 3, cw));
    // фарватер от входа к середине гавани
    const fx = clamp((x - 20) / (MOLE.x - 20), 0, 1);
    const fz = -50 + ((HARBOR.z0 + MOLE.z1) / 2 + 50) * fx; // к середине выхода из гавани
    D = Math.max(D, (7 + 3.5 * fx) * Math.exp(-((z - fz) ** 2) / 900) * sstep(-20, 30, x));
    const sw = seaD(x, z);
    if (sw > 0) D = Math.max(D, 9 + 20 * sstep(0, 220, sw));
    // яма под мостом
    D += 4.2 * Math.exp(-((x - BRIDGE.x) ** 2 + (z - BRIDGE.z) ** 2) / 120);
    // пляж: по колено
    const bk = sstep(BACKWATER.r + 10, BACKWATER.r - 4, Math.hypot(x - BACKWATER.x, z - BACKWATER.z));
    if (bk > 0) D = lerp(D, Math.min(D, 0.35 + 0.045 * dS), bk);
    // у набережных стенка отвесная: дно обрывается сразу у неё, у пологого берега — плавно
    const wall = cityK(x, z) > 0.5 || x < HARBOR.x0 + 12;
    h = -0.2 - D * sstep(0, wall ? 1.2 : 3.5, w) + (nz - 0.5) * 0.5 * sstep(3, 18, w);
  } else {
    const d = -w;
    const ck = cityK(x, z);
    // у базы — пологий сухой берег, как везде; в городе — ровная мостовая на высоте набережных
    const low = 1.12 * sstep(-1.5, 3, d) + (d > 3 ? 0.025 * Math.min(d - 3, 40) : 0);
    const city = QUAY_Y + 0.004 * Math.min(d, 300);
    h = lerp(low, city, ck);
    // за городом — пологие холмы, у горизонта — гряда
    h += 18 * sstep(260, 520, d) * (0.4 + 0.9 * fbm2(x * 0.006 + 2, z * 0.006 + 9, 3));
  }
  // мол: гребень из камня и откос из глыб — и над водой, и под ней
  const md = moleD(x, z);
  if (md < 12) h = Math.max(h, MOLE.y - 1.1 * Math.pow(Math.max(0, md + 2.2), 1.15) + (nz - 0.5) * 0.6);
  return h;
}
export const groundH = rawH;

// настилы: база та же, что везде (late — кладутся отдельным проходом); рыбацкий пирс у моста — свой
export const DECKS = [
  { id: 'deck', x0: -14, x1: 6, z0: 4, z1: 16, along: 'z' },
  { id: 'pier', x0: -1.6, x1: 1.6, z0: -22, z1: 4, along: 'z' },
  { id: 'head', x0: -6, x1: 6, z0: -27, z1: -22, along: 'x' },
  { id: 'walk', x0: -29, x1: -14, z0: 7.5, z1: 10.3, along: 'x' },
  { id: 'west', x0: -35, x1: -29, z0: 5, z1: 12.5, along: 'x' },
  { id: 'rental', x0: 1.6, x1: 5.6, z0: -8.6, z1: -4.2, along: 'z', late: true },
  { id: 'fpier', x0: FPIER.x - FPIER.w / 2, x1: FPIER.x + FPIER.w / 2, z0: FPIER.z0 + 1.5, z1: FPIER.z1, along: 'z', late: true },
  { id: 'fhead', x0: FPIER.x - FPIER.hw, x1: FPIER.x + FPIER.hw, z0: FPIER.z1, z1: FPIER.z1 + FPIER.hd, along: 'x', late: true }
];
// лавка у базы: внутрь не зайти
export const BOXES = [{ x0: -13.4, x1: -6.9, z0: 10.0, z1: 15.7 }];
export const CIRCLES = [
  { x: -12.4, z: 5.6, r: 0.75 }, { x: -11.2, z: 5.3, r: 0.6 }, { x: 4.6, z: 14.6, r: 0.8 }, { x: 4.9, z: 5.2, r: 0.55 },
  { x: -5.9, z: 15.2, r: 0.55 }, { x: 5.2, z: -26.2, r: 0.45 },
  { x: -5.0, z: -22.9, r: 0.5 }, { x: -29.8, z: 5.8, r: 0.5 }, { x: 4.9, z: 7.5, r: 0.55 }, { x: 7.7, z: 12.6, r: 0.5 },
  // фонари на площадке рыбацкого пирса
  { x: FPIER.x - FPIER.hw + 0.4, z: FPIER.z1 + FPIER.hd - 0.4, r: 0.3 }, { x: FPIER.x + FPIER.hw - 0.4, z: FPIER.z1 + FPIER.hd - 0.4, r: 0.3 }
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
/** Можно ли стоять в точке: настилы и берег у базы до ограды (в воду — по колено). */
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
  { id: 'home', name: 'Пальмовая марина', rent: true, x: 4.0, z: -12, yaw: -0.6, sx: 0.95, sz: -12, syaw: -Math.PI / 2 },
  // рыбацкий пирс у моста: катер встаёт вдоль площадки, рыбак выходит на неё лицом к мосту
  { id: 'fpier', name: 'Рыбацкий пирс', x: FPIER.x + 1.5, z: FPIER.z1 + FPIER.hd + 3.4, yaw: Math.PI / 2, sx: FPIER.x - 2, sz: FPIER.z1 + FPIER.hd - 1.4, syaw: Math.PI / 2 }
];
export const RENT_DESK = { x: 2.3, z: -6.4, r: 2.0 };
/** Буйки: у пирса и по краям фарватера. */
export const BUOYS = [[-14, -40], [16, -34], [-27, -12], [96, MOLE.z1 - 1], [104, HARBOR.z0 + 18]];
export const MARKS = [];
const SAIL_BLOCKS = BUOYS.map(([x, z]) => ({ x, z, r: 1.2 }));
export function canSail(x, z) {
  if (x < WORLD.x0 || x > WORLD.x1 || z < WORLD.z0 || z > WORLD.z1) return false;
  if (groundH(x, z) > -0.6) return false;
  for (const d of DECKS) if (x > d.x0 - 0.7 && x < d.x1 + 0.7 && z > d.z0 - 0.7 && z < d.z1 + 0.7) return false;
  return !inRocks(x, z);
}
/** Понтоны, яхты у них и откос мола: лодка их обходит. */
export function inRocks(x, z) {
  for (const c of SAIL_BLOCKS) if ((x - c.x) ** 2 + (z - c.z) ** 2 < c.r * c.r) return true;
  if (z < HARBOR.z0 + 40 && z > HARBOR.z0 - 2) {
    for (const p of PONTOONS) if (Math.abs(x - p.x) < p.w / 2 + 0.9 && z < p.z1 + 1.2) return true;
    for (const y of YACHTS) {
      const c = Math.cos(y.ry);
      const s = Math.sin(y.ry);
      const u = (x - y.x) * s + (z - y.z) * c; // вдоль корпуса
      const v = (x - y.x) * c - (z - y.z) * s; // поперёк
      if (Math.abs(u) < y.len / 2 + 1 && Math.abs(v) < y.half + 0.8) return true;
    }
  }
  if (moleD(x, z) < 4) return true;
  return false;
}

/** Метры до ближайшего понтона или яхты — там, у огней, ночью стоит кальмар и снук. */
function lightsD(x, z) {
  if (z > HARBOR.z0 + 46 || z < HARBOR.z0 - 1 || x > QUAY_END.x + 4) return 99;
  let best = z - HARBOR.z0; // вся северная набережная в огнях
  for (const p of PONTOONS) {
    const dx = Math.max(0, Math.abs(x - p.x) - p.w / 2);
    const dz = Math.max(0, z - p.z1);
    best = Math.min(best, Math.hypot(dx, dz));
  }
  return best;
}
/** Что за место в воде: глубина и зона ловли. null — не вода. */
export function spotAt(x, z) {
  const depth = -groundH(x, z);
  if (depth < 0.25) return null;
  const pier = deckDist(x, z) < 2.4;
  let zone;
  const [cw, cs] = canalD(x, z);
  if (Math.hypot(x - BRIDGE.x, z - BRIDGE.z) < 17 && depth > 3) zone = 'bridge';
  else if (seaD(x, z) > 4) zone = 'sea';
  else if (x > MOLE.x - 24 && z < MOLE.z1 + 10 && z > HARBOR.z0 - 30) zone = 'mouth';
  else if (cw > 0 && cs > 52) zone = 'channel';
  else if (Math.hypot(x - BACKWATER.x, z - BACKWATER.z) < BACKWATER.r + 2 && depth < 1.4) zone = 'backwater';
  else if (pier && depth < 3.8 && z > -40) zone = 'pier';
  else if (lightsD(x, z) < 9 || (pier && z < -100)) zone = 'lights';
  else zone = depth < 2.5 ? 'shallow' : depth < 6 ? 'mid' : 'deep';
  return { depth, zone, pier };
}

// косяки рыбы: где они могут стоять
export const SCHOOL_HOMES = [
  [-8, -9], [9, -7], [13, -31], [-14, -39], [1, -45], [22, -23], [-44, -30], [54, -44], [-6, -60], [-70, -60], [40, -70],
  [80, -55], [100, -78], [-30, -78], [10, -80], [-96, -88], [-150, -105], [-210, -116], [150, -110], [190, -60], [200, -170]
].filter(([x, z]) => groundH(x, z) < -1.4 && !inRocks(x, z));
export const SEA_HOMES = [[220, -120], [260, -60], [240, -200], [300, -150], [200, 10]];
/** Где кружат чайки: над входом в гавань, над молом и над базой. [x, высота, z, радиус] */
export const GULL_SPOTS = [
  [MOLE.x + 20, 18, -60, 26],
  [150, 22, HARBOR.z0, 30],
  [-10, 16, -30, 20]
];
/** Дельфины ходят в море за молом. */
export const DOLPHIN_WAY = [[180, 20], [260, -40], [280, -160], [200, -220], [160, -130], [170, -40]];

// части марины: что написать в углу экрана и чем место интересно рыбаку
export const AREAS = {
  harbor: ['ГАВАНЬ', ''],
  yachts: ['ЯХТ-КЛУБ', 'Яхт-клуб: ночью под огнями понтонов кальмары, снук и сарган'],
  fpier: ['РЫБАЦКИЙ ПИРС', 'Рыбацкий пирс: под мостом рядом — угорь, рыба-ёж и сибас, а в яме — групер-голиаф'],
  bridge: ['ПОД МОСТОМ', 'Под мостом: яма у опор — логово групера-голиафа, ночью здесь стоит снук'],
  canal: ['КАНАЛ', 'Канал: тихая вода между домами — угорь, рыба-ёж и снук'],
  mouth: ['ВЫХОД ИЗ ГАВАНИ', 'Выход из гавани: луфарь и кобия, ночью у огней — тарпон'],
  sea: ['ОТКРЫТОЕ МОРЕ', 'Открытое море: кобия, луфарь, тарпон; ночью — рыба-молот и Лунный призрак на лунной дорожке'],
  beach: ['ГОРОДСКОЙ ПЛЯЖ', 'Городской пляж: по колено воды — помпано и кефаль']
};
export function areaAt(x, z) {
  if (seaD(x, z) > -6) return 'sea';
  if (x > MOLE.x - 30 && z < MOLE.z1 + 16) return 'mouth';
  if (Math.hypot(x - BRIDGE.x, z - BRIDGE.z) < 26) return 'bridge';
  if (Math.abs(x - FPIER.x) < 14 && z < FPIER.z1 + 14 && z > HARBOR.z0 - 4) return 'fpier';
  const [cw, cs] = canalD(x, z);
  if (cw > -8 && cs > 40) return 'canal';
  if (Math.hypot(x - BACKWATER.x, z - BACKWATER.z) < BACKWATER.r + 8) return 'beach';
  if (z < HARBOR.z0 + 46 && x > -70) return 'yachts';
  return 'harbor';
}
