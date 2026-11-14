// Природа «Соснового озера»: лес по склонам, каменный островок, гряда валунов, скальная стена с утёсами,
// камыш в заводи и по тихим берегам, сруб с костром. Всё собрано из тех же моделей, что и бухта:
// каждое дерево и камень оставляет запись в ENV (envmodels.js), по ней встаёт готовая модель;
// процедурная сетка остаётся запасной — для пробной версии без моделей.
import * as THREE from 'three';
import { Batch, M, G, BATCH_MAT, BATCH_MAT_2S } from '../batch.js';
import { ENV } from '../envmodels.js';
import { pine, roundTree, bush, farPine } from '../flora.js';
import { spot01 } from '../scatter.js';
import { rng, rockGeo, shade, sstep, TAU, fbm2 } from '../util.js';
import { BOUNDS, LAKE, ISLET, SHOAL, CABIN, GLADE, CAMPFIRE, BACKWATER, FALLS, CIRCLES, DECK_Y, groundH, waterD, shoreZ, deckAt, shoreAt, cliffAt } from './lake.js';

const GREYS = ['#8d95a1', '#7f8793', '#9aa2ad', '#868f9c', '#a3a9b3'];
const GRASS = '#5fa84a';

/** Крутой ли склон в точке: на обрыве деревья не стоят. */
const steep = (x, z, y, k = 1.6) => Math.abs(groundH(x + 1.5, z) - y) > k || Math.abs(groundH(x, z + 1.5) - y) > k || Math.abs(groundH(x - 1.5, z) - y) > k || Math.abs(groundH(x, z - 1.5) - y) > k;
/** Поляна у избушки: там не растёт лес (m — запас, метры). */
const yard = (x, z, m = 0) => Math.hypot(x - GLADE.x, z - GLADE.z) < GLADE.r - 1.5 + m;

function buildForest(scene) {
  const r = rng(210311);
  const near = new Batch(); // цветы, забор, камыш — процедурные
  const nearT = new Batch(); // деревья и кусты у воды: запасные, пока не загрузились готовые модели
  const far = new Batch();
  far.far = true;
  // ── лес у воды, вокруг всего озера: настоящие деревья (на их места встают готовые модели). Сосны, у самой воды
  //    к ним примешаны берёзы. Полоса в полсотни метров от берега: ближе с воды не подойти ──
  let placed = 0;
  for (let i = 0; i < 12000 && placed < 880; i++) {
    const x = BOUNDS.x0 + 4 + r() * (BOUNDS.x1 - BOUNDS.x0 - 8);
    const z = BOUNDS.z0 + 4 + r() * (BOUNDS.z1 - BOUNDS.z0 - 8);
    const d = -waterD(x, z);
    if (d < 4.5 || d > 58) continue;
    // у базы берег открыт: площадка, тропа, пляж
    const ds = z - shoreZ(x);
    if (x > -58 && x < 51 && ds > -2 && ds < 15.5) continue;
    if (yard(x, z, 1.5)) continue;
    const y = groundH(x, z);
    if (y < 1.1 || steep(x, z, y)) continue;
    // опушка: у воды деревья реже и ниже, в глубине — стена леса
    if (r() > 0.45 + 0.55 * sstep(4, 20, d)) continue;
    const s = (0.85 + r() * 0.9) * (d > 26 ? 1.3 : 1);
    const B = d < 42 && Math.abs(x) < 120 && z > -60 ? nearT : far;
    if (d < 34 && r() < 0.24) roundTree(B, x, y - 0.2, z, s * 0.95, r, true);
    else pine(B, x, y - 0.2, z, s, r);
    placed++;
  }
  // ── лес на склонах выше: до него всегда далеко, поэтому дерево — два конуса (как на дальних островах бухты);
  //    стоит густо, до границы леса, по кулуарам поднимается выше ──
  const slope = new Batch();
  slope.far = true;
  const rf = rng(210315);
  let far2 = 0;
  for (let i = 0; i < 60000 && far2 < 4200; i++) {
    const x = -420 + rf() * 860;
    const z = -470 + rf() * 760;
    const d = -waterD(x, z);
    if (d < 52 || d > 380) continue;
    const y = groundH(x, z);
    const line = 66 + 22 * fbm2(x * 0.012 + 8, z * 0.012 + 2, 2); // граница леса гуляет по высоте
    if (y > line) continue;
    if (Math.abs(groundH(x + 3, z) - y) > 4.2 || Math.abs(groundH(x, z + 3) - y) > 4.2) continue; // на скале лес не растёт
    if (rf() > 0.92 - 0.5 * sstep(line - 22, line, y)) continue; // к границе леса редеет
    // темнее обычного — в тон готовым соснам у воды, с разбросом: стена леса не должна быть одного цвета
    farPine(slope, { x, y: y - 0.4, z, h: (9.5 + rf() * 8) * (1 - 0.3 * sstep(line - 30, line, y)) }, rf, -0.34 + rf() * 0.12);
    far2++;
  }
  const mSlope = slope.build(BATCH_MAT, false);
  mSlope.name = 'lake-far-forest';
  scene.add(mSlope);
  // ── островок: несколько сосен и кусты между камней ──
  for (let i = 0, n = 0; i < 200 && n < 7; i++) {
    const a = r() * TAU;
    const d = Math.sqrt(r()) * (ISLET.r - 3.2);
    const x = ISLET.x + Math.cos(a) * d;
    const z = ISLET.z + Math.sin(a) * d;
    const y = groundH(x, z);
    if (y < 1.6) continue;
    if (n < 5) pine(nearT, x, y - 0.15, z, 0.75 + r() * 0.5, r);
    else bush(nearT, x, y, z, 0.7 + r() * 0.5, r);
    n++;
  }
  // ── кусты: вдоль берега у базы (как в бухте) и по опушке вокруг озера ──
  for (let i = 0; i < 400; i++) {
    const x = -56 + r() * 105;
    const d = 3.6 + r() * 16;
    const z = shoreZ(x) + d;
    if (d < 14 && r() < 0.8) continue;
    if (deckAt(x, z, -1.5) || yard(x, z)) continue;
    bush(nearT, x, groundH(x, z), z, 0.5 + r() * 0.6, r);
  }
  for (let i = 0, n = 0; i < 2400 && n < 150; i++) {
    const [sx, sz] = shoreAt(r() * TAU);
    const x = sx + (r() - 0.5) * 16;
    const z = sz + (r() - 0.5) * 16;
    const d = -waterD(x, z);
    if (d < 2.5 || d > 9 || (x > -60 && x < 53 && z > -5)) continue;
    const y = groundH(x, z);
    if (y < 0.9 || steep(x, z, y, 1.2)) continue;
    bush(far, x, y, z, 0.6 + r() * 0.7, r);
    n++;
  }
  // ── цветы у тропинки и забор вдоль неё (как в бухте: забор — граница, дальше которой не ходят) ──
  for (let i = 0; i < 260; i++) {
    const x = -52 + r() * 96;
    const d = 3.4 + r() * 10;
    const z = shoreZ(x) + d;
    const y = groundH(x, z);
    if (deckAt(x, z, -0.6) || y < 1 || r() < 0.45) continue;
    near.add(G.cyl(4), '#3f9a3a', M(x, y + 0.12, z, 0.025, 0.26, 0.025));
    near.add(G.ico(0), ['#fde047', '#f8fafc', '#c4b5fd', '#93c5fd'][Math.floor(r() * 4)], M(x, y + 0.27, z, 0.11, 0.08, 0.11), { flat: true });
  }
  let prev = null;
  for (let x = -53.5; x <= 5.5; x += 2.3) {
    const z = shoreZ(x) + 14.1;
    const y = groundH(x, z);
    near.add(G.box(), '#9a744a', M(x, y + 0.45, z, 0.11, 1.0, 0.11), { grad: [0.8, 1.05] });
    if (prev) {
      const len = Math.hypot(x - prev[0], z - prev[2], y - prev[1]);
      const ry = Math.atan2(-(z - prev[2]), x - prev[0]);
      const rz = Math.atan2(y - prev[1], Math.hypot(x - prev[0], z - prev[2]));
      for (const h of [0.38, 0.75]) near.add(G.box(), '#b08a5c', M((x + prev[0]) / 2, (y + prev[1]) / 2 + h, (z + prev[2]) / 2, len, 0.07, 0.04, 0, ry, rz));
    }
    prev = [x, y, z];
  }
  // ── камыш и кувшинки: в заводи и пятнами по тихим берегам ──
  const reed = (x, z, dep) => {
    if (dep > 0.05 && dep < 0.75 && r() < 0.75) {
      const h = 0.9 + r() * 0.9;
      const lean = (r() - 0.5) * 0.25;
      near.add(G.cyl(4, 0.5, 1), shade('#6fae3c', (r() - 0.5) * 0.2), M(x, h / 2 - 0.3, z, 0.035, h + 0.6, 0.035, lean, r() * 3, lean));
      if (r() < 0.55) near.add(G.cyl(6), '#6b4226', M(x + lean * 0.4, h - 0.02, z + lean * 0.4, 0.07, 0.24, 0.07, lean, 0, lean));
    } else if (dep > 0.6 && dep < 2.4 && r() < 0.16) {
      const s = 0.5 + r() * 0.5;
      near.add(G.cyl(9), shade('#3fa34d', (r() - 0.5) * 0.16), M(x, 0.07, z, s, 0.035, s, 0, r() * 6, 0));
      if (r() < 0.3) {
        near.add(G.cone(6), '#f8fafc', M(x, 0.15, z, 0.2, 0.14, 0.2, Math.PI, 0, 0));
        near.add(G.ico(0), '#fde047', M(x, 0.16, z, 0.07, 0.07, 0.07));
      }
    }
  };
  for (let i = 0; i < 520; i++) {
    const x = BACKWATER.x - 17 + r() * 34;
    const z = BACKWATER.z - 14 + r() * 28;
    if (deckAt(x, z, -0.8)) continue;
    reed(x, z, -groundH(x, z));
  }
  for (let i = 0; i < 1500; i++) {
    const th = r() * TAU;
    const [sx, sz] = shoreAt(th);
    if (sx > -62 && sx < 54 && sz > -6) continue; // у базы берег чистый
    if (fbm2(sx * 0.03 + 4, sz * 0.03 + 9, 2) < 0.55) continue; // пятнами, не сплошной каймой
    const x = sx + (r() - 0.5) * 9;
    const z = sz + (r() - 0.5) * 9;
    if (cliffAt(x, z) > 0.2) continue;
    reed(x, z, -groundH(x, z));
  }
  const mNear = near.build();
  const mNearT = nearT.build();
  const mFar = far.build(BATCH_MAT, false);
  scene.add(mNear, mNearT, mFar);
  ENV.fallback.trees.push(mNearT, mFar);
}

function buildStones(scene) {
  const r = rng(210312);
  const B = new Batch();
  B.mat = 2;
  const S = new Batch(); // камни, которые заменяются готовыми моделями
  S.mat = 2;
  const geos = [rockGeo(11), rockGeo(23), rockGeo(37), rockGeo(51), rockGeo(64, 2, 0.3)];
  const small = [rockGeo(11, 1), rockGeo(23, 1), rockGeo(37, 1)];
  /** Валун: приплюснутый шар; as — какой моделью его заменить (null — остаётся процедурным). */
  const rock = (as, x, y, z, sx, sy, sz, grass = false, tone = 0) => {
    const c = shade(GREYS[Math.floor(r() * GREYS.length)], tone + (r() - 0.5) * 0.1);
    const set = Math.max(sx, sy, sz) < 2.4 ? small : geos;
    (as ? S : B).add(set[Math.floor(r() * set.length)], c, M(x, y, z, sx, sy, sz, (r() - 0.5) * 0.5, r() * TAU, (r() - 0.5) * 0.5), grass ? { top: [shade(GRASS, (r() - 0.5) * 0.12), 0.72], grad: [0.72, 1.05], soft: true } : { grad: [0.72, 1.05] });
    if (as) ENV.rocks[as].push({ x, y: y - 0.72 * sy, z, w: 2 * sx, h: 1.52 * sy, d: 2 * sz, ry: spot01(x, z, 4) * TAU, tilt: Math.max(sx, sz) < 4 });
  };
  // берег у базы: мелкие камни вдоль кромки
  for (let i = 0; i < 70; i++) {
    const x = -60 + r() * 115;
    const z = shoreZ(x) - 1.5 + r() * 3.4;
    if (deckAt(x, z, -1.2)) continue;
    const s = 0.3 + r() * 0.75;
    rock('env-rock1', x, groundH(x, z) + s * 0.12, z, s * 1.3, s * 0.75, s, false, 0.05);
  }
  // вокруг всего озера: валуны у воды, местами — крупные
  for (let i = 0; i < 150; i++) {
    const [sx, sz] = shoreAt(r() * TAU);
    if (sx > -62 && sx < 54 && sz > -6) continue;
    const x = sx + (r() - 0.5) * 5;
    const z = sz + (r() - 0.5) * 5;
    if (cliffAt(x, z) > 0.3) continue;
    if (Math.hypot(x - GLADE.x, z - GLADE.z) < GLADE.r + 2) continue; // берег поляны чистый: галька, мостки, лодка
    const big = r() < 0.22;
    const s = big ? 1.6 + r() * 1.8 : 0.5 + r() * 1.1;
    rock(big && s > 2.6 ? 'env-rock2' : 'env-rock1', x, Math.max(groundH(x, z), -0.4) + s * 0.1, z, s * 1.25, s * (big ? 0.95 : 0.75), s, big && r() < 0.5);
  }
  // островок: валуны по кромке и пара глыб на макушке
  for (let i = 0; i < 26; i++) {
    const a = r() * TAU;
    const R = ISLET.r * (0.9 + r() * 0.32);
    const s = 0.9 + r() * 1.7;
    rock('env-rock1', ISLET.x + Math.cos(a) * R, -0.25 + r() * 0.6, ISLET.z + Math.sin(a) * R, s * 1.2, s * 0.8, s, false, -0.05);
  }
  rock('env-rock3', ISLET.x - 2.2, groundH(ISLET.x - 2.2, ISLET.z + 1.5) + 1.6, ISLET.z + 1.5, 2.3, 4.6, 2.2, true);
  rock('env-rock2', ISLET.x + 3.4, groundH(ISLET.x + 3.4, ISLET.z - 2) + 0.9, ISLET.z - 2, 2.2, 2.9, 2.0, true);
  // гряда: глыбы торчат из воды, вокруг — камни помельче под водой
  SHOAL.rocks.forEach(([ox, oz, w], i) => {
    const x = SHOAL.x + ox;
    const z = SHOAL.z + oz;
    rock(i === 0 ? 'env-rock2' : 'env-rock1', x, 0.25 + w * 0.12, z, w * 0.62, w * (i === 0 ? 0.75 : 0.5), w * 0.58, i === 0);
    for (let k = 0; k < 3; k++) rock('env-rock1', x + (r() - 0.5) * w * 2.6, -0.45 - r() * 0.5, z + (r() - 0.5) * w * 2.6, 0.7 + r() * 0.9, 0.5 + r() * 0.5, 0.7 + r() * 0.8, false, -0.08);
  });
  // ── северная стена: утёсы стоят в воде у подножия и поднимаются чуть выше кромки; у водопадов — просветы ──
  {
    const rc = rng(210313);
    const TH0 = Math.atan2(FALLS[0].z - LAKE.z, FALLS[0].x - LAKE.x);
    const fallTh = FALLS.map((f) => Math.atan2(f.z - LAKE.z, f.x - LAKE.x));
    let wallRun = 0;
    for (let th = TH0 - 0.62; th < TH0 + 0.95; ) {
      const [x0, z0] = shoreAt(th);
      const R = Math.hypot(x0 - LAKE.x, z0 - LAKE.z);
      const len = 10.5 + rc() * 3;
      const dth = len / R;
      const mid = th + dth / 2;
      th += dth;
      const [x, z] = shoreAt(mid);
      const k = cliffAt(x, z);
      if (k < 0.3) continue;
      if (fallTh.some((f) => Math.abs(f - mid) * R < 3.4 + len * 0.36)) continue; // здесь падает вода
      const [ax, az] = shoreAt(mid - 0.02);
      const [bx, bz] = shoreAt(mid + 0.02);
      const tl = Math.hypot(bx - ax, bz - az);
      const nx = (LAKE.x - x) / R;
      const nz = (LAKE.z - z) / R;
      const wall = wallRun >= 2 ? false : wallRun <= -2 ? true : rc() < 0.5;
      wallRun = wall ? Math.max(1, wallRun + 1) : Math.min(-1, wallRun - 1);
      const top = groundH(x - nx * 6.5, z - nz * 6.5) + 0.4 + rc() * 1.2;
      ENV.rocks[wall ? 'env-cliff1' : 'env-cliff2'].push({
        x: x - nx * (1.6 + rc() * 0.8), y: -1.6, z: z - nz * (1.6 + rc() * 0.8), w: len * (1.18 + rc() * 0.12), h: top + 1.6, d: 7.4 + rc() * 1.8,
        ry: Math.atan2(-(bz - az) / tl, (bx - ax) / tl) + (rc() < 0.5 ? Math.PI : 0) + (rc() - 0.5) * 0.2, tilt: false, turn: !wall && rc() < 0.5
      });
      // запасной вид без моделей — гладкая глыба на том же месте
      const s = len * 0.55;
      B.add(geos[Math.floor(rc() * 4)], shade(GREYS[Math.floor(rc() * GREYS.length)], -0.05), M(x - nx * 2.4, top * 0.42, z - nz * 2.4, s, top * 0.62, 4.2, 0, Math.atan2(-(bz - az), bx - ax), 0), { top: [GRASS, 0.8], grad: [0.72, 1.05], soft: true });
      // у подножия — обломки
      for (let j = 0; j < 2; j++) rock('env-rock1', x + nx * (1.5 + rc() * 3) + (rc() - 0.5) * len * 0.7, -0.3 + rc() * 0.5, z + nz * (1.5 + rc() * 3) + (rc() - 0.5) * len * 0.7, 1 + rc() * 1.4, 0.8 + rc() * 0.9, 1 + rc() * 1.3, false, -0.06);
    }
  }
  const mS = S.build();
  scene.add(B.build(), mS);
  ENV.fallback.rocks.push(mS);
}

/**
 * Поляна на северном берегу: избушка лицом к озеру (и к пирсу базы — её видно прямо за водой), перед ней костёр
 * со скамейкой, дрова у стены, лодка на гальке у мостков, люпины вдоль тропинки; по краю поляны — стена леса.
 */
function buildCabin(scene) {
  const r = rng(210314);
  const { x: hx, z: hz, s: cs, ry: cr } = CABIN;
  const hy = groundH(hx, hz) + 0.05;
  // оси дома: f — куда смотрит фасад (дверь и два окна), s — вправо от него вдоль дома
  const f = [-Math.sin(cr), -Math.cos(cr)];
  const sd = [Math.cos(cr), -Math.sin(cr)];
  const at = (u, v) => [hx + sd[0] * u + f[0] * v, hz + sd[1] * u + f[1] * v];
  // запасной вид: бревенчатый дом с двускатной крышей
  const C = new Batch();
  const wallH = 0.33 * cs;
  C.add(G.box(), '#8a6238', M(hx, hy + wallH / 2, hz, 0.92 * cs, wallH, 0.6 * cs, 0, cr, 0), { grad: [0.82, 1.04] });
  C.add(G.prism(), '#5a3a26', M(hx, hy + wallH, hz, 0.73 * cs, 0.27 * cs, cs, 0, cr + Math.PI / 2, 0), { grad: [0.9, 1.06] });
  const mC = C.build(BATCH_MAT_2S);
  scene.add(mC);
  ENV.fallback.cottage.push(mC);
  // готовый дом: окна ночью горят; у двери и в окнах тёплый свет — его видно через всё озеро
  ENV.singles.push({ id: 'env-cottage', key: 'cottage', x: hx, y: hy, z: hz, s: cs, ry: cr, lit: { color: '#ffc56b', k: 1.9 }, glows: [[-0.245, 0.19, -0.3, 3.4], [0.187, 0.19, -0.3, 3.4]] });
  CIRCLES.push({ x: hx, z: hz, r: 0.61 * cs });
  // костёр и скамейка: сидишь лицом к огню и к озеру
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
  const bx = fx + 0.5;
  const bz = fz - 2.15;
  ENV.singles.push({ id: 'env-bench', x: bx, y: groundH(bx, bz) - 0.04, z: bz, s: 1.62, ry: Math.PI + 0.2, block: 0.65 });
  // лодка, вытащенная на гальку у мостков, фонарь и снасти у крыльца
  ENV.singles.push({ id: 'prop-boat', x: -28.6, y: groundH(-28.6, -110.3) + 0.12, z: -110.3, s: 3.7, ry: 0.5, rz: 0.1, block: 1.3 });
  const [lx, lz] = at(1.55, 0.3 * cs + 0.7);
  ENV.singles.push({ id: 'prop-lantern', x: lx, y: groundH(lx, lz), z: lz, s: 0.5, ry: 0.4 });
  const [qx, qz] = at(-3.3, 0.3 * cs + 0.9);
  ENV.singles.push({ id: 'prop-barrel', x: qx, y: groundH(qx, qz), z: qz, s: 0.98, ry: 1.1, block: 0.5 });
  ENV.singles.push({ id: 'prop-netpile', x: qx + 1.15, y: groundH(qx + 1.15, qz + 0.3), z: qz + 0.3, s: 1.0, ry: 2.2 });
  // дрова у торцевой стены
  const W = new Batch();
  for (let i = 0; i < 12; i++) {
    const [wx, wz] = at(0.5 * cs + 0.75, -1.3 + (i % 4) * 0.25);
    W.add(G.cyl(7), shade('#8a5f3a', (r() - 0.5) * 0.2), M(wx, groundH(wx, wz) + 0.13 + Math.floor(i / 4) * 0.23, wz, 0.22, 1.1, 0.22, 0, cr + Math.PI / 2, Math.PI / 2), { mat: 1 });
  }
  // люпины: свечки сиреневых, розовых и белых цветов — вдоль тропинки и по краю поляны у воды
  const LUP = ['#8b5cf6', '#a78bfa', '#c084fc', '#f472b6', '#f5f3ff'];
  for (let i = 0, n = 0; i < 900 && n < 150; i++) {
    const a = r() * TAU;
    const d = Math.sqrt(r()) * (GLADE.r - 1.5);
    const x = GLADE.x + Math.cos(a) * d;
    const z = GLADE.z + Math.sin(a) * d;
    const y = groundH(x, z);
    if (y < 0.85 || deckAt(x, z, -0.5) || Math.hypot(x - hx, z - hz) < 0.66 * cs || Math.hypot(x - fx, z - fz) < 1.6) continue;
    // пятнами: гуще у воды и по краям поляны, на тропинке и в середине двора пусто
    if (fbm2(x * 0.21 + 3, z * 0.21 + 7, 2) < 0.5 || Math.abs(x + 21.6) < 1.3) continue;
    const h = 0.42 + r() * 0.42;
    const c = LUP[Math.floor(r() * LUP.length)];
    W.add(G.cyl(4), '#3f8f3a', M(x, y + h * 0.3, z, 0.03, h * 0.6, 0.03));
    W.add(G.cone(6), c, M(x, y + h * 0.82, z, 0.13, h * 0.62, 0.13), { flat: true });
    W.add(G.ico(0), '#4f9e3c', M(x, y + 0.1, z, 0.26, 0.12, 0.26), { flat: true });
    n++;
  }
  scene.add(W.build());
  // стена леса по краю поляны: сосны и кусты кольцом с суши — дальше поляны не ходят
  const T = new Batch();
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * TAU + (r() - 0.5) * 0.1;
    const d = GLADE.r + 0.6 + r() * 5.5;
    const x = GLADE.x + Math.cos(a) * d;
    const z = GLADE.z + Math.sin(a) * d;
    const y = groundH(x, z);
    if (-waterD(x, z) < 3.2 || y < 1.0) continue; // со стороны воды поляна открыта
    if (i % 3 === 2) bush(T, x, y, z, 0.7 + r() * 0.6, r);
    else if (r() < 0.2) roundTree(T, x, y - 0.2, z, 0.9 + r() * 0.5, r, true);
    else pine(T, x, y - 0.2, z, 1.0 + r() * 0.75, r);
  }
  const mT = T.build();
  scene.add(mT);
  ENV.fallback.trees.push(mT);
}

/** Вся природа озера. */
export function buildLakeNature(scene) {
  buildForest(scene);
  buildStones(scene);
  buildCabin(scene);
}

// ───── туман над водой: слои дымки, которые тают к полудню ─────
const MIST_VERT = /* glsl */ `varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const MIST_FRAG = /* glsl */ `
uniform sampler2D uDet;
uniform float uTime, uK;
uniform vec3 uCol;
varying vec3 vW;
void main() {
  vec2 p = vW.xz;
  vec2 sh = vec2(vW.y * 0.37, vW.y * 0.23); // у каждого слоя свой сдвиг рисунка: клочья не стоят столбом
  float n1 = texture2D(uDet, p * 0.0042 + sh + uTime * vec2(0.0031, 0.0012)).r;
  float n2 = texture2D(uDet, p * 0.011 - sh - uTime * vec2(0.0024, 0.0031)).a;
  float body = smoothstep(0.34, 0.74, n1 * 0.62 + n2 * 0.5);
  float d = length(cameraPosition.xz - p);
  // рядом со смотрящим слой прозрачен: туман виден впереди, над водой, а не стеной перед лицом
  float a = body * uK * smoothstep(7.0, 46.0, d) * (1.0 - smoothstep(300.0, 520.0, d));
  gl_FragColor = vec4(uCol, a * 0.4);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
/**
 * Туман над озером: несколько больших полупрозрачных слоёв в метре-трёх над водой, рисунок плывёт.
 * uDet — общая текстура шума (surface.js). Возвращает { set(k, color), update(t) }: k — плотность 0…1.
 */
export function buildMist(scene, uDet) {
  const smoke = buildSmoke(scene);
  const uniforms = { uDet, uTime: { value: 0 }, uK: { value: 0 }, uCol: { value: new THREE.Color('#e9f1f4') } };
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: MIST_VERT, fragmentShader: MIST_FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const g = new THREE.Group();
  // семь тонких слоёв: вдоль воды каждый виден полоской, вместе они складываются в мягкую дымку без резких линий
  for (const [y, s] of [[0.5, 1], [1.0, 1.03], [1.6, 1.06], [2.3, 1.1], [3.1, 1.14], [4.0, 1.18], [5.0, 1.22]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(LAKE.a * 2.5 * s, LAKE.b * 2.7 * s), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(LAKE.x, y, LAKE.z);
    m.renderOrder = 4;
    m.frustumCulled = false;
    g.add(m);
  }
  g.name = 'lake-mist';
  scene.add(g);
  return {
    group: g,
    set(k, color) {
      uniforms.uK.value = k;
      g.visible = k > 0.004; // днём слои не рисуются вовсе

      if (color) {
        uniforms.uCol.value.copy(color);
        smoke.uCol.value.copy(color);
      }
    },
    update(t) {
      uniforms.uTime.value = t;
      smoke.uTime.value = t;
    }
  };
}

// ───── дым из трубы избушки: клубы поднимаются, растут и тают, их сносит ветром ─────
const SMOKE_VERT = /* glsl */ `
attribute float aPh;
uniform float uTime;
uniform vec3 uAt;
varying vec2 vQ;
varying float vA;
void main() {
  float life = fract(uTime * 0.05 + aPh);
  vec3 at = uAt + vec3(5.5 * life * life + 0.4 * sin(uTime * 0.7 + aPh * 20.0) * life, 15.0 * life - 3.0 * life * life, 1.6 * life * life + 0.35 * cos(uTime * 0.6 + aPh * 13.0) * life);
  vec4 mv = viewMatrix * vec4(at, 1.0);
  mv.xy += position.xy * (0.7 + 4.6 * life);
  vQ = position.xy;
  vA = smoothstep(0.0, 0.1, life) * pow(1.0 - life, 1.6);
  gl_Position = projectionMatrix * mv;
}`;
const SMOKE_FRAG = /* glsl */ `
uniform vec3 uCol;
varying vec2 vQ;
varying float vA;
void main() {
  float r = length(vQ) * 2.0;
  if (r >= 1.0) discard;
  gl_FragColor = vec4(uCol, vA * 0.55 * (1.0 - r * r));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
function buildSmoke(scene) {
  const N = 14;
  const pos = new Float32Array(N * 12);
  const ph = new Float32Array(N * 4);
  const idx = [];
  const Q = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];
  for (let i = 0; i < N; i++) {
    for (let k = 0; k < 4; k++) {
      pos.set([Q[k][0], Q[k][1], 0], (i * 4 + k) * 3);
      ph[i * 4 + k] = i / N + 0.03 * Math.sin(i * 7.1);
    }
    idx.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aPh', new THREE.BufferAttribute(ph, 1));
  g.setIndex(idx);
  // труба — на коньке, ближе к торцу дома (как у запасного домика: u = 0,33 длины, v ≈ 0)
  const cc = Math.cos(CABIN.ry);
  const sn = Math.sin(CABIN.ry);
  const u = 0.33 * CABIN.s;
  const uniforms = { uTime: { value: 0 }, uCol: { value: new THREE.Color('#e9f1f4') }, uAt: { value: new THREE.Vector3(CABIN.x + u * cc, CABIN.y + 0.76 * CABIN.s, CABIN.z - u * sn) } };
  const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ uniforms, vertexShader: SMOKE_VERT, fragmentShader: SMOKE_FRAG, transparent: true, depthWrite: false, fog: false }));
  m.frustumCulled = false;
  m.renderOrder = 4;
  m.name = 'lake-smoke';
  scene.add(m);
  return uniforms;
}
