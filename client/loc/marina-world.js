// «Пальмовая марина»: цвет земли и дна, холмы за городом. Сам рельеф — в loc/marina.js; сетку по нему строит
// world.js (buildGround), сюда приходят только её краски и раскладка кусков.
import * as THREE from 'three';
import { sstep, fbm2 } from '../util.js';
import { BOUNDS, BACKWATER, waterD, shoreZ, moleD, cityK } from './marina.js';

const C = (hex) => new THREE.Color(hex);
const sand = C('#e2d2ac'); // светлый песок пляжа и мелководья: вода над ним бирюзовая
const sandWet = C('#c2b08a');
const silt = C('#9a927c'); // дно гавани: ровный ил с песком
const siltDeep = C('#5e6a66'); // на глубине: вода над ним сине-зелёная
const seaBed = C('#b8ad8c'); // море за молом: песок, к глубине темнее
const pave = C('#d8c7ad'); // мостовая набережных: тёплый светлый камень
const paveB = C('#c6b293');
const paveDark = C('#a8977c');
const grass = C('#5f9e3e');
const grassB = C('#7bb24a');
const rock = C('#8a8478'); // мол: серый камень
const hills = C('#3f7a3a');
const path = C('#d6b98a'); // тропа у базы

/** Цвет земли в точке; w — какая это поверхность для рисованных текстур (surface.js): [трава, камень, песок, тропа]. */
export function marinaTint(c, x, y, z, ny, w) {
  const nz1 = fbm2(x * 0.11, z * 0.11, 3);
  const nz2 = fbm2(x * 0.5 + 9, z * 0.5 + 4, 2);
  w[0] = w[1] = w[3] = 0;
  w[2] = 1;
  const d = -waterD(x, z); // метры от воды (в воде — меньше нуля)
  const md = moleD(x, z);
  const ds = z - shoreZ(x);
  const beach = Math.hypot(x - BACKWATER.x, z - BACKWATER.z) < BACKWATER.r + 14;
  if (y < -0.12) {
    // дно: у пляжа и базы — песок, в гавани — ил, в море — песок, к глубине темнее
    const sea = x > 140 || z < -150;
    c.lerpColors(beach || ds > -30 ? sand : sea ? seaBed : silt, siltDeep, sstep(-1.5, sea ? -16 : -8, y) * (sea ? 0.7 : 0.85));
    if (md < 6) c.lerp(rock, 0.7 * sstep(6, 1, md));
    c.multiplyScalar(0.9 + nz2 * 0.14);
    return;
  }
  if (md < 1.5) {
    // мол: серые глыбы
    c.copy(rock).multiplyScalar(0.82 + nz2 * 0.3);
    w[1] = 1;
    w[2] = 0;
    return;
  }
  const ck = cityK(x, z);
  if (ck > 0.5) {
    // город: мостовая набережных, дальше — улицы; у горизонта — зелёные холмы
    const far = sstep(260, 420, d);
    c.lerpColors(pave, paveB, sstep(0.4, 0.7, nz2) * 0.6);
    c.lerp(paveDark, 0.25 * sstep(0.6, 0.85, nz1));
    if (far > 0) c.lerp(hills, far);
    // мостовая — не «камень» для мира: на ней не растут скальные выходы и валуны (decor.js)
    w[2] = 1 - far;
    w[0] = far;
    return;
  }
  // берег у базы и пляж: песок у воды, дальше газон с тропой
  if (beach || y < 0.85 + nz1 * 0.4 || (ds > 0 && ds < 4.2)) {
    c.lerpColors(sand, sandWet, sstep(0.5, -0.1, y)).multiplyScalar(0.95 + nz2 * 0.08);
    return;
  }
  c.lerpColors(grass, grassB, 0.4 + 0.4 * nz2);
  c.lerp(hills, sstep(80, 200, d));
  w[0] = 1;
  w[2] = 0;
  if (x > -56 && x < 49 && ds > 2.2 && ds < 14) {
    const k = 0.78 * Math.exp(-(((ds - 7.6) / 1.5) ** 2)) * (0.75 + 0.25 * nz2);
    c.lerp(path, k);
    w[3] = k;
    w[0] = 1 - k;
  }
}

/**
 * Рельеф марины: подробный кусок вокруг гавани, канала и города и четыре грубых — холмы и море до горизонта.
 * buildGround(x0, x1, z0, z1, nx, nz) — сетка по groundH с красками (world.js).
 */
export function buildMarinaTerrain(buildGround) {
  const { x0, x1, z0, z1 } = BOUNDS;
  const g = new THREE.Group();
  g.add(buildGround(x0, x1, z0, z1, 380, 228));
  const FAR = 900;
  const lap = 12;
  const strip = (ax, bx, az, bz, cell = 14) => {
    const m = buildGround(ax, bx, az, bz, Math.max(2, Math.round((bx - ax) / cell)), Math.max(2, Math.round((bz - az) / cell)));
    m.position.y = -1.1;
    m.name = 'mountains';
    m.receiveShadow = false;
    g.add(m);
  };
  strip(-FAR, FAR, -FAR, z0 + lap, 12); // север: город и холмы, на востоке — море
  strip(-FAR, FAR, z1 - lap, FAR * 0.82); // юг
  strip(-FAR, x0 + lap, z0 + lap, z1 - lap); // запад
  strip(x1 - lap, FAR, z0 + lap, z1 - lap); // восток: море
  return g;
}
