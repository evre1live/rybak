import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(process.argv[2] || 'public/models/prop-boat.glb');
const root = doc.getRoot();
const pts = [];
for (const node of root.listNodes()) {
  const mesh = node.getMesh(); if (!mesh) continue;
  const m = node.getWorldMatrix();
  for (const prim of mesh.listPrimitives()) {
    const a = prim.getAttribute('POSITION'); const idx = prim.getIndices(); const v = [0, 0, 0];
    const P = [];
    for (let i = 0; i < a.getCount(); i++) { a.getElement(i, v); P.push([m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12], m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13], m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14]]); }
    const n = idx ? idx.getCount() : P.length;
    for (let i = 0; i < n; i += 3) {
      const [A, B, C] = [0, 1, 2].map((k) => P[idx ? idx.getScalar(i + k) : i + k]);
      const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], vx = C[0] - A[0], vy = C[1] - A[1], vz = C[2] - A[2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1;
      pts.push({ c: [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3, (A[2] + B[2] + C[2]) / 3], ny: ny / l, area: l / 2 });
    }
  }
}
const band = (x0, x1) => pts.filter((t) => t.c[0] >= x0 && t.c[0] < x1);
console.log('ось X: ширина (макс |z|) и верх (макс y) по длине');
for (let x = -0.5; x < 0.5; x += 0.1) { const b = band(x, x + 0.1); console.log(x.toFixed(1), 'ширина', Math.max(...b.map((t) => Math.abs(t.c[2]))).toFixed(3), 'верх', Math.max(...b.map((t) => t.c[1])).toFixed(3), 'низ', Math.min(...b.map((t) => t.c[1])).toFixed(3)); }
console.log('горизонтальные площадки у оси (|z| < 0.12), смотрят вверх: высота → площадь');
const hist = {};
for (const t of pts) if (t.ny > 0.85 && Math.abs(t.c[2]) < 0.12) { const k = (Math.round(t.c[1] * 50) / 50).toFixed(2); hist[k] = (hist[k] || 0) + t.area; }
console.log(Object.entries(hist).sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}:${(v * 1000).toFixed(1)}`).join('  '));
console.log('где такие площадки по длине (y, x):'); const where = {};
for (const t of pts) if (t.ny > 0.85 && Math.abs(t.c[2]) < 0.12) { const k = (Math.round(t.c[1] * 25) / 25).toFixed(2) + '@' + (Math.round(t.c[0] * 5) / 5).toFixed(1); where[k] = (where[k] || 0) + t.area; }
console.log(Object.entries(where).filter(([, v]) => v > 0.002).sort().map(([k, v]) => `${k}:${(v * 1000).toFixed(0)}`).join('  '));
