// Внутренние стенки модели на срезе по X: node tools/dev/walls.mjs <файл.glb> <x> [полуширина среза]
// Печатает по высотам, где внутренняя поверхность бортов (нормаль смотрит к середине).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const [file, xs, ws = '0.03'] = process.argv.slice(2);
const X = +xs;
const W = +ws;
const doc = await io.read(file);
const rows = new Map();
for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const m = node.getWorldMatrix();
  for (const prim of mesh.listPrimitives()) {
    const a = prim.getAttribute('POSITION');
    const idx = prim.getIndices();
    const v = [0, 0, 0];
    const P = [];
    for (let i = 0; i < a.getCount(); i++) {
      a.getElement(i, v);
      P.push([m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12], m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13], m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14]]);
    }
    const n = idx ? idx.getCount() : P.length;
    for (let i = 0; i < n; i += 3) {
      const [A, B, C] = [0, 1, 2].map((k) => P[idx ? idx.getScalar(i + k) : i + k]);
      const c = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3, (A[2] + B[2] + C[2]) / 3];
      if (Math.abs(c[0] - X) > W) continue;
      const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], vx = C[0] - A[0], vy = C[1] - A[1], vz = C[2] - A[2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const l = Math.hypot(nx, ny, nz) || 1;
      // внутренняя стенка: нормаль смотрит к середине лодки
      if (Math.abs(nz / l) < 0.5 || Math.sign(nz) === Math.sign(c[2])) continue;
      const y = Math.round(c[1] / 0.02) * 0.02;
      const k = y.toFixed(2) + (c[2] < 0 ? ' −z' : ' +z');
      const r = rows.get(k) || { min: 9, max: -9, n: 0 };
      r.min = Math.min(r.min, Math.abs(c[2]));
      r.max = Math.max(r.max, Math.abs(c[2]));
      r.n++;
      rows.set(k, r);
    }
  }
}
for (const k of [...rows.keys()].sort()) { const r = rows.get(k); console.log(k, '|z| от', r.min.toFixed(3), 'до', r.max.toFixed(3), `(${r.n})`); }
