// «Синий простор»: цвет земли, скал и дна. Сам рельеф — в loc/blue.js; сетку по нему строит world.js
// (buildGround), сюда приходят только её краски и раскладка кусков.
//
// Остров вулканический: у базы — тёмный песок, выше — сочные травяные склоны с вереском, обрывы из бурого
// базальта, голая каменистая вершина. Под водой — тёмный песок у пляжа, базальт под обрывами и синева свала.
import * as THREE from 'three';
import { sstep, fbm2 } from '../util.js';
import { BOUNDS, BACKWATER, HOME, LIGHT_ROCK, SEALS, BANK, homeD, shoreZ, cliffK, lightR, bankK } from './blue.js';

const C = (hex) => new THREE.Color(hex);
const sandDry = C('#9a8f7c'); // вулканический песок: тёмный, серо-коричневый
const sandWet = C('#6f675b');
const bedSand = C('#8a8577'); // тот же песок под водой у пляжа
const bedDeep = C('#2c4e6a'); // свал: синева, сквозь которую дна почти не видно
const bedRock = C('#4c4a48'); // базальт под водой
const kelp = C('#5f6a3a'); // бурые водоросли в бухточке и у камней
const basaltA = C('#5f5650'); // обрывы: бурый базальт
const basaltB = C('#76695f');
const basaltC = C('#4d4b4c'); // тёмные потёки
const grassA = C('#5f9a45'); // сочная трава атлантических склонов
const grassB = C('#4b8a3c');
const grassC = C('#7fae52');
const heath = C('#8a7a5a'); // сухой вереск и папоротник выше по склону
const summit = C('#8a8378'); // голая вершина: камень и лишайник
const path = C('#a59a84'); // тропа из шлака
const lightTop = C('#7a9a52'); // травяная макушка Маячной скалы

/**
 * Цвет земли в точке. ny — насколько склон пологий (1 — ровно).
 * w — что это за поверхность, для рисованных текстур (surface.js): [трава, камень, песок, тропа].
 */
export function blueTint(c, x, y, z, ny, w) {
  const nz1 = fbm2(x * 0.09, z * 0.09, 3);
  const nz2 = fbm2(x * 0.45 + 9, z * 0.45 + 4, 2);
  w[0] = w[1] = w[2] = w[3] = 0;
  if (y < -0.12) {
    // дно: у пляжа песок, под обрывами и на свале — камень, глубже — синева
    const D = homeD(x, z);
    const cl = D > -60 ? cliffK(x, z) : 0;
    c.lerpColors(bedSand, bedRock, Math.max(cl * 0.85, sstep(-4, -10, y) * 0.6));
    const bw = Math.hypot(x - BACKWATER.x, z - BACKWATER.z);
    if (bw < BACKWATER.r + 6) c.lerp(kelp, 0.5 * sstep(BACKWATER.r + 6, BACKWATER.r - 4, bw) * (0.5 + 0.5 * sstep(0.4, 0.62, nz1)));
    c.lerp(bedDeep, sstep(-9, -26, y));
    if (bankK(x, z) > 0.05) c.lerp(bedSand, 0.4 * bankK(x, z));
    w[1] = sstep(-1, -5, y) * 0.6 + cl * 0.4;
    w[2] = 1 - w[1];
    if (ny < 0.75) {
      const s = Math.min(0.8, (0.75 - ny) * 2.4);
      c.lerp(bedRock, s);
      w[1] = Math.max(w[1], s);
      w[2] = 1 - w[1];
    }
    c.multiplyScalar(0.94 + nz2 * 0.1);
    return;
  }
  // скалы в море: Маячная скала (кроме травяной макушки) и Тюленьи камни
  const dl = Math.hypot(x - LIGHT_ROCK.x, z - LIGHT_ROCK.z);
  const onLight = dl < LIGHT_ROCK.R + 8;
  const onSeals = Math.hypot(x - SEALS.x, z - SEALS.z) < 40;
  if (onSeals || (onLight && (ny < 0.72 || y < LIGHT_ROCK.top - 1.2))) {
    c.lerpColors(basaltA, basaltB, nz2).multiplyScalar((0.86 + nz1 * 0.2) * (0.95 + 0.07 * Math.sin(y * 2.4 + nz1 * 5)));
    if (onSeals && y > 2) c.lerp(C('#d8d4c8'), 0.35 * sstep(0.5, 0.7, nz2)); // птичий помёт на макушках
    w[1] = 1;
    return;
  }
  if (onLight) {
    c.lerpColors(lightTop, grassB, sstep(0.3, 0.7, nz1));
    w[0] = 1;
    return;
  }
  const D = homeD(x, z);
  const cl = cliffK(x, z);
  // пляж у базы: тёмный песок, у воды мокрый
  if (y < 1.5 + 0.6 * nz1 && cl < 0.5) {
    c.lerpColors(sandWet, sandDry, sstep(-0.1, 0.6, y)).multiplyScalar(0.95 + nz2 * 0.08);
    w[2] = 1;
    return;
  }
  // обрывы: базальт по крутизне, наверху — трава
  if (ny < 0.66 || (cl > 0.5 && D < 7)) {
    c.lerpColors(basaltA, basaltB, nz2).multiplyScalar((0.84 + nz1 * 0.22) * (0.95 + 0.06 * Math.sin(y * 1.7 + nz1 * 6)));
    c.lerp(basaltC, 0.4 * sstep(0.55, 0.75, nz1));
    w[1] = 1;
    return;
  }
  c.lerpColors(grassA, grassB, sstep(0.3, 0.7, nz1));
  c.lerp(grassC, sstep(0.55, 0.9, nz2) * 0.45);
  // выше — вереск, на вершине — голый камень
  const top = sstep(18, 34, y) * (0.6 + 0.4 * nz2);
  c.lerp(heath, top * 0.7);
  c.lerp(summit, sstep(36, 44, y + 4 * (nz1 - 0.5)));
  w[0] = 1 - 0.6 * sstep(36, 44, y);
  w[1] = 1 - w[0];
  // тропа вдоль берега у базы
  const ds = z - shoreZ(x);
  if (x > -56 && x < 49 && ds > 2.2 && ds < 14) {
    const k = 0.8 * Math.exp(-(((ds - 7.6) / 1.5) ** 2)) * (0.75 + 0.25 * nz2);
    c.lerp(path, k);
    w[3] = k;
    w[0] *= 1 - k;
    w[1] *= 1 - k;
  }
}

/**
 * Рельеф «Синего простора»: подробный кусок — остров, свал, Маячная скала; отдельный — Тюленьи камни;
 * под всем остальным океаном — ровное глубокое дно (Банку видно только по цвету воды над ней).
 * buildGround(x0, x1, z0, z1, nx, nz) — сетка по groundH с красками (world.js).
 */
export function buildBlueTerrain(buildGround) {
  const { x0, x1, z0, z1 } = BOUNDS;
  const g = new THREE.Group();
  g.add(buildGround(x0, x1, z0, z1, 240, 210));
  const b = buildGround(BANK.x - BANK.r * 1.5, BANK.x + BANK.r * 1.5, BANK.z - BANK.r * 1.3, BANK.z + BANK.r * 1.3, 40, 36);
  b.name = 'bank';
  g.add(b);
  // дно открытого океана: один большой лист глубоко внизу
  const far = buildGround(-2400, 2400, -2400, 2400, 1, 1);
  far.position.y = -0.35;
  far.receiveShadow = false;
  far.name = 'sea-floor';
  g.add(far);
  return g;
}
export { HOME, lightR };
