// Природа «Мангровой протоки»: мангры по всем берегам лагуны и проток — модели Tripo с корнями-арками прямо в воде
// и раскидистыми кронами; дыхательные корни торчат из ила. На воде — палые листья, на Илистой отмели — прыгуны,
// на северном берегу лагуны — хижина на сваях с фонарями и флажками, в ветвях над водой — фонари, по вечерам
// над протокой — светлячки. Деревья — готовые модели (kit.js, записи в ENV), всё остальное — код.
import * as THREE from 'three';
import { Batch, M, G, BATCH_MAT } from '../batch.js';
import { ENV, addGlow, addLit } from '../envmodels.js';
import { roundTree, bush } from '../flora.js';
import { palmTree } from '../places.js';
import { bloomBush } from './keys-nature.js';
import { spot01 } from '../scatter.js';
import { rng, blobGeo, shade, sstep, TAU, fbm2, clamp } from '../util.js';
import { BOUNDS, LAGOON, ISLES, FLATS, HUT, DECK_Y, MOORINGS, groundH, waterD, shoreZ, deckAt } from './mangrove.js';

const BARK = ['#8a5e3c', '#946642', '#7e5436', '#9a6a46']; // корни и стволы мангров: тёплое красноватое дерево
const MOSS = '#7c9c3e';
const BLOOMS = ['#ff3b30', '#ff5a3a', '#ffb21e', '#ff6fb2', '#f8f4e8']; // гибискус, геликонии

/** Берег у базы открыт: площадка, тропа, пляж. */
const atBase = (x, z, m = 0) => x > -58 - m && x < 51 + m && z - shoreZ(x) > -6 - m && z - shoreZ(x) < 15.5 + m;
const nearHut = (x, z, m = 0) => Math.abs(x - HUT.x) < HUT.w / 2 + 6 + m && z > HUT.z - HUT.d - 4 - m && z < HUT.z + 9 + m;
const onFlats = (x, z, m = 0) => Math.hypot(x - FLATS.x, z - FLATS.z) < FLATS.r + m;

/**
 * Мангр у воды: модель Tripo с корнями-арками, кривым стволом и кроной (env-mangrove*, kit.js ставит её вместо
 * записи env-oak), низ корней — у кромки воды. Пока модель не загрузилась — запасная крона из кода (fall).
 * Вокруг из ила торчат дыхательные корни (pneu). Возвращает высоту, на которой у дерева начинаются ветви.
 */
function mangrove(fall, pneu, x, z, s, r) {
  const gy = Math.max(groundH(x, z), -0.3);
  ENV.flora['env-oak'].push({ x, y: gy - 0.25, z, s: 11 * s, ry: r() * TAU });
  // запасная крона: ствол и комья листвы (без записи в ENV — запись уже есть)
  roundTree(fall, x, gy + 1.6 * s, z, 2.1 * s, r, false);
  if (pneu)
    for (let i = 0; i < 9; i++) {
      const a = r() * TAU;
      const d = (2.5 + r() * 4.5) * s;
      const px = x + Math.cos(a) * d;
      const pz = z + Math.sin(a) * d;
      const py = groundH(px, pz);
      if (py < -0.5 || py > 0.5) continue;
      const h = 0.18 + r() * 0.3;
      pneu.add(G.cone(4), shade('#6a5038', (r() - 0.5) * 0.15), M(px, Math.max(py, -0.12) + h / 2 - 0.04, pz, 0.05, h, 0.05, (r() - 0.5) * 0.3, 0, (r() - 0.5) * 0.3));
    }
  return gy + 2.4 * s;
}

const FAR_CROWNS = [blobGeo(5, 0, 0.16), blobGeo(19, 0, 0.16), blobGeo(31, 0, 0.18)];
/** Дальний мангровый лес: тёмный комок листвы, иногда над ним поднимается дерево повыше. */
function farCanopy(B, x, y, z, h, r) {
  const base = ['#4f8f36', '#5a9a3c', '#447f30', '#66a442', '#3f7a2e'][Math.floor(r() * 5)];
  const w = h * (0.8 + r() * 0.3);
  B.add(FAR_CROWNS[Math.floor(r() * FAR_CROWNS.length)], shade(base, (r() - 0.5) * 0.14), M(x, y + 0.5 * h, z, w, h * 0.5, w, 0, r() * 3, 0), { grad: [0.62, 1.15], mat: 3 });
}

/** Сетка 2D для «не ближе, чем»: ячейки по cell метров. */
function spacer(cell) {
  const m = new Map();
  const key = (i, j) => i * 100003 + j;
  return {
    free(x, z, d) {
      const i0 = Math.floor((x - d) / cell);
      const i1 = Math.floor((x + d) / cell);
      const j0 = Math.floor((z - d) / cell);
      const j1 = Math.floor((z + d) / cell);
      for (let i = i0; i <= i1; i++)
        for (let j = j0; j <= j1; j++) {
          const l = m.get(key(i, j));
          if (l) for (const [px, pz] of l) if ((px - x) ** 2 + (pz - z) ** 2 < d * d) return false;
        }
      return true;
    },
    add(x, z) {
      const k = key(Math.floor(x / cell), Math.floor(z / cell));
      if (!m.has(k)) m.set(k, []);
      m.get(k).push([x, z]);
    }
  };
}

/** Где стоят мангры у воды: [x, z, s, rc] — для фонарей и светлячков. */
export const FRINGE = [];

function buildMangroves(scene) {
  const r = rng(270101);
  const fall = new Batch(); // запасные кроны, пока не загрузились готовые
  fall.ghost = true; // записи в ENV ставит сам mangrove(), со своей высотой и размером
  const fall2 = new Batch(); // запасные деревья второго ряда (их записи — от roundTree)
  const pneu = new Batch(); // дыхательные корни
  const far = new Batch();
  far.far = true;
  const sp = spacer(8);
  // ── передний ряд: мангры на самой кромке, корни в воде ──
  const { x0, x1, z0, z1 } = BOUNDS;
  let n = 0;
  for (let i = 0; i < 120000 && n < 270; i++) {
    const x = x0 + 6 + r() * (x1 - x0 - 12);
    const z = z0 + 6 + r() * (z1 - z0 - 12);
    const w = waterD(x, z);
    if (w < -3.2 || w > 1.4) continue;
    if (atBase(x, z, 2) || nearHut(x, z) || MOORINGS.some((m) => Math.hypot(x - m.x, z - m.z) < 9)) continue;
    if (onFlats(x, z, 2) && r() < 0.8) continue; // на отмели мангры редкие
    if (z > 30 || x > 312 || z < -280) continue;
    if (!sp.free(x, z, 7)) continue;
    sp.add(x, z);
    const s = 0.82 + r() * 0.36;
    FRINGE.push([x, z, s, mangrove(fall, pneu, x, z, s, r)]);
    n++;
  }
  // ── островки лагуны: большое дерево посередине и пара поменьше у края ──
  for (const I of ISLES) {
    const s = 1.05 + I.r * 0.04;
    FRINGE.push([I.x, I.z, s, mangrove(fall, pneu, I.x, I.z, s, r)]);
    sp.add(I.x, I.z);
    for (let k = 0; k < 3; k++) {
      const a = r() * TAU;
      const x = I.x + Math.cos(a) * I.r * 0.9;
      const z = I.z + Math.sin(a) * I.r * 0.9;
      if (!sp.free(x, z, 5)) continue;
      sp.add(x, z);
      FRINGE.push([x, z, 0.75, mangrove(fall, pneu, x, z, 0.75, r)]);
    }
  }
  // ── второй ряд: деревья за кромкой (кроны из набора локации; корней за передним рядом не видно) ──
  let m2 = 0;
  for (let i = 0; i < 90000 && m2 < 420; i++) {
    const x = x0 + 6 + r() * (x1 - x0 - 12);
    const z = z0 + 6 + r() * (z1 - z0 - 12);
    const d = -waterD(x, z);
    if (d < 4 || d > 24) continue;
    if (atBase(x, z, 1) || nearHut(x, z, -2)) continue;
    if (!sp.free(x, z, 6.5)) continue;
    sp.add(x, z);
    roundTree(fall2, x, groundH(x, z) + 0.2, z, 2.0 + r() * 0.7, r, true);
    m2++;
  }
  // ── дальний лес: сплошной полог до горизонта ──
  const rf = rng(270115);
  let f = 0;
  for (let i = 0; i < 100000 && f < 6500; i++) {
    const x = -520 + rf() * 1100;
    const z = -620 + rf() * 820;
    const d = -waterD(x, z);
    if (d < 16 || d > 420) continue;
    if (atBase(x, z, 18)) continue;
    const y = groundH(x, z);
    if (Math.abs(groundH(x + 3, z) - y) > 5) continue;
    // дальше 120 м от воды почти половина крон — «редкая»: на «низком» качестве их не рисуют (batch.js)
    farCanopy(d > 120 && spot01(x, z, 7) > 0.55 ? far.thin : far, x, y - 0.4, z, 7 + rf() * 5 + 8 * sstep(60, 300, d), rf);
    f++;
  }
  const mFall = fall.build();
  const mFall2 = fall2.build();
  const mFar = far.build(BATCH_MAT, false);
  mFar.name = 'mangrove-far-forest';
  const mPneu = pneu.build(BATCH_MAT, false);
  mPneu.name = 'mangrove-pneumatophores';
  scene.add(mFall, mFall2, mFar, mPneu);
  ENV.fallback.trees.push(mFall, mFall2);
}

/** Берег у базы: подлесок, гибискус у тропы, бамбуковый забор (граница, дальше которой не ходят). */
function buildBase(scene) {
  const r = rng(270121);
  const T = new Batch();
  const F = new Batch();
  for (let i = 0; i < 300; i++) {
    const x = -56 + r() * 105;
    const d = 3.6 + r() * 16;
    const z = shoreZ(x) + d;
    if (d < 14 && r() < 0.75) continue;
    if (deckAt(x, z, -1.5)) continue;
    const y = groundH(x, z);
    if (r() < 0.4) bloomBush(T, F, x, y, z, 0.6 + r() * 0.5, r, 0.8, BLOOMS[Math.floor(r() * BLOOMS.length)]);
    else bush(T, x, y, z, 0.6 + r() * 0.7, r);
  }
  // пара пальм у лавки и тропы
  for (const [x, dz] of [[-24, 16], [14, 15], [30, 17]]) {
    const z = shoreZ(x) + dz;
    palmTree(T, x, groundH(x, z), z, 0.95, r);
  }
  for (let i = 0; i < 200; i++) {
    const x = -52 + r() * 96;
    const d = 3.4 + r() * 10;
    const z = shoreZ(x) + d;
    const y = groundH(x, z);
    if (deckAt(x, z, -0.6) || y < 1 || r() < 0.5) continue;
    F.add(G.cyl(4), '#2f8a34', M(x, y + 0.14, z, 0.03, 0.3, 0.03));
    F.add(G.ico(0), BLOOMS[Math.floor(r() * BLOOMS.length)], M(x, y + 0.31, z, 0.12, 0.09, 0.12), { flat: true });
  }
  let prev = null;
  for (let x = -53.5; x <= 5.5; x += 2.3) {
    const z = shoreZ(x) + 14.1;
    const y = groundH(x, z);
    F.add(G.cyl(6), '#b8a274', M(x, y + 0.5, z, 0.09, 1.1, 0.09), { grad: [0.8, 1.05] });
    if (prev) {
      const len = Math.hypot(x - prev[0], z - prev[2], y - prev[1]);
      const ry = Math.atan2(-(z - prev[2]), x - prev[0]);
      const rz = Math.atan2(y - prev[1], Math.hypot(x - prev[0], z - prev[2]));
      for (const h of [0.42, 0.82]) F.add(G.cyl(6), '#c9b483', M((x + prev[0]) / 2, (y + prev[1]) / 2 + h, (z + prev[2]) / 2, 0.045, len, 0.045, 0, ry, Math.PI / 2 + rz));
    }
    prev = [x, y, z];
  }
  const mT = T.build();
  scene.add(mT, F.build());
  ENV.fallback.trees.push(mT);
}

/** Палые листья на воде: жёлтые, рыжие и зелёные, гуще у мангровых берегов и в заводях. */
function buildLeaves(scene) {
  const r = rng(270131);
  const B = new Batch();
  const leaf = (() => {
    const g = new THREE.BufferGeometry();
    // ромбик листа, чуть выгнутый вдоль жилки
    g.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, 0.02, 0, 0, 0, -0.2, 0.5, 0.03, 0, 0, 0, 0.2], 3));
    g.setIndex([0, 1, 3, 1, 2, 3]);
    g.computeVertexNormals();
    return g;
  })();
  const COL = ['#e0a82c', '#eebd3a', '#d0782a', '#b8642a', '#9aac3a', '#c8c040'];
  let n = 0;
  for (let i = 0; i < 60000 && n < 2600; i++) {
    const x = BOUNDS.x0 + r() * (BOUNDS.x1 - BOUNDS.x0);
    const z = BOUNDS.z0 + r() * (BOUNDS.z1 - BOUNDS.z0);
    const w = waterD(x, z);
    if (w < 0.6 || w > 26) continue;
    if (groundH(x, z) > -0.2 || deckAt(x, z, -1.2)) continue;
    // у берега гуще; ветер сносит листья полосами
    const k = sstep(18, 2, w) * (0.35 + 0.65 * sstep(0.35, 0.65, fbm2(x * 0.05 + 3, z * 0.05 + 1, 2)));
    if (r() > k) continue;
    const s = 0.12 + r() * 0.12;
    B.add(leaf, shade(COL[Math.floor(r() * COL.length)], (r() - 0.5) * 0.2), M(x, 0.065, z, s, s, s, 0, r() * TAU, 0));
    n++;
  }
  const m = B.build(BATCH_MAT, false);
  m.name = 'mangrove-leaves';
  m.receiveShadow = true;
  scene.add(m);
}

/** Прыгуны на буграх отмели: глазастые рыбки сидят на иле, опираясь на плавники. */
function buildSkippers(scene) {
  const r = rng(270141);
  const B = new Batch();
  let n = 0;
  for (let i = 0; i < 4000 && n < 26; i++) {
    const a = r() * TAU;
    const d = Math.sqrt(r()) * FLATS.r;
    const x = FLATS.x + Math.cos(a) * d;
    const z = FLATS.z + Math.sin(a) * d;
    const y = groundH(x, z);
    if (y < 0.02 || y > 0.5 || deckAt(x, z, -1)) continue;
    const ry = r() * TAU;
    const cx = Math.cos(ry);
    const cz = -Math.sin(ry);
    B.add(G.sph(8, 6), shade('#7a6a48', (r() - 0.5) * 0.15), M(x, y + 0.035, z, 0.15, 0.06, 0.06, 0, ry, 0.15));
    B.add(G.sph(6, 4), '#5a7a8a', M(x - cx * 0.02, y + 0.07, z - cz * 0.02, 0.05, 0.05, 0.02, 0, ry, 0)); // спинной плавник
    for (const sd of [-1, 1]) {
      const ex = x + cx * 0.05 + cz * sd * 0.014;
      const ez = z + cz * 0.05 - cx * sd * 0.014;
      B.add(G.sph(6, 4), '#f2efe2', M(ex, y + 0.075, ez, 0.026, 0.026, 0.026));
      B.add(G.sph(6, 4), '#141414', M(ex + cx * 0.01, y + 0.08, ez + cz * 0.01, 0.013, 0.013, 0.013));
    }
    n++;
  }
  scene.add(B.build());
}

/**
 * Хижина на сваях: бирюзовые доски, крыша из пальмовой соломы, окна светятся с сумерек. Над водой у неё мостки
 * (настил 'hut' кладёт общий строитель причалов), на них — ступени к двери, перила, фонари, флажки и лестница в воду.
 */
function buildHut(scene) {
  const r = rng(270151);
  const B = new Batch();
  const { x: hx, z: hz, floor: F, w: W, d: D } = HUT;
  const xa = hx - W / 2;
  const xb = hx + W / 2;
  const zb = hz + 0.4; // фасад (юг) — над кромкой воды
  const za = zb - D;
  const WALL = '#3f9e98';
  const TRIM = '#e9dfc4';
  const WOOD = '#7a5636';
  const H = 2.6;
  // сваи под домом: из ила до пола
  for (const x of [xa + 0.3, hx, xb - 0.3])
    for (const z of [za + 0.3, (za + zb) / 2, zb - 0.3]) {
      const gy = groundH(x, z);
      B.add(G.cyl(8), shade(WOOD, (r() - 0.5) * 0.1), M(x, (gy + F) / 2 - 0.2, z, 0.26, F - gy + 0.4, 0.26), { grad: [0.6, 1.0], mat: 1 });
    }
  // пол и обвязка
  B.add(G.box(), WOOD, M(hx, F - 0.12, (za + zb) / 2, W + 0.6, 0.24, D + 0.5), { mat: 1 });
  // стены из досок (по одной доске по высоте не рисуем: бирюзовая обшивка, светлые наличники и углы)
  const wall = (ax, az, bx, bz, holes) => {
    const len = Math.hypot(bx - ax, bz - az);
    const ry = Math.atan2(-(bz - az), bx - ax);
    const ux = (bx - ax) / len;
    const uz = (bz - az) / len;
    // стена кусками между проёмами: holes — [от, до, низ, верх] вдоль стены
    const cuts = [[0, len, 0, H]];
    for (const [h0, h1, y0, y1] of holes) {
      const c = cuts.pop();
      cuts.push([c[0], h0, 0, H], [h0, h1, 0, y0], [h0, h1, y1, H], [h1, c[1], 0, H]);
    }
    for (const [a0, a1, y0, y1] of cuts) {
      if (a1 - a0 < 0.01 || y1 - y0 < 0.01) continue;
      const m = (a0 + a1) / 2;
      B.add(G.box(), WALL, M(ax + ux * m, F + (y0 + y1) / 2, az + uz * m, a1 - a0, y1 - y0, 0.14, 0, ry, 0), { grad: [0.86, 1.04], mat: 6 });
    }
    for (const [h0, h1, y0, y1] of holes) {
      const m = (h0 + h1) / 2;
      // наличник: светлая рамка вокруг проёма
      for (const [dy, hh] of [[y0 - 0.05, 0.1], [y1 + 0.05, 0.1]]) B.add(G.box(), TRIM, M(ax + ux * m, F + dy, az + uz * m, h1 - h0 + 0.2, hh, 0.2, 0, ry, 0));
      for (const e of [h0 - 0.05, h1 + 0.05]) B.add(G.box(), TRIM, M(ax + ux * e, F + (y0 + y1) / 2, az + uz * e, 0.1, y1 - y0 + 0.2, 0.2, 0, ry, 0));
    }
  };
  const win = (a0) => [a0, a0 + 0.9, 1.1, 1.9];
  wall(xa, zb, xb, zb, [win(0.7), [W / 2 - 0.55, W / 2 + 0.55, 0, 2.05], win(W - 1.6)]); // фасад: два окна и дверь
  wall(xb, za, xa, za, [win(W / 2 - 0.45)]);
  wall(xa, za, xa, zb, [win(D / 2 - 0.45)]);
  wall(xb, zb, xb, za, [win(D / 2 - 0.45)]);
  for (const [x, z] of [[xa, za], [xb, za], [xa, zb], [xb, zb]]) B.add(G.box(), TRIM, M(x, F + H / 2, z, 0.22, H + 0.05, 0.22));
  // дверь — тёмные доски, приоткрыта внутрь
  B.add(G.box(), '#5a3a24', M(hx - 0.25, F + 1.02, zb - 0.35, 0.08, 2.0, 1.0, 0, 0.6, 0), { mat: 1 });
  // окна: стекло светится с сумерек (одна сетка на все окна — один материал)
  const panes = [];
  const pane = (x, y, z, w, h, ry) => panes.push(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), new THREE.Vector3(w, h, 0.04)));
  pane(xa + 1.15, F + 1.5, zb, 0.86, 0.76, 0);
  pane(xb - 1.15, F + 1.5, zb, 0.86, 0.76, 0);
  pane(hx, F + 1.5, za, 0.86, 0.76, 0);
  pane(xa, F + 1.5, (za + zb) / 2, 0.86, 0.76, Math.PI / 2);
  pane(xb, F + 1.5, (za + zb) / 2, 0.86, 0.76, Math.PI / 2);
  // ставни распахнуты: тёмная бирюза по бокам окон фасада
  for (const cx of [xa + 1.15, xb - 1.15]) for (const sd of [-1, 1]) B.add(G.box(), '#2c7a76', M(cx + sd * 0.72, F + 1.5, zb + 0.08, 0.42, 0.9, 0.05), { mat: 6 });
  // крыша из пальмовой соломы: два слоя шатра с большим свесом, конёк
  const roofY = F + H;
  B.add(ROOF4, '#b08d52', M(hx, roofY + 1.5, (za + zb) / 2, (W + 2.4) * 1.414, 3.0, (D + 2.2) * 1.414), { grad: [0.72, 1.06], mat: 5 });
  B.add(ROOF4, '#c29c5c', M(hx, roofY + 1.95, (za + zb) / 2, (W + 0.8) * 1.414, 2.6, (D + 0.6) * 1.414), { grad: [0.8, 1.1], mat: 5 });
  B.add(G.sph(8, 6), '#7a5f30', M(hx, roofY + 3.2, (za + zb) / 2, 0.5, 0.35, 0.5));
  // бахрома соломы по краю свеса
  for (let i = 0; i < 46; i++) {
    const t = i / 46;
    const per = 2 * (W + 2.4 + D + 2.2);
    let p = t * per;
    let x, z;
    const hw = (W + 2.4) / 2;
    const hd = (D + 2.2) / 2;
    if (p < 2 * hw) [x, z] = [hx - hw + p, (za + zb) / 2 + hd];
    else if ((p -= 2 * hw) < 2 * hd) [x, z] = [hx + hw, (za + zb) / 2 + hd - p];
    else if ((p -= 2 * hd) < 2 * hw) [x, z] = [hx + hw - p, (za + zb) / 2 - hd];
    else [x, z] = [hx - hw, (za + zb) / 2 - hd + (p - 2 * hw)];
    B.add(G.cone(4), shade('#a8844a', (r() - 0.5) * 0.12), M(x, roofY + 0.02, z, 0.5, 0.42, 0.5, Math.PI, r() * 3, 0), { mat: 5 });
  }
  // ступени с мостков к двери
  const sx = hx + 0.1;
  for (let k = 0; k < 4; k++) {
    const y = DECK_Y + (k + 1) * ((F - DECK_Y) / 4);
    B.add(G.box(), shade(WOOD, 0.05), M(sx, y - 0.05, zb + 1.05 - k * 0.27, 1.25, 0.08, 0.3), { mat: 1 });
  }
  for (const e of [-0.66, 0.66]) {
    const len = Math.hypot(1.2, F - DECK_Y);
    B.add(G.box(), WOOD, M(sx + e, (DECK_Y + F) / 2 + 0.05, zb + 0.62, 0.07, 0.12, len, Math.atan2(F - DECK_Y, 1.2), 0, 0), { mat: 1 });
  }
  // перила по краю мостков (кроме места, где встаёт каноэ) и столбы с фонарями
  const pz0 = hz + 0.4;
  const pz1 = hz + 4.4;
  const px0 = hx - 5.5;
  const px1 = hx + 5.5;
  const rail = (ax, az, bx, bz) => {
    const len = Math.hypot(bx - ax, bz - az);
    const ry = Math.atan2(-(bz - az), bx - ax);
    for (const h of [0.55, 1.0]) B.add(G.box(), '#8a6644', M((ax + bx) / 2, DECK_Y + h, (az + bz) / 2, len, 0.07, 0.07, 0, ry, 0), { mat: 1 });
    const n = Math.max(1, Math.round(len / 1.4));
    for (let i = 0; i <= n; i++) B.add(G.box(), '#7a5a3a', M(ax + ((bx - ax) * i) / n, DECK_Y + 0.52, az + ((bz - az) * i) / n, 0.09, 1.04, 0.09), { mat: 1 });
  };
  rail(px0, pz0 + 0.05, px0, pz1);
  rail(px1, pz0 + 0.05, px1, pz1);
  rail(px0, pz1, hx - 2.2, pz1);
  rail(hx + 2.2, pz1, px1, pz1);
  // лестница в воду с восточного края
  for (const e of [-0.3, 0.3]) B.add(G.box(), WOOD, M(px1 + 0.25, DECK_Y - 0.65, pz0 + 1.6 + e, 0.07, 1.9, 0.07, 0, 0, -0.15), { mat: 1 });
  for (let k = 0; k < 5; k++) B.add(G.box(), WOOD, M(px1 + 0.25 + k * 0.05, DECK_Y - 1.3 + k * 0.32, pz0 + 1.6, 0.06, 0.05, 0.62), { mat: 1 });
  // бочка, ящики, сеть на стене
  B.add(G.cyl(12, 0.9, 0.9), '#8a5a34', M(px0 + 0.8, DECK_Y + 0.42, pz0 + 0.8, 0.62, 0.84, 0.62), { mat: 1 });
  B.add(G.box(), '#a07a4a', M(xb + 0.6, DECK_Y + 0.25, pz0 + 0.7, 0.6, 0.5, 0.5, 0, 0.3, 0), { mat: 1 });
  B.add(G.box(), '#9a6f42', M(xb + 0.65, DECK_Y + 0.68, pz0 + 0.72, 0.46, 0.38, 0.4, 0, 0.5, 0), { mat: 1 });
  for (let i = 0; i < 7; i++) B.add(G.box(), '#d8cfae', M(xa + 0.9 + i * 0.13, F + 1.3, zb + 0.09, 0.02, 1.2 - Math.abs(i - 3) * 0.12, 0.02, 0, 0, (i - 3) * 0.06));
  // фонари: на углах мостков (на столбах) и у двери
  const lamps = [[px0 + 0.1, DECK_Y + 2.1, pz1 - 0.1], [px1 - 0.1, DECK_Y + 2.1, pz1 - 0.1], [hx + 0.9, F + 2.0, zb + 0.35]];
  for (const [x, y, z] of lamps.slice(0, 2)) {
    B.add(G.cyl(6), '#6a4a30', M(x, (DECK_Y + y) / 2 + 0.25, z, 0.1, y - DECK_Y + 0.5, 0.1), { mat: 1 });
    B.add(G.box(), '#6a4a30', M(x, y + 0.42, z, 0.4, 0.06, 0.06));
  }
  const glass = [];
  for (const [x, y, z] of lamps) glass.push(lantern(B, x, y, z, scene));
  // окна и стёкла фонарей — один материал, загорается ночью
  const lit = new THREE.MeshStandardMaterial({ color: '#ffd89a', emissive: '#ffa63c', emissiveIntensity: 0, roughness: 0.5 });
  addLit(lit, 1.7);
  const box = new THREE.BoxGeometry(1, 1, 1);
  const all = [...panes, ...glass];
  const im = new THREE.InstancedMesh(box, lit, all.length);
  all.forEach((m, i) => im.setMatrixAt(i, m));
  im.name = 'mangrove-hut-glow';
  scene.add(im);
  for (const p of panes) {
    const v = new THREE.Vector3().setFromMatrixPosition(p);
    addGlow(scene, v.x, v.y, v.z + 0.15, 1.3, '#ffb35a');
  }
  // гирлянда флажков вдоль перил мостков: красные, кремовые, бирюзовые треугольники на провисшем шнуре
  pennants(B, px0, DECK_Y + 2.45, pz1 - 0.1, px1, DECK_Y + 2.45, pz1 - 0.1, r);
  pennants(B, xa - 0.6, F + H + 0.1, zb + 0.8, px0 + 0.1, DECK_Y + 2.45, pz1 - 0.1, r);
  const m = B.build();
  m.name = 'mangrove-hut';
  scene.add(m);
}

// шатёр крыши: четырёхскатная пирамида со сторонами вдоль осей (масштаб по X и Z — длина и ширина)
const ROOF4 = new THREE.ConeGeometry(0.5, 1, 4).rotateY(Math.PI / 4);

/** Фонарь: рамка с колпаком и стекло (матрица стекла — в общий светящийся меш), ореол ночью. */
function lantern(B, x, y, z, scene) {
  B.add(G.cone(6), '#2b2420', M(x, y + 0.24, z, 0.32, 0.14, 0.32));
  B.add(G.box(), '#2b2420', M(x, y - 0.17, z, 0.24, 0.04, 0.24));
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B.add(G.box(), '#2b2420', M(x + dx * 0.1, y, z + dz * 0.1, 0.025, 0.36, 0.025));
  B.add(G.cyl(5), '#3a2a20', M(x, y + 0.38, z, 0.015, 0.16, 0.015));
  addGlow(scene, x, y, z, 1.6, '#ffb24a');
  return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(0.18, 0.3, 0.18));
}

/** Гирлянда флажков на провисшем шнуре от (ax, ay, az) до (bx, by, bz). */
function pennants(B, ax, ay, az, bx, by, bz, r) {
  const len = Math.hypot(bx - ax, bz - az);
  const n = Math.max(3, Math.round(len / 0.55));
  const COL = ['#e23d2f', '#f6efdc', '#2aa69c', '#f2b52c'];
  const sag = Math.min(0.6, len * 0.06);
  const at = (t) => [ax + (bx - ax) * t, ay + (by - ay) * t - sag * 4 * t * (1 - t), az + (bz - az) * t];
  const ry = Math.atan2(-(bz - az), bx - ax);
  for (let i = 0; i < n; i++) {
    const [x0, y0, z0] = at(i / n);
    const [x1, y1, z1] = at((i + 1) / n);
    const l = Math.hypot(x1 - x0, y1 - y0, z1 - z0);
    B.add(G.cyl(4), '#3a3028', M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, 0.012, l, 0.012, 0, ry, Math.PI / 2 + Math.atan2(y1 - y0, Math.hypot(x1 - x0, z1 - z0))));
    const [fx, fy, fz] = at((i + 0.5) / n);
    B.add(G.cone(3), COL[i % COL.length], M(fx, fy - 0.13, fz, 0.22, 0.26, 0.02, Math.PI, ry, 0));
  }
}

/** Фонари в ветвях над водой: висят на шнуре с нижней ветки мангров, по вечерам светятся. */
function buildTreeLanterns(scene) {
  const r = rng(270161);
  const B = new Batch();
  const glass = [];
  const used = [];
  // ближе к базе, хижине и узкой протоке — там их видно; не теснее 25 м друг к другу
  const pick = FRINGE.filter(([x, z]) => {
    const near = Math.hypot(x - LAGOON.x, z - LAGOON.z) < 90 || Math.hypot(x - HUT.x, z - HUT.z) < 40 || (x < -20 && z < -90 && z > -230);
    return near && waterD(x, z) > -2.4;
  });
  for (const [x, z, s, rc] of pick) {
    if (used.some(([ux, uz]) => Math.hypot(ux - x, uz - z) < 25) || used.length >= 18) continue;
    used.push([x, z]);
    // к воде — вынос с ветки
    const wx = waterD(x + 3, z) - waterD(x - 3, z);
    const wz = waterD(x, z + 3) - waterD(x, z - 3);
    const a = Math.atan2(wz, wx);
    const lx = x + Math.cos(a) * 1.9 * s;
    const lz = z + Math.sin(a) * 1.9 * s;
    const top = rc + 3.6 * s;
    const ly = rc + 1.9 + r() * 0.6;
    B.add(G.cyl(5), '#5a4030', M(lx, (top + ly) / 2 + 0.2, lz, 0.016, top - ly, 0.016));
    glass.push(lantern(B, lx, ly, lz, scene));
  }
  scene.add(B.build());
  const lit = new THREE.MeshStandardMaterial({ color: '#ffd89a', emissive: '#ffa63c', emissiveIntensity: 0, roughness: 0.5 });
  addLit(lit, 1.8);
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), lit, Math.max(1, glass.length));
  glass.forEach((m, i) => im.setMatrixAt(i, m));
  im.count = glass.length;
  im.name = 'mangrove-tree-lanterns';
  scene.add(im);
}

/**
 * Светлячки: точки над водой и у мангровых берегов. Мигают и медленно плывут (в шейдере), видны с вечера до рассвета;
 * на закате — вполсилы. update(t, ночь 0…1, часы, камера).
 */
export function buildFireflies(scene) {
  const r = rng(270171);
  const N = 1400;
  const pos = new Float32Array(N * 3);
  const seed = new Float32Array(N * 4);
  let n = 0;
  const list = FRINGE.length ? FRINGE : [[LAGOON.x, LAGOON.z, 1, 1]];
  for (let i = 0; i < 20000 && n < N; i++) {
    const [tx, tz] = list[Math.floor(r() * list.length)];
    // гуще — у лагуны и у хижины
    const near = Math.hypot(tx - LAGOON.x, tz - LAGOON.z) < 110 || Math.hypot(tx - HUT.x, tz - HUT.z) < 40;
    if (!near && r() < 0.6) continue;
    const a = r() * TAU;
    const d = 1 + r() * 7;
    const x = tx + Math.cos(a) * d;
    const z = tz + Math.sin(a) * d;
    const y = Math.max(groundH(x, z), 0) + 0.4 + r() * r() * 3.5;
    pos.set([x, y, z], n * 3);
    seed.set([r() * 100, 0.3 + r() * 0.5, 0.25 + r() * 0.6, 1.2 + r() * 2.2], n * 4);
    n++;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos.subarray(0, n * 3), 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed.subarray(0, n * 4), 4));
  const uni = { uTime: { value: 0 }, uK: { value: 0 }, uScale: { value: 600 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: uni,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec4 aSeed;
      uniform float uTime, uK, uScale;
      varying float vA;
      void main() {
        float t = uTime * aSeed.y + aSeed.x;
        vec3 p = position + vec3(sin(t) * aSeed.z, sin(t * 1.37 + 1.7) * aSeed.z * 0.45, cos(t * 0.83) * aSeed.z);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float blink = smoothstep(0.35, 1.0, 0.5 + 0.5 * sin(uTime * aSeed.w + aSeed.x * 7.0));
        vA = blink * uK;
        gl_PointSize = clamp(0.34 * uScale / max(0.5, -mv.z) * (0.5 + 0.5 * blink), 2.0, 30.0);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying float vA;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        float core = smoothstep(0.18, 0.0, d);
        float halo = smoothstep(0.5, 0.0, d);
        float a = (core * 0.9 + halo * halo * 0.6) * vA;
        if (a < 0.01) discard;
        gl_FragColor = vec4(vec3(1.0, 0.95, 0.5) * (0.8 + 1.2 * core), a);
      }`
  });
  const pts = new THREE.Points(g, mat);
  pts.name = 'fireflies';
  pts.frustumCulled = false;
  pts.renderOrder = 3;
  pts.visible = false;
  scene.add(pts);
  return {
    get count() {
      return n;
    },
    get k() {
      return uni.uK.value;
    },
    update(t, night, hours, camera) {
      // с заката до рассвета: на закате — вполсилы, ночью — все
      const dusk = hours >= 12 ? sstep(19.0, 20.6, hours) : 0;
      const k = clamp(Math.max(night * 1.2, dusk * 0.75), 0, 1);
      uni.uK.value = k;
      pts.visible = k > 0.02;
      if (!pts.visible) return;
      uni.uTime.value = t;
      const h = (globalThis.innerHeight || 720) * Math.min(2, globalThis.devicePixelRatio || 1);
      uni.uScale.value = h / (2 * Math.tan(((camera.fov || 60) * Math.PI) / 360));
    }
  };
}

export function buildMangroveNature(scene) {
  buildMangroves(scene);
  buildBase(scene);
  buildLeaves(scene);
  buildSkippers(scene);
  buildHut(scene);
  buildTreeLanterns(scene);
}
