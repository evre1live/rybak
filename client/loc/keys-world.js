// «Коралловые островки»: цвет песка, скал и дна лагуны. Сам рельеф — в loc/keys.js; сетку по нему строит world.js
// (buildGround), сюда приходят только её краски и раскладка кусков.
import * as THREE from 'three';
import { sstep, fbm2 } from '../util.js';
import { BOUNDS, BACKWATER, OUTER, ROCK, BLOOM, STACKS, homeD, shoreZ, reefM, gardenK, passK, cayR, BEACH } from './keys.js';

const C = (hex) => new THREE.Color(hex);
const sandWhite = C('#fbf2d4'); // сухой коралловый песок: почти белый
const sandWet = C('#ecdfb4');
const bedSand = C('#f4ecc8'); // песок под водой: светлый — над ним вода бирюзовая
const bedAqua = C('#a2c8ba'); // тот же песок на глубине лагуны
const bedBlue = C('#3f6f86'); // стена рифа и дно открытого моря
const reefA = C('#727a66'); // камень рифа: оливково-серый
const reefB = C('#8a7866'); // …и рыжеватый
const reefC = C('#6f6280'); // лиловые пятна — коралловая корка
const rubble = C('#e2d6b2'); // гребень рифа: обломки кораллов
const algae = C('#a9a274'); // бурые водоросли на гребне
const seagrass = C('#84b06a'); // морская трава на отмели у причала
const duneA = C('#a9cc6e'); // стелющаяся зелень на песке
const duneB = C('#7fb24e');
const lush = C('#5fa544'); // зелёная макушка скалы
const rockA = C('#8b8882'); // скала: тёплый светло-серый, как утёсы-модели
const rockB = C('#a5a199');
const path = C('#f0e2b2'); // утоптанная тропа из ракушечника

/** Камень ли здесь: скала с аркой, столбы, цветочный островок, скалы за рифом. Песчаные островки — нет. */
function onRock(x, y, z) {
  if (Math.hypot(x - ROCK.x, z - ROCK.z) < ROCK.R + 9) return y > 1.7 || cayR(BEACH, x, z) > 1.12; // над пляжем — обрыв скалы
  if (Math.hypot(x - BLOOM.x, z - BLOOM.z) < BLOOM.r + 4) return true;
  for (const s of STACKS) if (Math.hypot(x - s[0], z - s[1]) < s[2] + 4) return true;
  for (const o of OUTER) if (o.rock && Math.hypot(x - o.x, z - o.z) < o.r + 8) return true;
  return false;
}

/**
 * Цвет земли в точке: белый песок, зелень на дюнах, камень скал; под водой — песок лагуны, пятна кораллового
 * камня в садах, обломки на гребне рифа и синева за ним. ny — насколько склон пологий (1 — ровно).
 * w — что это за поверхность, для рисованных текстур (surface.js): [трава, камень, песок, тропа].
 */
export function keysTint(c, x, y, z, ny, w) {
  const nz1 = fbm2(x * 0.11, z * 0.11, 3);
  const nz2 = fbm2(x * 0.5 + 9, z * 0.5 + 4, 2);
  w[0] = w[1] = w[3] = 0;
  w[2] = 1;
  if (y < -0.12) {
    const m = reefM(x, z);
    // песок: светлый на мели, зеленоватый на глубине лагуны, за рифом — синева
    c.lerpColors(bedSand, bedAqua, sstep(-0.4, -7.5, y));
    if (y < -6) c.lerp(bedBlue, sstep(-6.5, -14, y));
    // коралловый камень: в садах, полосой за гребнем и на самом гребне; между пятнами остаётся песок
    let k = gardenK(x, z) * 0.9;
    if (m < 30) {
      const home = homeD(x, z) > -16 ? 0 : 1; // у домашнего островка берег песчаный
      const pass = 1 - sstep(0.15, 0.5, passK(x, z));
      const ring = sstep(30, 20, m) * sstep(-34, -12, m) * home * pass;
      k = Math.max(k, ring * (0.55 + 0.4 * sstep(0.35, 0.65, nz1)));
      if (m > -9 && m < 6 && y > -1.4) {
        // гребень: светлые обломки, тронутые водорослями
        const cr = sstep(-9, -5, m) * sstep(6, 2, m) * home * pass;
        c.lerp(rubble, cr * 0.75);
        c.lerp(algae, cr * 0.5 * sstep(0.45, 0.7, nz1));
        k *= 1 - 0.6 * cr;
      }
    }
    if (k > 0.02) {
      const patch = sstep(0.3, 0.62, fbm2(x * 0.24 + 5, z * 0.24 + 2, 2)); // рваные пятна: корка и песок вперемешку
      const kk = k * (0.45 + 0.55 * patch);
      const tone = fbm2(x * 0.07 + 20, z * 0.07 + 13, 2);
      c.lerp(tone < 0.42 ? reefA : tone < 0.6 ? reefB : reefC, Math.min(1, kk * 1.05));
      w[1] = kk * 0.7;
      w[2] = 1 - w[1];
    }
    // морская трава на тихой отмели
    const bw = Math.hypot(x - BACKWATER.x, z - BACKWATER.z);
    if (bw < BACKWATER.r + 8) c.lerp(seagrass, 0.55 * sstep(BACKWATER.r + 8, BACKWATER.r - 3, bw) * (0.5 + 0.5 * sstep(0.35, 0.6, nz1)));
    if (ny < 0.78) {
      const s = Math.min(0.8, (0.78 - ny) * 2.4);
      c.lerp(y < -5 ? bedBlue : reefA, s);
      w[1] = Math.max(w[1], s);
      w[2] = 1 - w[1];
    }
    c.multiplyScalar(0.94 + nz2 * 0.11);
    return;
  }
  const rocky = onRock(x, y, z);
  if (rocky) {
    if (ny < 0.7 || y < 0.35) {
      c.lerpColors(rockA, rockB, nz2).multiplyScalar((0.86 + nz1 * 0.2) * (0.95 + 0.07 * Math.sin(y * 2.4 + nz1 * 5)));
      w[1] = 1;
      w[2] = 0;
      return;
    }
    // макушка скалы — густая зелень
    c.lerpColors(lush, duneB, sstep(0.3, 0.7, nz1));
    c.lerp(duneA, sstep(0.6, 0.9, nz2) * 0.4);
    w[0] = 1;
    w[2] = 0;
    return;
  }
  // песок: у воды влажный, выше — белый
  c.lerpColors(sandWet, sandWhite, sstep(-0.1, 0.55, y)).multiplyScalar(0.96 + nz2 * 0.07);
  const D = homeD(x, z);
  if (D > 0) {
    // домашний островок: за пляжем — зелень пятнами по песку, вдоль берега у базы — тропа
    const g = sstep(4.4, 9, D + (nz1 - 0.5) * 5) * (0.35 + 0.65 * sstep(0.3, 0.56, fbm2(x * 0.06 + 31, z * 0.06 + 17, 3)));
    if (g > 0.01) {
      c.lerp(nz1 > 0.5 ? duneA : duneB, g * 0.9);
      w[0] = g;
      w[2] = 1 - g;
    }
    const ds = z - shoreZ(x);
    if (x > -57 && x < 50 && ds > 2.2 && ds < 14) {
      const k = 0.85 * Math.exp(-(((ds - 7.6) / 1.5) ** 2)) * (0.8 + 0.2 * nz2);
      c.lerp(path, k);
      w[3] = k;
      w[0] *= 1 - k;
      w[2] = Math.max(0, 1 - w[0] - w[3]);
    }
    return;
  }
  // песчаные островки: трава только на макушке дюны
  const g = sstep(1.15, 1.9, y + (nz1 - 0.5) * 0.8) * 0.7;
  if (g > 0.01) {
    c.lerp(duneA, g);
    w[0] = g;
    w[2] = 1 - g;
  }
}

/**
 * Рельеф островков: подробный кусок — лагуна с рифом и его внешним склоном; отдельные куски — острова за рифом;
 * под всем остальным морем — ровное дно.
 * buildGround(x0, x1, z0, z1, nx, nz) — сетка по groundH с красками (world.js).
 */
export function buildKeysTerrain(buildGround) {
  const { x0, x1, z0, z1 } = BOUNDS;
  const g = new THREE.Group();
  g.add(buildGround(x0, x1, z0, z1, 250, 234));
  for (const o of OUTER) {
    const R = o.r * (o.rock ? 3.4 : 4.0);
    const m = buildGround(o.x - R, o.x + R, o.z - R, o.z + R, 44, 44);
    m.name = 'outer-' + o.id;
    g.add(m);
  }
  // дно открытого моря: один большой лист чуть ниже подробного рельефа (углы листа — далеко в море)
  const far = buildGround(-2400, 2400, -2400, 2400, 1, 1);
  far.position.y = -0.35;
  far.receiveShadow = false;
  far.name = 'sea-floor';
  g.add(far);
  return g;
}
