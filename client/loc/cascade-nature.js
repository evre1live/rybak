// Природа «Водопадной чаши»: джунгли по берегам и на плато над скалами, пальмы у воды, цветущие геликонии,
// лианы на стене водопадов, гигантские кувшинки-виктории в заводи, коряги у восточного берега, Скала-черепаха
// с большим деревом. Как и на других локациях, каждое дерево, куст и камень оставляет запись в ENV
// (envmodels.js): по ней встаёт готовая модель из набора джунглей (kit.js), процедурная сетка — запасная.
import { Batch, M, G, BATCH_MAT, BATCH_MAT_2S } from '../batch.js';
import { ENV } from '../envmodels.js';
import { roundTree, bush } from '../flora.js';
import { palmTree } from '../places.js';
import { spot01 } from '../scatter.js';
import { bloomBush } from './keys-nature.js';
import { rng, rockGeo, blobGeo, shade, sstep, TAU, fbm2 } from '../util.js';
import { BOUNDS, BASIN, ISLET, BACKWATER, SNAGS, SNAG_TRUNKS, FALLS, LEDGE, groundH, waterD, shoreZ, deckAt, shoreAt, cliffK } from './cascade.js';

const GREYS = ['#5f5d56', '#6a675f', '#57554f', '#726e64', '#64625a']; // мокрый тёмный камень
const MOSS = '#4f8a3a';
const HELICONIA = ['#ff4a2a', '#ff7a1c', '#ffb21e', '#e8305a', '#ff5f8a']; // геликонии, бромелии, орхидеи

/** Крутой ли склон в точке: на обрыве деревья не стоят. */
const steep = (x, z, y, k = 1.6) => Math.abs(groundH(x + 1.5, z) - y) > k || Math.abs(groundH(x, z + 1.5) - y) > k || Math.abs(groundH(x - 1.5, z) - y) > k || Math.abs(groundH(x, z - 1.5) - y) > k;
/** У базы берег открыт: площадка, тропа, пляж. */
const atBase = (x, z, m = 0) => x > -58 - m && x < 51 + m && z - shoreZ(x) > -2 - m && z - shoreZ(x) < 15.5 + m;

const FAR_CROWNS = [blobGeo(5, 0, 0.16), blobGeo(19, 0, 0.16), blobGeo(31, 0, 0.18)];
/** Дальнее дерево джунглей: тёмный комок листвы, иногда над пологом поднимается великан с плоской кроной. */
function farJungle(B, x, y, z, h, r) {
  const base = ['#2f6f2e', '#3a7d32', '#2a6430', '#47863a', '#356f2a'][Math.floor(r() * 5)];
  const w = h * (0.55 + r() * 0.2);
  B.add(FAR_CROWNS[Math.floor(r() * FAR_CROWNS.length)], shade(base, (r() - 0.5) * 0.14), M(x, y + 0.36 * h, z, w, h * 0.55, w, 0, r() * 3, 0), { grad: [0.5, 1.12], mat: 3 });
  if (r() < 0.07) {
    // великан над пологом: зонтик кроны на тонком стволе
    B.add(G.cyl(5), '#8c7a5e', M(x, y + h * 0.9, z, 0.5, h * 0.9, 0.5), { mat: 1 });
    B.add(FAR_CROWNS[0], shade('#3f8a36', (r() - 0.5) * 0.1), M(x, y + h * 1.4, z, w * 0.9, h * 0.22, w * 0.9, 0, r() * 3, 0), { grad: [0.5, 1.15], mat: 3 });
  }
}

function buildForest(scene) {
  const r = rng(260111);
  const near = new Batch(); // цветы, забор, кувшинки — процедурные
  const nearT = new Batch(); // деревья и кусты у воды: запасные, пока не загрузились готовые модели
  const far = new Batch();
  far.far = true;
  // ── джунгли у воды и на плато над скалами: лиственные великаны, пальмы у самой воды, подлесок ──
  let placed = 0;
  for (let i = 0; i < 16000 && placed < 980; i++) {
    const x = BOUNDS.x0 + 4 + r() * (BOUNDS.x1 - BOUNDS.x0 - 8);
    const z = BOUNDS.z0 + 4 + r() * (BOUNDS.z1 - BOUNDS.z0 - 8);
    const d = -waterD(x, z);
    if (d < 3.2 || d > 62) continue;
    if (atBase(x, z)) continue;
    const y = groundH(x, z);
    if (y < 1.0 || steep(x, z, y)) continue;
    const cl = cliffK(x, z);
    // над стеной: лес начинается в нескольких метрах от кромки — чтобы с пирса были видны и кромка, и водопады
    if (cl > 0.3 && d < 11) continue;
    if (r() > 0.55 + 0.45 * sstep(3, 16, d)) continue;
    const s = (0.9 + r() * 0.85) * (d > 24 ? 1.35 : 1.1);
    const B = d < 46 && Math.abs(x - BASIN.x) < 130 && z > -150 ? nearT : far;
    if (d < 12 && cl < 0.3 && r() < 0.42) palmTree(B, x, y, z, 0.85 + r() * 0.35, r);
    else roundTree(B, x, y - 0.2, z, s, r, r() < 0.35);
    placed++;
  }
  // ── дальние джунгли на холмах: сплошной полог из тёмных комков листвы ──
  const slope = new Batch();
  slope.far = true;
  const rf = rng(260115);
  let far2 = 0;
  for (let i = 0; i < 60000 && far2 < 4400; i++) {
    const x = -420 + rf() * 860;
    const z = -470 + rf() * 760;
    const d = -waterD(x, z);
    if (d < 56 || d > 380) continue;
    const y = groundH(x, z);
    if (Math.abs(groundH(x + 3, z) - y) > 5 || Math.abs(groundH(x, z + 3) - y) > 5) continue; // на скале лес не растёт
    if (rf() > 0.94) continue;
    // дальше 120 м от воды почти половина комков — «редкая»: на «низком» качестве их не рисуют (batch.js)
    farJungle(d > 120 && spot01(x, z, 7) > 0.55 ? slope.thin : slope, x, y - 0.6, z, 11 + rf() * 9, rf);
    far2++;
  }
  const mSlope = slope.build(BATCH_MAT, false);
  mSlope.name = 'cascade-far-forest';
  scene.add(mSlope);
  // ── Скала-черепаха: большое дерево на горбу и кусты между камней ──
  roundTree(nearT, ISLET.x + 1, groundH(ISLET.x + 1, ISLET.z) - 0.2, ISLET.z, 1.9, r, false);
  for (let i = 0, n = 0; i < 200 && n < 8; i++) {
    const a = r() * TAU;
    const d = Math.sqrt(r()) * (ISLET.r - 2.5);
    const x = ISLET.x + Math.cos(a) * d;
    const z = ISLET.z + Math.sin(a) * d;
    const y = groundH(x, z);
    if (y < 1.4 || Math.hypot(x - ISLET.x - 1, z - ISLET.z) < 3) continue;
    if (n < 2) palmTree(nearT, x, y, z, 0.7 + r() * 0.3, r);
    else bloomBush(nearT, near, x, y, z, 0.7 + r() * 0.5, r, 0.6, HELICONIA[Math.floor(r() * HELICONIA.length)]);
    n++;
  }
  // ── подлесок: вдоль берега у базы и по опушке вокруг всей чаши; у тропы — цветущие геликонии ──
  for (let i = 0; i < 420; i++) {
    const x = -56 + r() * 105;
    const d = 3.6 + r() * 16;
    const z = shoreZ(x) + d;
    if (d < 14 && r() < 0.78) continue;
    if (deckAt(x, z, -1.5)) continue;
    const y = groundH(x, z);
    if (r() < 0.35) bloomBush(nearT, near, x, y, z, 0.6 + r() * 0.5, r, 0.8, HELICONIA[Math.floor(r() * HELICONIA.length)]);
    else bush(nearT, x, y, z, 0.6 + r() * 0.7, r);
  }
  for (let i = 0, n = 0; i < 2600 && n < 190; i++) {
    const [sx, sz] = shoreAt(r() * TAU);
    const x = sx + (r() - 0.5) * 16;
    const z = sz + (r() - 0.5) * 16;
    const d = -waterD(x, z);
    if (d < 2.2 || d > 10 || atBase(x, z, 2)) continue;
    const y = groundH(x, z);
    if (y < 0.8 || steep(x, z, y, 1.2)) continue;
    if (r() < 0.3) bloomBush(far, near, x, y, z, 0.7 + r() * 0.6, r, 0.7, HELICONIA[Math.floor(r() * HELICONIA.length)]);
    else bush(far, x, y, z, 0.7 + r() * 0.8, r);
    n++;
  }
  // ── цветы у тропы и забор вдоль неё (как на других локациях: забор — граница, дальше которой не ходят) ──
  for (let i = 0; i < 240; i++) {
    const x = -52 + r() * 96;
    const d = 3.4 + r() * 10;
    const z = shoreZ(x) + d;
    const y = groundH(x, z);
    if (deckAt(x, z, -0.6) || y < 1 || r() < 0.5) continue;
    near.add(G.cyl(4), '#2f8a34', M(x, y + 0.14, z, 0.03, 0.3, 0.03));
    near.add(G.ico(0), ['#ff4a2a', '#ffb21e', '#ff6fb2', '#f8fafc'][Math.floor(r() * 4)], M(x, y + 0.31, z, 0.12, 0.09, 0.12), { flat: true });
  }
  let prev = null;
  for (let x = -53.5; x <= 5.5; x += 2.3) {
    const z = shoreZ(x) + 14.1;
    const y = groundH(x, z);
    near.add(G.cyl(6), '#b8a274', M(x, y + 0.5, z, 0.09, 1.1, 0.09), { grad: [0.8, 1.05] }); // бамбуковые столбики
    if (prev) {
      const len = Math.hypot(x - prev[0], z - prev[2], y - prev[1]);
      const ry = Math.atan2(-(z - prev[2]), x - prev[0]);
      const rz = Math.atan2(y - prev[1], Math.hypot(x - prev[0], z - prev[2]));
      for (const h of [0.42, 0.82]) near.add(G.cyl(6), '#c9b483', M((x + prev[0]) / 2, (y + prev[1]) / 2 + h, (z + prev[2]) / 2, 0.045, len, 0.045, 0, ry, Math.PI / 2 + rz));
    }
    prev = [x, y, z];
  }
  const mNear = near.build();
  const mNearT = nearT.build();
  const mFar = far.build(BATCH_MAT, false);
  scene.add(mNear, mNearT, mFar);
  ENV.fallback.trees.push(mNearT, mFar);
}

/** Гигантские кувшинки-виктории: плоские круглые листья с отогнутым красноватым бортиком и белые с розовым цветы. */
function buildLilies(scene) {
  const r = rng(260112);
  const B = new Batch();
  const placed = [];
  const free = (x, z, s) => placed.every(([px, pz, ps]) => Math.hypot(x - px, z - pz) > (s + ps) * 0.5);
  const pad = (x, z, s) => {
    placed.push([x, z, s]);
    const ry = r() * TAU;
    // лист лежит на воде чуть выше ряби: иначе мелкая волна заливает его, и виден один бортик
    B.add(G.cyl(18), shade('#4a9a3c', (r() - 0.5) * 0.14), M(x, 0.13, z, s, 0.05, s, 0, ry, 0), { grad: [0.85, 1.1] });
    // прожилки: светлый крест по листу
    for (const a of [0, Math.PI / 2]) B.add(G.box(), '#7cc25a', M(x, 0.158, z, s * 0.92, 0.008, 0.035, 0, ry + a, 0));
    // бортик: тонкий отогнутый край, снаружи буро-красный
    B.add(G.torus(0.035, 24), shade('#86503f', (r() - 0.5) * 0.12), M(x, 0.16, z, s * 1.01, s * 1.01, 4.5, Math.PI / 2, 0, 0));
    if (r() < 0.12) {
      // цветок: белая чаша, к середине розовеет
      const fx = x + (r() - 0.5) * s * 0.6;
      const fz = z + (r() - 0.5) * s * 0.6;
      B.add(G.cone(8), '#f8f1f4', M(fx, 0.3, fz, 0.42, 0.3, 0.42, Math.PI, 0, 0));
      B.add(G.ico(1), '#f08ab0', M(fx, 0.34, fz, 0.17, 0.12, 0.17));
    }
  };
  // заводь: густо, не заходя на мостки
  for (let i = 0, n = 0; i < 1600 && n < 55; i++) {
    const x = BACKWATER.x - 16 + r() * 32;
    const z = BACKWATER.z - 14 + r() * 26;
    const dep = -groundH(x, z);
    if (dep < 0.35 || dep > 2.6 || deckAt(x, z, -1.6)) continue;
    if (Math.hypot(x - BACKWATER.x, z - BACKWATER.z) > BACKWATER.r + 3) continue;
    const s = 1.2 + r() * 1.3;
    if (!free(x, z, s)) continue;
    pad(x, z, s);
    n++;
  }
  // пятнами вдоль тихого западного берега чаши
  for (let i = 0, n = 0; i < 2400 && n < 70; i++) {
    const th = Math.PI * (0.55 + r() * 0.85);
    const [sx, sz] = shoreAt(th);
    if (fbm2(sx * 0.04 + 4, sz * 0.04 + 9, 2) < 0.5) continue;
    const x = sx + (r() - 0.5) * 10;
    const z = sz + (r() - 0.5) * 10;
    const dep = -groundH(x, z);
    if (dep < 0.4 || dep > 2.4 || cliffK(x, z) > 0.2 || deckAt(x, z, -2)) continue;
    const s = 1.0 + r() * 1.0;
    if (!free(x, z, s)) continue;
    pad(x, z, s);
    n++;
  }
  const m = B.build();
  m.name = 'cascade-lilies';
  scene.add(m);
}

/** Коряги: затопленные стволы торчат из воды, с обломками сучьев; вокруг — плавник и листья на воде. */
function buildSnags(scene) {
  const r = rng(260113);
  const B = new Batch();
  for (const [x, z, len, lean, ry] of SNAG_TRUNKS) {
    const rad = 0.45 + r() * 0.2;
    // ствол уходит под воду наклонно: видна верхняя часть
    const cx = x - Math.cos(ry) * Math.cos(lean) * len * 0.25;
    const cz = z + Math.sin(ry) * Math.cos(lean) * len * 0.25;
    B.add(G.cyl(7, 0.55, 1), shade('#857563', (r() - 0.5) * 0.14), M(cx, Math.sin(lean) * len * 0.25 - 0.2, cz, rad, len, rad, 0, ry, Math.PI / 2 - lean), { grad: [0.75, 1.05], mat: 1 });
    for (let k = 0; k < 2; k++) {
      const t = 0.15 + r() * 0.3;
      const bx = x - Math.cos(ry) * Math.cos(lean) * len * (0.5 - t) * 0.5;
      const bz = z + Math.sin(ry) * Math.cos(lean) * len * (0.5 - t) * 0.5;
      B.add(G.cyl(5, 0.4, 1), '#77685a', M(bx, Math.sin(lean) * len * t * 0.6 + 0.4, bz, rad * 0.4, 1.2 + r() * 1.4, rad * 0.4, (r() - 0.5) * 1.2, r() * TAU, (r() - 0.5) * 1.2), { mat: 1 });
    }
  }
  // листья и плавник на воде вокруг коряг
  for (let i = 0; i < 90; i++) {
    const a = r() * TAU;
    const d = Math.sqrt(r()) * SNAGS.r;
    const x = SNAGS.x + Math.cos(a) * d;
    const z = SNAGS.z + Math.sin(a) * d;
    if (-groundH(x, z) < 0.3) continue;
    B.add(G.cyl(6), ['#7a6a2a', '#9a6a2a', '#5f7a2a'][Math.floor(r() * 3)], M(x, 0.04, z, 0.18 + r() * 0.2, 0.01, 0.12 + r() * 0.12, 0, r() * TAU, 0));
  }
  const m = B.build();
  m.name = 'cascade-snags';
  scene.add(m);
}

/** Камни: валуны вдоль берега и у Скалы-черепахи, утёсы по подкове (у водопадов — просветы), обломки у подножия. */
function buildStones(scene) {
  const r = rng(260114);
  const B = new Batch();
  B.mat = 2;
  const S = new Batch(); // камни, которые заменяются готовыми моделями
  S.mat = 2;
  const geos = [rockGeo(11), rockGeo(23), rockGeo(37), rockGeo(51), rockGeo(64, 2, 0.3)];
  const small = [rockGeo(11, 1), rockGeo(23, 1), rockGeo(37, 1)];
  const rock = (as, x, y, z, sx, sy, sz, moss = false, tone = 0) => {
    const c = shade(GREYS[Math.floor(r() * GREYS.length)], tone + (r() - 0.5) * 0.1);
    const set = Math.max(sx, sy, sz) < 2.4 ? small : geos;
    (as ? S : B).add(set[Math.floor(r() * set.length)], c, M(x, y, z, sx, sy, sz, (r() - 0.5) * 0.5, r() * TAU, (r() - 0.5) * 0.5), moss ? { top: [shade(MOSS, (r() - 0.5) * 0.12), 0.7], grad: [0.72, 1.05], soft: true } : { grad: [0.72, 1.05] });
    if (as) ENV.rocks[as].push({ x, y: y - 0.72 * sy, z, w: 2 * sx, h: 1.52 * sy, d: 2 * sz, ry: spot01(x, z, 4) * TAU, tilt: Math.max(sx, sz) < 4 });
  };
  for (let i = 0; i < 60; i++) {
    const x = -60 + r() * 115;
    const z = shoreZ(x) - 1.5 + r() * 3.4;
    if (deckAt(x, z, -1.2)) continue;
    const s = 0.3 + r() * 0.7;
    rock('env-rock1', x, groundH(x, z) + s * 0.12, z, s * 1.3, s * 0.75, s, false, 0.05);
  }
  for (let i = 0; i < 140; i++) {
    const [sx, sz] = shoreAt(r() * TAU);
    if (atBase(sx, sz, 4)) continue;
    const x = sx + (r() - 0.5) * 5;
    const z = sz + (r() - 0.5) * 5;
    if (cliffK(x, z) > 0.3) continue;
    const big = r() < 0.2;
    const s = big ? 1.5 + r() * 1.6 : 0.5 + r() * 1.0;
    rock(big && s > 2.5 ? 'env-rock2' : 'env-rock1', x, Math.max(groundH(x, z), -0.4) + s * 0.1, z, s * 1.25, s * (big ? 0.95 : 0.75), s, true);
  }
  // Скала-черепаха: валуны по кромке, две глыбы на горбу
  for (let i = 0; i < 24; i++) {
    const a = r() * TAU;
    const R = ISLET.r * (0.92 + r() * 0.3);
    const s = 0.9 + r() * 1.5;
    rock('env-rock1', ISLET.x + Math.cos(a) * R, -0.25 + r() * 0.6, ISLET.z + Math.sin(a) * R, s * 1.2, s * 0.8, s, r() < 0.5, -0.05);
  }
  rock('env-rock2', ISLET.x - 3.2, groundH(ISLET.x - 3.2, ISLET.z + 1.8) + 0.9, ISLET.z + 1.8, 2.2, 2.6, 2.0, true);
  // ── подкова: утёсы стоят в воде у подножия и поднимаются до кромки; у водопадов — просветы ──
  {
    const rc = rng(260116);
    const fallTh = FALLS.map((f) => Math.atan2(f.z - BASIN.z, f.x - BASIN.x));
    let wallRun = 0;
    for (let th = -Math.PI / 2 - 1.05; th < -Math.PI / 2 + 1.05; ) {
      const [x0, z0] = shoreAt(th);
      const R = Math.hypot(x0 - BASIN.x, z0 - BASIN.z);
      const len = 10 + rc() * 3;
      const dth = len / R;
      const mid = th + dth / 2;
      th += dth;
      const [x, z] = shoreAt(mid);
      const k = cliffK(x, z);
      if (k < 0.3) continue;
      if (fallTh.some((f, i) => Math.abs(f - mid) * R < (FALLS[i].main ? 6.5 : 3.6) + len * 0.36)) continue; // здесь падает вода
      const [ax, az] = shoreAt(mid - 0.02);
      const [bx, bz] = shoreAt(mid + 0.02);
      const tl = Math.hypot(bx - ax, bz - az);
      const nx = (BASIN.x - x) / R;
      const nz = (BASIN.z - z) / R;
      const ry = Math.atan2(-(bz - az) / tl, (bx - ax) / tl);
      // по кромке вглубь: высота полки и верхней кромки в этом месте
      const at = (m) => groundH(x - nx * m, z - nz * m);
      const ledge = at((LEDGE.d[1] + LEDGE.d[2]) / 2);
      const top = at(LEDGE.d[3] + 1.5) + 0.3 + rc() * 1.0;
      // две ступени, как у самой стены: нижний ряд утёсов до полки, верхний — от полки до кромки
      for (const [m, y0, h, d] of [[1.0, -1.6, ledge + 1.9, 3.4 + rc() * 0.8], [6.7, ledge - 1.2, top - ledge + 1.2, 4.2 + rc() * 1.0]]) {
        const wall = wallRun >= 2 ? false : wallRun <= -2 ? true : rc() < 0.5;
        wallRun = wall ? Math.max(1, wallRun + 1) : Math.min(-1, wallRun - 1);
        ENV.rocks[wall ? 'env-cliff1' : 'env-cliff2'].push({
          x: x - nx * (m + rc() * 0.6), y: y0, z: z - nz * (m + rc() * 0.6), w: len * (1.18 + rc() * 0.12), h, d,
          ry: ry + (rc() < 0.5 ? Math.PI : 0) + (rc() - 0.5) * 0.2, tilt: false, turn: !wall && rc() < 0.5
        });
      }
      const s = len * 0.55;
      // запасной вид без моделей — гладкая глыба на том же месте (прячется, когда встанут утёсы)
      S.add(geos[Math.floor(rc() * 4)], shade(GREYS[Math.floor(rc() * GREYS.length)], -0.05), M(x - nx * 2.4, top * 0.42, z - nz * 2.4, s, top * 0.62, 4.2, 0, Math.atan2(-(bz - az), bx - ax), 0), { top: [MOSS, 0.8], grad: [0.72, 1.05], soft: true });
      for (let j = 0; j < 2; j++) rock('env-rock1', x + nx * (1.5 + rc() * 3) + (rc() - 0.5) * len * 0.7, -0.3 + rc() * 0.5, z + nz * (1.5 + rc() * 3) + (rc() - 0.5) * len * 0.7, 1 + rc() * 1.4, 0.8 + rc() * 0.9, 1 + rc() * 1.3, rc() < 0.4, -0.06);
    }
  }
  const mS = S.build();
  scene.add(B.build(), mS);
  ENV.fallback.rocks.push(mS);
}

/**
 * Лианы на стене водопадов: свисают с кромки плато тонкими плетьми, у некоторых внизу — пучок листьев.
 * Плети не мешают струям: у водопадов просветы.
 */
function buildVines(scene) {
  const r = rng(260117);
  const B = new Batch();
  const fallTh = FALLS.map((f) => Math.atan2(f.z - BASIN.z, f.x - BASIN.x));
  for (let i = 0, n = 0; i < 4000 && n < 320; i++) {
    const th = -Math.PI / 2 + (r() - 0.5) * 2.0;
    const [sx, sz] = shoreAt(th);
    const R = Math.hypot(sx - BASIN.x, sz - BASIN.z);
    if (fallTh.some((f, k) => Math.abs(f - th) * R < (FALLS[k].main ? 7.5 : 4.5))) continue;
    if (cliffK(sx, sz) < 0.5) continue;
    const nx = (BASIN.x - sx) / R;
    const nz = (BASIN.z - sz) / R;
    // откуда свисает: с верхней кромки (до полки) или с края полки (до воды)
    const upper = r() < 0.6;
    const d = upper ? LEDGE.d[3] - 0.3 : LEDGE.d[1] + 0.2;
    const top = groundH(sx - nx * d, sz - nz * d);
    const below = upper ? groundH(sx - nx * ((LEDGE.d[1] + LEDGE.d[2]) / 2), sz - nz * ((LEDGE.d[1] + LEDGE.d[2]) / 2)) : 0;
    if (top - below < 4) continue;
    const len = (top - below) * (0.35 + r() * 0.55);
    const x = sx - nx * (d - 0.4) + (r() - 0.5) * 1.2;
    const z = sz - nz * (d - 0.4) + (r() - 0.5) * 1.2;
    const c = shade('#3f7a2e', (r() - 0.5) * 0.18);
    // плеть — три отрезка с лёгким изгибом от стены
    let px = x;
    let py = top + 0.3;
    let pz = z;
    for (let s = 0; s < 3; s++) {
      const L = len / 3;
      const out = 0.25 + s * 0.12;
      const qx = px + nx * out;
      const qy = py - L;
      const qz = pz + nz * out;
      B.add(G.cyl(4), c, M((px + qx) / 2, (py + qy) / 2, (pz + qz) / 2, 0.09, L, 0.09, Math.atan2(nz * out, L), 0, -Math.atan2(nx * out, L)));
      // листья вдоль плети
      if (r() < 0.7) B.add(FAR_CROWNS[2], shade('#4a8a36', (r() - 0.5) * 0.16), M(qx, qy + L * 0.3, qz, 0.5, 0.7, 0.5, 0, r() * 3, 0), { grad: [0.6, 1.1], mat: 3 });
      px = qx;
      py = qy;
      pz = qz;
    }
    if (r() < 0.7) B.add(FAR_CROWNS[1], shade('#4f8f3a', (r() - 0.5) * 0.15), M(px, py, pz, 0.75, 1.0, 0.75, 0, r() * 3, 0), { grad: [0.6, 1.1], mat: 3 });
    n++;
  }
  const m = B.build(BATCH_MAT_2S);
  m.name = 'cascade-vines';
  scene.add(m);
}

/** Полка посередине стены: мох, кусты и папоротник на уступе (с пирса видно, что водопад падает на зелёную ступень). */
function buildLedge(scene) {
  const r = rng(260118);
  const T = new Batch();
  const F = new Batch();
  for (let i = 0, n = 0; i < 2000 && n < 120; i++) {
    const th = -Math.PI / 2 + (r() - 0.5) * 2.1;
    const [sx, sz] = shoreAt(th);
    if (cliffK(sx, sz) < 0.6) continue;
    if (FALLS.some((f) => Math.hypot(f.bx - sx, f.bz - sz) < (f.main ? 9 : 5.5))) continue;
    const R = Math.hypot(sx - BASIN.x, sz - BASIN.z);
    const nx = (BASIN.x - sx) / R;
    const nz = (BASIN.z - sz) / R;
    const m = LEDGE.d[1] + 0.6 + r() * (LEDGE.d[2] - LEDGE.d[1] - 1.2);
    const x = sx - nx * m;
    const z = sz - nz * m;
    const y = groundH(x, z);
    if (r() < 0.3) bloomBush(T, F, x, y, z, 0.6 + r() * 0.5, r, 0.6, HELICONIA[Math.floor(r() * HELICONIA.length)]);
    else bush(T, x, y, z, 0.6 + r() * 0.7, r);
    n++;
  }
  const mT = T.build();
  scene.add(mT, F.build());
  ENV.fallback.trees.push(mT);
}

/** Поваленное дерево: великан упал с восточного берега и лёг над водой, корнями к лесу, кроной в чашу. */
function buildFallenTree(scene) {
  const r = rng(260119);
  const B = new Batch();
  const th = -0.32;
  const [sx, sz] = shoreAt(th);
  const R = Math.hypot(sx - BASIN.x, sz - BASIN.z);
  const nx = (BASIN.x - sx) / R;
  const nz = (BASIN.z - sz) / R;
  const L = 19;
  const x0 = sx - nx * 3;
  const z0 = sz - nz * 3;
  const y0 = groundH(x0, z0) + 0.5;
  const x1 = sx + nx * (L - 3);
  const z1 = sz + nz * (L - 3);
  const y1 = 0.35;
  const len = Math.hypot(x1 - x0, y1 - y0, z1 - z0);
  const ry = Math.atan2(-(z1 - z0), x1 - x0);
  const rz = Math.atan2(y1 - y0, Math.hypot(x1 - x0, z1 - z0));
  B.add(G.cyl(10, 0.7, 1), '#7a634a', M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, 1.5, len, 1.5, 0, ry, rz - Math.PI / 2), { grad: [0.72, 1.05], mat: 1 });
  // мох поверх ствола
  B.add(G.cyl(10, 0.7, 1), '#4f8a3a', M((x0 + x1) / 2, (y0 + y1) / 2 + 0.45, (z0 + z1) / 2, 1.05, len * 0.8, 0.8, 0, ry, rz - Math.PI / 2), { mat: 3 });
  // корни у берега — веером
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * TAU;
    B.add(G.cyl(5, 0.3, 1), '#5a4430', M(x0 - nx * 0.4 + Math.cos(a) * 0.6, y0 + Math.sin(a) * 0.6, z0 - nz * 0.4, 0.18, 2.2, 0.18, Math.cos(a) * 1.1, ry, Math.sin(a) * 1.1), { mat: 1 });
  }
  // сухие сучья и свисающие лианы над водой
  for (let k = 0; k < 6; k++) {
    const t = 0.35 + k * 0.1;
    const px = x0 + (x1 - x0) * t;
    const pz = z0 + (z1 - z0) * t;
    const py = y0 + (y1 - y0) * t + 0.4;
    B.add(G.cyl(5, 0.4, 1), '#5a4632', M(px, py + 0.8, pz, 0.12, 1.8 + r() * 1.2, 0.12, (r() - 0.5) * 1.3, r() * TAU, (r() - 0.5) * 1.3), { mat: 1 });
    if (r() < 0.7) B.add(G.cyl(4), '#3f7a2e', M(px + nz * 0.5, py - 0.5, pz - nx * 0.5, 0.05, 1.4 + r() * 1.4, 0.05));
  }
  const m = B.build();
  m.name = 'cascade-fallen-tree';
  scene.add(m);
}

export function buildCascadeNature(scene) {
  buildLedge(scene);
  buildFallenTree(scene);
  buildForest(scene);
  buildStones(scene);
  buildLilies(scene);
  buildSnags(scene);
  buildVines(scene);
}
