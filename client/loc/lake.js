// Рельеф «Соснового озера»: горное озеро в кольце лесистых склонов. Тот же набор имён, что у бухты (loc/bay.js):
// высота земли и дна, причалы, зоны ловли, где можно ходить и плыть.
//
// База рыбака — та же, что в бухте: площадка с лавкой на южном берегу, пирс на север, будка проката, заводь с камышом
// на западе. Всё остальное своё: озеро вытянуто с запада на восток и замкнуто берегами. Прямо за водой, на северном
// берегу, — поляна с избушкой и своими мостками (туда ходят на лодке); правее неё — скальная стена с водопадами,
// ещё правее — каменный островок с соснами; между пирсом и избушкой — яма. Моря, маяка, арки и дальних островов нет.
import { clamp, lerp, sstep, fbm2 } from '../util.js';

/** Что есть на этой локации из того, что умеет строить мир (world.js, scenery.js и др.). */
export const HAS = { island: false, lighthouse: false, cottage: false, arch: false, reef: false, cape: false, palm: false, wreck: false, skerries: false, sea: false, farIsles: false, mountains: true, cabin: true, islet: true, gulls: false };

export const DECK_Y = 1.1;
// Чего на озере нет — стоит далеко за краем мира: проверки «рядом ли» никогда не срабатывают
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
export const cottageUV = (x, z) => [x - COTTAGE.x, z - COTTAGE.z];
export const islandR = () => 1;
export const capeDist = () => NOWHERE;
export const palmR = () => NOWHERE;

export const BACKWATER = { x: -40, z: 13, r: 14 };
export const MARKET = { x: -5.6, z: 12.8, r: 3.2 };
export const SPAWN = { x: -2, z: 9 };
/** Середина озера и его полуоси: берег — неровный овал вокруг неё (кроме южного берега, где стоит база). */
export const LAKE = { x: 8, z: -48, a: 128, b: 62 };
export const BOUNDS = { x0: -196, x1: 212, z0: -208, z1: 104 }; // подробный рельеф: озеро и склоны вокруг
export const WORLD = { x0: -150, x1: 166, z0: -134, z1: 40 }; // куда можно доплыть на лодке
export const SEA = { x: LAKE.x, z: LAKE.z, r: 1e4 }; // «открытого моря» нет: зыби и морской зоны не бывает
export const MAP_VIEW = { x0: -150, x1: 166, z0: -150, z1: 50 }; // мини-карта: всё озеро
/** Каменный островок: справа от пирса, перед скальной стеной. */
export const ISLET = { x: 43, z: -68, r: 10.5, top: 3.4 };
/** Каменная гряда — валуны на отмели к западу от пирса. rocks: [вправо, вниз по карте, поперечник] */
export const SHOAL = { x: -34, z: -52, r: 11, rocks: [[0, 0, 3.2], [5.5, 3, 2.2], [-4.5, 4, 2.6], [2, -5.5, 1.9]] };
/** Яма между пирсом и избушкой — самое глубокое место: с пирса не добросить, с мостков избушки — в самый раз. */
export const PIT = { x: -4, z: -80, r: 24 };
/**
 * Избушка рыбака на северном берегу, прямо за водой: на поляне, лицом к озеру. Под неё выровнена площадка
 * (y — её уровень, считается ниже). Поляна (GLADE) — открытое место вокруг: там можно ходить, лес на ней не растёт.
 */
export const CABIN = { x: -22, z: -127, s: 10, ry: Math.PI + 0.22, y: 0 }; // фасад (−z дома) смотрит на юго-юго-восток — на пирс базы
export const GLADE = { x: -22, z: -121, r: 19 };
/** Костёр перед избушкой, ближе к воде (звук и свет). */
export const CAMPFIRE = { x: -14.5, z: -117.5 };

// настилы: база та же, что в бухте, плюс мостки у избушки на северном берегу (late — кладутся отдельным проходом:
// случайная расстановка вещей на базе остаётся такой же, как в бухте)
export const DECKS = [
  { id: 'deck', x0: -14, x1: 6, z0: 4, z1: 16, along: 'z' },
  { id: 'pier', x0: -1.6, x1: 1.6, z0: -22, z1: 4, along: 'z' },
  { id: 'head', x0: -6, x1: 6, z0: -27, z1: -22, along: 'x' },
  { id: 'walk', x0: -29, x1: -14, z0: 7.5, z1: 10.3, along: 'x' },
  { id: 'west', x0: -35, x1: -29, z0: 5, z1: 12.5, along: 'x' },
  { id: 'rental', x0: 1.6, x1: 5.6, z0: -8.6, z1: -4.2, along: 'z', late: true },
  { id: 'cabinwalk', x0: -23.3, x1: -20.7, z0: -113, z1: -101, along: 'z', late: true },
  { id: 'cabin', x0: -27, x1: -17, z0: -101, z1: -96.5, along: 'x', late: true }
];
export const BOXES = [{ x0: -13.4, x1: -6.9, z0: 10.0, z1: 15.7 }];
export const CIRCLES = [
  { x: -12.4, z: 5.6, r: 0.75 }, { x: -11.2, z: 5.3, r: 0.6 }, { x: 4.6, z: 14.6, r: 0.8 }, { x: 4.9, z: 5.2, r: 0.55 },
  { x: -5.9, z: 15.2, r: 0.55 }, { x: 5.2, z: -26.2, r: 0.45 },
  { x: -5.0, z: -22.9, r: 0.5 }, { x: -29.8, z: 5.8, r: 0.5 }, { x: 4.9, z: 7.5, r: 0.55 }, { x: 7.7, z: 12.6, r: 0.5 }
];

/** Южный берег у базы: как в бухте — ровная кромка с заводью на западе. Дальше на запад и восток берег замыкает овал озера. */
export function shoreZ(x) {
  let s = 13 + 1.8 * Math.sin((x + 4) * 0.045) * sstep(8, 30, Math.abs(x + 4));
  const t = (x - BACKWATER.x) / 13;
  s += 11 * Math.exp(-t * t);
  return s;
}
/** Радиус берега в долях овала по направлению от середины: неровный, с заливами и мысами. */
function rim(th) {
  return 1 + 0.085 * Math.sin(3 * th + 0.6) + 0.05 * Math.sin(5 * th + 2.1) + 0.03 * Math.sin(8 * th + 4.0) + 0.02 * Math.sin(13 * th + 1.0);
}
/**
 * Насколько точка «в воде»: метры до берега, больше нуля — озеро, меньше — суша. Берег — ближайшее из двух:
 * южная кромка у базы и овал озера; стык сглажен.
 */
export function waterD(x, z) {
  const dx = x - LAKE.x;
  const dz = z - LAKE.z;
  const th = Math.atan2(dz, dx);
  const rho = Math.hypot(dx / LAKE.a, dz / LAKE.b);
  // до овала — в «условных метрах»: доля пути от берега к середине, растянутая на средний радиус озера.
  // (Честное расстояние вдоль луча даёт в середине озера складку — гребень вдоль короткой оси.)
  const ring = (1 - rho / rim(th)) * 104;
  const south = shoreZ(x) - z;
  // мягкий минимум: на стыке южной кромки и овала берег скруглён
  const k = 9;
  const h = clamp(0.5 + (0.5 * (ring - south)) / k, 0, 1);
  return lerp(ring, south, h) - k * h * (1 - h);
}
/** Северная скальная стена с водопадами: 0…1 — насколько берег здесь обрывист. */
const CLIFF_TH = -1.3; // направление от середины озера на середину стены: на северо-северо-восток — с пирса она видна правее избушки
function cliffK(x, z) {
  let d = Math.atan2(z - LAKE.z, x - LAKE.x) - CLIFF_TH;
  d = Math.atan2(Math.sin(d), Math.cos(d));
  return Math.exp(-((d / 0.3) ** 2));
}
function isletH(x, z) {
  const r = Math.hypot(x - ISLET.x, z - ISLET.z);
  if (r > ISLET.r * 4) return -99;
  const a = Math.atan2(z - ISLET.z, x - ISLET.x);
  const R = ISLET.r * (1 + 0.14 * Math.sin(3 * a + 1.1) + 0.08 * Math.sin(5 * a + 0.4));
  const c = sstep(R + 1.2, R - 3.2, r);
  const top = ISLET.top + 1.6 * fbm2(x * 0.16 + 3, z * 0.16 + 8, 2) - 0.6;
  // вокруг островка — каменистая отмель: метр-два у берега, дальше склон уходит ниже дна озера (и перестаёт на него влиять)
  const shelf = -0.7 - 24 * sstep(R, R + 30, r);
  return shelf * (1 - c) + top * Math.pow(c, 0.7);
}
function shoalH(x, z) {
  const dx = x - SHOAL.x;
  const dz = z - SHOAL.z;
  const d2 = dx * dx + dz * dz;
  if (d2 > SHOAL.r * SHOAL.r * 9) return -99;
  // грива поднимается со дна до полутора метров под водой; по краям склон уходит ниже дна озера
  let h = -1.5 - 19 * (1 - Math.exp(-d2 / (SHOAL.r * SHOAL.r * 2.2))) + 0.8 * (fbm2(x * 0.13 + 2, z * 0.13, 2) - 0.5) * Math.exp(-d2 / (SHOAL.r * SHOAL.r));
  for (const [ox, oz, w] of SHOAL.rocks) {
    const q = ((dx - ox) ** 2 + (dz - oz) ** 2) / (w * w * 1.1);
    if (q < 3) h = Math.max(h, 0.9 * (1 - q));
  }
  return h;
}
function rawH(x, z) {
  const w = waterD(x, z);
  let h = -12.5 * Math.pow(sstep(0, 70, w), 0.9); // дно: полка у берега, дальше — глубина (на суше — ноль)
  if (w > 0 && w < 40) h -= 4.5 * cliffK(x, z) * sstep(0, 5, w) * sstep(40, 14, w); // под стеной сразу глубоко: туда падает вода
  if (w > 1.6) {
    h += (fbm2(x * 0.09, z * 0.09, 3) - 0.5) * 1.1 * sstep(6, 30, w);
    // яма под северной стеной
    h -= 7.5 * Math.exp(-((x - PIT.x) ** 2 + (z - PIT.z) ** 2) / (PIT.r * PIT.r * 0.55)) * sstep(8, 30, w);
  } else {
    const d = -w; // метры вглубь суши (у самой кромки — чуть отрицательные: это ещё вода)
    const cl = cliffK(x, z);
    // кромка: у базы пологий берег, под стеной — скала прямо из воды
    h += (1.12 + 21 * cl) * sstep(-1.5, 3 + 2.5 * cl, d);
    if (d > 3) {
      h += 0.035 * Math.min(d - 3, 30);
      // поляна у избушки: холмы расступаются — пологий луг от воды до опушки
      const gl = 1 - 0.8 * Math.exp(-((x - GLADE.x) ** 2 + (z - GLADE.z) ** 2) / (GLADE.r * GLADE.r * 0.8));
      // лесистые холмы, за ними склоны гор; над стеной подъём начинается сразу
      h += 9 * sstep(9, 46, d) * (0.45 + 0.55 * fbm2(x * 0.035, z * 0.035, 3)) * gl;
      h += 30 * sstep(34 - 14 * cl, 120, d) * (0.5 + 0.9 * fbm2(x * 0.011 + 3, z * 0.011 + 7, 4)) * gl;
      // горы: широкие плечи и острые гребни над ними — вершины разной высоты, между ними седловины
      const m = fbm2(x * 0.0046 + 1, z * 0.0046 + 11, 3);
      h += 64 * sstep(105, 330, d) * (0.3 + 1.25 * m);
      const rg = 1 - Math.abs(2 * fbm2(x * 0.0078 + 20, z * 0.0078 + 5, 3) - 1);
      h += 92 * sstep(170, 460, d) * rg * rg * rg * (0.35 + 1.1 * m);
    }
  }
  const hi = isletH(x, z);
  if (hi > h) h = hi;
  const hs = shoalH(x, z);
  if (hs > h) h = hs;
  return h;
}
CABIN.y = +rawH(CABIN.x, CABIN.z).toFixed(2);
export function groundH(x, z) {
  const h = rawH(x, z);
  // площадка под срубом: ровная, с плавным откосом
  const dc = Math.hypot(x - CABIN.x, z - CABIN.z);
  return dc < 11 ? lerp(h, CABIN.y, sstep(11, 7, dc)) : h;
}
/** Точка берега на луче из середины озера под углом th (0 — на восток, по часовой на карте). */
export function shoreAt(th) {
  const m = shorePoint(th);
  return [LAKE.x + Math.cos(th) * m, LAKE.z + Math.sin(th) * m];
}
/** Насколько берег в этой стороне от середины озера обрывист (0…1): северная стена с водопадами. */
export const cliffAt = (x, z) => cliffK(x, z);

// водопады: две струи на северной стене, обращённые к озеру
function shorePoint(th) {
  // точка берега на луче из середины озера: идём, пока вода
  const cx = Math.cos(th);
  const cz = Math.sin(th);
  let lo = 20;
  let hi = 260;
  // (берег на луче один: вода — до него, суша — после)
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (waterD(LAKE.x + cx * m, LAKE.z + cz * m) > 0) lo = m;
    else hi = m;
  }
  return lo;
}
// w — полуширина струи, spray — размер облака водяной пыли у подножия (м): левый водопад шире, правый — узкая прядь
export const FALLS = [[CLIFF_TH - 0.13, 2.5, 10], [CLIFF_TH + 0.2, 1.7, 7.5]].map(([th, w, spray]) => {
  const R = shorePoint(th);
  const rx = Math.cos(th);
  const rz = Math.sin(th);
  // n — от скалы к воде (к середине озера); x, z — кромка обрыва, b — куда падает вода
  const at = (m) => [LAKE.x + rx * m, LAKE.z + rz * m];
  const [x, z] = at(R + 0.6);
  const [bx, bz] = at(R - 2.6);
  const [tx, tz] = at(R + 5.5);
  return { x, z, nx: -rx, nz: -rz, bx, bz, top: groundH(tx, tz), w, spray };
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
/** Можно ли стоять в точке: настилы, берег у базы до забора и поляна у избушки (до опушки; в воду — по колено). */
export function canStand(x, z, skip = null) {
  for (const b of BOXES) if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1 && !(skip && skip.includes(b))) return false;
  for (const c of CIRCLES) if ((x - c.x) ** 2 + (z - c.z) ** 2 < c.r * c.r && !(skip && skip.includes(c))) return false;
  if (onDecks(x, z)) return true;
  if ((x - GLADE.x) ** 2 + (z - GLADE.z) ** 2 < GLADE.r * GLADE.r) return groundH(x, z) >= -WADE;
  if (x < -54 || x > 47 || z < -12.6) return false;
  if (groundH(x, z) < -WADE) return false;
  return z - shoreZ(x) < 13.5;
}

// ── лодка ──
export const MOORINGS = [
  { id: 'home', name: 'Сосновое озеро', rent: true, x: 4.0, z: -12, yaw: -0.6, sx: 0.95, sz: -12, syaw: -Math.PI / 2 },
  // мостки у избушки: лодка встаёт вдоль площадки, рыбак выходит лицом к берегу — к избушке
  { id: 'cabin', name: 'Избушка рыбака', x: -22, z: -94.7, yaw: Math.PI / 2, sx: -22, sz: -97.2, syaw: 0 }
];
export const RENT_DESK = { x: 2.3, z: -6.4, r: 2.0 };
/** Буйки: у пирса и на краю ямы — со стороны базы. */
export const BUOYS = [[-14, -40], [16, -34], [-27, -12], [PIT.x + 9, PIT.z + 15]];
export const MARKS = [];
const SAIL_BLOCKS = [
  ...SHOAL.rocks.map(([ox, oz, w]) => ({ x: SHOAL.x + ox, z: SHOAL.z + oz, r: w * 1.1 })),
  ...BUOYS.map(([x, z]) => ({ x, z, r: 1.2 }))
];
export function canSail(x, z) {
  if (x < WORLD.x0 || x > WORLD.x1 || z < WORLD.z0 || z > WORLD.z1) return false;
  if (groundH(x, z) > -0.6) return false;
  for (const d of DECKS) if (x > d.x0 - 0.7 && x < d.x1 + 0.7 && z > d.z0 - 0.7 && z < d.z1 + 0.7) return false;
  return !inRocks(x, z);
}
/** Камни в воде: гряда, берег островка, валуны под северной стеной. */
export function inRocks(x, z) {
  for (const c of SAIL_BLOCKS) if ((x - c.x) ** 2 + (z - c.z) ** 2 < c.r * c.r) return true;
  if (Math.hypot(x - ISLET.x, z - ISLET.z) < ISLET.r + 3.5) return true;
  const w = waterD(x, z);
  if (w < 5.5 && cliffK(x, z) > 0.35) return true;
  return false;
}

/** Что за место в воде: глубина и зона ловли. null — не вода. */
export function spotAt(x, z) {
  const depth = -groundH(x, z);
  if (depth < 0.25) return null;
  const pier = deckDist(x, z) < 2.4;
  let zone;
  if (Math.hypot(x - BACKWATER.x, z - BACKWATER.z) < BACKWATER.r && x < -25) zone = 'backwater';
  else if (FALLS.some((f) => (x - f.bx) ** 2 + (z - f.bz) ** 2 < 144)) zone = 'falls';
  else if (Math.hypot(x - ISLET.x, z - ISLET.z) < ISLET.r + 13 || Math.hypot(x - SHOAL.x, z - SHOAL.z) < SHOAL.r) zone = 'stones';
  else if (pier && depth < 3.8) zone = 'pier';
  else if (depth > 14) zone = 'pit';
  else zone = depth < 2.5 ? 'shallow' : depth < 6 ? 'mid' : 'deep';
  return { depth, zone, pier };
}

// косяки рыбы: где они могут стоять
export const SCHOOL_HOMES = [
  [-8, -9], [9, -7], [13, -31], [-14, -39], [1, -45], [22, -23], [-39, 11], [-24, -19], [42, -27], [-33, 2], [-4, -33],
  [62, -44], [26, -92], [-52, -70], [-84, -62], [-30, -90], [74, -84], [104, -52], [-90, -46], [PIT.x, PIT.z], [PIT.x + 14, PIT.z - 6]
];
export const SEA_HOMES = [];

// части озера: что написать в углу экрана и чем место интересно рыбаку
export const AREAS = {
  lake: ['ОЗЕРО', ''],
  falls: ['ВОДОПАДЫ', 'Водопады: в холодной струе под скалой держатся форель и хариус, а на заре выходит таймень'],
  islet: ['КАМЕННЫЙ ОСТРОВ', 'Каменный остров: у валунов берёт окунь и щука, ночью из-под камней выходит налим'],
  pit: ['ЯМА', 'Яма: самое глубокое место озера — здесь ходят сиг, судак и налим, а на дне лежит сом'],
  cabin: ['ИЗБУШКА', 'Избушка рыбака: с её мостков добрасывают до ямы, а у костра хорошо встречать рассвет']
};
export function areaAt(x, z) {
  if (FALLS.some((f) => (x - f.bx) ** 2 + (z - f.bz) ** 2 < 26 * 26)) return 'falls';
  if (Math.hypot(x - ISLET.x, z - ISLET.z) < ISLET.r + 18) return 'islet';
  if (Math.hypot(x - PIT.x, z - PIT.z) < PIT.r && -groundH(x, z) > 12) return 'pit';
  if (Math.hypot(x - GLADE.x, z - (GLADE.z + 9)) < 27) return 'cabin';
  return 'lake';
}
