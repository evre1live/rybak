// Природа «Коралловых островков»: пальмы и цветущие кусты на песчаных островках, скала с каменной аркой,
// столбы и валуны, хижина с костром на песчаном островке. Всё собрано из тех же моделей, что и бухта:
// каждая пальма, куст и камень оставляет запись в ENV (envmodels.js), по ней встаёт готовая модель;
// процедурная сетка остаётся запасной — для пробной версии без моделей. Коралловые сады на дне — в keys-reef.js.
import * as THREE from 'three';
import { Batch, M, G, BATCH_MAT_2S } from '../batch.js';
import { ENV } from '../envmodels.js';
import { bush } from '../flora.js';
import { palmTree, signBoard } from '../places.js';
import { spot01 } from '../scatter.js';
import { rng, rockGeo, shade, sstep, TAU, fbm2 } from '../util.js';
import {
  ARCH, ARCH_LEGS, ROCK, BEACH, SAND, BLOOM, CAYS, STACKS, OUTER, CAMPFIRE, PASSES, CIRCLES, DECK_Y, LAGOON,
  groundH, homeD, shoreZ, deckAt, rockR, cayR, reefM, passK, rimAt
} from './keys.js';

const GREYS = ['#9a968e', '#8b8882', '#a7a39b', '#918d86', '#b0aca4']; // тёплый светло-серый камень
const GRASS = '#6dbd50';
const BLOOMS = ['#ff4f9a', '#ff6fb2', '#f43f7f', '#ff8a3d', '#fff1f6', '#e94bd0']; // гибискус и бугенвиллея

/** Цветок: пять лепестков чашечкой, смотрит вдоль +Y. Поперечник 1. */
const FLOWER = (() => {
  const pos = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU;
    const tip = [Math.cos(a) * 0.5, 0.16, Math.sin(a) * 0.5];
    const l = [Math.cos(a - 0.44) * 0.3, 0.05, Math.sin(a - 0.44) * 0.3];
    const r = [Math.cos(a + 0.44) * 0.3, 0.05, Math.sin(a + 0.44) * 0.3];
    pos.push(0, 0, 0, ...tip, ...l, 0, 0, 0, ...r, ...tip);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
})();
const _fc = new THREE.Color();
/**
 * Цветущий куст: сам куст (на его место встаёт готовая модель) и цветы поверх кроны — они остаются и на модели.
 * F — набор для цветов; k — сколько цветов (0 — зелёный куст).
 */
export function bloomBush(T, F, x, y, z, s, r, k = 1, col = null) {
  bush(T, x, y, z, s, r);
  const c = col || BLOOMS[Math.floor(r() * BLOOMS.length)];
  const n = Math.round((4 + r() * 4) * k);
  for (let i = 0; i < n; i++) {
    const a = r() * TAU;
    const up = 0.3 + r() * 0.6; // по высоте кроны
    const rad = 0.6 * s * Math.sqrt(1 - up * up * 0.8) * (0.85 + r() * 0.25);
    const size = (0.3 + r() * 0.16) * Math.min(1.25, 0.7 + s * 0.35);
    const fx = x + Math.cos(a) * rad;
    const fy = y + (0.2 + up * 0.6) * s;
    const fz = z + Math.sin(a) * rad;
    const tilt = 1.25 - up * 0.9 + (r() - 0.5) * 0.3; // наверху цветок смотрит в небо, сбоку — наружу
    // цветок ярче краски: на солнце он должен гореть, а не теряться в листве
    F.add(FLOWER, _fc.set(shade(c, (r() - 0.5) * 0.1)).multiplyScalar(1.5), M(fx, fy, fz, size, size, size, tilt, -a + Math.PI / 2, 0));
    F.add(G.cone(5), _fc.set('#ffd84a').multiplyScalar(1.4), M(fx + Math.cos(a) * 0.03, fy + 0.03, fz + Math.sin(a) * 0.03, size * 0.2, size * 0.16, size * 0.2, tilt, -a + Math.PI / 2, 0));
  }
}

/** Пальмы, кусты и цветы на домашнем островке: у базы берег открыт, по рогам и в середине — заросли. */
function buildHome(scene, P, T, F, near) {
  const r = rng(230401);
  const free = (x, z, m) => !deckAt(x, z, -m) && !(x > -15.5 && x < -5 && z > 8 && z < 17.5);
  // тропа у базы и пляж перед ней остаются свободными (по ним ходят и на них стоят лавка, фонари, скамейка)
  const walk = (x, z) => {
    const ds = z - shoreZ(x);
    return x > -58 && x < 51 && ds < 10.2;
  };
  // несколько пальм — нарочно: над пляжем слева и справа от площадки (в кадре с причала и от лавки), на концах рогов
  const SET = [[-24.5, 17.2, 1.1], [-51, 27, 1.2], [14.5, 24.2, 1.15], [27, 25.5, 1.0], [43, 25, 1.2], [-66, 20, 1.05], [-80, 8, 1.15], [-88.5, 0.5, 0.95], [63, 17, 1.1], [76, 6, 1.0], [-36, 30.5, 1.25], [1, 30, 1.3]];
  for (const [x, z, s] of SET) if (homeD(x, z) > 2.2) palmTree(P, x, groundH(x, z), z, s, r);
  let n = 0;
  for (let i = 0; i < 1400 && n < 24; i++) {
    const x = -98 + r() * 190;
    const z = -12 + r() * 74;
    const D = homeD(x, z);
    if (D < 5 || walk(x, z) || !free(x, z, 3)) continue;
    if (CIRCLES.some((c) => Math.hypot(c.x - x, c.z - z) < 4.6)) continue;
    palmTree(P, x, groundH(x, z), z, 0.85 + r() * 0.5, r);
    n++;
  }
  // кусты: зелёные и цветущие — пятнами по всему островку, гуще за тропой
  n = 0;
  for (let i = 0; i < 2600 && n < 110; i++) {
    const x = -98 + r() * 190;
    const z = -12 + r() * 74;
    const D = homeD(x, z);
    if (D < 3.4 || !free(x, z, 1.6)) continue;
    const ds = z - shoreZ(x);
    if (x > -58 && x < 51 && ds < 10.6) continue;
    if (fbm2(x * 0.09 + 13, z * 0.09 + 5, 2) < 0.46 && r() < 0.8) continue;
    if (CIRCLES.some((c) => Math.hypot(c.x - x, c.z - z) < 1.3)) continue;
    const s = 0.7 + r() * 0.9;
    bloomBush(T, F, x, groundH(x, z), z, s, r, r() < 0.62 ? 1 : 0);
    n++;
  }
  // цветы у самой площадки и вдоль тропы: низкие кустики гибискуса — их видно с первого шага
  for (const [x, z, s, c] of [[-17.5, 13.4, 0.9, '#ff4f9a'], [-19.6, 15.2, 0.7, '#fff1f6'], [8.6, 15.6, 0.95, '#ff6fb2'], [10.8, 13.9, 0.7, '#ff8a3d'], [-3.2, 18.6, 0.8, '#f43f7f'], [16.5, 12.2, 0.75, '#e94bd0'], [-32.5, 15.4, 0.8, '#ff4f9a']]) {
    if (homeD(x, z) > 1 && free(x, z, 0.9)) bloomBush(T, F, x, groundH(x, z), z, s, r, 1.4, c);
  }
  // прибрежные вьюнки и ракушки на песке у тропы
  for (let i = 0; i < 240; i++) {
    const x = -54 + r() * 100;
    const d = 3.2 + r() * 9;
    const z = shoreZ(x) + d;
    const y = groundH(x, z);
    if (!free(x, z, 0.6) || y < 0.9 || r() < 0.5) continue;
    near.add(G.cyl(4), '#4fa23f', M(x, y + 0.1, z, 0.025, 0.22, 0.025));
    near.add(G.ico(0), ['#ff6fb2', '#fff1f6', '#ffd84a', '#ff8a3d'][Math.floor(r() * 4)], M(x, y + 0.24, z, 0.12, 0.08, 0.12), { flat: true });
  }
}

/** Камни: валун-заготовка и запись для готовой модели. */
export function rocker(B, S, r) {
  const geos = [rockGeo(11), rockGeo(23), rockGeo(37), rockGeo(51), rockGeo(64, 2, 0.3)];
  const small = [rockGeo(11, 1), rockGeo(23, 1), rockGeo(37, 1)];
  return (as, x, y, z, sx, sy, sz, grass = false, tone = 0) => {
    const c = shade(GREYS[Math.floor(r() * GREYS.length)], tone + (r() - 0.5) * 0.1);
    const set = Math.max(sx, sy, sz) < 2.4 ? small : geos;
    (as ? S : B).add(set[Math.floor(r() * set.length)], c, M(x, y, z, sx, sy, sz, (r() - 0.5) * 0.5, r() * TAU, (r() - 0.5) * 0.5), grass ? { top: [shade(GRASS, (r() - 0.5) * 0.12), 0.72], grad: [0.72, 1.05], soft: true } : { grad: [0.72, 1.05] });
    if (as) ENV.rocks[as].push({ x, y: y - 0.72 * sy, z, w: 2 * sx, h: 1.52 * sy, d: 2 * sz, ry: spot01(x, z, 4) * TAU, tilt: Math.max(sx, sz) < 4 });
  };
}

/**
 * Кольцо утёсов вокруг каменного острова: записи для готовых моделей (стена из пластов и уступ из глыб) — как у
 * острова с маяком в бухте. radius(a) — кромка воды, topAt(x, z) — высота плато; gaps — просветы: [угол, полуширина в метрах].
 */
export function cliffRing(S, cx, cz, radius, topAt, gaps, rc, step = 11.5) {
  const at = (a, rad) => [cx + Math.cos(a) * rad, cz + Math.sin(a) * rad];
  const geos = [rockGeo(11), rockGeo(23), rockGeo(37)];
  gaps = gaps.map(([a, w]) => [(a + TAU * 4) % TAU, w]).sort((p, q) => p[0] - q[0]);
  if (!gaps.length) gaps = [[0, 0.01]];
  let run = 0;
  for (let i = 0; i < gaps.length; i++) {
    const [ga, gw] = gaps[i];
    const [hb, hw] = gaps[(i + 1) % gaps.length];
    const a0 = ga + gw / radius(ga);
    const a1 = hb + (i + 1 === gaps.length ? TAU : 0) - hw / radius(hb);
    if (a1 <= a0) continue;
    const N = 96;
    const acc = [0];
    for (let k = 0; k < N; k++) acc.push(acc[k] + (radius(a0 + ((k + 0.5) / N) * (a1 - a0)) * (a1 - a0)) / N);
    const len = acc[N];
    if (len < 3.5) continue;
    const n = Math.max(1, Math.round(len / step));
    const narrow = len / n < 7.5;
    for (let j = 0; j < n; j++) {
      const want = ((j + 0.5) / n) * len;
      let k = 0;
      while (k < N - 1 && acc[k + 1] < want) k++;
      const a = a0 + ((k + (want - acc[k]) / Math.max(1e-6, acc[k + 1] - acc[k])) / N) * (a1 - a0);
      const R = radius(a);
      const [ax, az] = at(a - 0.03, radius(a - 0.03));
      const [bx, bz] = at(a + 0.03, radius(a + 0.03));
      const tl = Math.hypot(bx - ax, bz - az);
      const wall = run >= 2 ? false : run <= -2 ? true : rc() < 0.5;
      run = wall ? Math.max(1, run + 1) : Math.min(-1, run - 1);
      const depth = Math.min(7.2 + rc() * 1.6, R * 0.5);
      const [x, z] = at(a, R - 1.5 + rc() * 0.7);
      const top = topAt(...at(a, R - Math.min(6.5, R * 0.4))) + 0.5 + rc() * 1.1;
      ENV.rocks[narrow ? 'env-rock2' : wall ? 'env-cliff1' : 'env-cliff2'].push({
        x, y: -1.3, z, w: (len / n) * (1.2 + rc() * 0.12), h: top + 1.3, d: narrow ? Math.min(depth, 6.4) : depth,
        ry: Math.atan2(-(bz - az) / tl, (bx - ax) / tl) + (rc() < 0.5 ? Math.PI : 0) + (narrow ? 0 : (rc() - 0.5) * 0.22), tilt: false,
        turn: !narrow && !wall && rc() < 0.5
      });
      // запасной вид без моделей — гладкая глыба на том же месте
      S.add(geos[Math.floor(rc() * 3)], shade(GREYS[Math.floor(rc() * GREYS.length)], -0.05), M(x, top * 0.42, z, (len / n) * 0.55, top * 0.62, 3.6, 0, Math.atan2(-(bz - az), bx - ax), 0), { top: [GRASS, 0.8], grad: [0.72, 1.05], soft: true });
    }
  }
}

/** Скала с аркой: кольцо утёсов, валуны у воды, зелёная макушка с пальмами и цветами, пляж с мостками. */
function buildRock(scene, B, S, P, T, F) {
  const r = rng(230402);
  const rock = rocker(B, S, r);
  const beachA = Math.atan2(BEACH.z - ROCK.z, BEACH.x - ROCK.x);
  const archA = Math.atan2(ARCH_LEGS[0][1] - ROCK.z, ARCH_LEGS[0][0] - ROCK.x);
  // просветы в кольце утёсов: пляж (там обрыв самой скалы над песком) и западная опора арки
  // за пляжем кольцо утёсов отступает вглубь скалы: песок лежит в каменной нише; просвет — только у западной опоры арки
  const niche = (a) => {
    const d = Math.atan2(Math.sin(a - beachA), Math.cos(a - beachA));
    return rockR(a) - 6.2 * Math.exp(-((d / 0.4) ** 2));
  };
  cliffRing(S, ROCK.x, ROCK.z, niche, groundH, [[archA, 4.2]], rng(230403));
  // валуны у кромки воды и обломки под обрывом
  for (let i = 0; i < 34; i++) {
    const a = r() * TAU;
    const R = rockR(a) + 0.4 + r() * 4;
    const x = ROCK.x + Math.cos(a) * R;
    const z = ROCK.z + Math.sin(a) * R;
    if (cayR(BEACH, x, z) < 1.2 || deckAt(x, z, -1.5)) continue;
    const s = 0.9 + r() * 2;
    rock('env-rock1', x, -0.3 + r() * 0.7, z, s * 1.2, s * 0.8, s, false, -0.05);
  }
  // макушка: пальмы, кусты в цвету (розовая кайма по краю обрыва — как на картинке), пучки травы кладёт grass.js
  for (let i = 0, n = 0; i < 400 && n < 9; i++) {
    const a = r() * TAU;
    const d = Math.sqrt(r()) * (ROCK.R - 7.5);
    const x = ROCK.x + Math.cos(a) * d;
    const z = ROCK.z + Math.sin(a) * d;
    const y = groundH(x, z);
    if (y < ROCK.top - 1.5 || CIRCLES.some((c) => Math.hypot(c.x - x, c.z - z) < 3.2)) continue;
    palmTree(P, x, y, z, 0.8 + r() * 0.45, r);
    n++;
  }
  for (let i = 0, n = 0; i < 700 && n < 44; i++) {
    const a = r() * TAU;
    const d = (0.35 + 0.65 * Math.sqrt(r())) * (rockR(a) - 5.2);
    const x = ROCK.x + Math.cos(a) * d;
    const z = ROCK.z + Math.sin(a) * d;
    const y = groundH(x, z);
    if (y < ROCK.top - 2.2) continue;
    const edge = d > rockR(a) - 8.5; // у края обрыва кусты цветут все
    bloomBush(T, F, x, y, z, edge ? 1.0 + r() * 0.9 : 0.9 + r() * 1.1, r, edge ? 1.5 : r() < 0.45 ? 1 : 0, edge ? ['#ff4f9a', '#ff6fb2', '#f43f7f'][n % 3] : null);
    n++;
  }
  // пляж: пара пальм у подножия скалы, кусты, коряга
  for (const [dx, dz, s] of [[-5.6, -2.6, 1.0], [4.6, -3.0, 0.9]]) {
    const x = BEACH.x + dx;
    const z = BEACH.z + dz;
    if (groundH(x, z) > 0.7) palmTree(P, x, groundH(x, z), z, s, r);
  }
  for (const [dx, dz, s] of [[-2.2, -3.6, 0.8], [2.0, -3.9, 0.7], [6.4, -1.4, 0.6]]) {
    const x = BEACH.x + dx;
    const z = BEACH.z + dz;
    if (groundH(x, z) > 0.8) bloomBush(T, F, x, groundH(x, z), z, s, r, 1.3);
  }
  B.add(G.cyl(7, 0.6, 1), '#a8937a', M(BEACH.x + 5.5, groundH(BEACH.x + 5.5, BEACH.z + 2.4) + 0.16, BEACH.z + 2.4, 0.28, 3.0, 0.28, 0, 0.5, Math.PI / 2 - 0.08), { mat: 1 });
  // указатель у мостков
  const sx = -15.2;
  const sz = -100.9;
  const sy = groundH(sx, sz);
  B.add(G.cyl(8), '#8a5f3a', M(sx, sy + 1.0, sz, 0.14, 2.3, 0.14), { grad: [0.8, 1.05], mat: 1 });
  signBoard(scene, 'СКАЛА С АРКОЙ', 2.0, 0.5, sx, sy + 1.85, sz + 0.08, 0);
  CIRCLES.push({ x: sx, z: sz, r: 0.22 });
}

/** Арка: запасной вид — половина тора, помятая шумом, тех же габаритов, что и готовая модель; опоры стоят на каменных подошвах. */
function buildArch(scene, B, S, T, F) {
  const r = rng(230404);
  const rock = rocker(B, S, r);
  const AB = new Batch();
  AB.mat = 2;
  const tube = 2.5;
  const ag = new THREE.TorusGeometry(ARCH.leg, tube, 7, 13, Math.PI).toNonIndexed();
  const p = ag.attributes.position;
  const v = new THREE.Vector3();
  const ky = (ARCH.h + 0.2) / (ARCH.leg + tube);
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = fbm2(v.x * 0.35 + 5 + v.z * 0.3, v.y * 0.35 + 9 - v.z * 0.2, 3);
    const k = 1 + (n - 0.5) * 0.45;
    const foot = 1 + 0.45 * sstep(4, 0, v.y);
    p.setXYZ(i, v.x * k * (0.94 + 0.06 * foot), v.y * ky * k, v.z * k * foot * 1.25);
  }
  ag.computeVertexNormals();
  AB.add(ag, '#9a968e', M(ARCH.x, -1.4, ARCH.z, 1, 1, 1, 0, ARCH.ry, 0), { top: [GRASS, 0.8], grad: [0.72, 1.05] });
  const mA = AB.build();
  scene.add(mA);
  ENV.fallback.arch.push(mA);
  ENV.singles.push({ id: 'env-arch', key: 'arch', x: ARCH.x, y: -0.5, z: ARCH.z, s: 1, fit: [ARCH.w, ARCH.h, ARCH.d], ry: ARCH.ry, rock: true, gain: 1.15 });
  // под водой опоры стоят на каменных подошвах до самого дна: под аркой — яма
  const geos = [rockGeo(11), rockGeo(23), rockGeo(37), rockGeo(51)];
  for (const [lx, lz] of ARCH_LEGS) {
    const bot = Math.min(-2, groundH(lx, lz));
    for (let k = 0; k < 2; k++) {
      const hh = (-1.2 - bot) / 1.46 + 0.6;
      B.add(geos[Math.floor(r() * 4)], shade('#8b8882', -0.12 + (r() - 0.5) * 0.08), M(lx + (r() - 0.5) * 2.2, bot + hh * 0.72 - 0.4, lz + (r() - 0.5) * 2.2, 4.4 + r() * 1.2, hh, 4.0 + r() * 1.0, 0, r() * TAU, 0), { grad: [0.6, 1.0], soft: true });
    }
  }
  // валуны у восточной опоры и зелень на макушке арки
  for (let i = 0; i < 5; i++) rock('env-rock1', ARCH_LEGS[1][0] + (r() - 0.3) * 5, -0.2, ARCH_LEGS[1][1] + (r() - 0.5) * 5, 1.5 + r() * 1.8, 1.1 + r() * 1.3, 1.5 + r() * 1.8, r() < 0.4);
  const ay = ARCH.h * 0.93 - 0.75;
  bloomBush(T, F, ARCH.x + 0.4, ay + 0.1, ARCH.z - 0.2, 1.0, r, 1.5, '#ff4f9a');
  bloomBush(T, F, ARCH.x - 1.8, ay - 0.1, ARCH.z + 0.8, 0.8, r, 1.2, '#ff6fb2');
  bloomBush(T, F, ARCH.x + 2.0, ay, ARCH.z + 0.4, 0.75, r, 0);
}

/** Столбы в лагуне: высокие скалы на отмели, с зеленью наверху; вокруг — валуны. */
function buildStacks(B, S, T, F) {
  const r = rng(230405);
  const rock = rocker(B, S, r);
  STACKS.forEach(([x, z, w, h], i) => {
    rock(i % 2 ? 'env-rock3' : 'env-rock2', x, h * 0.42 - 0.8, z, w * 0.52, h * 0.72, w * 0.5, true);
    for (let k = 0; k < 3; k++) rock('env-rock1', x + (r() - 0.5) * w * 1.7, -0.3, z + (r() - 0.5) * w * 1.7, 1.1 + r() * 1.4, 0.8 + r() * 0.9, 1.1 + r() * 1.3, false, -0.05);
    if (h > 9) bloomBush(T, F, x + 0.3, h * 0.9 - 0.5, z, 0.8, r, 1.2, '#ff6fb2');
  });
}

/** Цветочный островок: камень в цвету — валуны, две пальмы и кусты гибискуса. */
function buildBloom(B, S, P, T, F) {
  const r = rng(230406);
  const rock = rocker(B, S, r);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU + r() * 0.5;
    const R = BLOOM.r * (0.82 + r() * 0.3);
    const s = 1.0 + r() * 1.3;
    rock(i % 4 === 0 ? 'env-rock2' : 'env-rock1', BLOOM.x + Math.cos(a) * R, -0.2 + r() * 0.7, BLOOM.z + Math.sin(a) * R, s * 1.2, s * (i % 4 === 0 ? 1.1 : 0.8), s, i % 4 === 0, -0.03);
  }
  for (const [dx, dz, s] of [[-1.4, 0.8, 1.0], [2.2, -1.2, 0.85]]) palmTree(P, BLOOM.x + dx, groundH(BLOOM.x + dx, BLOOM.z + dz), BLOOM.z + dz, s, r);
  for (let i = 0, n = 0; i < 80 && n < 9; i++) {
    const a = r() * TAU;
    const d = Math.sqrt(r()) * (BLOOM.r - 1.6);
    const x = BLOOM.x + Math.cos(a) * d;
    const z = BLOOM.z + Math.sin(a) * d;
    const y = groundH(x, z);
    if (y < 1.2 || CIRCLES.some((c) => Math.hypot(c.x - x, c.z - z) < 0.9)) continue;
    bloomBush(T, F, x, y, z, 0.7 + r() * 0.6, r, 1.6);
    n++;
  }
}

/** Песчаный островок: пальмы, хижина лицом к мосткам, костёр со скамейкой, лодка на песке; указатель у мостков. */
function buildSand(scene, B, P, T, F) {
  const r = rng(230407);
  const hx = SAND.x + 3.5;
  const hz = SAND.z + 1.6;
  const hy = groundH(hx, hz);
  // готовая хижина: вход (у модели он на −X) смотрит на запад — к мосткам
  ENV.singles.push({ id: 'env-hut', key: 'hut', x: hx, y: hy - 0.05, z: hz, s: 4.4, ry: 0, block: 2.25 });
  // запасной вид: навес на четырёх столбах
  const HB = new Batch();
  for (const [dx, dz] of [[-1.5, -1.2], [1.5, -1.2], [-1.5, 1.2], [1.5, 1.2]]) HB.add(G.cyl(8), '#8a5f3a', M(hx + dx, hy + 1.1, hz + dz, 0.16, 2.5, 0.16), { grad: [0.8, 1.05] });
  for (const s of [-1, 1]) HB.add(G.box(), '#c9a24f', M(hx, hy + 2.62, hz + s * 0.85, 3.9, 0.1, 1.95, s * 0.42, 0, 0), { grad: [0.9, 1.05], mat: 5 });
  const mH = HB.build(BATCH_MAT_2S);
  scene.add(mH);
  ENV.fallback.hut.push(mH);
  // костёр и скамейка — между хижиной и северным берегом островка
  const fx = CAMPFIRE.x;
  const fz = CAMPFIRE.z;
  const fy = groundH(fx, fz);
  const FB = new Batch();
  FB.mat = 2;
  const stone = rockGeo(5, 1);
  for (let i = 0; i < 8; i++) FB.add(stone, shade('#8d95a1', (r() - 0.5) * 0.16), M(fx + Math.cos((i / 8) * TAU) * 0.62, fy + 0.05, fz + Math.sin((i / 8) * TAU) * 0.62, 0.2, 0.15, 0.2, 0, r() * 6, 0), { mat: 2 });
  for (let i = 0; i < 3; i++) FB.add(G.cyl(7), '#5b3a1e', M(fx, fy + 0.14, fz, 0.13, 0.95, 0.13, 0, (i / 3) * Math.PI, Math.PI / 2 - 0.2));
  const mF = FB.build();
  scene.add(mF);
  ENV.fallback.campfire.push(mF);
  CIRCLES.push({ x: fx, z: fz, r: 0.75 });
  ENV.singles.push({ id: 'env-campfire', key: 'campfire', x: fx, y: fy - 0.03, z: fz, s: 1.75, ry: 0.4, fire: [0.03, 0.2, 0] });
  const bx = fx + 1.9;
  const bz = fz + 1.3;
  ENV.singles.push({ id: 'env-bench', x: bx, y: groundH(bx, bz) - 0.04, z: bz, s: 1.62, ry: -2.2, block: 0.65 });
  // лодка на песке, бочка и сети у хижины
  ENV.singles.push({ id: 'prop-boat', x: SAND.x - 9.5, y: groundH(SAND.x - 9.5, SAND.z + 4.6) + 0.12, z: SAND.z + 4.6, s: 3.7, ry: 0.7, rz: 0.1, block: 1.3 });
  ENV.singles.push({ id: 'prop-barrel', x: hx - 2.9, y: groundH(hx - 2.9, hz - 2.4), z: hz - 2.4, s: 0.95, ry: 0.5, block: 0.5 });
  ENV.singles.push({ id: 'prop-netpile', x: hx - 3.3, y: groundH(hx - 3.3, hz + 2.6), z: hz + 2.6, s: 1.0, ry: 2.2 });
  // пальмы: гуще к середине; не на тропе от мостков к хижине и не у костра
  for (let i = 0, n = 0; i < 400 && n < 7; i++) {
    const x = SAND.x + (r() * 2 - 1) * SAND.rx;
    const z = SAND.z + (r() * 2 - 1) * SAND.rz;
    const q = cayR(SAND, x, z);
    if (q > 0.84 || (q > 0.6 && r() < 0.6)) continue;
    if (Math.abs(z - (SAND.z + 0.2)) < 2.4 && x < hx) continue;
    if (Math.hypot(x - fx, z - fz) < 3.2 || Math.hypot(x - hx, z - hz) < 4.6 || CIRCLES.some((c) => Math.hypot(c.x - x, c.z - z) < 3.6)) continue;
    palmTree(P, x, groundH(x, z), z, 0.85 + r() * 0.45, r);
    n++;
  }
  for (let i = 0, n = 0; i < 200 && n < 10; i++) {
    const x = SAND.x + (r() * 2 - 1) * SAND.rx * 0.9;
    const z = SAND.z + (r() * 2 - 1) * SAND.rz * 0.9;
    if (cayR(SAND, x, z) > 0.78 || (Math.abs(z - (SAND.z + 0.2)) < 2 && x < hx) || Math.hypot(x - fx, z - fz) < 2.4 || Math.hypot(x - hx, z - hz) < 3.3 || CIRCLES.some((c) => Math.hypot(c.x - x, c.z - z) < 1.2)) continue;
    bloomBush(T, F, x, groundH(x, z), z, 0.6 + r() * 0.6, r, r() < 0.7 ? 1.2 : 0);
    n++;
  }
  // указатель у конца мостков
  const sx = 31.2;
  const sz = -87.9;
  const sy = groundH(sx, sz);
  B.add(G.cyl(8), '#8a5f3a', M(sx, sy + 1.0, sz, 0.14, 2.3, 0.14), { grad: [0.8, 1.05], mat: 1 });
  signBoard(scene, 'ПЕСЧАНЫЙ ОСТРОВОК', 2.2, 0.5, sx - 0.08, sy + 1.85, sz, -Math.PI / 2);
  CIRCLES.push({ x: sx, z: sz, r: 0.22 });
}

/** Песчаные островки без причала и острова за рифом: пальмы и кусты; на каменных — кольцо утёсов. */
function buildFar(B, S, P, T, F) {
  const r = rng(230408);
  const rock = rocker(B, S, r);
  const plant = (c, palms, bushes) => {
    for (let i = 0, n = 0; i < 300 && n < palms; i++) {
      const x = c.x + (r() * 2 - 1) * c.rx;
      const z = c.z + (r() * 2 - 1) * c.rz;
      if (cayR(c, x, z) > 0.74 || CIRCLES.some((q) => Math.hypot(q.x - x, q.z - z) < 3.2)) continue;
      palmTree(P, x, groundH(x, z), z, 0.85 + r() * 0.5, r);
      n++;
    }
    for (let i = 0, n = 0; i < 200 && n < bushes; i++) {
      const x = c.x + (r() * 2 - 1) * c.rx * 0.9;
      const z = c.z + (r() * 2 - 1) * c.rz * 0.9;
      if (cayR(c, x, z) > 0.72) continue;
      bloomBush(T, F, x, groundH(x, z), z, 0.6 + r() * 0.6, r, r() < 0.5 ? 1 : 0);
      n++;
    }
  };
  for (const c of CAYS) plant(c, c.id === 'far' ? 5 : 4, 5);
  for (const o of OUTER) {
    if (!o.rock) {
      plant({ x: o.x, z: o.z, rx: o.r, rz: o.r * 0.7 }, 6, 5);
      continue;
    }
    // каменный остров за рифом: утёсы кольцом, шпиль и пальмы наверху
    const radius = (a) => o.r * (1 + 0.14 * Math.sin(3 * a + o.x) + 0.08 * Math.sin(5 * a + o.z));
    cliffRing(S, o.x, o.z, radius, groundH, [], rng(230409 + Math.round(o.x)), 13);
    rock('env-rock3', o.x + o.r * 0.25, o.top + 2.2, o.z - o.r * 0.1, o.r * 0.24, o.top * 0.5, o.r * 0.22, true);
    for (let i = 0, n = 0; i < 200 && n < 5; i++) {
      const a = r() * TAU;
      const d = Math.sqrt(r()) * o.r * 0.5;
      const x = o.x + Math.cos(a) * d;
      const z = o.z + Math.sin(a) * d;
      const y = groundH(x, z);
      if (y < o.top - 2.5) continue;
      if (n < 3) palmTree(P, x, y, z, 0.9 + r() * 0.4, r);
      else bloomBush(T, F, x, y, z, 1.0 + r() * 0.6, r, 1);
      n++;
    }
    for (let i = 0; i < 10; i++) {
      const a = r() * TAU;
      const R = radius(a) + 1 + r() * 5;
      const s = 1.2 + r() * 2.2;
      rock('env-rock1', o.x + Math.cos(a) * R, -0.3 + r() * 0.6, o.z + Math.sin(a) * R, s * 1.2, s * 0.8, s, false, -0.05);
    }
  }
}

/** Гребень рифа: тёмные глыбы кораллового камня торчат из воды — по ним кольцо рифа видно издалека. */
function buildCrest(B) {
  const r = rng(230410);
  const geos = [rockGeo(11, 1), rockGeo(23, 1), rockGeo(37, 1)];
  const TONES = ['#6f6a58', '#7d735f', '#655f52', '#857a66'];
  for (let i = 0, n = 0; i < 600 && n < 90; i++) {
    const th = r() * TAU;
    const [x, z] = rimAt(th, -4 + r() * 9);
    if (passK(x, z) > 0.12 || homeD(x, z) > -14 || Math.abs(reefM(x, z)) > 8) continue;
    const h = groundH(x, z);
    if (h < -1.1) continue;
    const s = 0.5 + r() * r() * 1.5;
    B.add(geos[Math.floor(r() * 3)], shade(TONES[Math.floor(r() * TONES.length)], (r() - 0.5) * 0.12), M(x, h + s * 0.22, z, s * 1.3, s * 0.62, s * 1.1, (r() - 0.5) * 0.4, r() * TAU, (r() - 0.5) * 0.4), { grad: [0.7, 1.05], soft: true });
    n++;
  }
}

/** Мелкие камни и ракушки у воды на домашнем островке (как на базе в бухте, но реже: берег здесь песчаный). */
function buildShore(B, S) {
  const r = rng(230411);
  const rock = rocker(B, S, r);
  for (let i = 0; i < 26; i++) {
    const x = -60 + r() * 115;
    const z = shoreZ(x) - 1.5 + r() * 3.4;
    if (deckAt(x, z, -1.2)) continue;
    const s = 0.25 + r() * 0.55;
    rock('env-rock1', x, groundH(x, z) + s * 0.12, z, s * 1.3, s * 0.75, s, false, 0.05);
  }
}

export function buildKeysNature(scene) {
  const P = new Batch(); // пальмы
  const T = new Batch(); // кусты: запасные, пока не загрузились готовые модели
  const F = new Batch(); // цветы: остаются всегда
  const near = new Batch();
  const B = new Batch();
  B.mat = 2;
  const S = new Batch(); // камни, которые заменяются готовыми моделями
  S.mat = 2;
  P.auto = true;
  buildHome(scene, P, T, F, near);
  buildShore(B, S);
  buildRock(scene, B, S, P, T, F);
  buildArch(scene, B, S, T, F);
  buildStacks(B, S, T, F);
  buildBloom(B, S, P, T, F);
  buildSand(scene, B, P, T, F);
  buildFar(B, S, P, T, F);
  buildCrest(B);
  const mP = P.build(BATCH_MAT_2S);
  const mT = T.build();
  const mF = F.build(BATCH_MAT_2S, false);
  mF.name = 'keys-blooms';
  const mS = S.build();
  scene.add(mP, mT, mF, near.build(), B.build(), mS);
  ENV.fallback.palms.push(mP);
  ENV.fallback.trees.push(mT);
  ENV.fallback.rocks.push(mS);
  // для проверок: сколько чего посажено
  return { palms: ENV.flora['env-palm'].length, bushes: ENV.flora['env-bush'].length, passes: PASSES.length, lagoon: LAGOON };
}
