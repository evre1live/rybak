// «Сосновое озеро»: цвет земли и дна, горы вокруг. Сам рельеф — в loc/lake.js; сетку по нему строит world.js
// (buildGround), сюда приходят только её краски и раскладка кусков.
import * as THREE from 'three';
import { sstep, fbm2 } from '../util.js';
import { BOUNDS, BACKWATER, GLADE, CABIN, CAMPFIRE, waterD, shoreZ } from './lake.js';

const C = (hex) => new THREE.Color(hex);
const sand = C('#e6d9ae');
const sandWet = C('#cfc39a');
const pebble = C('#b3ad9c');
const pebbleWet = C('#8f8d82');
const bedDeep = C('#586e66'); // тёмный ил на глубине: вода над ним — густой сине-зелёной
const bedReed = C('#6c7a4e'); // зелёный ил заводи
const grassA = C('#6ea348');
const grassB = C('#5a903e');
const grassC = C('#8cba58');
const forest = C('#2f6a3c'); // под лесом: тёмная хвойная зелень — в тон кронам, чтобы лес читался сплошным
const alpine = C('#8e9c62'); // луга выше леса — желтее и суше
const rockA = C('#827f79');
const rockB = C('#9a968e');
const rockHi = C('#a9a6a2'); // камень высоко в горах светлее
const snow = C('#f3f6fb');
const path = C('#d2c08e');
const meadow = C('#86b852'); // поляна у избушки: светлый луг

/** Расстояние от точки до отрезка (ax, az)–(bx, bz). */
function segDist(x, z, ax, az, bx, bz) {
  const dx = bx - ax;
  const dz = bz - az;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(x - ax - dx * t, z - az - dz * t);
}
// тропинки на поляне: от мостков к крыльцу избушки и от неё к костру
const DOOR = [CABIN.x - Math.sin(CABIN.ry) * (0.3 * CABIN.s + 1.4), CABIN.z - Math.cos(CABIN.ry) * (0.3 * CABIN.s + 1.4)];
const TRAILS = [[-22, -111.5, DOOR[0], DOOR[1]], [DOOR[0], DOOR[1] + 1.5, CAMPFIRE.x - 1.2, CAMPFIRE.z - 0.6]];

/**
 * Цвет земли в точке: галька и песок у воды, трава, лесная подстилка, камень, снег; под водой — галька и ил.
 * ny — насколько склон пологий (1 — ровно). w — что это за поверхность, для рисованных текстур
 * (surface.js): [трава, камень, песок, тропа].
 */
export function lakeTint(c, x, y, z, ny, w) {
  const nz1 = fbm2(x * 0.11, z * 0.11, 3);
  const nz2 = fbm2(x * 0.5 + 9, z * 0.5 + 4, 2);
  w[0] = w[1] = w[3] = 0;
  w[2] = 1;
  const ds = z - shoreZ(x);
  const base = x > -58 && x < 51 && ds > -34 && ds < 16; // берег у базы: здесь песок, как в бухте
  if (y < -0.12) {
    // дно: у базы светлый песок (вода над ним бирюзовая), вокруг озера — галька, на глубине — тёмный ил
    c.lerpColors(base ? sandWet : pebbleWet, bedDeep, sstep(-0.3, base ? -9 : -5.5, y));
    const bw = Math.hypot(x - BACKWATER.x, z - BACKWATER.z);
    if (bw < BACKWATER.r + 6) c.lerp(bedReed, 0.6 * sstep(BACKWATER.r + 6, BACKWATER.r - 4, bw));
    if (ny < 0.8) {
      const k = Math.min(0.8, (0.8 - ny) * 2.2);
      c.lerp(rockA, k);
      w[1] = k;
      w[2] = 1 - k;
    }
    c.multiplyScalar(0.93 + nz2 * 0.12);
    return;
  }
  // высоко в горах сетка грубая (14 м): мелкий шум на ней рябит — там краски меняются плавно, по крупным пятнам
  const hi = sstep(52, 80, y);
  const big = fbm2(x * 0.019 + 4, z * 0.019 + 6, 3);
  const snowLine = 118 + big * 44;
  if (y > snowLine - 16 && ny > 0.42) {
    // снег на пологих местах выше границы; у границы он ложится языками, на крутых стенах не держится — там камень
    const k = sstep(snowLine - 16, snowLine + 6, y + (big - 0.5) * 20) * sstep(0.42, 0.62, ny);
    if (k > 0.02) {
      c.lerpColors(rockA, rockHi, 0.6).multiplyScalar(0.9 + big * 0.14);
      c.lerp(snow, k);
      w[1] = 1 - k;
      w[2] = k;
      return;
    }
  }
  if (ny < 0.6 || (y > 70 && ny < 0.82) || y > snowLine - 22) {
    const n2 = nz2 * (1 - hi) + big * hi;
    c.lerpColors(rockA, rockB, n2).multiplyScalar((0.84 + (nz1 * (1 - hi) + big * hi) * 0.22) * (0.94 + 0.08 * (1 - hi) * Math.sin(y * 2.4 + nz1 * 5)));
    c.lerp(rockHi, 0.5 * sstep(60, 130, y));
    w[1] = 1;
    w[2] = 0;
    return;
  }
  if (y < 0.85 + nz1 * 0.5) {
    // кромка воды: у базы песок, дальше галька
    c.lerpColors(base ? sand : pebble, base ? sandWet : pebbleWet, sstep(0.5, -0.1, y)).multiplyScalar(0.95 + nz2 * 0.08);
    return;
  }
  // метры от воды; островок и гряда лежат «в воде» — там расстоянием служит высота над водой
  let d = -waterD(x, z);
  if (d < 0) d = y * 3;
  const n1 = nz1 * (1 - hi) + big * hi;
  c.lerpColors(grassA, grassB, sstep(0.3, 0.7, n1));
  c.lerp(grassC, sstep(0.55, 0.9, nz2) * 0.5 * (1 - hi));
  // под лесом — тёмная хвойная зелень; у базы и на поляне у избушки — светлый луг
  const gd = Math.hypot(x - GLADE.x, z - GLADE.z);
  const glade = sstep(GLADE.r + 4, GLADE.r - 5, gd);
  c.lerp(forest, (base && ds < 15 ? 0.12 : 0.86 * (1 - 0.92 * glade)) * sstep(5, 22, d) * (1 - 0.8 * sstep(60, 92, y)));
  if (glade > 0.01) c.lerp(meadow, 0.45 * glade * (0.6 + 0.4 * nz2));
  // выше леса — сухие луга
  c.lerp(alpine, 0.75 * sstep(62, 96, y));
  w[0] = 1;
  w[2] = 0;
  if (x > -56 && x < 49 && ds > 2.2 && ds < 14) {
    // тропа вдоль берега у базы
    const k = 0.8 * Math.exp(-(((ds - 7.6) / 1.5) ** 2)) * (0.75 + 0.25 * nz2);
    c.lerp(path, k);
    w[3] = k;
    w[0] = 1 - k;
  }
  if (glade > 0.2) {
    let td = 99;
    for (const t of TRAILS) td = Math.min(td, segDist(x, z, t[0], t[1], t[2], t[3]));
    if (td < 3) {
      const k = 0.78 * Math.exp(-((td / 0.95) ** 2)) * (0.75 + 0.25 * nz2);
      c.lerp(path, k);
      w[3] = k;
      w[0] = 1 - k;
    }
  }
  if (base && ds > 0 && ds < 4.2) {
    const k = sstep(4.2, 2.2, ds) * 0.85;
    c.lerp(sand, k);
    w[2] = k;
    w[0] *= 1 - k;
    w[3] *= 1 - k;
  } else if (!base && d < 3.2) {
    const k = sstep(3.2, 1.4, d) * 0.8;
    c.lerp(pebble, k);
    w[2] = k;
    w[0] *= 1 - k;
  }
}

/**
 * Рельеф озера: подробный кусок вокруг воды и четыре грубых — горы до горизонта.
 * buildGround(x0, x1, z0, z1, nx, nz) — сетка по groundH с красками (world.js).
 */
export function buildLakeTerrain(buildGround) {
  const { x0, x1, z0, z1 } = BOUNDS;
  const g = new THREE.Group();
  g.add(buildGround(x0, x1, z0, z1, 230, 230));
  // горы: грубая сетка в 13–15 метров, с нахлёстом на подробный кусок (стык прячется под лесом);
  // сами куски опущены на метр, чтобы в нахлёсте не спорили с подробным рельефом
  const FAR = 880;
  const lap = 12;
  const strip = (ax, bx, az, bz, cell = 14) => {
    const m = buildGround(ax, bx, az, bz, Math.max(2, Math.round((bx - ax) / cell)), Math.max(2, Math.round((bz - az) / cell)));
    m.position.y = -1.1;
    m.name = 'mountains';
    m.receiveShadow = false;
    g.add(m);
  };
  strip(-FAR, FAR, -FAR, z0 + lap, 10); // север: эти горы — главный вид с пирса, сетка у них мельче
  strip(-FAR, FAR, z1 - lap, FAR * 0.82); // юг
  strip(-FAR, x0 + lap, z0 + lap, z1 - lap); // запад
  strip(x1 - lap, FAR, z0 + lap, z1 - lap); // восток
  return g;
}
