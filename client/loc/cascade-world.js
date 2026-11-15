// «Водопадная чаша»: цвет земли и дна, холмы вокруг. Сам рельеф — в loc/cascade.js; сетку по нему строит world.js
// (buildGround), сюда приходят только её краски и раскладка кусков.
import * as THREE from 'three';
import { sstep, fbm2 } from '../util.js';
import { BOUNDS, BACKWATER, ISLET, waterD, shoreZ, cliffK } from './cascade.js';

const C = (hex) => new THREE.Color(hex);
const sand = C('#cbbf9c'); // речной песок у базы: серо-жёлтый, с илом
const sandWet = C('#a49a7c');
const mud = C('#8a7a5c'); // илистый берег вокруг чаши
const mudWet = C('#6a5f48');
const bedDeep = C('#3f5040'); // тёмный ил на глубине: вода над ним густо-изумрудная
const bedLeaf = C('#5a5232'); // палая листва на дне заводи
const jungleA = C('#3f8a32'); // влажная зелень
const jungleB = C('#2f7a34');
const jungleC = C('#5ea83a'); // светлые пятна: поляны, папоротник на солнце
const canopy = C('#1f5a2c'); // под пологом леса: тёмная, почти чёрно-зелёная
const moss = C('#4f7a36'); // мох на скале
const rockA = C('#5c5a52'); // скала: тёмный мокрый базальт
const rockB = C('#6f6b60');
const laterite = C('#b0623a'); // красная тропическая земля на тропе
const meadow = C('#6fb24a');

/**
 * Цвет земли в точке: песок у базы, ил вокруг чаши, джунгли, мокрая скала подковы с мхом; под водой — песок, ил
 * и листва. ny — насколько склон пологий (1 — ровно). w — что это за поверхность, для рисованных текстур
 * (surface.js): [трава, камень, песок, тропа].
 */
export function cascadeTint(c, x, y, z, ny, w) {
  const nz1 = fbm2(x * 0.11, z * 0.11, 3);
  const nz2 = fbm2(x * 0.5 + 9, z * 0.5 + 4, 2);
  w[0] = w[1] = w[3] = 0;
  w[2] = 1;
  const ds = z - shoreZ(x);
  const base = x > -58 && x < 51 && ds > -34 && ds < 16; // берег у базы: здесь песок
  const cl = cliffK(x, z);
  if (y < -0.12) {
    c.lerpColors(base ? sandWet : mudWet, bedDeep, sstep(-0.3, base ? -8 : -4.5, y));
    const bw = Math.hypot(x - BACKWATER.x, z - BACKWATER.z);
    if (bw < BACKWATER.r + 8) c.lerp(bedLeaf, 0.65 * sstep(BACKWATER.r + 8, BACKWATER.r - 4, bw));
    if (ny < 0.8) {
      const k = Math.min(0.85, (0.8 - ny) * 2.2);
      c.lerp(rockA, k);
      w[1] = k;
      w[2] = 1 - k;
    }
    c.multiplyScalar(0.92 + nz2 * 0.12);
    return;
  }
  const hi = sstep(48, 76, y);
  const big = fbm2(x * 0.019 + 4, z * 0.019 + 6, 3);
  // отвесная скала подковы и крутые склоны: мокрый тёмный камень, на уступах — мох
  if (ny < 0.6 || (cl > 0.3 && ny < 0.8 && y > 1.5)) {
    const n2 = nz2 * (1 - hi) + big * hi;
    c.lerpColors(rockA, rockB, n2).multiplyScalar((0.82 + (nz1 * (1 - hi) + big * hi) * 0.22) * (0.94 + 0.08 * Math.sin(y * 2.1 + nz1 * 5)));
    // мох и потёки: чем ближе к воде и водопадам, тем зеленее
    c.lerp(moss, 0.6 * sstep(0.3, 0.68, nz1 + 0.25 * (nz2 - 0.5)) * (1 - hi));
    w[1] = 1;
    w[2] = 0;
    return;
  }
  if (y < 0.85 + nz1 * 0.5 && cl < 0.5) {
    // кромка воды: у базы песок, дальше ил
    c.lerpColors(base ? sand : mud, base ? sandWet : mudWet, sstep(0.5, -0.1, y)).multiplyScalar(0.95 + nz2 * 0.08);
    return;
  }
  // метры от воды; островок лежит «в воде» — там расстоянием служит высота над водой
  let d = -waterD(x, z);
  if (d < 0) d = y * 3;
  const n1 = nz1 * (1 - hi) + big * hi;
  c.lerpColors(jungleA, jungleB, sstep(0.3, 0.7, n1));
  c.lerp(jungleC, sstep(0.55, 0.9, nz2) * 0.45 * (1 - hi));
  // под пологом джунглей — темно; у базы — светлая поляна
  c.lerp(canopy, (base && ds < 15 ? 0.1 : 0.8) * sstep(5, 20, d));
  if (base && ds > 0) c.lerp(meadow, 0.25 * sstep(15, 4, ds));
  w[0] = 1;
  w[2] = 0;
  if (x > -56 && x < 49 && ds > 2.2 && ds < 14) {
    // тропа вдоль берега у базы — красная латеритная земля
    const k = 0.78 * Math.exp(-(((ds - 7.6) / 1.5) ** 2)) * (0.75 + 0.25 * nz2);
    c.lerp(laterite, k);
    w[3] = k;
    w[0] = 1 - k;
  }
  // островок: камень проступает сквозь траву на макушке
  const di = Math.hypot(x - ISLET.x, z - ISLET.z);
  if (di < ISLET.r + 2) c.lerp(rockB, 0.3 * sstep(0.4, 0.8, nz2));
  if (base && ds > 0 && ds < 4.2) {
    const k = sstep(4.2, 2.2, ds) * 0.85;
    c.lerp(sand, k);
    w[2] = k;
    w[0] *= 1 - k;
    w[3] *= 1 - k;
  } else if (!base && d < 3.2) {
    const k = sstep(3.2, 1.4, d) * 0.8;
    c.lerp(mud, k);
    w[2] = k;
    w[0] *= 1 - k;
  }
}

/**
 * Рельеф чаши: подробный кусок вокруг воды и четыре грубых — холмы под джунглями до горизонта.
 * buildGround(x0, x1, z0, z1, nx, nz) — сетка по groundH с красками (world.js).
 */
export function buildCascadeTerrain(buildGround) {
  const { x0, x1, z0, z1 } = BOUNDS;
  const g = new THREE.Group();
  g.add(buildGround(x0, x1, z0, z1, 230, 230));
  const FAR = 860;
  const lap = 12;
  const strip = (ax, bx, az, bz, cell = 14) => {
    const m = buildGround(ax, bx, az, bz, Math.max(2, Math.round((bx - ax) / cell)), Math.max(2, Math.round((bz - az) / cell)));
    m.position.y = -1.1;
    m.name = 'mountains';
    m.receiveShadow = false;
    g.add(m);
  };
  strip(-FAR, FAR, -FAR, z0 + lap, 10); // север: над стеной водопадов — главный вид с пирса
  strip(-FAR, FAR, z1 - lap, FAR * 0.82); // юг
  strip(-FAR, x0 + lap, z0 + lap, z1 - lap); // запад
  strip(x1 - lap, FAR, z0 + lap, z1 - lap); // восток
  return g;
}
