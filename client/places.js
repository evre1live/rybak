// Места за пределами бухты, куда плавают на лодке: Пальмовый остров, затонувший корабль, вывеска проката у пирса.
// Всё собирается кодом: пальмы — изогнутый ствол и листья-лопасти, корабль — разбитая половина корпуса с рёбрами
// и мачтой. Пальмы, навес, костёр, камни и корабль — запасные: когда загружаются готовые модели локации
// (envmodels.js), они встают на те же места, а процедурные прячутся.
import * as THREE from 'three';
import { Batch, M, G, BATCH_MAT_2S } from './batch.js';
import { loft } from './shapes.js';
import { rng, rockGeo, blobGeo, canvasTex, shade, TAU } from './util.js';
import { groundH, palmR, PALM, WRECK, DECK_Y, CIRCLES, MOORINGS } from './terrain.js';
import { ENV } from './envmodels.js';

/** Лист пальмы: дуга вдоль +X с провисанием, по ширине — три точки (ребро приподнято). Длина 1. */
const FROND = (() => {
  const N = 8;
  const pos = [];
  const pt = (t, side) => {
    const w = 0.21 * Math.pow(Math.sin(Math.PI * (0.05 + 0.95 * t)), 0.7);
    return [t, 0.42 * t - 1.05 * t * t + (side ? -0.045 * (1 - t) : 0), side * w];
  };
  for (let i = 0; i < N; i++) {
    const a = i / N;
    const b = (i + 1) / N;
    for (const s of [-1, 1]) {
      const p0 = pt(a, 0);
      const p1 = pt(b, 0);
      const e0 = pt(a, s);
      const e1 = pt(b, s);
      if (s < 0) pos.push(...p0, ...e0, ...p1, ...p1, ...e0, ...e1);
      else pos.push(...p0, ...p1, ...e0, ...p1, ...e1, ...e0);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
})();

function palmTree(B, x, y, z, s, r) {
  const dir = r() * TAU;
  const H = (5.0 + r() * 2.6) * s;
  const off = (0.1 + r() * 0.22) * H; // на столько верхушка уходит в сторону
  const secs = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const rad = (0.21 - 0.08 * t + (i % 2 ? 0.012 : 0)) * s; // чередование толщины — «кольца» на стволе
    secs.push([t * H, rad, rad, Math.cos(dir) * off * t * t, Math.sin(dir) * off * t * t]);
  }
  B.add(loft(secs, 8), shade('#a37a4c', (r() - 0.5) * 0.12), M(x, y - 0.25, z), { grad: [0.72, 1.06], mat: 1 });
  const tx = x + Math.cos(dir) * off;
  const tz = z + Math.sin(dir) * off;
  const ty = y - 0.25 + H;
  const n = 8 + Math.floor(r() * 2);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + r() * 0.4;
    const len = (2.5 + r() * 1.0) * s;
    B.add(FROND, shade(['#3f9d3c', '#4aad42', '#35913a'][i % 3], (r() - 0.5) * 0.1), M(tx, ty - 0.05, tz, len, len, len, 0, a, 0.05 + r() * 0.3), { mat: 3 });
  }
  // молодые листья торчат вверх
  for (let i = 0; i < 3; i++) B.add(FROND, '#5cbf4c', M(tx, ty, tz, 1.5 * s, 1.5 * s, 1.2 * s, 0, r() * TAU, 0.75 + r() * 0.3), { mat: 3 });
  for (let i = 0; i < 3; i++) {
    const a = r() * TAU;
    B.add(G.sph(8, 6), '#6b4a2a', M(tx + Math.cos(a) * 0.2 * s, ty - 0.22 * s, tz + Math.sin(a) * 0.2 * s, 0.26 * s, 0.28 * s, 0.26 * s));
  }
  CIRCLES.push({ x, z, r: Math.max(0.34 * s, 0.06 * H) }); // ствол готовой пальмы толще нарисованного
  ENV.flora['env-palm'].push({ x, y: y - 0.45, z, s: H * 1.17 + 0.2, ry: -dir });
}

/** Самая низкая точка земли под прямоугольником (полуразмеры a вдоль и b поперёк, повёрнут на ry): чтобы мебель не висела над склоном. */
function lowest(x, z, a, b, ry) {
  const c = Math.cos(ry);
  const sn = Math.sin(ry);
  let y = Infinity;
  for (const [u, v] of [[-a, -b], [a, -b], [-a, b], [a, b]]) y = Math.min(y, groundH(x + u * c + v * sn, z - u * sn + v * c));
  return y;
}

/** Табличка с надписью: две стороны. */
export function signBoard(scene, text, w, h, x, y, z, ry, sub = '') {
  const tex = canvasTex(512, Math.round((512 * h) / w), (g, cw, ch) => {
    g.fillStyle = '#7a4a26';
    g.fillRect(0, 0, cw, ch);
    const n = 3;
    for (let i = 0; i < n; i++) {
      g.fillStyle = ['#a86a3a', '#b5763f', '#9c6032'][i];
      g.fillRect(6, 6 + (i * (ch - 12)) / n, cw - 12, (ch - 12) / n - 3);
    }
    g.fillStyle = '#fff7df';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `italic 900 ${Math.round(ch * (sub ? 0.46 : 0.62))}px "Sofia Sans Extra Condensed", "Arial Narrow", sans-serif`;
    g.fillText(text, cw / 2, ch * (sub ? 0.36 : 0.54));
    if (sub) {
      g.fillStyle = '#ffd60a';
      g.font = `italic 800 ${Math.round(ch * 0.3)}px "Sofia Sans Extra Condensed", "Arial Narrow", sans-serif`;
      g.fillText(sub, cw / 2, ch * 0.76);
    }
  });
  // две доски спина к спине: надпись читается с обеих сторон, а не зеркалится с изнанки
  const m = new THREE.Group();
  const geo = new THREE.PlaneGeometry(w, h);
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
  for (const back of [0, 1]) {
    const f = new THREE.Mesh(geo, mat);
    f.rotation.y = back * Math.PI;
    f.position.z = back ? -0.012 : 0.012;
    f.castShadow = true;
    m.add(f);
  }
  m.position.set(x, y, z);
  m.rotation.y = ry;
  scene.add(m);
  return m;
}

function buildPalmIsland(scene, r) {
  const B = new Batch();
  B.auto = true;
  // то, что заменяется готовыми моделями, — в отдельные меши
  const PB = new Batch(); // пальмы
  const HB = new Batch(); // навес
  const FB = new Batch(); // костёр
  const RB = new Batch(); // камни
  PB.auto = HB.auto = FB.auto = true;
  // пальмы на дюне: гуще к середине, пара — у самой воды
  let n = 0;
  for (let i = 0; i < 400 && n < 13; i++) {
    const x = PALM.x + (r() * 2 - 1) * PALM.rx;
    const z = PALM.z + (r() * 2 - 1) * PALM.rz;
    const pr = palmR(x, z);
    if (pr > 0.86 || (pr > 0.6 && r() < 0.6)) continue;
    // не на мостках, не под навесом и не вплотную друг к другу
    if (x < 249 && Math.abs(z + 190) < 3.2) continue;
    if (Math.hypot(x - 255, z + 183) < 4.2) continue;
    if (CIRCLES.some((c) => Math.hypot(c.x - x, c.z - z) < 3.4)) continue;
    palmTree(PB, x, groundH(x, z), z, 0.85 + r() * 0.45, r);
    n++;
  }
  // навес у мостков: четыре столба, крыша из пальмовых листьев, скамья
  const sx = 255;
  const sz = -183;
  const sy = groundH(sx, sz);
  for (const [dx, dz] of [[-1.5, -1.2], [1.5, -1.2], [-1.5, 1.2], [1.5, 1.2]]) {
    HB.add(G.cyl(8), '#8a5f3a', M(sx + dx, sy + 1.1, sz + dz, 0.16, 2.5, 0.16), { grad: [0.8, 1.05] });
    CIRCLES.push({ x: sx + dx, z: sz + dz, r: 0.22 });
  }
  for (const s of [-1, 1]) {
    HB.add(G.box(), '#c9a24f', M(sx, sy + 2.62, sz + s * 0.85, 3.9, 0.1, 1.95, s * 0.42, 0, 0), { grad: [0.9, 1.05], mat: 5 });
    for (let i = 0; i < 7; i++) HB.add(FROND, shade('#b8963f', (r() - 0.5) * 0.14), M(sx - 1.7 + i * 0.57, sy + 2.98, sz + s * 0.1, 2.0, 1.5, 1.2, 0, -s * Math.PI / 2 + (r() - 0.5) * 0.25, -0.22), { mat: 5 });
  }
  HB.add(G.cyl(8), '#7a5230', M(sx, sy + 3.0, sz, 0.12, 4.1, 0.12, 0, 0, Math.PI / 2));
  HB.add(G.box(), '#c58a4e', M(sx, sy + 0.46, sz - 0.9, 2.4, 0.08, 0.42));
  for (const dx of [-1, 1]) HB.add(G.box(), '#7a5230', M(sx + dx, sy + 0.23, sz - 0.9, 0.09, 0.46, 0.38));
  // готовая хижина: вход (у модели он на −X) смотрит на конец мостков
  ENV.singles.push({ id: 'env-hut', key: 'hut', x: sx, y: sy - 0.05, z: sz, s: 4.4, ry: -0.585, block: 2.25 });
  // кострище: камни по кругу, поленья, угли. Стоит на свободном месте: готовые пальмы толще нарисованных,
  // и на прежнем месте (258.5, −188.4) ствол соседней пальмы вставал прямо в огонь
  const fx = 262.6;
  const fz = -187.4;
  const fy = groundH(fx, fz);
  const stone = rockGeo(5, 1);
  for (let i = 0; i < 8; i++) FB.add(stone, shade('#8d95a1', (r() - 0.5) * 0.16), M(fx + Math.cos((i / 8) * TAU) * 0.62, fy + 0.05, fz + Math.sin((i / 8) * TAU) * 0.62, 0.2, 0.15, 0.2, 0, r() * 6, 0), { mat: 2 });
  for (let i = 0; i < 3; i++) FB.add(G.cyl(7), '#5b3a1e', M(fx, fy + 0.14, fz, 0.13, 0.95, 0.13, 0, (i / 3) * Math.PI, Math.PI / 2 - 0.2));
  CIRCLES.push({ x: fx, z: fz, r: 0.75 });
  ENV.singles.push({ id: 'env-campfire', key: 'campfire', x: fx, y: fy - 0.03, z: fz, s: 1.75, ry: 0.4, fire: [0.03, 0.2, 0] });
  // скамейка у костра — лицом к огню
  ENV.singles.push({ id: 'env-bench', x: fx + 2.2, y: lowest(fx + 2.2, fz - 1.3, 0.8, 0.35, 2.09) - 0.04, z: fz - 1.3, s: 1.62, ry: 2.09, block: 0.65 });
  // коряга и камни на северном берегу, ракушки-камешки у воды
  B.add(G.cyl(7, 0.6, 1), '#a8937a', M(281, groundH(281, -206) + 0.16, -206, 0.3, 3.4, 0.3, 0, 0.6, Math.PI / 2 - 0.08), { mat: 1 });
  B.add(G.cyl(6, 0.5, 1), '#a8937a', M(281.6, groundH(281, -206) + 0.5, -205.4, 0.14, 1.3, 0.14, 0.5, 0.2, 0.7), { mat: 1 });
  const rocks = [rockGeo(11, 1), rockGeo(23, 1), rockGeo(37, 1)];
  for (let i = 0; i < 9; i++) {
    const a = -1.0 + r() * 0.9;
    const k = 0.92 + r() * 0.22;
    const x = PALM.x + Math.cos(a) * PALM.rx * k;
    const z = PALM.z + Math.sin(a) * PALM.rz * k;
    const s = 0.5 + r() * 1.3;
    const gy = groundH(x, z) + s * 0.1;
    RB.add(rocks[i % 3], shade('#9aa2ad', (r() - 0.5) * 0.14), M(x, gy, z, s * 1.2, s * 0.8, s, 0, r() * 6, 0), { grad: [0.72, 1.05], mat: 2 });
    ENV.rocks['env-rock1'].push({ x, y: gy - 0.72 * s * 0.8, z, w: 2.4 * s, h: 1.52 * s * 0.8, d: 2 * s, ry: i * 2.3, tilt: true });
    if (s > 0.9) CIRCLES.push({ x, z, r: s * 0.75 });
  }
  // кусты прибрежной травы
  const blob = blobGeo(8, 1, 0.18);
  const GB = new Batch();
  for (let i = 0; i < 16; i++) {
    const x = PALM.x + (r() * 2 - 1) * PALM.rx * 0.8;
    const z = PALM.z + (r() * 2 - 1) * PALM.rz * 0.8;
    // (258.5, −188.4) — прежнее место костра: правило оставлено, чтобы случайная расстановка дальше не сдвинулась
    if (palmR(x, z) > 0.8 || (x < 250 && Math.abs(z + 190) < 2.6) || Math.hypot(x - sx, z - sz) < 3.4 || Math.hypot(x - 258.5, z + 188.4) < 2 || Math.hypot(x - fx, z - fz) < 2) continue;
    const s = 0.5 + r() * 0.6;
    GB.add(blob, shade('#7fbf55', (r() - 0.5) * 0.14), M(x, groundH(x, z) + 0.12 * s, z, s, s * 0.6, s, 0, r() * 6, 0), { grad: [0.6, 1.12], mat: 3 });
    ENV.flora['env-bush'].push({ x, y: groundH(x, z) - 0.05, z, s: 1.7 * s, ry: i * 1.9 });
  }
  const mG = GB.build(BATCH_MAT_2S);
  scene.add(mG);
  ENV.fallback.trees.push(mG);
  const mP = PB.build(BATCH_MAT_2S);
  const mH = HB.build(BATCH_MAT_2S);
  const mF = FB.build();
  const mR = RB.build();
  scene.add(B.build(BATCH_MAT_2S), mP, mH, mF, mR);
  ENV.fallback.palms.push(mP);
  ENV.fallback.hut.push(mH);
  ENV.fallback.campfire.push(mF);
  ENV.fallback.rocks.push(mR);
  // указатель у конца мостков
  const py = groundH(246.6, -187.2);
  const post = new Batch();
  post.auto = true;
  post.add(G.cyl(8), '#8a5f3a', M(246.6, py + 1.0, -187.2, 0.14, 2.3, 0.14), { grad: [0.8, 1.05] });
  scene.add(post.build());
  signBoard(scene, 'ПАЛЬМОВЫЙ ОСТРОВ', 2.2, 0.5, 246.52, py + 1.85, -187.2, -Math.PI / 2);
  CIRCLES.push({ x: 246.6, z: -187.2, r: 0.22 });
}

function buildWreck(scene, r) {
  const B = new Batch();
  B.mat = 1;
  // корабль лежит на боку на отмели: нос задран, корма под водой
  const W = new THREE.Matrix4().compose(new THREE.Vector3(WRECK.x, 1.7, WRECK.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, 0.7, 0.2, 'YXZ')), new THREE.Vector3(1, 1, 1));
  const at = (m) => new THREE.Matrix4().multiplyMatrices(W, m);
  const LX = 9.4;
  const LY = 3.8;
  const LZ = 3.1;
  // корпус: нижняя половина эллипсоида, корма «отломана» по рваной линии
  const hull = new THREE.SphereGeometry(1, 26, 12, 0, TAU, Math.PI / 2, Math.PI / 2).toNonIndexed();
  {
    const p = hull.attributes.position;
    const keep = [];
    for (let i = 0; i < p.count; i += 3) {
      const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3;
      const cy = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3;
      const cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
      if (cx < -0.42 + 0.16 * Math.sin(cy * 9 + cz * 6)) continue; // корма отломана
      if (cy > -0.5 && Math.sin(cx * 7.5 + 1) * Math.sin(cz * 9 + cy * 4) > 0.8) continue; // дыры в обшивке
      for (let k = 0; k < 3; k++) keep.push(p.getX(i + k), p.getY(i + k), p.getZ(i + k));
    }
    hull.setAttribute('position', new THREE.Float32BufferAttribute(keep, 3));
    hull.deleteAttribute('normal');
    hull.deleteAttribute('uv');
    hull.computeVertexNormals();
  }
  B.add(hull, '#4f3a26', at(M(0, 0, 0, LX, LY, LZ)), { grad: [0.6, 1.1] });
  // привальный брус по борту, рёбра-шпангоуты и поперечные балки палубы
  for (let i = 0; i < 9; i++) {
    const x = -0.36 + i * 0.16;
    const k = Math.sqrt(Math.max(0.02, 1 - x * x));
    B.add(G.torus(0.035, 14, Math.PI), shade('#6b4a2e', (r() - 0.5) * 0.14), at(M(x * LX, 0, 0, LZ * 2 * k * 0.97, LY * 2 * k * 0.97, 1.4, Math.PI, Math.PI / 2, 0)));
    if (i % 2 === 0 || r() < 0.5) B.add(G.box(), shade('#7a5a3a', (r() - 0.5) * 0.14), at(M(x * LX, -0.06, 0, 0.22, 0.16, LZ * 2 * k * 0.96)));
  }
  for (const s of [-1, 1]) {
    for (let i = 0; i < 10; i++) {
      const x0 = -0.34 + i * 0.132;
      const x1 = x0 + 0.132;
      const z0 = Math.sqrt(1 - x0 * x0) * LZ * s;
      const z1 = Math.sqrt(Math.max(0, 1 - x1 * x1)) * LZ * s;
      const len = Math.hypot((x1 - x0) * LX, z1 - z0);
      B.add(G.box(), '#6b4a2e', at(M(((x0 + x1) / 2) * LX, 0.06, (z0 + z1) / 2, len + 0.05, 0.22, 0.2, 0, Math.atan2(-(z1 - z0), (x1 - x0) * LX), 0)));
    }
  }
  // остатки палубы на носу
  for (let i = 0; i < 6; i++) {
    const x = 0.38 + i * 0.085;
    const k = Math.sqrt(Math.max(0.02, 1 - x * x));
    if (r() < 0.25) continue;
    B.add(G.box(), shade('#8a6a45', (r() - 0.5) * 0.16), at(M(x * LX, 0.02, 0, 0.6, 0.07, LZ * 2 * k * 0.92)));
  }
  // бушприт, сломанная мачта с реей и обрывком паруса
  B.add(G.cyl(8, 0.5, 1), '#6b4a2e', at(M(LX * 1.14, 0.9, 0, 0.28, 4.4, 0.28, 0, 0, -Math.PI / 2 + 0.32)));
  B.add(G.cyl(9, 0.8, 1), '#7a5a3a', at(M(0.6, 3.6, 0.2, 0.42, 10.6, 0.42, 0.1, 0, -0.14)));
  B.add(G.cyl(7), '#6b4a2e', at(M(-0.2, 7.6, 0.9, 0.18, 6.4, 0.18, Math.PI / 2 - 0.12, 0.25, 0)));
  B.add(G.box(), '#d9cfb8', at(M(-0.45, 6.0, 1.5, 0.03, 2.9, 3.2, 0.1, 0.25, 0.08)), { mat: 5, grad: [0.75, 1.05] });
  B.add(G.box(), '#cfc3a6', at(M(-0.3, 5.6, -1.1, 0.03, 1.9, 1.4, -0.2, 0.25, 0.25)), { mat: 5, grad: [0.75, 1.05] });
  // обломок мачты в воде и пара бочек на отмели
  const mW = B.build(BATCH_MAT_2S);
  scene.add(mW);
  ENV.fallback.wreck.push(mW);
  // готовый корабль: нос (у модели он на +X) задран, корпус завален на борт
  ENV.singles.push({ id: 'env-wreck', key: 'wreck', x: WRECK.x, y: -2.5, z: WRECK.z, s: 16.5, ry: 0.7, rx: 0.24, rz: 0.1, gain: 1.25 });
  // обломок мачты в воде — остаётся при любом корабле
  const D = new Batch();
  D.mat = 1;
  D.add(G.cyl(8), '#6b4a2e', M(WRECK.x - 9, -0.1, WRECK.z + 6, 0.3, 4.2, 0.3, 0.2, 1.1, Math.PI / 2 - 0.06));
  scene.add(D.build());
  // камни отмели вокруг корабля
  const R = new Batch();
  R.mat = 2;
  const geos = [rockGeo(11, 1), rockGeo(23, 1), rockGeo(37, 1)];
  for (let i = 0; i < 16; i++) {
    const a = r() * TAU;
    const d = 6 + r() * 15;
    const x = WRECK.x + Math.cos(a) * d;
    const z = WRECK.z + Math.sin(a) * d;
    const s = 0.9 + r() * 1.9;
    const gy = groundH(x, z) + s * 0.25;
    R.add(geos[i % 3], shade('#868f9c', (r() - 0.5) * 0.14), M(x, gy, z, s * 1.2, s * 0.8, s, (r() - 0.5) * 0.4, r() * 6, 0), { grad: [0.7, 1.05] });
    ENV.rocks[i % 4 === 3 ? 'env-rock3' : 'env-rock1'].push({ x, y: gy - 0.72 * s * 0.8, z, w: 2.4 * s, h: 1.52 * s * (i % 4 === 3 ? 1.5 : 0.8), d: 2 * s, ry: i * 1.9, tilt: true });
  }
  const mR = R.build();
  scene.add(mR);
  ENV.fallback.rocks.push(mR);
}

/** Вывеска проката у главного пирса: столб с доской, видно с настила. */
function buildRentalSign(scene) {
  const m = MOORINGS[0];
  const x = 1.42;
  const z = m.z - 3.3; // чуть дальше стоянки, в стороне от фонаря
  const B = new Batch();
  B.auto = true;
  B.add(G.cyl(8), '#5b3a1e', M(x, DECK_Y + 1.25, z, 0.13, 2.5, 0.13), { grad: [0.8, 1.05] });
  B.add(G.box(), '#5b3a1e', M(x + 0.55, DECK_Y + 2.42, z, 1.25, 0.07, 0.07));
  for (const dx of [0.2, 0.95]) B.add(G.cyl(5), '#2b2f36', M(x + dx, DECK_Y + 2.31, z, 0.02, 0.16, 0.02));
  const post = B.build();
  scene.add(post);
  const board = signBoard(scene, 'ПРОКАТ ЛОДОК', 1.3, 0.5, x + 0.58, DECK_Y + 1.98, z, 0, 'ПОДОЙДИ К ЛОДКЕ');
  const block = { x, z, r: 0.2 };
  CIRCLES.push(block);
  // когда на площадке проката встаёт готовая будка с вывеской, столб с доской убирается (и перестаёт мешать ходить)
  ENV.fallback.sign.push(post, board);
  ENV.signBlock = block;
}

export function buildPlaces(scene) {
  const r = rng(20261112);
  buildPalmIsland(scene, r);
  buildWreck(scene, r);
  buildRentalSign(scene);
}
