// Рельеф «Синего простора»: скалистый остров посреди океана. Тот же набор имён, что у бухты (loc/bay.js):
// высота земли и дна, причалы, зоны ловли, где можно ходить и плыть.
//
// База рыбака — та же, что везде: площадка с лавкой, пирс на юг (к −z), будка проката, тихая бухточка на западе.
// Стоит она в излучине южного берега острова Маяка: позади — травяные склоны и голая вершина, по бокам — обрывы.
// Прямо по курсу справа — Маячная скала с маяком и домиком смотрителя (к ней — мостки), слева вдали — Тюленьи камни.
// От острова дно уходит свалом в синеву; далеко на юго-востоке — Банка, подводное плато, где ходят тунцы,
// а поперёк океана тянется Течение — полоса плавучих водорослей, вдоль которой охотятся парусник и марлин.
import { clamp, lerp, sstep, fbm2 } from '../util.js';

/** Что есть на этой локации из того, что умеет строить мир (world.js, scenery.js и др.). */
export const HAS = { island: false, lighthouse: true, cottage: true, arch: false, reef: false, cape: false, palm: false, wreck: false, skerries: false, sea: true, farIsles: false, mountains: false, cabin: false, islet: false, gulls: true, keys: false, blue: true };

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
export const islandR = () => 1;
export const capeDist = () => NOWHERE;
export const palmR = () => NOWHERE;
export const FALLS = [];

export const BACKWATER = { x: -40, z: 13, r: 14 }; // тихая бухточка к западу от причала: камни и бурые водоросли
export const MARKET = { x: -5.6, z: 12.8, r: 3.2 };
export const SPAWN = { x: -2, z: 9 };

/** Остров Маяка (домашний): середина и средний радиус по кромке воды. */
export const HOME = { x: -4, z: 84, R: 71, top: 46 };
/** Маячная скала: каменный островок с плоской макушкой справа по курсу от пирса. */
export const LIGHT_ROCK = { x: 66, z: -88, R: 16.5, top: 9.2 };
/** Тюленьи камни: скалы в море слева вдали — [x, z, поперечник у воды, высота]. */
export const SEALS = { x: -128, z: -150, rocks: [[0, 0, 9, 7.5], [11, 6, 6, 4.5], [-9, 9, 7, 5.8], [4, -11, 5, 3.6], [-14, -6, 4, 2.6]] };
/** Банка: подводное плато далеко на юго-востоке — мель среди синевы. */
export const BANK = { x: 235, z: -285, r: 72, d: 8 };
/** Течение: полоса плавучих водорослей поперёк океана — от a до b, полуширина w. */
export const CURRENT = { ax: -560, az: -250, bx: 560, bz: -520, w: 26 };

export const BOUNDS = { x0: -230, x1: 230, z0: -230, z1: 175 }; // подробный рельеф: остров, свал, Маячная скала и Тюленьи камни
export const WORLD = { x0: -560, x1: 560, z0: -640, z1: 240 }; // куда можно доплыть на лодке
export const SEA = { x: 0, z: 2, r: 42 }; // дальше этого круга — открытый океан с зыбью
export const MAP_VIEW = { x0: -250, x1: 250, z0: -192, z1: 76 }; // мини-карта: база, Маячная скала и Тюленьи камни

/** Маяк на Маячной скале и домик смотрителя рядом с ним — на площадке, выровненной в скале. */
export const LIGHTHOUSE = { x: LIGHT_ROCK.x + 5.5, z: LIGHT_ROCK.z - 4 };
export const COTTAGE = { x: LIGHT_ROCK.x - 5, z: LIGHT_ROCK.z + 1.2, s: 7.4, ry: Math.PI / 2 + 0.25, y: LIGHT_ROCK.top + 0.35, pad: [4.4, 3.0, 2.2] };
const PAD_C = Math.cos(COTTAGE.ry);
const PAD_S = Math.sin(COTTAGE.ry);
/** Координаты вдоль и поперёк домика смотрителя. */
export const cottageUV = (x, z) => [(x - COTTAGE.x) * PAD_C - (z - COTTAGE.z) * PAD_S, (x - COTTAGE.x) * PAD_S + (z - COTTAGE.z) * PAD_C];
/** Костёр — на площадке у маяка (звук и свет): смотритель жжёт его по вечерам. */
export const CAMPFIRE = { x: LIGHT_ROCK.x - 2, z: LIGHT_ROCK.z - 7 };

// настилы: база та же, что везде, плюс мостки Маячной скалы (late — кладутся отдельным проходом)
export const DECKS = [
  { id: 'deck', x0: -14, x1: 6, z0: 4, z1: 16, along: 'z' },
  { id: 'pier', x0: -1.6, x1: 1.6, z0: -22, z1: 4, along: 'z' },
  { id: 'head', x0: -6, x1: 6, z0: -27, z1: -22, along: 'x' },
  { id: 'walk', x0: -29, x1: -14, z0: 7.5, z1: 10.3, along: 'x' },
  { id: 'west', x0: -35, x1: -29, z0: 5, z1: 12.5, along: 'x' },
  { id: 'rental', x0: 1.6, x1: 5.6, z0: -8.6, z1: -4.2, along: 'z', late: true },
  // мостки Маячной скалы: от лестницы вдоль западного бока скалы
  { id: 'lightwalk', x0: 42.6, x1: 50.2, z0: -87.4, z1: -84.8, along: 'x', late: true },
  { id: 'light', x0: 37.6, x1: 42.6, z0: -90.5, z1: -81.5, along: 'x', late: true }
];
export const BOXES = [{ x0: -13.4, x1: -6.9, z0: 10.0, z1: 15.7 }];
export const CIRCLES = [
  { x: -12.4, z: 5.6, r: 0.75 }, { x: -11.2, z: 5.3, r: 0.6 }, { x: 4.6, z: 14.6, r: 0.8 }, { x: 4.9, z: 5.2, r: 0.55 },
  { x: -5.9, z: 15.2, r: 0.55 }, { x: 5.2, z: -26.2, r: 0.45 },
  { x: -5.0, z: -22.9, r: 0.5 }, { x: -29.8, z: 5.8, r: 0.5 }, { x: 4.9, z: 7.5, r: 0.55 }, { x: 7.7, z: 12.6, r: 0.5 },
  // мостки Маячной скалы: ящик и сети
  { x: 38.6, z: -82.6, r: 0.45 }, { x: 41.4, z: -89.6, r: 0.5 }
];

/** Мягкий минимум: на стыке двух берегов кромка скруглена. */
function smin(a, b, k) {
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return lerp(b, a, h) - k * h * (1 - h);
}
/** Расстояние от точки до отрезка (ax, az)–(bx, bz). */
function segDist(x, z, ax, az, bx, bz) {
  const dx = bx - ax;
  const dz = bz - az;
  const t = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz), 0, 1);
  return Math.hypot(x - ax - dx * t, z - az - dz * t);
}

// ── остров Маяка ──
/** Южный берег у базы: ровная кромка с бухточкой на западе (та же, что в бухте). */
export function shoreZ(x) {
  let s = 13 + 1.6 * Math.sin((x + 4) * 0.045) * sstep(8, 30, Math.abs(x + 4));
  const t = (x - BACKWATER.x) / 13;
  s += 11 * Math.exp(-t * t);
  return s;
}
/** Радиус острова по кромке воды в направлении th от середины. */
export function homeR(th) {
  return HOME.R * (1 + 0.07 * Math.sin(3 * th + 1.2) + 0.05 * Math.sin(5 * th + 0.4) + 0.03 * Math.sin(9 * th + 2.0) + 0.02 * Math.sin(14 * th + 0.7));
}
/** Метры вглубь острова от ближайшего берега: больше нуля — суша, меньше — вода. */
export function homeD(x, z) {
  const dx = x - HOME.x;
  const dz = z - HOME.z;
  const r = Math.hypot(dx, dz);
  const blob = homeR(Math.atan2(dz, dx)) - r;
  // у базы берег ровный: южная кромка — по shoreZ, к краям излучины переходит в общий контур острова
  const k = sstep(70, 40, Math.abs(x + 6)) * sstep(48, 30, z);
  return k > 0 ? lerp(blob, smin(z - shoreZ(x), blob + 30, 12), k) : blob;
}
/** Насколько берег здесь обрывистый: у базы — пологий пляж, по остальному кругу — скалы. */
export function cliffK(x, z) {
  return 1 - sstep(64, 36, Math.abs(x + 6)) * sstep(60, 24, z);
}
function homeH(x, z) {
  const D = homeD(x, z);
  if (D < -120) return -99;
  const n1 = fbm2(x * 0.045 + 2, z * 0.045 + 6, 3);
  const cl = cliffK(x, z);
  if (D < 0) {
    // под водой: у пляжа — пологий песчаный откос, под обрывами — камень круто уходит вниз
    const fall = lerp(5.4, 13, cl); // у пирса — как в бухте: у головы пирса ещё зона «у свай»
    // дальше полка продолжает опускаться и сходится с дном океана (oceanFloor) без ступеньки
    return -fall * Math.pow(sstep(0, lerp(52, 30, cl), -D), lerp(0.9, 0.7, cl)) - 12 * sstep(lerp(42, 26, cl), 110, -D);
  }
  // пляж у базы: те же первые метры, что в бухте
  let h = 1.12 * sstep(-1.5, 3, D);
  if (D > 3) h += 0.035 * Math.min(D - 3, 30);
  // обрывы: стена до 12–20 м в первые метры от воды, наверху — травяное плато
  const wall = (12 + 8 * n1) * sstep(0.5, 7, D);
  h = lerp(h, wall, cl);
  // склоны к вершине (к северу от середины острова)
  const dt = Math.hypot(x - HOME.x - 6, z - HOME.z - 14);
  h += HOME.top * Math.pow(sstep(62, 4, dt), 1.6) * (0.85 + 0.3 * n1);
  // мелкие бугры травы
  h += 1.4 * sstep(6, 22, D) * (fbm2(x * 0.11 + 7, z * 0.11 + 1, 2) - 0.5);
  return h;
}

// ── скалы в море ──
/** Радиус Маячной скалы по кромке воды в направлении th. */
export function lightR(th) {
  return LIGHT_ROCK.R * (1 + 0.11 * Math.sin(3 * th + 0.4) + 0.07 * Math.sin(5 * th + 2.0) + 0.04 * Math.sin(8 * th + 1.1));
}
function lightH(x, z) {
  const dx = x - LIGHT_ROCK.x;
  const dz = z - LIGHT_ROCK.z;
  const r = Math.hypot(dx, dz);
  if (r > 80) return -99;
  const R = lightR(Math.atan2(dz, dx));
  const c = sstep(R + 1.2, R - 3.6, r);
  // макушка ровная: на ней маяк и домик смотрителя (площадка под домик выровнена)
  let top = LIGHT_ROCK.top + 0.9 * (fbm2(x * 0.12 + 5, z * 0.12 + 1, 2) - 0.5) * sstep(R - 9, R - 3, r);
  const [u, v] = cottageUV(x, z);
  const pd = Math.hypot(Math.max(Math.abs(u) - COTTAGE.pad[0], 0), Math.max(Math.abs(v) - COTTAGE.pad[1], 0));
  if (pd < COTTAGE.pad[2]) top = lerp(top, COTTAGE.y, sstep(COTTAGE.pad[2], 0, pd));
  const shelf = -1.2 - 26 * sstep(R, R + 34, r);
  return shelf * (1 - c) + top * Math.pow(c, 0.55);
}
/** Каменный столб с полкой вокруг: Тюленьи камни. */
function stackH(x, z, cx, cz, R, top) {
  const r = Math.hypot(x - cx, z - cz);
  if (r > R * 4 + 30) return -99;
  const a = Math.atan2(z - cz, x - cx);
  const Rk = R * (1 + 0.16 * Math.sin(3 * a + cx) + 0.09 * Math.sin(5 * a + cz));
  const c = sstep(Rk + 1, Rk - Math.min(2.6, R * 0.5), r);
  const t = top + 0.8 * (fbm2(x * 0.2 + 3 + cx, z * 0.2 + 8, 2) - 0.5);
  const shelf = -1.4 - 24 * sstep(Rk, Rk + 26, r);
  return shelf * (1 - c) + t * Math.pow(c, 0.6);
}
function sealsH(x, z) {
  if (Math.abs(x - SEALS.x) > 120 || Math.abs(z - SEALS.z) > 120) return -99;
  let h = -99;
  for (const [ox, oz, w, top] of SEALS.rocks) {
    const v = stackH(x, z, SEALS.x + ox, SEALS.z + oz, w / 2, top);
    if (v > h) h = v;
  }
  return h;
}

// ── дно океана ──
/** Насколько точка на Банке: 0 — синева, 1 — середина плато. */
export function bankK(x, z) {
  const d = Math.hypot(x - BANK.x, (z - BANK.z) * 1.25);
  if (d > BANK.r * 1.6) return 0;
  return sstep(BANK.r * 1.05, BANK.r * 0.55, d + 14 * (fbm2(x * 0.02 + 4, z * 0.02 + 9, 2) - 0.5));
}
/** Расстояние до оси Течения, м. */
export function currentD(x, z) {
  // полоса чуть извивается
  const w = 22 * Math.sin(x * 0.011 + 1.3) + 12 * Math.sin(x * 0.027 + 0.4);
  return segDist(x, z - w, CURRENT.ax, CURRENT.az, CURRENT.bx, CURRENT.bz);
}
/** Насколько точка в Течении: 1 — на оси полосы. */
export function currentK(x, z) {
  const d = currentD(x, z);
  return d > CURRENT.w * 2.5 ? 0 : Math.exp(-((d / CURRENT.w) ** 2));
}
/** Дно без островов: свал от острова в синеву, Банка. */
function oceanFloor(x, z) {
  const r = Math.hypot(x - HOME.x, z - HOME.z * 0.5);
  // у острова — полка, за ней свал; дальше — глубина, которую уже не видно
  let h = lerp(-14, -48, sstep(120, 240, r)) + 3 * (fbm2(x * 0.02 + 1, z * 0.02 + 5, 3) - 0.5);
  const bk = bankK(x, z);
  if (bk > 0) h = lerp(h, -BANK.d - 2.5 * (fbm2(x * 0.06 + 3, z * 0.06 + 2, 2) - 0.5), bk);
  return h;
}

export function groundH(x, z) {
  let h = oceanFloor(x, z);
  let v = homeH(x, z);
  if (v > h) h = v;
  if (Math.abs(x - LIGHT_ROCK.x) < 90 && Math.abs(z - LIGHT_ROCK.z) < 90) {
    v = lightH(x, z);
    if (v > h) h = v;
  }
  v = sealsH(x, z);
  if (v > h) h = v;
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
/** Можно ли стоять в точке: настилы и пляж у базы — по песку и в воду по колено. На обрывы и скалы не забраться. */
export function canStand(x, z, skip = null) {
  for (const b of BOXES) if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1 && !(skip && skip.includes(b))) return false;
  for (const c of CIRCLES) if ((x - c.x) ** 2 + (z - c.z) ** 2 < c.r * c.r && !(skip && skip.includes(c))) return false;
  if (onDecks(x, z)) return true;
  const h = groundH(x, z);
  if (h < -WADE) return false;
  // пляж и склон над базой: дальше склон становится круче — туда не ходят
  return homeD(x, z) > -9 && cliffK(x, z) < 0.4 && z < 62 && h < 9;
}

// ── лодка ──
export const MOORINGS = [
  { id: 'home', name: 'Синий простор', rent: true, x: 4.0, z: -12, yaw: -0.6, sx: 0.95, sz: -12, syaw: -Math.PI / 2 },
  // мостки Маячной скалы: лодка встаёт вдоль площадки с западной стороны, рыбак выходит лицом к маяку
  { id: 'light', name: 'Маячная скала', x: 35.1, z: -86, yaw: 0, sx: 37.9, sz: -86, syaw: -Math.PI / 2 }
];
export const RENT_DESK = { x: 2.3, z: -6.4, r: 2.0 };
/** Буйки у пирса и вдоль фарватера к Маячной скале. */
export const BUOYS = [[-13, -41], [16, -52], [-27, -12], [26, -78]];
/** Вехи с огнём: у Тюленьих камней (камни под водой) и на краю Банки. */
export const MARKS = [[SEALS.x + 26, SEALS.z - 8], [SEALS.x - 8, SEALS.z + 28], [BANK.x - BANK.r * 0.85, BANK.z + 30], [BANK.x + 20, BANK.z + BANK.r * 0.8]];
const SAIL_BLOCKS = [...[...BUOYS, ...MARKS].map(([x, z]) => ({ x, z, r: 1.2 }))];
/** Может ли здесь быть лодка: глубина под килем, не причал и не скала. */
export function canSail(x, z) {
  if (x < WORLD.x0 || x > WORLD.x1 || z < WORLD.z0 || z > WORLD.z1) return false;
  if (groundH(x, z) > -0.6) return false;
  for (const d of DECKS) if (x > d.x0 - 0.7 && x < d.x1 + 0.7 && z > d.z0 - 0.7 && z < d.z1 + 0.7) return false;
  return !inRocks(x, z);
}
/** Камни в воде: под обрывами острова, у Маячной скалы и Тюленьих камней. */
export function inRocks(x, z) {
  for (const c of SAIL_BLOCKS) if ((x - c.x) ** 2 + (z - c.z) ** 2 < c.r * c.r) return true;
  const dx = x - LIGHT_ROCK.x;
  const dz = z - LIGHT_ROCK.z;
  const rr = Math.hypot(dx, dz);
  if (rr < 30 && rr - lightR(Math.atan2(dz, dx)) < 3.6 && !(x < 44 && x > 30 && z > -93 && z < -79)) return true;
  for (const [ox, oz, w] of SEALS.rocks) if (Math.hypot(x - SEALS.x - ox, z - SEALS.z - oz) < w / 2 + 3.5) return true;
  // под обрывами острова камни: подходить вплотную нельзя
  if (cliffK(x, z) > 0.5 && homeD(x, z) > -5) return true;
  return false;
}

/** Что за место в воде: глубина и зона ловли. null — не вода. */
export function spotAt(x, z) {
  const depth = -groundH(x, z);
  if (depth < 0.25) return null;
  const pier = deckDist(x, z) < 2.4;
  const far = Math.hypot(x - HOME.x, z - HOME.z * 0.5);
  let zone;
  if (Math.hypot(x - BACKWATER.x, z - BACKWATER.z) < BACKWATER.r && x < -25) zone = 'backwater';
  else if (Math.hypot(x - SEALS.x, z - SEALS.z) < 46) zone = 'reef';
  else if (bankK(x, z) > 0.45) zone = 'bank';
  else if (currentK(x, z) > 0.35) zone = 'current';
  else if (pier && depth < 4.7) zone = 'pier';
  else if (far > 175 || depth > 26) zone = 'sea';
  else if (depth > 9) zone = 'deep';
  else zone = depth < 2.5 ? 'shallow' : 'mid';
  return { depth, zone, pier };
}

// косяки рыбы: у пирса, у Маячной скалы, на свале, у Тюленьих камней, на Банке и вдоль Течения
export const SCHOOL_HOMES = [
  [-8, -9], [9, -7], [13, -31], [-14, -39], [1, -45], [22, -23], [-39, 11], [-24, -19], [42, -27], [-33, 2], [-4, -33],
  [44, -66], [80, -110], [-60, -70], [-100, -120], [30, -120], [-150, -40], [120, -40], [0, -150], [-160, -180]
];
/** Океанские косяки: на Банке и вдоль Течения — над ними кружат птицы, по птицам их и находят. */
export const SEA_HOMES = [[235, -285], [190, -250], [270, -320], [-300, -330], [-120, -300], [60, -380], [300, -420], [-420, -280]];
/** Где кружат чайки: над Маячной скалой, пирсом, площадкой, Тюленьими камнями и обрывами острова. */
export const GULL_SPOTS = [
  [LIGHT_ROCK.x, 26, LIGHT_ROCK.z, 22], [0, 16, -20, 20], [5, 13, 4, 14], [SEALS.x, 14, SEALS.z, 18],
  [-60, 34, 60, 30], [56, 30, 46, 26], [SEALS.x + 6, 10, SEALS.z + 4, 9]
];
/** Дорога дельфинов: петля по открытому океану вокруг острова и скал. */
export const DOLPHIN_WAY = [
  [180, -40], [240, -160], [220, -280], [120, -330], [0, -300], [-110, -260], [-220, -220], [-260, -110], [-250, 20],
  [-300, -150], [-330, -330], [-200, -440], [0, -470], [200, -460], [330, -380], [360, -220], [300, -80]
];

/** Дорога китов: широкая петля вокруг острова — между ним и Банкой, их фонтаны видно с причала. */
export const WHALE_WAY = [[-320, -170], [-130, -260], [80, -250], [270, -170], [350, -20], [280, 130], [70, 230], [-170, 210], [-340, 70]];

// части мира: что написать в углу экрана и чем место интересно рыбаку
export const AREAS = {
  home: ['ОСТРОВ МАЯКА', ''],
  light: ['МАЯЧНАЯ СКАЛА', 'Маячная скала: с её мостков достают до свала — здесь ходят сибас, морской окунь и корифена'],
  seals: ['ТЮЛЕНЬИ КАМНИ', 'Тюленьи камни: на рассвете и в сумерках тут охотится белая акула. Подходить на лодке — осторожно'],
  drop: ['СВАЛ', 'Свал: дно острова обрывается в синеву. Скумбрия, ставрида, а из глубины поднимаются тунцы'],
  bank: ['БАНКА', 'Банка: подводное плато среди океана. Желтопёрый тунец, ваху, а иногда — тунец-гигант'],
  current: ['ТЕЧЕНИЕ', 'Течение: полоса плавучих водорослей. Под ней держатся корифена и летучие рыбы — а за ними охотятся парусник и марлин'],
  sea: ['СИНЕВА', 'Синева: открытый океан. Марлин, мако, рыба-меч — нужна морская удочка и багор']
};
export function areaAt(x, z) {
  if (Math.hypot(x - SEALS.x, z - SEALS.z) < 60) return 'seals';
  if (Math.hypot(x - LIGHT_ROCK.x, z - LIGHT_ROCK.z) < 40) return 'light';
  if (bankK(x, z) > 0.3) return 'bank';
  if (currentK(x, z) > 0.3) return 'current';
  const far = Math.hypot(x - HOME.x, z - HOME.z * 0.5);
  if (far > 175) return 'sea';
  if (homeD(x, z) > -40) return 'home';
  return 'drop';
}
