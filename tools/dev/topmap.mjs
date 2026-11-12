import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read('/home/claude/rybak/public/models/prop-boat.glb');
const pts = [];
for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh(); if (!mesh) continue;
  const m = node.getWorldMatrix();
  for (const prim of mesh.listPrimitives()) {
    const a = prim.getAttribute('POSITION'); const idx = prim.getIndices(); const v = [0, 0, 0]; const P = [];
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
// сетка сверху: для каждой клетки (x, z) — самая высокая грань, смотрящая вверх
const rows = [];
for (let z = -0.25; z <= 0.2501; z += 0.05) {
  let s = z.toFixed(2).padStart(6) + ' ';
  for (let x = -0.5; x < 0.5; x += 0.04) {
    let top = -1;
    for (const t of pts) if (t.ny > 0.6 && t.c[0] >= x && t.c[0] < x + 0.04 && Math.abs(t.c[2] - z) < 0.025) top = Math.max(top, t.c[1]);
    s += top < 0 ? ' ..' : ' ' + Math.round(top * 100).toString().padStart(2);
  }
  rows.push(s);
}
console.log('высота верхней грани, см на единицу длины (x от -0.5 слева до 0.5, шаг 0.04):');
console.log(rows.join('\n'));
