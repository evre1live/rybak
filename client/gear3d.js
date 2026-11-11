// Снасти в 3D: удочка с катушкой (гнётся под рыбой), поплавки, приманки, наживка и прочие предметы для иконок.
import * as THREE from 'three';
import { ITEMS, RODS, FLOATS, LINES, REELS } from '../shared/data.js';
import { Batch, M, G, BATCH_MAT, BATCH_MAT_2S } from './batch.js';
import { METAL_MAT, GLOSS_MAT, RING_MAT } from './env.js';
import { loft, tube } from './shapes.js';
import { shade, mat } from './util.js';

const METAL = '#3b424c';
export const ROD_LEN = 1.98;
const SEGS = 10;

/**
 * Удочка. Ось +Y — к кончику, катушка висит со стороны +Z, начало координат — у катушкодержателя (там её держит правая рука).
 * handleSide: с какой стороны ручка катушки (−1 — слева в виде от первого лица).
 */
export function buildRod(rodId, reelId = 'reel1', lineId = 'line1', handleSide = -1) {
  const rod = ITEMS[rodId] || RODS[0];
  const reel = ITEMS[reelId] || REELS[0];
  const line = ITEMS[lineId] || LINES[0];
  const [cBlank, cAccent, cGrip, cReel] = rod.col;
  const reelCol = reel.id === 'reel1' ? cReel : reel.col;
  const group = new THREE.Group();
  const B = new Batch();
  const hs = handleSide;
  const Bg = new Batch(); // глянец: корпус и шпуля
  const Bm = new Batch(); // хром
  const CHROME = '#dfe5ee';
  // ── рукоять: торец, задняя ручка с цветными кольцами, катушкодержатель с гайками, передняя ручка ──
  B.add(G.cyl(14), cAccent, M(0, -0.285, 0, 0.046, 0.04, 0.046));
  Bm.add(G.cyl(14), CHROME, M(0, -0.262, 0, 0.042, 0.008, 0.042));
  B.add(loft([[-0.27, 0.0195, 0.0195], [-0.2, 0.018, 0.018], [-0.06, 0.017, 0.017]], 14), cGrip, M(0, 0, 0), { mat: 5 });
  for (const y of [-0.215, -0.105]) B.add(G.cyl(14), cAccent, M(0, y, 0, 0.0385, 0.012, 0.0385));
  B.add(G.cyl(14), cAccent, M(0, -0.055, 0, 0.041, 0.022, 0.041));
  Bg.add(G.cyl(14), shade(cBlank, -0.25), M(0, 0.03, 0, 0.031, 0.15, 0.031));
  for (const y of [-0.036, 0.096]) Bm.add(G.cyl(14), CHROME, M(0, y, 0, 0.037, 0.014, 0.037));
  B.add(G.cyl(14), cAccent, M(0, 0.112, 0, 0.041, 0.022, 0.041));
  B.add(loft([[0.12, 0.017, 0.017], [0.2, 0.0165, 0.0165], [0.245, 0.0128, 0.0128]], 14), cGrip, M(0, 0, 0), { mat: 5 });
  B.add(G.cyl(14), cAccent, M(0, 0.252, 0, 0.031, 0.016, 0.031));
  // ── катушка: крупная, как на макете. Ось шпули параллельна удилищу и висит под ним (со стороны +Z) ──
  const RZ = 0.108;
  // лапка под гайками катушкодержателя и ножка
  Bm.add(G.box(), CHROME, M(0, 0.03, 0.019, 0.017, 0.112, 0.007));
  Bg.add(loft([[0.02, 0.011, 0.0065], [0.045, 0.012, 0.0075], [0.078, 0.019, 0.013]], 10), reelCol, M(0, 0.036, 0, 1, 1, 1, Math.PI / 2, 0, 0));
  // корпус редуктора и крышка со стороны ручки
  Bg.add(G.sph(18, 12), reelCol, M(0, 0.036, RZ, 0.056, 0.082, 0.078));
  Bg.add(G.cyl(18), shade(reelCol, -0.18), M(-hs * 0.027, 0.036, RZ, 0.062, 0.008, 0.062, 0, 0, Math.PI / 2));
  Bm.add(G.cyl(12), CHROME, M(-hs * 0.032, 0.036, RZ, 0.02, 0.006, 0.02, 0, 0, Math.PI / 2));
  // ротор с двумя стойками
  Bg.add(G.cyl(20), shade(reelCol, -0.28), M(0, 0.094, RZ, 0.088, 0.034, 0.088));
  Bg.add(G.cyl(20), shade(reelCol, -0.12), M(0, 0.076, RZ, 0.092, 0.008, 0.092));
  for (const sx of [-1, 1]) Bg.add(G.box(), shade(reelCol, -0.2), M(sx * 0.046, 0.128, RZ, 0.009, 0.062, 0.02));
  // шпуля: юбка, леска, бортик, фрикцион
  Bg.add(G.cyl(20), cAccent, M(0, 0.116, RZ, 0.077, 0.018, 0.077));
  B.add(G.cyl(20), line.col, M(0, 0.143, RZ, 0.064, 0.038, 0.064), { mat: 5 });
  Bm.add(G.cyl(20), CHROME, M(0, 0.164, RZ, 0.082, 0.006, 0.082));
  Bg.add(G.cyl(16), cAccent, M(0, 0.176, RZ, 0.044, 0.018, 0.044));
  Bm.add(G.cyl(12), CHROME, M(0, 0.187, RZ, 0.022, 0.006, 0.022));
  // дужка лесоукладывателя и ролик
  Bm.add(G.torus(0.045, 18, Math.PI * 1.08), CHROME, M(0, 0.15, RZ, 0.104, 0.104, 0.104, Math.PI / 2 - 0.42, 0, -0.1));
  Bm.add(G.cyl(8), '#f2c94c', M(0.046, 0.157, RZ + 0.004, 0.014, 0.014, 0.014, Math.PI / 2, 0, 0));
  // вал ручки
  Bm.add(G.cyl(10), CHROME, M(hs * 0.034, 0.036, RZ, 0.016, 0.028, 0.016, 0, 0, Math.PI / 2));
  group.add(B.build(BATCH_MAT, false), Bg.build(GLOSS_MAT, false), Bm.build(METAL_MAT, false));
  // ручка катушки — отдельно, она крутится: рычаг и крупная ручка-«грибок»
  const handle = new THREE.Group();
  handle.position.set(hs * 0.05, 0.036, RZ);
  const KNOB = new THREE.Vector3(hs * 0.04, 0.072, 0);
  const hb = new Batch();
  const hm = new Batch();
  hm.add(G.cyl(12), CHROME, M(0, 0, 0, 0.026, 0.012, 0.026, 0, 0, Math.PI / 2));
  hm.add(G.box(), CHROME, M(0, KNOB.y / 2, 0, 0.007, KNOB.y + 0.016, 0.015));
  hm.add(G.cyl(8), CHROME, M(hs * 0.012, KNOB.y, 0, 0.009, 0.024, 0.009, 0, 0, Math.PI / 2));
  hb.add(G.sph(14, 10), shade(cGrip, -0.1), M(KNOB.x, KNOB.y, 0, 0.05, 0.034, 0.034), { mat: 5 });
  hb.add(G.cyl(10), cAccent, M(hs * 0.019, KNOB.y, 0, 0.022, 0.006, 0.022, 0, 0, Math.PI / 2));
  handle.add(hb.build(BATCH_MAT, false), hm.build(METAL_MAT, false));
  group.add(handle);
  // бланк из сегментов: каждый следующий чуть наклоняется — так удочка гнётся
  const segs = [];
  const total = ROD_LEN - 0.26;
  const sl = total / SEGS;
  let parent = group;
  const blankMat = mat(cBlank, 0.45, 0.1);
  const accentMat = mat(cAccent, 0.5, 0.1);
  const metalMat = RING_MAT;
  for (let i = 0; i < SEGS; i++) {
    const s = new THREE.Group();
    s.position.y = i ? sl : 0.26;
    parent.add(s);
    const r0 = 0.0105 - (0.0083 * i) / SEGS;
    const r1 = 0.0105 - (0.0083 * (i + 1)) / SEGS;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, sl, 7), blankMat);
    m.position.y = sl / 2;
    s.add(m);
    if (i % 2 === 1 || i === SEGS - 1) {
      // пропускное кольцо и цветная обмотка
      const gr = 0.017 - i * 0.0012;
      const ring = new THREE.Mesh(G.torus(0.22, 10), metalMat);
      ring.scale.setScalar(gr * 2);
      ring.position.set(0, sl, r1 + gr);
      ring.rotation.x = Math.PI / 2;
      s.add(ring);
      const wrap = new THREE.Mesh(G.cyl(7), accentMat);
      wrap.scale.set(r1 * 2.5, 0.03, r1 * 2.5);
      wrap.position.y = sl - 0.02;
      s.add(wrap);
    }
    segs.push(s);
    parent = s;
  }
  const tip = new THREE.Object3D();
  tip.position.set(0, sl, 0.006);
  parent.add(tip);
  group.traverse((o) => {
    if (o.isMesh) o.receiveShadow = false;
  });
  return {
    group, tip, handle, id: rodId,
    /** середина ручки катушки в осях handle — туда ложится левая кисть */
    knob: KNOB,
    handleSide: hs,
    /** b: 0 — прямая, 1 — в дугу; side — увод кончика вбок */
    setBend(b, side = 0) {
      for (let i = 0; i < SEGS; i++) {
        const w = Math.pow((i + 1) / SEGS, 1.6);
        segs[i].rotation.x = b * 0.26 * w;
        segs[i].rotation.z = side * 0.09 * w;
      }
    }
  };
}

export function buildFloat(floatId = 'float1') {
  const f = ITEMS[floatId] || FLOATS[0];
  const [cTop, cBot, cKeel] = f.col;
  const g = new THREE.Group();
  const B = new Batch();
  B.add(loft([[0, 0.072, 0.072], [0.045, 0.06, 0.06], [0.09, 0.03, 0.03], [0.115, 0.012, 0.012]], 14), cTop, M(0, 0, 0));
  B.add(loft([[-0.12, 0.012, 0.012], [-0.08, 0.04, 0.04], [-0.035, 0.066, 0.066], [0, 0.072, 0.072]], 14), cBot, M(0, 0, 0));
  B.add(G.cyl(6), cTop, M(0, 0.2, 0, 0.012, 0.18, 0.012));
  B.add(G.sph(8, 6), f.glow ? '#fef08a' : cTop, M(0, 0.3, 0, 0.034, 0.034, 0.034));
  B.add(G.cyl(6), cKeel, M(0, -0.19, 0, 0.012, 0.16, 0.012));
  const m = B.build(BATCH_MAT);
  g.add(m);
  if (f.glow) {
    const glow = new THREE.Mesh(G.sph(8, 6), new THREE.MeshBasicMaterial({ color: '#d9f99d' }));
    glow.scale.setScalar(0.05);
    glow.position.y = 0.3;
    g.add(glow);
  }
  return g;
}

function hook(B, x, y, z, s, ry = 0) {
  const g = tube([[0, 0.5, 0], [0, 0, 0], [0.02, -0.28, 0], [0.16, -0.4, 0], [0.3, -0.26, 0], [0.3, -0.1, 0]], 0.022, 5);
  B.add(g, '#cbd5e1', M(x, y, z, s, s, s, 0, ry, 0));
}
export function buildLure(id) {
  const it = ITEMS[id] || ITEMS.spoon;
  const [c1, c2] = it.col || ['#d9dee6', '#ef4444'];
  const B = new Batch();
  if (id === 'spinner') {
    B.add(G.cyl(5), '#cbd5e1', M(0, 0, 0, 0.012, 0.5, 0.012));
    B.add(G.sph(10, 8), c1, M(0.05, 0.05, 0, 0.16, 0.3, 0.03, 0, 0, -0.35));
    B.add(G.sph(8, 6), '#ef4444', M(0, -0.08, 0, 0.06, 0.07, 0.06));
    B.add(G.sph(8, 6), c2, M(0, -0.15, 0, 0.05, 0.05, 0.05));
    hook(B, 0, -0.3, 0, 0.26);
  } else if (id === 'wobbler') {
    B.add(loft([[-0.3, 0.01, 0.008], [-0.18, 0.07, 0.045], [0.05, 0.085, 0.055], [0.24, 0.05, 0.035], [0.32, 0.012, 0.01]], 12), c1, M(0, 0, 0, 1, 1, 1, 0, 0, Math.PI / 2), { top: [c2, 0.35] });
    B.add(G.box(), '#e2e8f0', M(-0.3, -0.06, 0, 0.1, 0.012, 0.09, 0, 0, 0.6));
    B.add(G.sph(8, 6), '#111827', M(-0.2, 0.03, 0.045, 0.035, 0.035, 0.02));
    B.add(G.sph(8, 6), '#111827', M(-0.2, 0.03, -0.045, 0.035, 0.035, 0.02));
    hook(B, 0.0, -0.17, 0, 0.2);
    hook(B, 0.3, -0.12, 0, 0.2);
  } else if (id === 'jig') {
    B.add(G.sph(10, 8), '#9ca3af', M(-0.2, 0.02, 0, 0.14, 0.14, 0.14));
    B.add(tube([[-0.15, 0, 0], [0.05, -0.02, 0], [0.2, 0.03, 0], [0.32, -0.04, 0], [0.4, 0.08, 0]], 0.05, 8, (t) => 1 - t * 0.75), c1, M(0, 0, 0, 1, 1, 1), null);
    B.add(G.sph(8, 6), c2, M(0.4, 0.08, 0, 0.05, 0.11, 0.02, 0, 0, 0.5));
    hook(B, -0.05, -0.12, 0, 0.22);
  } else {
    // колебалка: изогнутый лепесток
    B.add(G.sph(14, 10), c1, M(0, 0, 0, 0.2, 0.52, 0.035));
    B.add(G.sph(8, 6), c2, M(0, 0.1, 0.012, 0.09, 0.2, 0.02));
    B.add(G.torus(0.25, 8), '#cbd5e1', M(0, 0.28, 0, 0.06, 0.06, 0.06));
    hook(B, 0, -0.36, 0, 0.26);
  }
  const g = new THREE.Group();
  g.add(B.build(BATCH_MAT_2S));
  return g;
}

const fishlet = (B, x, y, z, s, c1 = '#b9c7d1', c2 = '#5f7480', rz = 0) => {
  B.add(loft([[-0.5, 0.01, 0.006], [-0.3, 0.13, 0.07], [0.05, 0.15, 0.08], [0.36, 0.05, 0.03], [0.42, 0.02, 0.012]], 10), c1, M(x, y, z, s, s, s, 0, 0, Math.PI / 2 + rz), { top: [c2, 0.4] });
  B.add(G.cone(4), c2, M(x + 0.5 * s * Math.cos(rz), y + 0.5 * s * Math.sin(rz), z, 0.3 * s, 0.26 * s, 0.03 * s, 0, 0, Math.PI / 2 + rz));
  B.add(G.sph(6, 5), '#111827', M(x - 0.3 * s * Math.cos(rz), y - 0.3 * s * Math.sin(rz) + 0.05 * s, z + 0.06 * s, 0.05 * s, 0.05 * s, 0.03 * s));
};

/** Модель предмета для иконки: помещается в единичный куб вокруг начала координат. */
export function itemModel(id) {
  const it = ITEMS[id];
  const g = new THREE.Group();
  const B = new Batch();
  const cat = it ? it.cat : 'junk';
  if (cat === 'rod') {
    const r = buildRod(id, 'reel1', 'line1', -1);
    r.setBend(0.25);
    g.add(r.group);
    g.userData.rod = true;
    return g;
  }
  if (cat === 'float') {
    const f = buildFloat(id);
    f.scale.setScalar(2.2);
    f.position.y = -0.1;
    f.rotation.z = -0.3;
    g.add(f);
    return g;
  }
  if (cat === 'lure') {
    const l = buildLure(id);
    l.scale.setScalar(1.15);
    l.rotation.z = id === 'wobbler' || id === 'jig' ? 0.25 : -0.5;
    g.add(l);
    return g;
  }
  if (cat === 'reel') {
    const c = it.col;
    B.add(G.box(), METAL, M(0, 0.36, 0, 0.09, 0.2, 0.3));
    B.add(G.box(), METAL, M(0, 0.47, 0, 0.1, 0.05, 0.6));
    B.add(G.sph(16, 12), c, M(0, 0.05, 0, 0.42, 0.5, 0.4));
    B.add(G.cyl(16), shade(c, -0.3), M(0, 0.05, 0.24, 0.36, 0.14, 0.36, Math.PI / 2, 0, 0));
    B.add(G.cyl(16), '#e8f4ff', M(0, 0.05, 0.36, 0.4, 0.16, 0.4, Math.PI / 2, 0, 0));
    B.add(G.cyl(16), shade(c, 0.2), M(0, 0.05, 0.46, 0.46, 0.04, 0.46, Math.PI / 2, 0, 0));
    B.add(G.torus(0.07, 14, Math.PI * 1.2), '#cbd5e1', M(0, 0.05, 0.36, 0.62, 0.62, 0.62, 0, 0, 0.4));
    B.add(G.box(), '#cbd5e1', M(-0.3, -0.05, 0, 0.05, 0.3, 0.07, 0, 0, 0.5));
    B.add(G.sph(10, 8), '#1f2937', M(-0.42, -0.2, 0, 0.16, 0.13, 0.13));
    g.rotation.set(0.2, -0.7, 0);
  } else if (cat === 'line') {
    B.add(G.cyl(18), '#334155', M(0, 0, -0.22, 0.8, 0.06, 0.8, Math.PI / 2, 0, 0));
    B.add(G.cyl(18), '#334155', M(0, 0, 0.22, 0.8, 0.06, 0.8, Math.PI / 2, 0, 0));
    B.add(G.cyl(18), it.col, M(0, 0, 0, 0.62, 0.4, 0.62, Math.PI / 2, 0, 0));
    B.add(G.cyl(12), '#0f172a', M(0, 0, 0, 0.2, 0.5, 0.2, Math.PI / 2, 0, 0));
    g.rotation.set(0.25, -0.8, 0);
  } else if (cat === 'hook') {
    const n = id === 'hook3' ? 3 : 1;
    const col = id === 'hook4' ? '#fbbf24' : '#cbd5e1';
    for (let i = 0; i < n; i++) {
      const hb = tube([[0, 0.5, 0], [0, 0, 0], [0.03, -0.3, 0], [0.2, -0.44, 0], [0.36, -0.28, 0], [0.34, -0.08, 0]], id === 'hook1' ? 0.028 : 0.034, 6);
      B.add(hb, col, M(0, 0, 0, 1, 1, 1, 0, (i * Math.PI * 2) / 3, 0));
    }
    B.add(G.torus(0.3, 8), col, M(0, 0.55, 0, 0.1, 0.1, 0.1));
    g.rotation.set(0, -0.4, 0.15);
  } else if (cat === 'bag') {
    if (id === 'bag1') {
      for (let i = 0; i < 4; i++) B.add(G.torus(0.035, 18), '#3f6212', M(0, 0.36 - i * 0.24, 0, 0.62, 0.62, 0.62, Math.PI / 2, 0, 0));
      B.add(G.cyl(14), '#65a30d', M(0, 0, 0, 0.58, 0.74, 0.58), { grad: [0.6, 1.1] });
      B.add(G.torus(0.04, 12, Math.PI), '#1f2937', M(0, 0.4, 0, 0.5, 0.5, 0.5));
    } else if (id === 'bag2') {
      B.add(G.cyl(16, 1, 0.78), '#64748b', M(0, 0, 0, 0.74, 0.7, 0.74), { grad: [0.7, 1.1] });
      B.add(G.torus(0.05, 18), '#94a3b8', M(0, 0.35, 0, 0.76, 0.76, 0.76, Math.PI / 2, 0, 0));
      B.add(G.torus(0.04, 14, Math.PI), '#1f2937', M(0, 0.35, 0, 0.74, 0.9, 0.74));
    } else {
      const c = id === 'bag3' ? '#2f6fd6' : id === 'bag4' ? '#0ea5e9' : '#c9975c';
      const w = id === 'bag3' ? 0.8 : 0.96;
      B.add(G.box(), c, M(0, -0.08, 0, w, 0.5, 0.56), { grad: [0.8, 1.06] });
      B.add(G.box(), id === 'bag5' ? shade(c, -0.2) : '#eef3f8', M(0, 0.22, 0, w + 0.04, 0.12, 0.6));
      B.add(G.box(), '#1f2937', M(0, 0.3, 0, 0.34, 0.05, 0.1));
      if (id === 'bag4') for (const sx of [-0.36, 0.36]) B.add(G.cyl(10), '#1f2937', M(sx, -0.34, 0.2, 0.16, 0.08, 0.16, Math.PI / 2, 0, 0));
      if (id === 'bag5') for (const sx of [-0.25, 0.25]) B.add(G.box(), '#fbbf24', M(sx, 0.12, 0.29, 0.1, 0.12, 0.03));
    }
    g.rotation.set(0.35, -0.6, 0);
  } else if (id === 'net') {
    B.add(G.torus(0.05, 20), '#22d3ee', M(0.12, 0.14, 0, 0.62, 0.62, 0.62));
    B.add(G.sph(14, 8), '#e2e8f0', M(0.12, 0.14, -0.1, 0.56, 0.56, 0.36), { grad: [0.6, 1] });
    B.add(G.cyl(8), '#1f2937', M(-0.3, -0.26, 0, 0.05, 0.56, 0.05, 0, 0, -0.82));
    g.rotation.set(-0.2, 0.3, 0);
  } else if (id === 'sonar') {
    B.add(G.box(), '#1f2937', M(0, 0, 0, 0.78, 0.56, 0.16));
    B.add(G.box(), '#083344', M(0, 0.03, 0.085, 0.64, 0.4, 0.02));
    for (let i = 0; i < 4; i++) B.add(G.torus(0.06, 12, Math.PI * 0.6), '#22d3ee', M(0, -0.14, 0.1, 0.16 + i * 0.13, 0.16 + i * 0.13, 0.1, 0, 0, Math.PI * 0.2));
    B.add(G.box(), '#fbbf24', M(0.2, 0.08, 0.1, 0.1, 0.05, 0.02));
    B.add(G.cyl(6), '#64748b', M(0.3, 0.38, 0, 0.03, 0.22, 0.03));
    g.rotation.set(0.1, -0.35, 0);
  } else if (id === 'bread') {
    B.add(G.ico(1), '#f1d9a8', M(0, 0, 0, 0.62, 0.5, 0.56), { flat: true });
    B.add(G.ico(1), '#e6c88e', M(0.3, -0.18, 0.1, 0.26, 0.22, 0.24), { flat: true });
    B.add(G.ico(1), '#f6e3b9', M(-0.3, -0.2, 0.12, 0.2, 0.18, 0.2), { flat: true });
  } else if (id === 'worm') {
    B.add(tube([[-0.4, -0.12, 0], [-0.2, 0.14, 0.05], [0, -0.04, -0.03], [0.18, 0.18, 0.04], [0.4, 0.02, 0]], 0.07, 9, (t) => 0.8 + 0.3 * Math.sin(t * Math.PI)), '#f08a8a', M(0, 0, 0, 1, 1, 1), null);
    B.add(tube([[-0.06, 0.03, 0.0], [0, -0.035, -0.03], [0.06, 0.05, 0.02]], 0.078, 9), '#f6b0a8', M(0, 0, 0, 1, 1, 1), null);
    g.scale.setScalar(1.1);
    g.userData.tubeR = 0.07;
  } else if (id === 'maggot') {
    for (const [x, y, rz] of [[-0.18, 0.1, 0.5], [0.12, -0.02, -0.3], [-0.05, -0.22, 1.2]]) {
      for (let i = 0; i < 5; i++) B.add(G.sph(8, 6), i % 2 ? '#f5efdc' : '#fffaf0', M(x + Math.cos(rz) * (i - 2) * 0.07, y + Math.sin(rz) * (i - 2) * 0.07, 0, 0.13 - Math.abs(i - 2) * 0.015, 0.13 - Math.abs(i - 2) * 0.015, 0.13));
    }
  } else if (id === 'corn') {
    for (const [x, y, z] of [[-0.2, 0.08, 0], [0.16, 0.14, 0.05], [0, -0.16, 0.1], [0.28, -0.14, -0.05], [-0.26, -0.2, -0.05]]) B.add(G.sph(10, 8), '#fbbf24', M(x, y, z, 0.26, 0.3, 0.2, 0, 0, x), { grad: [0.85, 1.15] });
  } else if (id === 'shrimp') {
    B.add(tube([[-0.34, 0.1, 0], [-0.1, 0.24, 0], [0.18, 0.16, 0], [0.32, -0.08, 0], [0.2, -0.28, 0]], 0.085, 10, (t) => 1.25 - t * 0.85), '#fb923c', M(0, 0, 0, 1, 1, 1), null);
    B.add(G.cone(5), '#fdba74', M(0.12, -0.36, 0, 0.2, 0.18, 0.05, 0, 0, 2.2));
    B.add(G.sph(6, 5), '#111827', M(-0.34, 0.16, 0.06, 0.05, 0.05, 0.05));
    for (const s of [0.05, -0.05]) B.add(G.cyl(4), '#fdba74', M(-0.5, 0.2, s, 0.012, 0.3, 0.012, 0, 0, 1.0));
    g.userData.tubeR = 0.085;
  } else if (id === 'live') {
    fishlet(B, 0, 0, 0, 0.95);
  } else if (id === 'squid') {
    B.add(loft([[-0.1, 0.16, 0.14], [0.2, 0.15, 0.13], [0.42, 0.02, 0.02]], 12), '#f5c6d6', M(0, 0.02, 0, 1, 1, 1), { grad: [0.9, 1.1] });
    B.add(G.cone(4), '#f9a8d4', M(0, 0.34, 0, 0.5, 0.2, 0.05));
    for (let i = 0; i < 6; i++) B.add(tube([[(i - 2.5) * 0.05, -0.1, 0], [(i - 2.5) * 0.08, -0.28, 0.03], [(i - 2.5) * 0.1, -0.44, 0]], 0.03, 5, (t) => 1 - t * 0.6), '#f9a8d4', M(0, 0, 0, 1, 1, 1), null);
    for (const s of [-0.07, 0.07]) B.add(G.sph(6, 5), '#111827', M(s, -0.04, 0.13, 0.05, 0.05, 0.04));
    g.userData.tubeR = 0.03;
  } else if (id === 'boot') {
    B.add(G.box(), '#6b4f3a', M(-0.08, 0.1, 0, 0.3, 0.6, 0.3), { grad: [0.8, 1.05] });
    B.add(loft([[-0.2, 0.17, 0.12], [0.1, 0.16, 0.13], [0.36, 0.12, 0.1]], 10, 2.6), '#5b4230', M(0.05, -0.22, 0, 1, 1, 1, 0, 0, -Math.PI / 2));
    B.add(G.box(), '#2b2118', M(0.06, -0.36, 0, 0.64, 0.06, 0.3));
    B.add(G.torus(0.2, 10), '#3f2f22', M(-0.08, 0.4, 0, 0.36, 0.36, 0.36, Math.PI / 2, 0, 0));
    g.rotation.set(0.1, -0.6, 0.12);
  } else if (id === 'can') {
    B.add(G.cyl(14), '#94a3b8', M(0, 0, 0, 0.46, 0.62, 0.46), { grad: [0.75, 1.1] });
    B.add(G.cyl(14), '#ef4444', M(0, 0, 0, 0.47, 0.32, 0.47));
    B.add(G.cyl(14), '#cbd5e1', M(0, 0.32, 0.1, 0.4, 0.02, 0.4, 0.5, 0, 0));
    g.rotation.set(0.3, 0.3, 0.25);
  } else if (id === 'weed') {
    for (let i = 0; i < 6; i++) B.add(tube([[(i - 2.5) * 0.06, -0.4, 0], [(i - 2.5) * 0.14 + 0.05, -0.1, 0.05], [(i - 2.5) * 0.1, 0.18, -0.04], [(i - 2.5) * 0.2, 0.42, 0]], 0.045, 5, (t) => 1.3 - t), i % 2 ? '#3f9a3a' : '#2f7d32', M(0, 0, 0, 1, 1, 1), null);
    g.userData.tubeR = 0.045;
  } else if (id === 'bottle') {
    B.add(loft([[-0.4, 0.15, 0.15], [0.05, 0.16, 0.16], [0.18, 0.06, 0.06], [0.36, 0.055, 0.055]], 12), '#5eead4', M(0, 0, 0, 1, 1, 1), { grad: [0.8, 1.1] });
    B.add(G.cyl(10), '#b45309', M(0, 0.4, 0, 0.1, 0.1, 0.1));
    B.add(G.cyl(10), '#fef3c7', M(0, -0.14, 0, 0.2, 0.34, 0.2));
    g.rotation.z = 0.7;
  } else if (id === 'chest') {
    B.add(G.box(), '#8a5a2b', M(0, -0.12, 0, 0.84, 0.4, 0.52), { grad: [0.8, 1.05] });
    B.add(G.cyl(12), '#9c6a36', M(0, 0.08, 0, 0.52, 0.84, 0.52, 0, 0, Math.PI / 2));
    for (const sx of [-0.3, 0, 0.3]) B.add(G.box(), '#fbbf24', M(sx, -0.04, 0, 0.07, 0.6, 0.55));
    B.add(G.box(), '#fde047', M(0, -0.02, 0.27, 0.14, 0.16, 0.04));
    g.rotation.set(0.3, -0.6, 0);
  }
  if (!B.empty) {
    const m = B.build(BATCH_MAT_2S);
    // трубки строятся единичного радиуса с множителем — сжимаем здесь
    g.add(m);
  }
  return g;
}
