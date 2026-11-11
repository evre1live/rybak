// Рельеф «Солнечной бухты»: высота земли и дна, причалы, зоны ловли, где можно ходить.
import { clamp, sstep, fbm2 } from './util.js';

export const DECK_Y = 1.1;
export const ISLAND = { x: 22, z: -100 };
export const ARCH = { x: 66, z: -50 };
export const BACKWATER = { x: -40, z: 13, r: 14 };
export const REEF = { x: 21, z: -15 };
export const CAPE = { ax: 32, az: 13, bx: 41, bz: -9, r: 3.6 };
export const MARKET = { x: -5.6, z: 12.8, r: 3.2 }; // где стоять, чтобы говорить с торговцем
export const SPAWN = { x: -2, z: 9 };
export const BOUNDS = { x0: -170, x1: 170, z0: -190, z1: 90 };
export const MAP_VIEW = { x0: -78, x1: 100, z0: -142, z1: 36 };

// настилы: по ним ходят, с них ловят
export const DECKS = [
  { id: 'deck', x0: -14, x1: 6, z0: 4, z1: 16, along: 'z' },
  { id: 'pier', x0: -1.6, x1: 1.6, z0: -22, z1: 4, along: 'z' },
  { id: 'head', x0: -6, x1: 6, z0: -27, z1: -22, along: 'x' },
  { id: 'walk', x0: -29, x1: -14, z0: 7.5, z1: 10.3, along: 'x' },
  { id: 'west', x0: -35, x1: -29, z0: 5, z1: 12.5, along: 'x' }
];
// препятствия: лавка, ящики, бочки (круги и прямоугольники)
export const BOXES = [{ x0: -13.4, x1: -6.9, z0: 10.0, z1: 15.7 }];
export const CIRCLES = [
  { x: -12.4, z: 5.6, r: 0.75 }, { x: -11.2, z: 5.3, r: 0.6 }, { x: 4.6, z: 14.6, r: 0.8 }, { x: 4.9, z: 5.2, r: 0.55 },
  { x: -5.9, z: 15.2, r: 0.55 }, { x: 5.2, z: -26.2, r: 0.45 }
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
function islandH(x, z) {
  const dx = x - ISLAND.x;
  const dz = z - ISLAND.z;
  const r = Math.hypot(dx, dz);
  if (r > 64) return -99;
  const R = islandR(Math.atan2(dz, dx));
  const top = 10.5 + 3 * fbm2(x * 0.06 + 7, z * 0.06 + 3, 3) + 8 * Math.exp(-((dx - 8) ** 2 + (dz + 3) ** 2) / 110);
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
export function groundH(x, z) {
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
export function canStand(x, z) {
  for (const b of BOXES) if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1) return false;
  for (const c of CIRCLES) if ((x - c.x) ** 2 + (z - c.z) ** 2 < c.r * c.r) return false;
  if (onDecks(x, z)) return true;
  if (x < -54 || x > 47 || z < -12.6) return false;
  if (groundH(x, z) < -WADE) return false;
  return z - shoreZ(x) < 13.5;
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
  else if (Math.hypot(dx, dz) - islandR(Math.atan2(dz, dx)) < 13 || Math.hypot(x - REEF.x, z - REEF.z) < 9.5 || (capeDist(x, z) < CAPE.r + 7 && depth < 7)) zone = 'reef';
  else if (pier && depth < 3.8) zone = 'pier';
  else zone = depth < 2.5 ? 'shallow' : depth < 6 ? 'mid' : 'deep';
  return { depth, zone, pier };
}

// косяки рыбы: где они могут стоять (точка, зона для подписи на карте)
export const SCHOOL_HOMES = [
  [-8, -9], [9, -7], [13, -31], [-14, -39], [1, -45], [22, -23], [-39, 11], [8, -66], [33, -66], [60, -42], [14, -52], [-24, -19], [42, -27], [-33, 2], [-4, -33]
];
