// Рельеф «Водопадной чаши»: круглая заводь в джунглях под подковой скал. Тот же набор имён, что у бухты
// (loc/bay.js): высота земли и дна, причалы, зоны ловли, где можно ходить и плыть.
//
// База рыбака — та же, что везде: площадка с лавкой на южном берегу, пирс на север, будка проката, заводь на западе
// (здесь — с гигантскими кувшинками-викториями). Северная половина чаши — подкова отвесных скал: с неё падают
// пять водопадов разной ширины и высоты, посередине — Большой каскад в две ступени. Под ним — Котёл, самое
// глубокое место. Справа у восточного берега — Коряги (затопленные деревья), слева в воде — Скала-черепаха.
// За скалами и вокруг — холмы под джунглями, моря нет.
import { clamp, lerp, sstep, fbm2 } from '../util.js';

/** Что есть на этой локации из того, что умеет строить мир (world.js, scenery.js и др.). */
export const HAS = { island: false, lighthouse: false, cottage: false, arch: false, reef: false, cape: false, palm: false, wreck: false, skerries: false, sea: false, farIsles: false, mountains: true, cabin: false, islet: true, gulls: false, cascade: true };

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

export const BACKWATER = { x: -40, z: 13, r: 14 };
export const MARKET = { x: -5.6, z: 12.8, r: 3.2 };
export const SPAWN = { x: -2, z: 9 };
/** Середина чаши и её полуоси: берег — неровный овал вокруг неё (кроме южного берега, где стоит база). */
export const BASIN = { x: 4, z: -38, a: 84, b: 52 };
export const BOUNDS = { x0: -176, x1: 186, z0: -196, z1: 100 }; // подробный рельеф: чаша и склоны вокруг
export const WORLD = { x0: -86, x1: 94, z0: -100, z1: 40 }; // куда можно доплыть на лодке
export const SEA = { x: BASIN.x, z: BASIN.z, r: 1e4 }; // моря нет: зыби и морской зоны не бывает
export const MAP_VIEW = { x0: -100, x1: 108, z0: -110, z1: 44 }; // мини-карта: вся чаша
/** Скала-черепаха: каменный островок с большим деревом, слева от пирса. */
export const ISLET = { x: -38, z: -48, r: 8.5, top: 4.2 };
/** Коряги: затопленные деревья у восточного берега. trunks: [вправо, вниз по карте, длина, наклон, поворот] */
export const SNAGS = { x: 56, z: -26, r: 16 };
/** Котёл — яма под Большим каскадом, самое глубокое место чаши. */
export const PIT = { x: 4, z: -76, r: 16 };

// настилы: база та же, что в бухте и на озере (late — кладутся отдельным проходом)
export const DECKS = [
  { id: 'deck', x0: -14, x1: 6, z0: 4, z1: 16, along: 'z' },
  { id: 'pier', x0: -1.6, x1: 1.6, z0: -22, z1: 4, along: 'z' },
  { id: 'head', x0: -6, x1: 6, z0: -27, z1: -22, along: 'x' },
  { id: 'walk', x0: -29, x1: -14, z0: 7.5, z1: 10.3, along: 'x' },
  { id: 'west', x0: -35, x1: -29, z0: 5, z1: 12.5, along: 'x' },
  { id: 'rental', x0: 1.6, x1: 5.6, z0: -8.6, z1: -4.2, along: 'z', late: true }
];
export const BOXES = [{ x0: -13.4, x1: -6.9, z0: 10.0, z1: 15.7 }];
export const CIRCLES = [
  { x: -12.4, z: 5.6, r: 0.75 }, { x: -11.2, z: 5.3, r: 0.6 }, { x: 4.6, z: 14.6, r: 0.8 }, { x: 4.9, z: 5.2, r: 0.55 },
  { x: -5.9, z: 15.2, r: 0.55 }, { x: 5.2, z: -26.2, r: 0.45 },
  { x: -5.0, z: -22.9, r: 0.5 }, { x: -29.8, z: 5.8, r: 0.5 }, { x: 4.9, z: 7.5, r: 0.55 }, { x: 7.7, z: 12.6, r: 0.5 }
];

/** Южный берег у базы: как в бухте — ровная кромка с заводью на западе. Дальше берег замыкает овал чаши. */
export function shoreZ(x) {
  let s = 13 + 1.8 * Math.sin((x + 4) * 0.045) * sstep(8, 30, Math.abs(x + 4));
  const t = (x - BACKWATER.x) / 13;
  s += 11 * Math.exp(-t * t);
  return s;
}
/** Радиус берега в долях овала по направлению от середины: неровный, с заливами и мысами. */
function rim(th) {
  return 1 + 0.07 * Math.sin(3 * th + 1.2) + 0.045 * Math.sin(5 * th + 2.6) + 0.03 * Math.sin(9 * th + 0.4) + 0.018 * Math.sin(14 * th + 1.7);
}
/**
 * Насколько точка «в воде»: метры до берега, больше нуля — вода, меньше — суша. Берег — ближайшее из двух:
 * южная кромка у базы и овал чаши; стык сглажен.
 */
export function waterD(x, z) {
  const dx = x - BASIN.x;
  const dz = z - BASIN.z;
  const th = Math.atan2(dz, dx);
  const rho = Math.hypot(dx / BASIN.a, dz / BASIN.b);
  const ring = (1 - rho / rim(th)) * 80;
  const south = shoreZ(x) - z;
  const k = 9;
  const h = clamp(0.5 + (0.5 * (ring - south)) / k, 0, 1);
  return lerp(ring, south, h) - k * h * (1 - h);
}

// ── подкова скал на севере ──
const WALL_TH = -Math.PI / 2; // середина подковы — точно на север от середины чаши: с пирса она прямо по курсу
/** Угол от середины подковы (−π…π). */
function wallD(x, z) {
  const d = Math.atan2(z - BASIN.z, x - BASIN.x) - WALL_TH;
  return Math.atan2(Math.sin(d), Math.cos(d));
}
/** 0…1 — насколько берег здесь отвесная скала: вся северная половина, к краям подковы сходит на нет. */
function cliffK(x, z) {
  return sstep(1.12, 0.8, Math.abs(wallD(x, z)));
}
/**
 * Высота стены по углу: посередине, над Большим каскадом, — самая высокая, к краям подковы ниже.
 * Стена везде в две ступени: нижняя — до полки на 0,42 высоты, на полке мох и кусты, выше — верхняя ступень.
 * Водопады падают с верхней кромки на полку и уже с неё — в чашу, как в каскаде.
 */
function wallH(dth) {
  return 23 + 14 * Math.exp(-((dth / 0.34) ** 2)) + 2.5 * Math.sin(dth * 9 + 0.7);
}
/** Доля высоты, на которой полка (0,42), и где по глубине суши ступени: [низ от, низ до, полка до, верх до]. */
export const LEDGE = { k: 0.42, d: [-0.6, 2.4, 5.4, 8.2] };

function isletH(x, z) {
  const r = Math.hypot(x - ISLET.x, z - ISLET.z);
  if (r > ISLET.r * 4) return -99;
  const a = Math.atan2(z - ISLET.z, x - ISLET.x);
  // «черепаха»: вытянутая горбатая спина, голова — мысок на восток
  const R = ISLET.r * (1 + 0.22 * Math.cos(a) * Math.cos(a) - 0.1 + 0.08 * Math.sin(3 * a + 0.4) + 0.18 * Math.exp(-((a / 0.25) ** 2)));
  const c = sstep(R + 1.2, R - 3.4, r);
  const top = ISLET.top + 1.3 * fbm2(x * 0.18 + 3, z * 0.18 + 8, 2) - 0.5;
  const shelf = -0.9 - 20 * sstep(R, R + 24, r);
  return shelf * (1 - c) + top * Math.pow(c, 0.6);
}
function rawH(x, z) {
  const w = waterD(x, z);
  const cl = cliffK(x, z);
  let h = -9.5 * Math.pow(sstep(0, 52, w), 0.9); // дно: полка у берега, дальше — глубина (на суше — ноль)
  if (w > 0 && w < 44) h -= 5 * cl * sstep(0, 5, w) * sstep(44, 14, w); // под скалами сразу глубоко: туда падает вода
  if (w > 1.6) {
    h += (fbm2(x * 0.09, z * 0.09, 3) - 0.5) * 1.1 * sstep(6, 30, w);
    // Котёл под Большим каскадом
    h -= 9 * Math.exp(-((x - PIT.x) ** 2 + (z - PIT.z) ** 2) / (PIT.r * PIT.r * 0.5)) * sstep(3, 16, w);
  } else {
    const d = -w; // метры вглубь суши (у самой кромки — чуть отрицательные: это ещё вода)
    // пологий берег у базы и по краям подковы; под стеной — скала прямо из воды
    h += 1.12 * sstep(-1.5, 3, d) * (1 - cl);
    if (cl > 0.001) {
      const H = wallH(wallD(x, z));
      // стена в две ступени с полкой между ними
      const [a0, a1, b0, b1] = LEDGE.d;
      const wall = LEDGE.k * sstep(a0, a1, d) + (1 - LEDGE.k) * sstep(b0, b1, d);
      h += cl * H * wall;
      // над стеной — плато с джунглями, понемногу поднимается
      if (d > 4) h += cl * (0.06 * Math.min(d - 4, 60) + 4 * sstep(10, 50, d) * fbm2(x * 0.04 + 5, z * 0.04 + 2, 3));
    }
    if (d > 3) {
      const open = 1 - cl;
      h += open * 0.035 * Math.min(d - 3, 30);
      // холмы под джунглями вокруг чаши, дальше — гряды зелёных гор (без снега)
      h += open * 8 * sstep(9, 46, d) * (0.45 + 0.55 * fbm2(x * 0.035, z * 0.035, 3));
      h += 24 * sstep(30 + 30 * open, 120, d) * (0.45 + 0.9 * fbm2(x * 0.011 + 3, z * 0.011 + 7, 4));
      const m = fbm2(x * 0.0052 + 1, z * 0.0052 + 11, 3);
      h += 48 * sstep(110, 340, d) * (0.3 + 1.2 * m);
      const rg = 1 - Math.abs(2 * fbm2(x * 0.009 + 20, z * 0.009 + 5, 3) - 1);
      h += 46 * sstep(180, 460, d) * rg * rg * (0.4 + 1.0 * m);
    }
  }
  const hi = isletH(x, z);
  if (hi > h) h = hi;
  return h;
}
export const groundH = rawH;
/** Точка берега на луче из середины чаши под углом th. */
export function shoreAt(th) {
  const m = shorePoint(th);
  return [BASIN.x + Math.cos(th) * m, BASIN.z + Math.sin(th) * m];
}
/** Насколько берег в этой стороне от середины чаши отвесен (0…1): подкова скал. */
export const cliffAt = (x, z) => cliffK(x, z);
export { cliffK, wallD };

function shorePoint(th) {
  const cx = Math.cos(th);
  const cz = Math.sin(th);
  let lo = 15;
  let hi = 200;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (waterD(BASIN.x + cx * m, BASIN.z + cz * m) > 0) lo = m;
    else hi = m;
  }
  return lo;
}
/**
 * Пять водопадов на подкове: [угол от середины стены, полуширина струи, облако пыли, на сколько метров от кромки
 * воды вглубь начинается струя]. Все начинаются за верхней ступенью (8,6 м от воды), падают на полку и уже с неё —
 * в чашу. Посередине — Большой каскад над Котлом, по бокам — две струи средних, у краёв — две тонкие пряди.
 */
const FALL_DEF = [
  [0, 4.6, 16, 8.6],
  [-0.33, 2.7, 11, 8.6],
  [0.31, 2.5, 11, 8.6],
  [-0.6, 1.5, 7.5, 8.6],
  [0.58, 1.6, 7.5, 8.6]
];
export const FALLS = FALL_DEF.map(([dth, w, spray, inland]) => {
  const th = WALL_TH + dth;
  const R = shorePoint(th);
  const rx = Math.cos(th);
  const rz = Math.sin(th);
  const at = (m) => [BASIN.x + rx * m, BASIN.z + rz * m];
  const [x, z] = at(R + inland);
  const [bx, bz] = at(R - 2.6);
  const [tx, tz] = at(R + inland + 5);
  return { x, z, nx: -rx, nz: -rz, bx, bz, top: groundH(tx, tz), w, spray, main: dth === 0 };
});

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
export const MOORINGS = [{ id: 'home', name: 'Водопадная чаша', rent: true, x: 4.0, z: -12, yaw: -0.6, sx: 0.95, sz: -12, syaw: -Math.PI / 2 }];
export const RENT_DESK = { x: 2.3, z: -6.4, r: 2.0 };
/** Буйки: у пирса и на краю Котла — дальше под каскадом лодку бьёт струя. */
export const BUOYS = [[-14, -36], [16, -32], [-27, -12], [PIT.x - 13, PIT.z + 10], [PIT.x + 14, PIT.z + 9]];
export const MARKS = [];
/** Стволы коряг: [x, z, длина, наклон к воде, поворот] — торчат из воды, о них лодка спотыкается. */
export const SNAG_TRUNKS = [
  [50, -18, 9, 0.5, 0.4], [58, -23, 7, 0.75, 2.2], [53, -32, 11, 0.42, 1.2], [64, -34, 6, 0.9, 3.6],
  [45, -27, 5, 1.0, 5.1], [61, -14, 8, 0.6, 4.4], [68, -25, 6.5, 0.7, 0.9]
];
const SAIL_BLOCKS = [...BUOYS.map(([x, z]) => ({ x, z, r: 1.2 })), ...SNAG_TRUNKS.map(([x, z]) => ({ x, z, r: 2.2 }))];
export function canSail(x, z) {
  if (x < WORLD.x0 || x > WORLD.x1 || z < WORLD.z0 || z > WORLD.z1) return false;
  if (groundH(x, z) > -0.6) return false;
  for (const d of DECKS) if (x > d.x0 - 0.7 && x < d.x1 + 0.7 && z > d.z0 - 0.7 && z < d.z1 + 0.7) return false;
  return !inRocks(x, z);
}
/** Камни и струи в воде: берег Скалы-черепахи, коряги, кипень под водопадами, подножие стены. */
export function inRocks(x, z) {
  for (const c of SAIL_BLOCKS) if ((x - c.x) ** 2 + (z - c.z) ** 2 < c.r * c.r) return true;
  if (Math.hypot(x - ISLET.x, z - ISLET.z) < ISLET.r + 3) return true;
  for (const f of FALLS) if ((x - f.bx) ** 2 + (z - f.bz) ** 2 < (f.main ? 7.5 : 4.5) ** 2) return true;
  const w = waterD(x, z);
  if (w < 5 && cliffK(x, z) > 0.35) return true;
  return false;
}

/** Что за место в воде: глубина и зона ловли. null — не вода. */
export function spotAt(x, z) {
  const depth = -groundH(x, z);
  if (depth < 0.25) return null;
  const pier = deckDist(x, z) < 2.4;
  let zone;
  if (Math.hypot(x - BACKWATER.x, z - BACKWATER.z) < BACKWATER.r && x < -25) zone = 'backwater';
  else if (Math.hypot(x - PIT.x, z - PIT.z) < PIT.r && depth > 11) zone = 'pit';
  else if (FALLS.some((f) => (x - f.bx) ** 2 + (z - f.bz) ** 2 < (f.main ? 196 : 144))) zone = 'falls';
  else if (Math.hypot(x - SNAGS.x, z - SNAGS.z) < SNAGS.r) zone = 'snags';
  else if (Math.hypot(x - ISLET.x, z - ISLET.z) < ISLET.r + 12) zone = 'stones';
  else if (pier && depth < 3.8) zone = 'pier';
  else zone = depth < 2.5 ? 'shallow' : depth < 6 ? 'mid' : 'deep';
  return { depth, zone, pier };
}

// косяки рыбы: где они могут стоять
export const SCHOOL_HOMES = [
  [-8, -9], [9, -7], [13, -31], [-14, -39], [1, -45], [22, -23], [-39, 11], [-24, -19], [42, -27], [-33, 2], [-4, -33],
  [54, -26], [-36, -36], [-56, -50], [30, -60], [-28, -66], [36, -70], [-56, -26], [64, -46], [PIT.x - 8, PIT.z + 4], [PIT.x + 9, PIT.z + 2]
].filter(([x, z]) => groundH(x, z) < -1.5);
export const SEA_HOMES = [];
/** Дельфинов здесь нет: их «дорога» лежит далеко за краем мира. */
export const DOLPHIN_WAY = [[NOWHERE, NOWHERE], [NOWHERE + 60, NOWHERE], [NOWHERE + 60, NOWHERE + 60], [NOWHERE, NOWHERE + 60]];

// части чаши: что написать в углу экрана и чем место интересно рыбаку
export const AREAS = {
  basin: ['ЧАША', ''],
  falls: ['КАСКАД', 'Каскад: у подножия водопадов держатся павлиний окунь и арована, а на заре выходит золотая дорада'],
  pit: ['КОТЁЛ', 'Котёл: глубокая яма под Большим каскадом — здесь лежат арапайма и сом, ночью выходит электрический угорь'],
  islet: ['СКАЛА-ЧЕРЕПАХА', 'Скала-черепаха: у камней стоят пираньи и павлиний окунь'],
  snags: ['КОРЯГИ', 'Коряги: затопленные деревья — пираньи, паку и арована держатся в их тени'],
  backwater: ['ЗАВОДЬ ВИКТОРИЙ', 'Заводь викторий: под огромными листьями кувшинок — дискус и паку']
};
export function areaAt(x, z) {
  if (Math.hypot(x - PIT.x, z - PIT.z) < PIT.r + 4 && -groundH(x, z) > 9) return 'pit';
  if (FALLS.some((f) => (x - f.bx) ** 2 + (z - f.bz) ** 2 < 24 * 24)) return 'falls';
  if (Math.hypot(x - ISLET.x, z - ISLET.z) < ISLET.r + 16) return 'islet';
  if (Math.hypot(x - SNAGS.x, z - SNAGS.z) < SNAGS.r + 8) return 'snags';
  if (Math.hypot(x - BACKWATER.x, z - BACKWATER.z) < BACKWATER.r + 6) return 'backwater';
  return 'basin';
}
