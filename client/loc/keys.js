// Рельеф «Коралловых островков»: лагуна в кольце рифа. Тот же набор имён, что у бухты (loc/bay.js):
// высота земли и дна, причалы, зоны ловли, где можно ходить и плыть.
//
// База рыбака — та же, что в бухте: площадка с лавкой, пирс на север, будка проката, тихая отмель на западе.
// Стоит она на песчаном островке-полумесяце на южном краю лагуны. Прямо за водой — скала с каменной аркой
// (под аркой — глубокая яма), правее — песчаный островок с хижиной, левее — цветочный островок. По дну лагуны
// разбросаны коралловые сады, между ними идёт протока. Лагуну замыкает гребень рифа: вода на нём по колено,
// лодка проходит только через три прохода; за гребнем стена рифа уходит в синеву — там край рифа и открытое море.
import { clamp, lerp, sstep, fbm2 } from '../util.js';

/** Что есть на этой локации из того, что умеет строить мир (world.js, scenery.js и др.). */
export const HAS = { island: false, lighthouse: false, cottage: false, arch: true, reef: false, cape: false, palm: false, wreck: false, skerries: false, sea: true, farIsles: false, mountains: false, cabin: false, islet: false, gulls: true, keys: true };

export const DECK_Y = 1.1;
// Чего здесь нет — стоит далеко за краем мира: проверки «рядом ли» никогда не срабатывают
const NOWHERE = 1e5;
export const ISLAND = { x: NOWHERE, z: NOWHERE };
export const REEF = { x: NOWHERE, z: NOWHERE };
export const CAPE = { ax: NOWHERE, az: NOWHERE, bx: NOWHERE + 1, bz: NOWHERE, r: 1 };
export const PALM = { x: NOWHERE, z: NOWHERE, rx: 1, rz: 1 };
export const WRECK = { x: NOWHERE, z: NOWHERE, r: 1 };
export const SKERRIES = [];
export const LIGHTHOUSE = { x: NOWHERE, z: NOWHERE };
export const COTTAGE = { x: NOWHERE, z: NOWHERE, s: 8.5, ry: 0, y: 0, pad: [1, 1, 1] };
export const cottageUV = (x, z) => [x - COTTAGE.x, z - COTTAGE.z];
export const islandR = () => 1;
export const capeDist = () => NOWHERE;
export const palmR = () => NOWHERE;
export const FALLS = [];

export const BACKWATER = { x: -40, z: 13, r: 14 }; // тихая отмель с морской травой к западу от причала
export const MARKET = { x: -5.6, z: 12.8, r: 3.2 };
export const SPAWN = { x: -2, z: 9 };
/** Лагуна: середина и полуоси кольца рифа (по гребню). */
export const LAGOON = { x: 6, z: -68, a: 142, b: 134 };
const RING = 138; // средний радиус кольца, м: в него растягивается «доля пути до гребня»
export const BOUNDS = { x0: -214, x1: 226, z0: -274, z1: 138 }; // подробный рельеф: лагуна, риф и его внешний склон
export const WORLD = { x0: -330, x1: 340, z0: -390, z1: 150 }; // куда можно доплыть на лодке
export const SEA = { x: LAGOON.x, z: LAGOON.z, r: 152 }; // дальше этого круга — открытое море с зыбью
export const MAP_VIEW = { x0: -243, x1: 255, z0: -206, z1: 62 }; // мини-карта: вся лагуна с домашним островком (той же формы, что карта бухты)

/**
 * Каменная арка у восточного края скалы: ry — куда повёрнута (опоры стоят вдоль этой оси, с запада на восток —
 * с пирса сквозь неё видно море), leg — от середины до середины опоры, block — радиус опоры для лодки
 * (между опорами остаётся проход), w, h, d — габариты арки в метрах.
 */
export const ARCH = { x: 3.4, z: -125, ry: 0, leg: 6.9, block: 4.2, w: 22, h: 15.5, d: 13 };
export const ARCH_LEGS = [-1, 1].map((k) => [ARCH.x + Math.cos(ARCH.ry) * ARCH.leg * k, ARCH.z - Math.sin(ARCH.ry) * ARCH.leg * k]);
/** Скала с аркой: каменный остров с зелёной макушкой. R — средний радиус по кромке воды, top — высота плато. */
export const ROCK = { x: -22, z: -126, R: 18.5, top: 9.6 };
/** Пляж у подножия скалы, со стороны базы: сюда причаливают и отсюда добрасывают до ямы под аркой. */
export const BEACH = { x: -17, z: -104.5, rx: 9.5, rz: 6, top: 1.25 };
/** Песчаный островок с хижиной — справа от пирса. */
export const SAND = { x: 46, z: -90, rx: 17, rz: 10.5, top: 2.3 };
/** Цветочный островок — камень с пальмами и цветами слева от пирса. */
export const BLOOM = { x: -37, z: -60, r: 6.6, top: 2.7 };
/** Песчаные островки без причала: дальний (слева за скалой) и птичий (на востоке лагуны). */
export const CAYS = [
  { id: 'far', x: -62, z: -142, rx: 13, rz: 8, top: 2.0 },
  { id: 'bird', x: 104, z: -58, rx: 11, rz: 7, top: 1.7 }
];
/** Скалы-столбы в лагуне (справа за аркой) и острова за рифом: [x, z, поперечник у воды, высота]. */
export const STACKS = [[17.5, -128.5, 5.2, 9.5], [24, -148, 6.5, 13], [41, -160, 5, 8.5]];
export const OUTER = [
  { id: 'north', x: 96, z: -322, r: 24, top: 15, rock: true },
  { id: 'west', x: -262, z: -214, r: 21, top: 12, rock: true },
  { id: 'east', x: 296, z: -138, r: 19, top: 2.2, rock: false },
  { id: 'south', x: -246, z: 18, r: 17, top: 2.0, rock: false }
];
/** Костёр у хижины на песчаном островке (звук и свет). */
export const CAMPFIRE = { x: 52.5, z: -85.5 };

// настилы: база та же, что в бухте, плюс мостки песчаного островка и пляжа под скалой (late — кладутся отдельным
// проходом: случайная расстановка вещей на базе остаётся такой же, как в бухте)
export const DECKS = [
  { id: 'deck', x0: -14, x1: 6, z0: 4, z1: 16, along: 'z' },
  { id: 'pier', x0: -1.6, x1: 1.6, z0: -22, z1: 4, along: 'z' },
  { id: 'head', x0: -6, x1: 6, z0: -27, z1: -22, along: 'x' },
  { id: 'walk', x0: -29, x1: -14, z0: 7.5, z1: 10.3, along: 'x' },
  { id: 'west', x0: -35, x1: -29, z0: 5, z1: 12.5, along: 'x' },
  { id: 'rental', x0: 1.6, x1: 5.6, z0: -8.6, z1: -4.2, along: 'z', late: true },
  { id: 'sandwalk', x0: 20, x1: 33.6, z0: -91.3, z1: -88.7, along: 'x', late: true },
  { id: 'sand', x0: 15, x1: 20, z0: -94.5, z1: -85.5, along: 'x', late: true },
  { id: 'archwalk', x0: -18.3, x1: -15.7, z0: -103.2, z1: -90, along: 'z', late: true },
  { id: 'arch', x0: -21.5, x1: -12.5, z0: -90, z1: -85.5, along: 'x', late: true }
];
export const BOXES = [{ x0: -13.4, x1: -6.9, z0: 10.0, z1: 15.7 }];
export const CIRCLES = [
  { x: -12.4, z: 5.6, r: 0.75 }, { x: -11.2, z: 5.3, r: 0.6 }, { x: 4.6, z: 14.6, r: 0.8 }, { x: 4.9, z: 5.2, r: 0.55 },
  { x: -5.9, z: 15.2, r: 0.55 }, { x: 5.2, z: -26.2, r: 0.45 },
  { x: -5.0, z: -22.9, r: 0.5 }, { x: -29.8, z: 5.8, r: 0.5 }, { x: 4.9, z: 7.5, r: 0.55 }, { x: 7.7, z: 12.6, r: 0.5 },
  // мостки песчаного островка и пляжа под скалой: ящик, сети, ловушка
  { x: 19.2, z: -86.3, r: 0.42 }, { x: 15.9, z: -93.4, r: 0.5 }, { x: -13.3, z: -86.4, r: 0.5 }
];

/** Мягкий минимум: на стыке двух берегов кромка скруглена. */
function smin(a, b, k) {
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return lerp(b, a, h) - k * h * (1 - h);
}

// ── домашний островок: полумесяц, рога загнуты к северу — причал стоит в его излучине ──
/** Северный берег островка (у базы — тот же, что в бухте: ровная кромка с отмелью на западе). */
export function shoreZ(x) {
  let s = 13 + 1.8 * Math.sin((x + 4) * 0.045) * sstep(8, 30, Math.abs(x + 4));
  const t = (x - BACKWATER.x) / 13;
  s += 11 * Math.exp(-t * t);
  s -= 22 * sstep(-58, -92, x);
  s -= 8 * sstep(50, 76, x);
  return s;
}
/** Южный берег островка: дуга, которая сходится с северным берегом на концах рогов. */
function southZ(x) {
  const u = Math.abs(x + 4) / (x < -4 ? 96 : 76); // западный рог длиннее восточного
  return 58 + 4 * Math.sin(x * 0.045 + 1) + 2.5 * Math.sin(x * 0.11 + 4) - 66 * u * u * Math.pow(u, 0.3);
}
/** Метры вглубь домашнего островка от ближайшего берега: больше нуля — суша, меньше — вода. */
export function homeD(x, z) {
  return smin(z - shoreZ(x), southZ(x) - z, 9);
}
function homeH(x, z) {
  const D = homeD(x, z);
  if (D < -58) return -99;
  // под водой — пологий песчаный откос; у базы первые метры такие же, как в бухте
  let h = D < 0 ? -6.2 * Math.pow(sstep(0, 52, -D), 0.9) : 0;
  // с океанской стороны откоса нет: за пляжем сразу риф-флет и стена рифа (их кладёт seabed)
  if (D < -1.6) {
    const m = reefM(x, z);
    if (m < 10) h = lerp(h, -99, sstep(10, 2, m));
  }
  if (D > -1.6) {
    h += 1.12 * sstep(-1.5, 3, D);
    if (D > 3) {
      h += 0.035 * Math.min(D - 3, 30);
      // дюна в середине островка: невысокие песчаные бугры под пальмами
      h += 1.8 * sstep(9, 20, D) * (0.35 + 1.0 * fbm2(x * 0.05 + 2, z * 0.05 + 6, 3));
    }
  }
  return h;
}

// ── кольцо рифа ──
function rimK(th) {
  return 1 + 0.06 * Math.sin(3 * th + 0.9) + 0.04 * Math.sin(5 * th + 2.3) + 0.026 * Math.sin(8 * th + 4.1) + 0.016 * Math.sin(13 * th + 0.7);
}
/** Метры до гребня рифа: больше нуля — лагуна, меньше — снаружи, у нуля — сам гребень. */
export function reefM(x, z) {
  const dx = x - LAGOON.x;
  const dz = z - LAGOON.z;
  return (1 - Math.hypot(dx / LAGOON.a, dz / LAGOON.b) / rimK(Math.atan2(dz, dx))) * RING;
}
/** Точка гребня рифа под углом th от середины лагуны (0 — восток, −90° — север). */
export function rimAt(th, off = 0) {
  const k = rimK(th);
  const c = Math.cos(th);
  const s = Math.sin(th);
  const R = k / Math.hypot(c / LAGOON.a, s / LAGOON.b);
  return [LAGOON.x + c * (R - off), LAGOON.z + s * (R - off)];
}
/**
 * Проходы в рифе: th — направление от середины лагуны, w — полуширина (м), d — глубина.
 * Западный — главная протока, восточный — к птичьему островку, северный — за скалой с аркой.
 */
export const PASSES = [
  { id: 'west', th: (-150 * Math.PI) / 180, w: 13, d: -6.6 },
  { id: 'east', th: (-9 * Math.PI) / 180, w: 11.5, d: -6.2 },
  { id: 'north', th: (-101 * Math.PI) / 180, w: 10, d: -5.6 }
];
for (const p of PASSES) [p.x, p.z] = rimAt(p.th);
/** Насколько точка в проходе: 0 — нет, 1 — на его оси. */
export function passK(x, z) {
  const dx = x - LAGOON.x;
  const dz = z - LAGOON.z;
  const R = Math.hypot(dx, dz);
  if (R < 60) return 0;
  const th = Math.atan2(dz, dx);
  let k = 0;
  for (const p of PASSES) {
    let d = th - p.th;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    const a = (d * R) / p.w;
    if (a > -3 && a < 3) k = Math.max(k, Math.exp(-a * a));
  }
  return k;
}
function passDepth(x, z) {
  const th = Math.atan2(z - LAGOON.z, x - LAGOON.x);
  let best = PASSES[0];
  let bd = 9;
  for (const p of PASSES) {
    const d = Math.abs(Math.atan2(Math.sin(th - p.th), Math.cos(th - p.th)));
    if (d < bd) {
      bd = d;
      best = p;
    }
  }
  return best.d;
}

/** Расстояние от точки до отрезка (ax, az)–(bx, bz). */
function segDist(x, z, ax, az, bx, bz) {
  const dx = bx - ax;
  const dz = bz - az;
  const t = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz), 0, 1);
  return Math.hypot(x - ax - dx * t, z - az - dz * t);
}
/**
 * Протоки по дну лагуны: ломаные, вдоль которых дно глубже. Главная идёт от пирса на северо-запад к западному
 * проходу; от неё ветка на восток мимо песчаного островка; третья — под аркой на север.
 */
export const CHANNELS = [
  { w: 9, d: -7.6, pts: [[5, -46], [-18, -76], [-52, -104], [-88, -124], [PASSES[0].x, PASSES[0].z]] },
  { w: 8, d: -7.0, pts: [[-18, -76], [16, -100], [3.4, -112], [3.4, -138], [-8, -168], [PASSES[2].x, PASSES[2].z]] },
  { w: 8, d: -6.8, pts: [[16, -100], [44, -116], [84, -110], [120, -98], [PASSES[1].x, PASSES[1].z]] }
];
for (const c of CHANNELS) {
  // протока продолжается за гребень: её последний отрезок выходит на внешний склон
  const [ax, az] = c.pts[c.pts.length - 2];
  const [bx, bz] = c.pts[c.pts.length - 1];
  const l = Math.hypot(bx - ax, bz - az);
  c.pts.push([bx + ((bx - ax) / l) * 26, bz + ((bz - az) / l) * 26]);
  c.box = c.pts.reduce((b, [x, z]) => [Math.min(b[0], x), Math.max(b[1], x), Math.min(b[2], z), Math.max(b[3], z)], [1e9, -1e9, 1e9, -1e9]);
}
function channelD(x, z, c) {
  const m = c.w * 3;
  if (x < c.box[0] - m || x > c.box[1] + m || z < c.box[2] - m || z > c.box[3] + m) return 1e9;
  let d = 1e9;
  for (let i = 0; i + 1 < c.pts.length; i++) d = Math.min(d, segDist(x, z, c.pts[i][0], c.pts[i][1], c.pts[i + 1][0], c.pts[i + 1][1]));
  return d;
}

/**
 * Коралловые сады: круги на дне лагуны, где кораллы растут густо, а дно поднимается буграми к самой поверхности.
 * Первые два — у самого пирса (до них добрасывает и стартовая удочка). Кольцо за гребнем рифа — тоже сад.
 */
export const GARDENS = [
  { x: 18, z: -37, r: 11.5 }, { x: -17, z: -44, r: 10 }, { x: -37, z: -60, r: 17 }, { x: 28, z: -64, r: 13 },
  { x: 66, z: -74, r: 12.5 }, { x: 50, z: -112, r: 12 }, { x: -34, z: -98, r: 12 }, { x: 24, z: -136, r: 12 },
  { x: -72, z: -72, r: 14 }, { x: -98, z: -98, r: 12 }, { x: 92, z: -76, r: 14 }, { x: 110, z: -128, r: 13 },
  { x: 52, z: -166, r: 14 }, { x: -58, z: -170, r: 13 }, { x: -4, z: -66, r: 9 }, { x: 78, z: -30, r: 12 }, { x: -86, z: -36, r: 12 }
];
/** Насколько точка в коралловом саду: 0 — песок, 1 — середина сада. */
export function gardenK(x, z) {
  let k = 0;
  for (const g of GARDENS) {
    const dx = x - g.x;
    const dz = z - g.z;
    if (dx > g.r || dx < -g.r || dz > g.r || dz < -g.r) continue;
    const d = Math.hypot(dx, dz) / g.r;
    // край сада рваный
    if (d < 1) k = Math.max(k, sstep(1, 0.62, d + 0.22 * (fbm2(x * 0.16 + g.x, z * 0.16 + g.z, 2) - 0.5)));
  }
  return k;
}

/** Дно без островов: лагуна, гребень рифа, внешний склон, проходы, протоки, сады и яма под аркой. */
function seabed(x, z) {
  const m = reefM(x, z);
  if (m < -70) return -16;
  const n1 = fbm2(x * 0.06 + 3, z * 0.06 + 8, 3);
  const n2 = fbm2(x * 0.21 + 1, z * 0.21 + 5, 2);
  // гребень: риф-флет у самой поверхности, местами почти обсыхает
  const crest = -0.5 + 0.5 * (n1 - 0.5) + 0.22 * (n2 - 0.5);
  let h;
  if (m >= 0) {
    // лагуна: за гребнем дно уходит к песчаному полу, к середине глубже
    const floor = -3.2 - 1.3 * sstep(60, 125, m) + 0.7 * (n1 - 0.5);
    h = lerp(crest, floor, Math.pow(sstep(3, 34, m), 0.8));
    // коралловые сады: бугры до метра-полутора под поверхностью
    const gk = gardenK(x, z);
    if (gk > 0) {
      const top = -1.75 + 1.5 * (fbm2(x * 0.33 + 11, z * 0.33 + 4, 2) - 0.5) - 0.9 * (1 - gk);
      if (top > h) h = lerp(h, top, gk);
    }
  } else {
    // внешний склон: стенка до девяти метров, дальше откос на глубину моря
    const o = -m;
    h = lerp(crest, -9, sstep(8, 22, o));
    h = lerp(h, -16, sstep(18, 62, o)) + 0.8 * (n1 - 0.5) * sstep(12, 34, o);
  }
  // проходы: на месте гребня — канал
  if (m > -44 && m < 44) {
    const pk = passK(x, z);
    if (pk > 0.01) {
      const pd = passDepth(x, z) + 0.5 * (n1 - 0.5);
      if (pd < h) h = lerp(h, pd, Math.min(1, pk * 1.25) * sstep(44, 16, Math.abs(m)));
    }
  }
  // протоки
  for (const c of CHANNELS) {
    const d = channelD(x, z, c);
    if (d < c.w * 2.6) {
      const cd = c.d + 0.6 * (n1 - 0.5);
      if (cd < h) h = lerp(h, cd, Math.exp(-((d / c.w) ** 2)));
    }
  }
  // яма под аркой: самое глубокое место лагуны
  const da = (x - ARCH.x) ** 2 + (z - ARCH.z) ** 2;
  if (da < 900) h = Math.min(h, lerp(h, -10.8, Math.exp(-da / 120)));
  return h;
}

// ── острова ──
/** Расстояние до песчаного островка в «радиусах»: 1 — кромка воды. */
export function cayR(c, x, z) {
  const dx = (x - c.x) / c.rx;
  const dz = (z - c.z) / c.rz;
  const q = Math.hypot(dx, dz);
  if (q > 4) return q;
  const a = Math.atan2(dz, dx);
  return q / (1 + 0.1 * Math.sin(3 * a + c.x * 0.3) + 0.06 * Math.sin(5 * a + c.z * 0.2));
}
function cayH(c, x, z, deep = false) {
  const r = cayR(c, x, z);
  // островок за рифом стоит на глубине: его отмель плавно уходит ко дну открытого моря
  if (deep) return r > 3.9 ? -99 : r < 1 ? c.top * Math.pow(1 - r * r, 0.85) : lerp(-0.04 - 4.2 * Math.pow(sstep(1, 2.4, r), 0.85), -16.4, sstep(1.9, 3.8, r));
  if (r > 2.6) return -99;
  // песчаный купол; вокруг — отмель, уходящая под дно лагуны
  if (r < 1) return c.top * Math.pow(1 - r * r, 0.85) + 0.25 * (fbm2(x * 0.09 + c.x, z * 0.09, 2) - 0.5) * (1 - r);
  return -0.04 - 5.4 * Math.pow(sstep(1, 2.55, r), 0.85);
}
/** Радиус скалы с аркой по кромке воды в направлении th. */
export function rockR(th) {
  return ROCK.R * (1 + 0.13 * Math.sin(3 * th + 0.4) + 0.08 * Math.sin(5 * th + 2.0) + 0.045 * Math.sin(8 * th + 1.1));
}
const rockTop = (x, z) => ROCK.top + 2.6 * fbm2(x * 0.07 + 5, z * 0.07 + 1, 3) + 2.4 * Math.exp(-((x - ROCK.x + 5) ** 2 + (z - ROCK.z - 2) ** 2) / 70);
function rockH(x, z) {
  const dx = x - ROCK.x;
  const dz = z - ROCK.z;
  const r = Math.hypot(dx, dz);
  if (r > 60) return -99;
  const R = rockR(Math.atan2(dz, dx));
  const c = sstep(R + 1.4, R - 4.2, r);
  // у подножия — каменная полка, дальше склон уходит под дно лагуны
  const shelf = -0.8 - 9 * sstep(R, R + 22, r);
  return shelf * (1 - c) + rockTop(x, z) * Math.pow(c, 0.7);
}
/** Каменный купол с отмелью вокруг: цветочный островок, столбы в лагуне, скалы за рифом. */
function knollH(x, z, cx, cz, R, top, drop = 26) {
  const r = Math.hypot(x - cx, z - cz);
  if (r > R * 4 + 30) return -99;
  const a = Math.atan2(z - cz, x - cx);
  const Rk = R * (1 + 0.14 * Math.sin(3 * a + cx) + 0.08 * Math.sin(5 * a + cz));
  const c = sstep(Rk + 1.2, Rk - Math.min(3.2, R * 0.55), r);
  const t = top + (top > 4 ? 1.6 : 0.9) * (fbm2(x * 0.16 + 3 + cx, z * 0.16 + 8, 2) - 0.5);
  const shelf = -0.7 - drop * sstep(Rk, Rk + 30, r);
  return shelf * (1 - c) + t * Math.pow(c, 0.7);
}
function outerH(x, z) {
  let h = -99;
  for (const o of OUTER) {
    if (Math.abs(x - o.x) > 110 || Math.abs(z - o.z) > 110) continue;
    const v = o.rock ? knollH(x, z, o.x, o.z, o.r, o.top, 20) : cayH({ x: o.x, z: o.z, rx: o.r, rz: o.r * 0.7, top: o.top }, x, z, true);
    if (v > h) h = v;
  }
  return h;
}

export function groundH(x, z) {
  let h = seabed(x, z);
  let v = homeH(x, z);
  if (v > h) h = v;
  if (z < -70) {
    v = rockH(x, z);
    if (v > h) h = v;
    v = cayH(BEACH, x, z);
    if (v > h) h = v;
    for (const s of STACKS) {
      v = knollH(x, z, s[0], s[1], s[2] / 2, -0.5); // сам столб — модель; под ним только отмель
      if (v > h) h = v;
    }
  }
  v = cayH(SAND, x, z);
  if (v > h) h = v;
  v = knollH(x, z, BLOOM.x, BLOOM.z, BLOOM.r, BLOOM.top);
  if (v > h) h = v;
  for (const c of CAYS) {
    v = cayH(c, x, z);
    if (v > h) h = v;
  }
  if (x < -200 || x > 230 || z < -260) {
    v = outerH(x, z);
    if (v > h) h = v;
  }
  return h;
}

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
/**
 * Можно ли стоять в точке: настилы, весь домашний островок, песчаный островок и пляж под скалой — по песку и
 * в воду по колено. На скалу не забраться.
 */
export function canStand(x, z, skip = null) {
  for (const b of BOXES) if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1 && !(skip && skip.includes(b))) return false;
  for (const c of CIRCLES) if ((x - c.x) ** 2 + (z - c.z) ** 2 < c.r * c.r && !(skip && skip.includes(c))) return false;
  if (onDecks(x, z)) return true;
  const h = groundH(x, z);
  if (h < -WADE) return false;
  if (homeD(x, z) > -9) return true;
  if (cayR(SAND, x, z) < 1.5) return true;
  if (cayR(BEACH, x, z) < 1.45) return h < 2.1 && Math.hypot(x - ROCK.x, z - ROCK.z) > rockR(Math.atan2(z - ROCK.z, x - ROCK.x)) - 1.2;
  return false;
}

// ── лодка ──
export const MOORINGS = [
  { id: 'home', name: 'Коралловые островки', rent: true, x: 4.0, z: -12, yaw: -0.6, sx: 0.95, sz: -12, syaw: -Math.PI / 2 },
  // мостки песчаного островка: лодка встаёт вдоль площадки с южной стороны
  { id: 'sand', name: 'Песчаный островок', x: 17.5, z: -83.7, yaw: Math.PI / 2, sx: 17.5, sz: -86.2, syaw: Math.PI },
  // мостки у пляжа под скалой: рыбак выходит лицом к скале и арке
  { id: 'arch', name: 'Скала с аркой', x: -17, z: -83.7, yaw: Math.PI / 2, sx: -17, sz: -86.2, syaw: Math.PI }
];
export const RENT_DESK = { x: 2.3, z: -6.4, r: 2.0 };
/** Буйки у пирса и вдоль главной протоки. */
export const BUOYS = [[-13, -41], [16, -52], [-27, -12], [-40, -88]];
/** Вехи с огнём у проходов в рифе: по ним находят выход в море. Стоят по обе стороны каждого прохода. */
export const MARKS = PASSES.flatMap((p) => {
  const R = Math.hypot(p.x - LAGOON.x, p.z - LAGOON.z);
  const da = (p.w * 1.55) / R;
  return [rimAt(p.th - da, 2), rimAt(p.th + da, 2)];
});
const SAIL_BLOCKS = [
  ...ARCH_LEGS.map(([x, z]) => ({ x, z, r: ARCH.block })),
  ...STACKS.map(([x, z, w]) => ({ x, z, r: w * 0.5 + 2.6 })),
  { x: BLOOM.x, z: BLOOM.z, r: BLOOM.r + 3.2 },
  ...[...BUOYS, ...MARKS].map(([x, z]) => ({ x, z, r: 1.2 }))
];
/** Может ли здесь быть лодка: глубина под килем, не причал, не скала и не гребень рифа. */
export function canSail(x, z) {
  if (x < WORLD.x0 || x > WORLD.x1 || z < WORLD.z0 || z > WORLD.z1) return false;
  if (groundH(x, z) > -0.6) return false;
  for (const d of DECKS) if (x > d.x0 - 0.7 && x < d.x1 + 0.7 && z > d.z0 - 0.7 && z < d.z1 + 0.7) return false;
  return !inRocks(x, z);
}
/** Камни в воде: опоры арки, столбы, берег скалы, гребень рифа (кроме проходов), скалы за рифом. */
export function inRocks(x, z) {
  for (const c of SAIL_BLOCKS) if ((x - c.x) ** 2 + (z - c.z) ** 2 < c.r * c.r) return true;
  const dx = x - ROCK.x;
  const dz = z - ROCK.z;
  const rr = Math.hypot(dx, dz);
  if (rr < 34 && rr - rockR(Math.atan2(dz, dx)) < 4.6 && cayR(BEACH, x, z) > 1.5) return true;
  const m = reefM(x, z);
  if (m > -7 && m < 7 && passK(x, z) < 0.35 && homeD(x, z) < -6) return true;
  for (const o of OUTER) if (o.rock && Math.hypot(x - o.x, z - o.z) < o.r + 5) return true;
  return false;
}

/** Что за место в воде: глубина и зона ловли. null — не вода. */
export function spotAt(x, z) {
  const depth = -groundH(x, z);
  if (depth < 0.25) return null;
  const pier = deckDist(x, z) < 2.4;
  const m = reefM(x, z);
  let zone;
  if (Math.hypot(x - BACKWATER.x, z - BACKWATER.z) < BACKWATER.r && x < -25) zone = 'backwater';
  else if (Math.hypot(x - ARCH.x, z - ARCH.z) < 15) zone = 'arch';
  else if (m < -6) zone = m < -34 && depth > 9 ? 'sea' : 'edge';
  else if (pier && depth < 4.7) zone = 'pier';
  else if (depth > 5.3) zone = 'channel';
  else if (depth < 6 && (gardenK(x, z) > 0.25 || (m > 5 && m < 25 && passK(x, z) < 0.3 && homeD(x, z) < -14))) zone = 'garden';
  else zone = depth < 2.2 ? 'shallow' : 'mid';
  return { depth, zone, pier };
}

// косяки рыбы: где они могут стоять — у пирса, над садами, в протоке, у арки и за рифом
export const SCHOOL_HOMES = [
  [-8, -9], [9, -7], [13, -31], [-14, -39], [1, -45], [22, -23], [-39, 11], [-24, -19], [42, -27], [-33, 2], [-4, -33],
  [28, -64], [-18, -76], [-52, -104], [50, -112], [3.4, -125], [66, -74], [-72, -72], [92, -76], [-34, -98], [24, -136],
  [-150, -160], [170, -92], [-30, -238], [120, -236], [-200, -40]
];
/** Морские косяки: стоят за рифом — над ними кружат чайки, по птицам их и находят. */
export const SEA_HOMES = [[-190, -190], [200, -110], [-40, -262], [150, -250], [-220, -40], [250, -250], [-280, -300], [60, -350]];
/** Где кружат чайки: над скалой с аркой, пирсом, лагуной, песчаным островком и площадкой; три — над птичьим островком. */
export const GULL_SPOTS = [
  [ROCK.x, 27, ROCK.z, 25], [0, 16, -20, 20], [-30, 22, -40, 30], [SAND.x, 20, SAND.z, 22], [5, 13, 4, 14],
  [104, 12, -58, 12], [107, 9, -60, 8], [102, 16, -55, 16]
];
/** Дорога дельфинов: петля по открытому морю вокруг рифа, в стороне от скал. */
export const DOLPHIN_WAY = [
  [215, -30], [236, -120], [222, -214], [166, -272], [60, -262], [-40, -276], [-140, -262], [-206, -168], [-224, -80], [-250, -30],
  [-296, -120], [-292, -250], [-200, -330], [-40, -350], [150, -366], [270, -300], [300, -200], [262, -96]
];

// части мира: что написать в углу экрана и чем место интересно рыбаку
export const AREAS = {
  lagoon: ['ЛАГУНА', ''],
  arch: ['СКАЛА С АРКОЙ', 'Скала с аркой: под аркой — самая глубокая яма лагуны. Там живут мурена и луциан, а в сумерках выходит наполеон'],
  sand: ['ПЕСЧАНЫЙ ОСТРОВОК', 'Песчаный островок: вокруг него коралловые сады — рыба-клоун, бабочка, попугай. У костра хорошо встречать закат'],
  pass: ['ПРОТОКА', 'Протока: по глубокой воде ходят барракуда и каранкс. Через проход в рифе выходят в открытое море'],
  edge: ['КРАЙ РИФА', 'Край рифа: стена уходит в синеву. Здесь охотятся каранкс и барракуда, а из глубины поднимается наполеон'],
  sea: ['ОТКРЫТОЕ МОРЕ', 'Открытое море: скумбрия, тунец, а если повезёт — рыба-меч. Косяк ищите по чайкам: где кружит стая — там рыба']
};
export function areaAt(x, z) {
  const m = reefM(x, z);
  if (m < -34) return 'sea';
  if (m < 9) return passK(x, z) > 0.3 ? 'pass' : m < -3 ? 'edge' : 'lagoon';
  if (Math.hypot(x - ROCK.x, z - ROCK.z) < 36 || Math.hypot(x - ARCH.x, z - ARCH.z) < 24) return 'arch';
  if (cayR(SAND, x, z) < 2.7) return 'sand';
  return 'lagoon';
}
