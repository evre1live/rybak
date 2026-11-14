// Деревья и кусты «из кода»: сосна, лиственное дерево, куст. Ими засажены все локации.
// Каждое дерево, кроме процедурной сетки, оставляет запись «где и какого роста» (ENV.flora): по ним потом
// встают готовые модели (envmodels.js); сетка остаётся запасной — для пробной версии без моделей.
import * as THREE from 'three';
import { M, G } from './batch.js';
import { ENV } from './envmodels.js';
import { spot01 } from './scatter.js';
import { blobGeo, shade, TAU } from './util.js';

const BLOBS = [blobGeo(3, 2), blobGeo(8, 2), blobGeo(15, 2), blobGeo(22, 2)];
const BLOBS_FAR = [blobGeo(3, 1, 0.16), blobGeo(15, 1, 0.16)]; // вдали хватит и грубой кроны
const blobOf = (B, r) => (B.far ? BLOBS_FAR[Math.floor(r() * BLOBS_FAR.length)] : BLOBS[Math.floor(r() * BLOBS.length)]);

/** Сосна. B — набор, куда уходит сетка (B.ghost — дерево «в никуда»: записи для модели не оставляет); s — размер; r — случайные числа. */
export function pine(B, x, y, z, s, r) {
  B.add(G.cyl(6, 0.6, 1), '#7a5230', M(x, y + 0.7 * s, z, 0.34 * s, 1.5 * s, 0.34 * s), { grad: [0.7, 1], mat: 1 });
  const tiers = 3 + (r() < 0.5 ? 1 : 0);
  if (!B.ghost) ENV.flora['env-pine'].push({ x, y, z, s: (1.1 + 1.02 * tiers) * s * 1.06, ry: spot01(x, z, 3) * TAU });
  const base = ['#2f8f4e', '#2a8246', '#37a058'][Math.floor(r() * 3)];
  for (let i = 0; i < tiers; i++) {
    const k = i / tiers;
    const rad = (1.5 - k * 0.95) * s;
    B.add(G.cone(8), shade(base, i * 0.07), M(x, y + (1.25 + i * 1.02) * s, z, rad * 2, 1.75 * s, rad * 2, 0, r() * 3, 0), { grad: [0.62, 1.12], mat: 3 });
  }
}
/** Лиственное дерево — дуб, каждое третье — берёза (она выше и уже). birch: true/false — задать породу самому. */
export function roundTree(B, x, y, z, s, r, birch = spot01(x, z, 5) < 0.3) {
  B.add(G.cyl(6, 0.7, 1), '#8a5f3a', M(x, y + 0.9 * s, z, 0.36 * s, 1.9 * s, 0.36 * s, 0, 0, (r() - 0.5) * 0.12), { grad: [0.7, 1], mat: 1 });
  if (!B.ghost) ENV.flora[birch ? 'env-birch' : 'env-oak'].push({ x, y, z, s: (birch ? 5.0 : 4.4) * s, ry: spot01(x, z, 3) * TAU });
  const base = ['#62b84e', '#74c75a', '#57a947', '#86cf63'][Math.floor(r() * 4)];
  const n = 3 + Math.floor(r() * 2);
  for (let i = 0; i < n; i++) {
    const a = r() * TAU;
    const d = i ? (0.55 + r() * 0.4) * s : 0;
    const rad = (i ? 1.0 + r() * 0.5 : 1.55) * s;
    B.add(blobOf(B, r), shade(base, (r() - 0.5) * 0.12), M(x + Math.cos(a) * d, y + (2.25 + (i ? r() * 0.7 : 0.35)) * s, z + Math.sin(a) * d, rad * 1.04, rad * 0.9, rad * 1.04, r() * 0.4, r() * 3, 0), { grad: [0.55, 1.16], mat: 3 });
  }
}
export function bush(B, x, y, z, s, r) {
  if (!B.ghost) ENV.flora['env-bush'].push({ x, y: y - 0.04, z, s: 1.5 * s, ry: spot01(x, z, 3) * TAU });
  const base = ['#58b848', '#4aa63f', '#6cc956'][Math.floor(r() * 3)];
  for (let i = 0; i < 2; i++) B.add(blobOf(B, r), shade(base, (r() - 0.5) * 0.1), M(x + (r() - 0.5) * s, y + 0.3 * s, z + (r() - 0.5) * s, (0.52 + r() * 0.26) * s, 0.42 * s, (0.52 + r() * 0.26) * s, 0, r() * 3, 0), { grad: [0.55, 1.14], mat: 3 });
}

// Дальние деревья (острова за краем моря, лес на склонах гор): до них сотни метров, поэтому крона — два конуса
// или один комок листвы, без ствола; готовых моделей на их места не встаёт.
const FAR_CONE = (() => {
  const pos = [];
  for (let i = 0; i < 6; i++) {
    const a0 = (i / 6) * TAU, a1 = ((i + 1) / 6) * TAU;
    pos.push(0, 0.5, 0, Math.cos(a1) * 0.5, -0.5, Math.sin(a1) * 0.5, Math.cos(a0) * 0.5, -0.5, Math.sin(a0) * 0.5);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
})();
const FAR_CROWNS = [blobGeo(5, 0, 0.14), blobGeo(19, 0, 0.14)];
/** Дальняя сосна: t — { x, y, z, h — высота }; tone — темнее (меньше нуля) или светлее обычного. */
export function farPine(B, t, r, tone = 0) {
  const base = ['#2f8f4e', '#2a8246', '#37a058'][Math.floor(r() * 3)];
  const h = t.h;
  B.add(FAR_CONE, shade(base, -0.04 + tone), M(t.x, t.y + 0.3 * h, t.z, 0.52 * h, 0.66 * h, 0.52 * h, 0, r() * 3, 0), { grad: [0.55, 1.1], mat: 3 });
  B.add(FAR_CONE, shade(base, 0.06 + tone), M(t.x, t.y + 0.72 * h, t.z, 0.36 * h, 0.56 * h, 0.36 * h, 0, r() * 3, 0), { grad: [0.68, 1.14], mat: 3 });
}
/** Дальнее лиственное дерево — комок листвы на земле. */
export function farCrown(B, t, r) {
  const base = ['#62b84e', '#74c75a', '#57a947', '#86cf63'][Math.floor(r() * 4)];
  const h = t.h * 0.8;
  const w = h * (0.5 + r() * 0.16);
  // комок листвы стоит на земле (низ чуть утоплен): издали это купа деревьев, а не шар, повисший над лугом
  B.add(FAR_CROWNS[Math.floor(r() * FAR_CROWNS.length)], shade(base, -0.06 + (r() - 0.5) * 0.12), M(t.x, t.y + 0.4 * h, t.z, w, h * 0.56, w, 0, r() * 3, 0), { grad: [0.5, 1.12], mat: 3 });
}

