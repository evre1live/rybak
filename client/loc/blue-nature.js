// Природа «Синего простора»: обрывы острова Маяка, рощи криптомерий на склонах, живые изгороди из гортензий
// у базы, Маячная скала (маяк и домик смотрителя ставит scenery.js — buildLighthouse) и Тюленьи камни в море.
// Как и на других локациях, каждое дерево, куст и камень оставляет запись в ENV (envmodels.js): по ней встаёт
// готовая модель, процедурная сетка остаётся запасной.
import { Batch, M, G, BATCH_MAT_2S } from '../batch.js';
import { ENV } from '../envmodels.js';
import { pine, bush } from '../flora.js';
import { signBoard } from '../places.js';
import { cliffRing, rocker, bloomBush } from './keys-nature.js';
import { rng, shade, TAU, fbm2 } from '../util.js';
import { HOME, LIGHT_ROCK, SEALS, CIRCLES, groundH, homeD, homeR, shoreZ, cliffK, deckAt, lightR } from './blue.js';

const HYDRANGEA = ['#6f8cff', '#8aa0ff', '#a98cff', '#5f7ff0', '#f0b8e8', '#eef2ff']; // гортензии: синие, лиловые, розовые, белые

/** Остров Маяка: обрывы по кругу (кроме излучины с базой), рощи на склонах, гортензии вдоль тропы. */
function buildHome(scene, P, T, F, S) {
  const r = rng(240501);
  const free = (x, z, m) => !deckAt(x, z, -m) && !(x > -15.5 && x < -5 && z > 8 && z < 17.5);
  // обрывы: просвет — излучина с пляжем у базы (на юге острова)
  cliffRing(S, HOME.x, HOME.z, homeR, groundH, [[-Math.PI / 2, 74]], rng(240502), 12.5);
  // рощи криптомерий: пятнами по склонам выше тропы, не на самой вершине
  let n = 0;
  for (let i = 0; i < 3000 && n < 120; i++) {
    const a = r() * TAU;
    const d = Math.sqrt(r()) * HOME.R;
    const x = HOME.x + Math.cos(a) * d;
    const z = HOME.z + Math.sin(a) * d;
    const D = homeD(x, z);
    const y = groundH(x, z);
    if (D < 9 || y < 3.5 || y > 34 || !free(x, z, 3)) continue;
    if (z - shoreZ(x) < 18 && cliffK(x, z) < 0.5) continue; // над базой — открытый луг
    if (fbm2(x * 0.035 + 21, z * 0.035 + 7, 3) < 0.5) continue; // рощи, а не ровный лес
    pine(P, x, y - 0.15, z, 0.85 + r() * 0.55, r);
    n++;
  }
  // кусты по склонам
  n = 0;
  for (let i = 0; i < 2400 && n < 90; i++) {
    const a = r() * TAU;
    const d = Math.sqrt(r()) * HOME.R;
    const x = HOME.x + Math.cos(a) * d;
    const z = HOME.z + Math.sin(a) * d;
    const D = homeD(x, z);
    const y = groundH(x, z);
    if (D < 4 || y < 2 || y > 38 || !free(x, z, 1.6)) continue;
    if (z - shoreZ(x) < 10.6 && cliffK(x, z) < 0.5) continue; // тропа и пляж у базы свободны
    if (CIRCLES.some((c) => Math.hypot(c.x - x, c.z - z) < 1.3)) continue;
    bush(T, x, y, z, 0.7 + r() * 0.8, r);
    n++;
  }
  // живая изгородь из гортензий за тропой у базы — их видно с причала
  for (let x = -54; x < 46; x += 2.2 + r() * 1.4) {
    const z = shoreZ(x) + 11.4 + r() * 1.6;
    if (!free(x, z, 1.2) || homeD(x, z) < 6 || x > -16 && x < 8 && z < 20) continue;
    bloomBush(T, F, x, groundH(x, z), z, 0.75 + r() * 0.45, r, 1.6, HYDRANGEA[Math.floor(r() * HYDRANGEA.length)]);
  }
  // и у самой площадки
  for (const [x, z, s, c] of [[-17.5, 13.6, 0.9, '#6f8cff'], [-19.8, 15.4, 0.75, '#a98cff'], [8.6, 15.8, 0.95, '#8aa0ff'], [10.9, 14.2, 0.7, '#f0b8e8'], [-3.4, 18.8, 0.8, '#5f7ff0'], [16.5, 12.6, 0.75, '#eef2ff']]) {
    if (homeD(x, z) > 1 && free(x, z, 0.9)) bloomBush(T, F, x, groundH(x, z), z, s, r, 1.6, c);
  }
}

/** Валуны у воды: под обрывами острова и на пляже у краёв излучины. */
function buildShore(S) {
  const r = rng(240503);
  const rock = rocker(null, S, r);
  for (let i = 0; i < 70; i++) {
    const a = r() * TAU;
    const R = homeR(a) + 0.5 + r() * 5;
    const x = HOME.x + Math.cos(a) * R;
    const z = HOME.z + Math.sin(a) * R;
    if (cliffK(x, z) < 0.6 || deckAt(x, z, -2)) continue;
    const s = 1.0 + r() * 2.4;
    rock('env-rock1', x, -0.4 + r() * 0.6, z, s * 1.2, s * 0.8, s, false, -0.12);
  }
  // по краям пляжа у базы — россыпь валунов
  for (const [x, z, s] of [[-62, 20, 2.2], [-58, 14, 1.4], [44, 18, 2.0], [50, 26, 2.6], [38, 14, 1.2], [-67, 28, 1.8]]) rock('env-rock1', x, groundH(x, z) + 0.2, z, s * 1.2, s * 0.8, s, false, -0.1);
}

/** Маячная скала: обрывы по кругу (просвет у мостков), трава и кусты на макушке, указатель у мостков. */
function buildLightRock(scene, B, S, T, F) {
  const r = rng(240504);
  cliffRing(S, LIGHT_ROCK.x, LIGHT_ROCK.z, lightR, groundH, [[Math.PI, 4.6]], rng(240505), 10.5);
  const rock = rocker(B, S, r);
  for (let i = 0; i < 26; i++) {
    const a = r() * TAU;
    const R = lightR(a) + 0.4 + r() * 3.6;
    const x = LIGHT_ROCK.x + Math.cos(a) * R;
    const z = LIGHT_ROCK.z + Math.sin(a) * R;
    if (x < 50 && z > -92 && z < -80) continue; // у мостков чисто
    const s = 0.8 + r() * 1.8;
    rock('env-rock1', x, -0.3 + r() * 0.6, z, s * 1.2, s * 0.8, s, false, -0.12);
  }
  // кусты по краю макушки, подальше от маяка и домика
  for (let i = 0, n = 0; i < 400 && n < 12; i++) {
    const a = r() * TAU;
    const d = (0.55 + 0.45 * Math.sqrt(r())) * (lightR(a) - 4.6);
    const x = LIGHT_ROCK.x + Math.cos(a) * d;
    const z = LIGHT_ROCK.z + Math.sin(a) * d;
    const y = groundH(x, z);
    if (y < LIGHT_ROCK.top - 1.2 || Math.hypot(x - LIGHT_ROCK.x - 5.5, z - LIGHT_ROCK.z + 4) < 5 || Math.hypot(x - LIGHT_ROCK.x + 5, z - LIGHT_ROCK.z - 1.2) < 6) continue;
    bloomBush(T, F, x, y, z, 0.7 + r() * 0.5, r, r() < 0.5 ? 1.2 : 0, HYDRANGEA[n % HYDRANGEA.length]);
    n++;
  }
  // указатель у мостков
  const sx = 38.2;
  const sz = -80.6;
  B.add(G.cyl(8), '#8a5f3a', M(sx, 1.1 + 1.0, sz, 0.14, 2.3, 0.14), { grad: [0.8, 1.05], mat: 1 });
  signBoard(scene, 'МАЯЧНАЯ СКАЛА', 2.0, 0.5, sx, 1.1 + 1.85, sz + 0.08, 0);
  CIRCLES.push({ x: sx, z: sz, r: 0.22 });
}

/** Тюленьи камни: каждый столб — большая глыба-модель, вокруг — валуны в пене. */
function buildSeals(B, S) {
  const r = rng(240506);
  const rock = rocker(B, S, r);
  for (const [ox, oz, w, top] of SEALS.rocks) {
    const x = SEALS.x + ox;
    const z = SEALS.z + oz;
    rock(top > 5 ? 'env-rock3' : 'env-rock2', x, top * 0.35, z, w * 0.55, top * 0.62, w * 0.5, false, -0.15);
    for (let k = 0; k < 4; k++) {
      const a = r() * TAU;
      const R = w * 0.55 + 1 + r() * 3;
      const s = 0.7 + r() * 1.3;
      rock('env-rock1', x + Math.cos(a) * R, -0.2 + r() * 0.5, z + Math.sin(a) * R, s * 1.2, s * 0.8, s, false, -0.15);
    }
  }
}

export function buildBlueNature(scene) {
  const P = new Batch(); // деревья: запасные, пока не загрузились готовые модели
  const T = new Batch(); // кусты: тоже
  const F = new Batch(); // цветы гортензий: остаются всегда
  const B = new Batch();
  B.mat = 2;
  const S = new Batch(); // камни и обрывы, которые заменяются готовыми моделями
  S.mat = 2;
  P.auto = true;
  buildHome(scene, P, T, F, S);
  buildShore(S);
  buildLightRock(scene, B, S, T, F);
  buildSeals(B, S);
  const mP = P.build();
  const mT = T.build();
  const mF = F.build(BATCH_MAT_2S, false);
  mF.name = 'blue-blooms';
  const mS = S.build();
  scene.add(mP, mT, mF, B.build(), mS);
  ENV.fallback.trees.push(mP, mT);
  ENV.fallback.rocks.push(mS);
  return { pines: ENV.flora['env-pine'].length, bushes: ENV.flora['env-bush'].length };
}
