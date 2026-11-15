// «Мангровая протока»: цвет земли и дна, лес до горизонта. Сам рельеф — в loc/mangrove.js; сетку по нему строит
// world.js (buildGround), сюда приходят только её краски и раскладка кусков.
import * as THREE from 'three';
import { sstep, fbm2 } from '../util.js';
import { BOUNDS, FLATS, waterD, shoreZ } from './mangrove.js';

const C = (hex) => new THREE.Color(hex);
const sand = C('#d2c39a'); // светлый песок у базы и на мелководье лагуны: вода над ним бирюзовая
const sandWet = C('#b3a47c');
const bedMud = C('#7c6e4e'); // ил под мангровыми берегами
const bedDeep = C('#4a5638'); // тёмный ил на глубине: вода над ним изумрудная
const bedLeaf = C('#6a5a32'); // палая листва на дне у корней
const mud = C('#6a5a42'); // мокрый ил в манграх
const mudDark = C('#4e4232');
const mudFlat = C('#8a7656'); // бугры Илистой отмели: светлый подсохший ил
const litter = C('#5a5a30'); // подстилка под пологом: листья и ил
const mossy = C('#5f7a34');
const jungleA = C('#3f8a32');
const jungleB = C('#2f7a34');
const canopy = C('#24502a');
const laterite = C('#b0623a'); // красная тропа у базы
const meadow = C('#74b04a');

/** Цвет земли в точке; w — какая это поверхность для рисованных текстур (surface.js): [трава, камень, песок, тропа]. */
export function mangroveTint(c, x, y, z, ny, w) {
  const nz1 = fbm2(x * 0.11, z * 0.11, 3);
  const nz2 = fbm2(x * 0.5 + 9, z * 0.5 + 4, 2);
  w[0] = w[1] = w[3] = 0;
  w[2] = 1;
  const ds = z - shoreZ(x);
  const base = x > -58 && x < 51 && ds > -40 && ds < 16; // у базы — песок
  const fl = Math.hypot(x - FLATS.x, z - FLATS.z) < FLATS.r + 6;
  let d = -waterD(x, z); // метры от воды (в воде — меньше нуля)
  if (y < -0.12) {
    // дно: у базы и посреди лагуны — светлый песок, у мангровых берегов — ил с листвой, в глубине — тёмный ил
    const shoreK = sstep(-10, -2, d); // чем ближе к берегу, тем больше ила
    c.lerpColors(base ? sandWet : sand, bedMud, base ? 0.15 : 0.35 + 0.55 * shoreK);
    if (!base && shoreK > 0.3) c.lerp(bedLeaf, 0.45 * shoreK * sstep(0.35, 0.7, nz1));
    c.lerp(bedDeep, sstep(-1.2, -7, y));
    if (fl) c.lerp(mudFlat, 0.5 * sstep(-1.2, -0.2, y));
    c.multiplyScalar(0.9 + nz2 * 0.14);
    return;
  }
  if (fl && d < 4) {
    // бугры отмели: подсохший ил с тёмными лужицами
    c.lerpColors(mudFlat, mudDark, sstep(0.45, 0.7, nz2) * 0.6).multiplyScalar(0.94 + nz1 * 0.1);
    return;
  }
  if (base) {
    // берег у базы: песок у воды, дальше поляна с тропой
    if (y < 0.85 + nz1 * 0.4 || (ds > 0 && ds < 4.2)) {
      c.lerpColors(sand, sandWet, sstep(0.5, -0.1, y)).multiplyScalar(0.95 + nz2 * 0.08);
      return;
    }
    c.lerpColors(jungleA, meadow, 0.45 + 0.3 * nz2);
    c.lerp(canopy, 0.6 * sstep(14, 26, ds));
    w[0] = 1;
    w[2] = 0;
    if (x > -56 && x < 49 && ds > 2.2 && ds < 14) {
      const k = 0.78 * Math.exp(-(((ds - 7.6) / 1.5) ** 2)) * (0.75 + 0.25 * nz2);
      c.lerp(laterite, k);
      w[3] = k;
      w[0] = 1 - k;
    }
    return;
  }
  if (d < 0) d = 0;
  // мангры: у воды — мокрый ил, под пологом — подстилка из листьев с мхом; на холмах вдали — лес
  const far = sstep(60, 140, d);
  c.lerpColors(mud, mudDark, sstep(0.3, 0.7, nz2) * 0.7);
  c.lerp(litter, sstep(2, 9, d));
  c.lerp(mossy, 0.35 * sstep(0.55, 0.8, nz1) * sstep(3, 10, d));
  c.lerp(far > 0.5 ? jungleB : jungleA, far * 0.8);
  c.lerp(canopy, 0.4 * sstep(8, 30, d) * (1 - far));
  c.multiplyScalar(0.92 + nz2 * 0.1);
  if (d > 6) {
    w[0] = sstep(6, 14, d);
    w[2] = 1 - w[0];
  }
}

/**
 * Рельеф протоки: подробный кусок вокруг лагуны, проток и устья и четыре грубых — лес и холмы до горизонта, на
 * северо-востоке — море за устьем. buildGround(x0, x1, z0, z1, nx, nz) — сетка по groundH с красками (world.js).
 */
export function buildMangroveTerrain(buildGround) {
  const { x0, x1, z0, z1 } = BOUNDS;
  const g = new THREE.Group();
  g.add(buildGround(x0, x1, z0, z1, 280, 216));
  const FAR = 900;
  const lap = 12;
  const strip = (ax, bx, az, bz, cell = 14) => {
    const m = buildGround(ax, bx, az, bz, Math.max(2, Math.round((bx - ax) / cell)), Math.max(2, Math.round((bz - az) / cell)));
    m.position.y = -1.1;
    m.name = 'mountains';
    m.receiveShadow = false;
    g.add(m);
  };
  strip(-FAR, FAR, -FAR, z0 + lap, 12); // север и море за устьем
  strip(-FAR, FAR, z1 - lap, FAR * 0.82); // юг
  strip(-FAR, x0 + lap, z0 + lap, z1 - lap); // запад
  strip(x1 - lap, FAR, z0 + lap, z1 - lap); // восток
  return g;
}
