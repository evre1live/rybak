// Рельеф «Солнечной бухты»: высота земли и дна, причалы, зоны ловли, где можно ходить.
import { clamp, lerp, sstep, fbm2 } from './util.js';

export const DECK_Y = 1.1;
export const ISLAND = { x: 22, z: -100 };
// Каменная арка: ry — куда повёрнута (опоры стоят вдоль этой оси), leg — от середины до середины опоры,
// block — радиус опоры для лодки (между опорами остаётся проход), w, h, d — габариты арки в метрах.
export const ARCH = { x: 66, z: -50, ry: 1.92, leg: 6.9, block: 4.2, w: 22, h: 15.5, d: 13 };
export const ARCH_LEGS = [-1, 1].map((k) => [ARCH.x + Math.cos(ARCH.ry) * ARCH.leg * k, ARCH.z - Math.sin(ARCH.ry) * ARCH.leg * k]);
export const BACKWATER = { x: -40, z: 13, r: 14 };
export const REEF = { x: 21, z: -15 };
export const CAPE = { ax: 32, az: 13, bx: 41, bz: -9, r: 3.6 };
export const MARKET = { x: -5.6, z: 12.8, r: 3.2 }; // где стоять, чтобы говорить с торговцем
export const SPAWN = { x: -2, z: 9 };
export const BOUNDS = { x0: -170, x1: 170, z0: -190, z1: 150 }; // большой остров с бухтой: здесь подробный рельеф
export const WORLD = { x0: -330, x1: 420, z0: -440, z1: 185 }; // куда можно доплыть на лодке
export const PALM = { x: 270, z: -190, rx: 36, rz: 25 }; // Пальмовый остров: полуоси по кромке воды
export const WRECK = { x: -135, z: -235, r: 24 }; // затонувший корабль на отмели
export const SEA = { x: 20, z: -60, r: 115 }; // дальше этого круга от бухты — открытое море
export const MAP_VIEW = { x0: -78, x1: 100, z0: -142, z1: 36 };

// настилы: по ним ходят, с них ловят
export const DECKS = [
  { id: 'deck', x0: -14, x1: 6, z0: 4, z1: 16, along: 'z' },
  { id: 'pier', x0: -1.6, x1: 1.6, z0: -22, z1: 4, along: 'z' },
  { id: 'head', x0: -6, x1: 6, z0: -27, z1: -22, along: 'x' },
  { id: 'walk', x0: -29, x1: -14, z0: 7.5, z1: 10.3, along: 'x' },
  { id: 'west', x0: -35, x1: -29, z0: 5, z1: 12.5, along: 'x' },
  // причал у маяка: мостки от скалы и площадка на конце
  { id: 'lightwalk', x0: -15, x1: -3.2, z0: -75.4, z1: -72.8, along: 'x' },
  { id: 'light', x0: -20, x1: -15, z0: -78.5, z1: -70, along: 'x' },
  // Пальмовый остров: мостки с пляжа и площадка на конце
  { id: 'palmwalk', x0: 214, x1: 245, z0: -191.3, z1: -188.7, along: 'x' },
  { id: 'palm', x0: 209, x1: 214, z0: -194.5, z1: -185.5, along: 'x' },
  // площадка проката у главного пирса: на ней стоит будка. late — доски кладутся отдельным проходом,
  // чтобы случайная расстановка остального мира (она идёт следом за настилами) не сдвинулась
  { id: 'rental', x0: 1.6, x1: 5.6, z0: -8.6, z1: -4.2, along: 'z', late: true }
];
// препятствия: лавка, ящики, бочки (круги и прямоугольники)
export const BOXES = [{ x0: -13.4, x1: -6.9, z0: 10.0, z1: 15.7 }];
export const CIRCLES = [
  { x: -12.4, z: 5.6, r: 0.75 }, { x: -11.2, z: 5.3, r: 0.6 }, { x: 4.6, z: 14.6, r: 0.8 }, { x: 4.9, z: 5.2, r: 0.55 },
  { x: -5.9, z: 15.2, r: 0.55 }, { x: 5.2, z: -26.2, r: 0.45 },
  // ловушки, сети, якорь
  { x: -5.0, z: -22.9, r: 0.5 }, { x: -29.8, z: 5.8, r: 0.5 }, { x: 4.9, z: 7.5, r: 0.55 }, { x: 7.7, z: 12.6, r: 0.5 },
  // причал у маяка и Пальмовый остров
  { x: -19.2, z: -71.2, r: 0.42 }, { x: -16.2, z: -77.6, r: 0.5 }, { x: -19.3, z: -77.4, r: 0.5 },
  { x: 213.2, z: -193.6, r: 0.42 }, { x: 209.9, z: -186.6, r: 0.5 }, { x: 262.5, z: -176.5, r: 0.5 }, { x: 257.9, z: -181.2, r: 0.5 }, { x: 252.9, z: -180.4, r: 0.45 }
];

export function shoreZ(x) {
  let s = 13 + 1.8 * Math.sin((x + 4) * 0.045) * sstep(8, 30, Math.abs(x + 4));
  const t = (x - BACKWATER.x) / 13;
  s += 11 * Math.exp(-t * t);
  s -= 95 * sstep(-58, -115, x);
  s += 6 * sstep(40, 110, x);
  return s;
}
function mainH(x, z) {
  const d = z - shoreZ(x);
  const cliff = sstep(-60, -92, x); // западный мыс — скалистый
  let h = -14 * Math.pow(sstep(0, -75, d), 0.9);
  if (d > -1.6) {
    h += (1.12 + 5.5 * cliff) * sstep(-1.5, 3, d);
    if (d > 3) {
      h += 0.035 * Math.min(d - 3, 30);
      h += 9 * sstep(9, 46, d) * (0.45 + 0.55 * fbm2(x * 0.035, z * 0.035, 3));
      h += 20 * sstep(42, 85, d);
    }
  } else h += (fbm2(x * 0.09, z * 0.09, 3) - 0.5) * 1.1 * sstep(-6, -30, d);
  return h;
}
export function islandR(th) {
  return 30 + 4.5 * Math.sin(3 * th + 1.0) + 2.5 * Math.sin(5 * th + 2.2) + 1.5 * Math.sin(9 * th);
}
const islandTop = (x, z) => 10.5 + 3 * fbm2(x * 0.06 + 7, z * 0.06 + 3, 3) + 8 * Math.exp(-((x - ISLAND.x - 8) ** 2 + (z - ISLAND.z + 3) ** 2) / 110);
/**
 * Домик смотрителя на склоне холма под маяком: s — длина дома в метрах, ry — поворот (дверь смотрит на юго-запад,
 * к бухте), y — уровень пола. Склон там крутой, поэтому под дом в холме срезана ровная площадка: с одной стороны
 * она врезана в склон, с другой — подсыпана (pad — её полуразмеры вдоль и поперёк дома и ширина откоса).
 */
export const COTTAGE = { x: 21.5, z: -100, s: 8.5, ry: (2 * Math.PI) / 3, y: 0, pad: [5.4, 3.6, 2.4] };
COTTAGE.y = +(islandTop(COTTAGE.x, COTTAGE.z) + 0.6).toFixed(2);
const PAD_C = Math.cos(COTTAGE.ry);
const PAD_S = Math.sin(COTTAGE.ry);
/** Точка в осях домика: u — вдоль дома, v — поперёк (дверь на стороне −v). */
export const cottageUV = (x, z) => [(x - COTTAGE.x) * PAD_C - (z - COTTAGE.z) * PAD_S, (x - COTTAGE.x) * PAD_S + (z - COTTAGE.z) * PAD_C];
function islandH(x, z) {
  const dx = x - ISLAND.x;
  const dz = z - ISLAND.z;
  const r = Math.hypot(dx, dz);
  if (r > 64) return -99;
  const R = islandR(Math.atan2(dz, dx));
  let top = islandTop(x, z);
  if (Math.abs(x - COTTAGE.x) < 14 && Math.abs(z - COTTAGE.z) < 14) {
    const [u, v] = cottageUV(x, z);
    const d = Math.hypot(Math.max(Math.abs(u) - COTTAGE.pad[0], 0), Math.max(Math.abs(v) - COTTAGE.pad[1], 0));
    if (d < COTTAGE.pad[2]) top = lerp(top, COTTAGE.y, sstep(COTTAGE.pad[2], 0, d));
  }
  const c = sstep(R + 1.5, R - 4.5, r);
  const shelf = -0.9 - 13 * sstep(R, R + 24, r);
  return shelf * (1 - c) + top * Math.pow(c, 0.7);
}
export function capeDist(x, z) {
  const vx = CAPE.bx - CAPE.ax;
  const vz = CAPE.bz - CAPE.az;
  const t = clamp(((x - CAPE.ax) * vx + (z - CAPE.az) * vz) / (vx * vx + vz * vz), 0, 1);
  return Math.hypot(x - CAPE.ax - vx * t, z - CAPE.az - vz * t);
}
/** Расстояние до Пальмового острова в «радиусах»: 1 — кромка воды, около 2 — край отмели. */
export function palmR(x, z) {
  const dx = (x - PALM.x) / PALM.rx;
  const dz = (z - PALM.z) / PALM.rz;
  const q = Math.hypot(dx, dz);
  if (q > 4) return q;
  const a = Math.atan2(dz, dx);
  return q / (1 + 0.1 * Math.sin(3 * a + 0.7) + 0.06 * Math.sin(5 * a + 2));
}
function palmH(x, z) {
  const r = palmR(x, z);
  if (r > 3.4) return -99;
  // песчаный купол до 2,6 м; вокруг — бирюзовая отмель до трёх метров глубины, дальше склон в море
  if (r < 1) return 2.6 * Math.pow(1 - r * r, 0.85) + 0.3 * (fbm2(x * 0.08, z * 0.08, 2) - 0.5) * (1 - r);
  const lagoon = -0.04 - 3.1 * Math.pow(sstep(1, 2.15, r), 0.8) + 0.5 * (fbm2(x * 0.07 + 3, z * 0.07, 2) - 0.5) * sstep(1.1, 1.6, r);
  return lerp(lagoon, -14, sstep(2.1, 3.3, r));
}
function wreckH(x, z) {
  const r2 = (x - WRECK.x) ** 2 + (z - WRECK.z) ** 2;
  if (r2 > 4900) return -99;
  return -14 + 12.5 * Math.exp(-r2 / 380) + 0.8 * (fbm2(x * 0.12, z * 0.12, 2) - 0.5) * Math.exp(-r2 / 900);
}
const EDGE_DEPTH = -9;
/**
 * У краёв подробного рельефа земля уходит под воду: большой остров можно обойти на лодке кругом.
 * Край — не прямоугольник, а скруглённый овал с неровной кромкой: с моря и на карте берег выглядит живым.
 * Возвращает «радиус»: меньше 0,76 — рельеф как есть, около 1 — край, дальше — открытое море.
 */
function edgeR(x, z) {
  const { x0, x1, z0, z1 } = BOUNDS;
  const u = Math.abs((x - (x0 + x1) / 2) / ((x1 - x0) / 2));
  const v = Math.abs((z - (z0 + z1) / 2) / ((z1 - z0) / 2));
  if (u < 0.55 && v < 0.55) return 0;
  return Math.pow(u ** 3.4 + v ** 3.4, 1 / 3.4) + 0.11 * (fbm2(x * 0.013 + 5, z * 0.013 + 9, 3) - 0.5);
}
export function groundH(x, z) {
  let h = bayH(x, z);
  const r = edgeR(x, z);
  if (r > 0.76) {
    // вокруг острова — отмель на девяти метрах, дальше дно плавно уходит на глубину открытого моря
    const shelf = lerp(-14, EDGE_DEPTH, sstep(1.32, 1.0, r));
    if (h > shelf) h = lerp(shelf, h, sstep(0.985, 0.76, r));
  }
  const hp = palmH(x, z);
  if (hp > h) h = hp;
  const hw = wreckH(x, z);
  if (hw > h) h = hw;
  return h;
}
function bayH(x, z) {
  let h = mainH(x, z);
  const hi = islandH(x, z);
  if (hi > h) h = hi;
  const dr = (x - REEF.x) ** 2 + (z - REEF.z) ** 2;
  if (dr < 600) h = Math.max(h, -9 + 8.2 * Math.exp(-dr / 40));
  const dc = capeDist(x, z);
  if (dc < CAPE.r + 4) h = Math.max(h, -6 + 7.25 * sstep(CAPE.r + 3, CAPE.r - 0.8, dc));
  return h;
}

// водопады: две точки на обрыве острова, обращённые к причалу
export const FALLS = [Math.PI / 2 + 0.5, Math.PI / 2 - 0.42].map((th) => {
  const R = islandR(th);
  const nx = Math.cos(th);
  const nz = Math.sin(th);
  return { x: ISLAND.x + nx * (R - 0.6), z: ISLAND.z + nz * (R - 0.6), nx, nz, bx: ISLAND.x + nx * (R + 2.2), bz: ISLAND.z + nz * (R + 2.2), top: groundH(ISLAND.x + nx * (R - 5.5), ISLAND.z + nz * (R - 5.5)) };
});
export const LIGHTHOUSE = { x: ISLAND.x + 8, z: ISLAND.z - 3 };

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
const EDGE = 0.1; // настолько не доходим до края настила
export const WADE = 0.62; // на такую глубину можно зайти в воду с берега
/** Точка на настилах: все четыре угла «подошвы» лежат хоть на каком-то из них — на стыках настилов щелей нет. */
function onDecks(x, z) {
  return !!(deckAt(x - EDGE, z - EDGE) && deckAt(x + EDGE, z - EDGE) && deckAt(x - EDGE, z + EDGE) && deckAt(x + EDGE, z + EDGE));
}
/** Преграды (прямоугольники и круги), внутри которых оказалась точка. Обычно ни одной — тогда null. */
export function blocksAt(x, z) {
  let out = null;
  for (const b of BOXES) if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1) (out ||= []).push(b);
  for (const c of CIRCLES) if ((x - c.x) ** 2 + (z - c.z) ** 2 < c.r * c.r) (out ||= []).push(c);
  return out;
}
/** Можно ли стоять в точке. skip — преграды, которые не считаются (из них игрок как раз выходит). */
export function canStand(x, z, skip = null) {
  for (const b of BOXES) if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1 && !(skip && skip.includes(b))) return false;
  for (const c of CIRCLES) if ((x - c.x) ** 2 + (z - c.z) ** 2 < c.r * c.r && !(skip && skip.includes(c))) return false;
  if (onDecks(x, z)) return true;
  // Пальмовый остров: весь песок и вода по колено вокруг
  if (palmR(x, z) < 1.5) return groundH(x, z) >= -WADE;
  if (x < -54 || x > 47 || z < -12.6) return false;
  if (groundH(x, z) < -WADE) return false;
  return z - shoreZ(x) < 13.5;
}

// ── лодка ──
/** Где можно причалить. x, z, yaw — как встаёт лодка; sx, sz, syaw — куда и лицом куда выходит рыбак. rent — здесь лодку берут и сдают. */
// Домашняя лодка стоит носом от пирса, на северо-восток: прямо по курсу — проход между головой пирса и рифом.
export const MOORINGS = [
  { id: 'home', name: 'Солнечная бухта', rent: true, x: 4.0, z: -12, yaw: -0.6, sx: 0.95, sz: -12, syaw: -Math.PI / 2 },
  { id: 'light', name: 'Причал у маяка', x: -17.5, z: -68.2, yaw: Math.PI / 2, sx: -17.5, sz: -70.7, syaw: Math.PI },
  { id: 'palm', name: 'Пальмовый остров', x: 211.5, z: -183.7, yaw: Math.PI / 2, sx: 211.5, sz: -186.2, syaw: Math.PI }
];
/** Прилавок будки проката на площадке у главного пирса: стоя перед ним, лодку тоже можно взять. */
export const RENT_DESK = { x: 2.3, z: -6.4, r: 2.0 };
// во что лодка упирается помимо берега и причалов: риф, опоры арки, скалы в море, корабль, буйки
const SAIL_BLOCKS = [
  { x: REEF.x, z: REEF.z, r: 7.6 },
  ...ARCH_LEGS.map(([x, z]) => ({ x, z, r: ARCH.block })),
  ...[[98, -72, 7], [112, -40, 5], [90, -104, 6], [126, -98, 9], [-58, -96, 5], [-76, -122, 7], [140, -20, 5]].map(([x, z, s]) => ({ x, z, r: s * 1.25 })),
  { x: WRECK.x, z: WRECK.z, r: 8.5 },
  ...[[-12, -43], [15, -37], [45, -31], [-27, -12]].map(([x, z]) => ({ x, z, r: 1.2 }))
];
/** Может ли здесь быть лодка: глубина под килем, не причал, не скала. */
export function canSail(x, z) {
  if (x < WORLD.x0 || x > WORLD.x1 || z < WORLD.z0 || z > WORLD.z1) return false;
  if (groundH(x, z) > -0.6) return false;
  for (const d of DECKS) if (x > d.x0 - 0.7 && x < d.x1 + 0.7 && z > d.z0 - 0.7 && z < d.z1 + 0.7) return false;
  for (const c of SAIL_BLOCKS) if ((x - c.x) ** 2 + (z - c.z) ** 2 < c.r * c.r) return false;
  // камни у берега острова с маяком, на мысу и вдоль западного берега торчат дальше кромки воды
  const dx = x - ISLAND.x;
  const dz = z - ISLAND.z;
  const ri = Math.hypot(dx, dz);
  if (ri < 46 && ri - islandR(Math.atan2(dz, dx)) < 6.5) return false;
  if (capeDist(x, z) < CAPE.r + 3.6) return false;
  const dw = z - shoreZ(x);
  if (x < -60 && x > BOUNDS.x0 + 20 && dw > -7.5 && dw < 6) return false;
  return true;
}

/** Что за место в воде: глубина и зона ловли. null — не вода. */
export function spotAt(x, z) {
  const depth = -groundH(x, z);
  if (depth < 0.25) return null;
  const pier = deckDist(x, z) < 2.4;
  let zone;
  const fall = FALLS.some((f) => (x - f.bx) ** 2 + (z - f.bz) ** 2 < 100);
  const dx = x - ISLAND.x;
  const dz = z - ISLAND.z;
  if (Math.hypot(x - BACKWATER.x, z - BACKWATER.z) < BACKWATER.r && x < -25) zone = 'backwater';
  else if (fall) zone = 'falls';
  else if (Math.hypot(x - ARCH.x, z - ARCH.z) < 14) zone = 'arch';
  else if (Math.hypot(x - WRECK.x, z - WRECK.z) < WRECK.r) zone = 'wreck';
  else if (palmR(x, z) < 2.35) zone = 'lagoon';
  else if (Math.hypot(dx, dz) - islandR(Math.atan2(dz, dx)) < 13 || Math.hypot(x - REEF.x, z - REEF.z) < 9.5 || (capeDist(x, z) < CAPE.r + 7 && depth < 7)) zone = 'reef';
  else if (pier && depth < 3.8) zone = 'pier';
  else if (depth > 8 && Math.hypot(x - SEA.x, z - SEA.z) > SEA.r) zone = 'sea';
  else zone = depth < 2.5 ? 'shallow' : depth < 6 ? 'mid' : 'deep';
  return { depth, zone, pier };
}

// косяки рыбы: где они могут стоять (точка, зона для подписи на карте)
export const SCHOOL_HOMES = [
  [-8, -9], [9, -7], [13, -31], [-14, -39], [1, -45], [22, -23], [-39, 11], [8, -66], [33, -66], [60, -42], [14, -52], [-24, -19], [42, -27], [-33, 2], [-4, -33],
  // новые места: у корабля, в лагуне, в открытом море
  [-124, -224], [-146, -246], [228, -160], [246, -226], [150, -215], [60, -255], [-40, -205], [330, -120]
];
