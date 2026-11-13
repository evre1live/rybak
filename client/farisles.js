// Дальние острова — за краем моря, по которому ходит лодка: до них не доплыть, но с воды они видны всё время.
// От края этого моря до ближайшего их берега — не меньше 170 метров: у самого края острова остаются «на горизонте»,
// и слова «дальше — только океан» не расходятся с тем, что видно.
// Это настоящий рельеф, а не холмы-заглушки: у каждого острова свой берег с мысами и бухтами, обрывы и пляжи,
// вершины и лес. Рисуются тем же материалом, что и большой остров (world.js): трава, камень на крутых склонах,
// песок у воды; вода знает их берега (water.js) — у кромки пена, волна гаснет.
import { fbm2, sstep, lerp, angDiff, rng, TAU } from './util.js';

/**
 * x, z — середина; rx, rz — полуоси по кромке воды (rx — вдоль оси, повёрнутой на ry); seed — свой рисунок берега;
 * cliff: [высота берегового обрыва, какая доля берега — обрыв]; low — высота равнины над пляжем;
 * peaks: [[вдоль, поперёк (в долях полуосей), высота в метрах, ширина вдоль, ширина поперёк], …]; rough — неровность;
 * bay: [куда смотрит бухта (угол), её ширина, насколько вдаётся]; wood — насколько остров зарос лесом (0…1),
 * pines — доля хвойных; cell — шаг сетки рельефа, м (дальним островам хватит и грубой).
 */
export const FAR_ISLES = [
  // северо-запад, за затонувшим кораблём: скалистый остров — обрыв почти кругом, наверху сосны
  { id: 'crag', x: -525, z: -670, rx: 128, rz: 86, ry: 0.5, seed: 11, cliff: [19, 0.8], low: 8, rough: 9, peaks: [[-0.22, 0.05, 40, 0.5, 0.45], [0.45, -0.1, 27, 0.32, 0.36]], wood: 0.6, pines: 0.85, cell: 6 },
  // север: большой лесистый остров с двумя вершинами; бухта с пляжем смотрит на юг, к игроку
  { id: 'twin', x: 255, z: -735, rx: 178, rz: 104, ry: -0.2, seed: 23, cliff: [11, 0.38], low: 7, rough: 10, peaks: [[-0.4, -0.08, 58, 0.4, 0.5], [0.4, 0.02, 43, 0.38, 0.48]], bay: [1.75, 0.5, 0.3], wood: 0.8, pines: 0.5, cell: 6.5 },
  // восток: длинный низкий остров — пляжи, дюны, луга и рощи
  { id: 'long', x: 702, z: -330, rx: 96, rz: 168, ry: 0.15, seed: 37, cliff: [5, 0.18], low: 5, rough: 6, peaks: [[0.05, -0.45, 15, 0.5, 0.3], [0.1, 0.42, 10, 0.5, 0.3]], wood: 0.42, pines: 0.2, cell: 6.5 },
  // запад: гора — видна издалека, склоны в лесу, вершина каменная
  { id: 'peak', x: -705, z: -150, rx: 152, rz: 176, ry: 0.3, seed: 51, cliff: [14, 0.55], low: 9, rough: 16, peaks: [[0.02, -0.02, 118, 0.42, 0.42], [0.46, 0.36, 32, 0.3, 0.3], [-0.42, -0.4, 24, 0.28, 0.3]], wood: 0.62, pines: 0.9, cell: 7 },
  // дальний север: гряда из трёх островков — мал мала меньше
  { id: 'ridge1', x: -62, z: -985, rx: 96, rz: 62, ry: 0.15, seed: 67, cliff: [13, 0.6], low: 7, rough: 8, peaks: [[0.0, 0.0, 30, 0.5, 0.5]], wood: 0.6, pines: 0.7, cell: 8 },
  { id: 'ridge2', x: 92, z: -1010, rx: 70, rz: 50, ry: -0.3, seed: 71, cliff: [15, 0.75], low: 6, rough: 7, peaks: [[0.1, 0.0, 22, 0.5, 0.5]], wood: 0.5, pines: 0.8, cell: 8 },
  { id: 'ridge3', x: 205, z: -975, rx: 40, rz: 30, ry: 0.6, seed: 79, cliff: [12, 0.9], low: 4, rough: 5, peaks: [[0.0, 0.0, 10, 0.6, 0.6]], wood: 0.35, pines: 0.9, cell: 8 }
];
for (const I of FAR_ISLES) {
  I.c = Math.cos(I.ry);
  I.s = Math.sin(I.ry);
  const r = rng(I.seed * 7919);
  I.p = Array.from({ length: 7 }, () => r() * TAU);
  I.R = Math.max(I.rx, I.rz);
}
/** Точка в осях острова: [вдоль / rx, поперёк / rz]. */
const uvOf = (I, x, z) => {
  const dx = x - I.x, dz = z - I.z;
  return [(dx * I.c + dz * I.s) / I.rx, (-dx * I.s + dz * I.c) / I.rz];
};
/** Кромка берега в направлении a: мысы и бухты (1 — ровный овал). */
function coast(I, a) {
  let k = 1 + 0.11 * Math.sin(2 * a + I.p[0]) + 0.08 * Math.sin(3 * a + I.p[1]) + 0.05 * Math.sin(5 * a + I.p[2]) + 0.03 * Math.sin(9 * a + I.p[3]);
  if (I.bay) {
    const d = angDiff(I.bay[0], a) / I.bay[1];
    k -= I.bay[2] * Math.exp(-d * d);
  }
  return k;
}
/** Обрыв (1) или пляж (0) у берега в направлении a. В бухте — всегда пляж. */
function cliffK(I, a) {
  const n = 0.5 + 0.32 * Math.sin(2 * a + I.p[4]) + 0.18 * Math.sin(3 * a + I.p[5]);
  const th = 1 - I.cliff[1];
  let k = sstep(th - 0.1, th + 0.1, n);
  if (I.bay) {
    const d = angDiff(I.bay[0], a) / (I.bay[1] * 1.25);
    k *= 1 - Math.exp(-d * d);
  }
  return k;
}
/** Высота одного острова в точке; далеко от него — −99. */
function isleH(I, x, z) {
  const [u, v] = uvOf(I, x, z);
  const q = Math.hypot(u, v);
  if (q > 2.2) return -99;
  const a = Math.atan2(v, u);
  const e = 1 - q / coast(I, a); // 0 — кромка воды, 1 — середина острова
  // под водой: отмель у берега, дальше дно уходит на глубину открытого моря
  if (e <= 0) return lerp(-0.2, -14, sstep(0, 0.6, -e));
  const ck = cliffK(I, a);
  const beach = I.low * Math.pow(sstep(0, 0.5, e), 1.3);
  const wall = I.cliff[0] * sstep(0, 0.085, e) + I.low * 0.6 * sstep(0.06, 0.5, e);
  let h = lerp(beach, wall, ck);
  const inland = sstep(0.02, 0.32, e);
  for (const [pu, pv, A, su, sv] of I.peaks) h += A * Math.exp(-(((u - pu) / su) ** 2 + ((v - pv) / sv) ** 2)) * inland;
  h += (fbm2(x * 0.016 + I.seed, z * 0.016 - I.seed, 4) - 0.5) * I.rough * sstep(0.05, 0.42, e);
  return Math.max(h, 0.02 + 0.5 * e);
}
/** Высота дальних островов в точке (над водой — больше нуля); вдали от них — −99. */
export function farH(x, z) {
  let h = -99;
  for (const I of FAR_ISLES) {
    if (Math.abs(x - I.x) > I.R * 2.2 || Math.abs(z - I.z) > I.R * 2.2) continue;
    const y = isleH(I, x, z);
    if (y > h) h = y;
  }
  return h;
}
/** Прямоугольник, в который помещаются все дальние острова с отмелями, — для карты глубин воды. */
export function farBounds(pad = 40) {
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
  for (const I of FAR_ISLES) {
    x0 = Math.min(x0, I.x - I.R * 1.7);
    x1 = Math.max(x1, I.x + I.R * 1.7);
    z0 = Math.min(z0, I.z - I.R * 1.7);
    z1 = Math.max(z1, I.z + I.R * 1.7);
  }
  return { x0: x0 - pad, x1: x1 + pad, z0: z0 - pad, z1: z1 + pad };
}
/** Уклон в точке: 1 — ровно, 0 — отвесно. */
export function farFlat(x, z, e = 2.5) {
  const dx = farH(x + e, z) - farH(x - e, z);
  const dz = farH(x, z + e) - farH(x, z - e);
  return (2 * e) / Math.hypot(dx, 2 * e, dz);
}
/** Лес в точке: 0 — луг, 1 — чаща. У каждого острова свой рисунок опушек. */
export function farWood(I, x, z) {
  return sstep(0.62 - I.wood * 0.42, 0.74 - I.wood * 0.42, fbm2(x * 0.011 + I.seed * 3.1, z * 0.011 + I.seed * 1.7, 3));
}

/**
 * Деревья дальнего острова: [{ x, y, z, h — высота в метрах, pine }]. Стоят там, где полого и не у самой воды;
 * гуще — в чаще, на лугах — редкие. Места свои у каждого острова и всегда одни и те же.
 */
export function farTrees(I) {
  const r = rng(I.seed * 104729 + 5);
  const out = [];
  const area = Math.PI * I.rx * I.rz;
  const want = Math.round((area / 1000) * (2.2 + 4.6 * I.wood));
  for (let i = 0; i < want * 14 && out.length < want; i++) {
    const a = r() * TAU;
    const d = Math.sqrt(r()) * 1.05;
    const x = I.x + (Math.cos(a) * d * I.rx * I.c - Math.sin(a) * d * I.rz * I.s);
    const z = I.z + (Math.cos(a) * d * I.rx * I.s + Math.sin(a) * d * I.rz * I.c);
    const y = isleH(I, x, z);
    const k = r();
    const pick = r();
    const size = r();
    if (y < 2.4 || farFlat(x, z) < 0.8) continue;
    const w = farWood(I, x, z);
    if (k > 0.1 + 0.9 * w) continue;
    // высоко на горе — только сосны, и пониже ростом
    const high = sstep(55, 95, y);
    out.push({ x, y, z, h: (10 + size * 9) * (1 - 0.35 * high), pine: pick < I.pines + high });
  }
  return out;
}
/**
 * Утёсы у воды — места для готовых моделей скал: [{ x, z, w, h, d, ry, wall }]. Встают на мысах там, где берег обрывистый.
 */
export function farCliffs(I) {
  const r = rng(I.seed * 15485863 + 9);
  const out = [];
  const n = Math.round(((I.rx + I.rz) / 26) * I.cliff[1]);
  for (let i = 0; i < n * 8 && out.length < n; i++) {
    const a = r() * TAU;
    const wide = r();
    const tall = r();
    const kind = r();
    if (cliffK(I, a) < 0.85) continue;
    // слишком близко к уже стоящему — пропускаем
    const k = coast(I, a) * 0.985;
    const lx = Math.cos(a) * k * I.rx, lz = Math.sin(a) * k * I.rz;
    const x = I.x + lx * I.c - lz * I.s, z = I.z + lx * I.s + lz * I.c;
    if (out.some((o) => Math.hypot(o.x - x, o.z - z) < 30)) continue;
    // касательная к берегу — по двум соседним точкам кромки
    const at = (b) => {
      const kb = coast(I, b);
      const ux = Math.cos(b) * kb * I.rx, uz = Math.sin(b) * kb * I.rz;
      return [I.x + ux * I.c - uz * I.s, I.z + ux * I.s + uz * I.c];
    };
    const [ax, az] = at(a - 0.06), [bx, bz] = at(a + 0.06);
    const tl = Math.hypot(bx - ax, bz - az) || 1;
    out.push({ x, z, w: 30 + wide * 16, h: I.cliff[0] * (1.15 + tall * 0.35) + 3, d: 15 + wide * 5, ry: Math.atan2(-(bz - az) / tl, (bx - ax) / tl) + (kind < 0.5 ? Math.PI : 0), wall: kind < 0.5 });
  }
  return out;
}
