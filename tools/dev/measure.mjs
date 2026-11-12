// Замеры готовой модели: срезы по высоте и карта верхних граней. node tools/dev/measure.mjs <файл.glb> [slices|top] [шаг]
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const [file, mode = 'slices', stepArg] = process.argv.slice(2);
const doc = await io.read(file);
const tris = [];
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
      const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], vx = C[0] - A[0], vy = C[1] - A[1], vz = C[2] - A[2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const l = Math.hypot(nx, ny, nz) || 1;
      tris.push({ c: [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3, (A[2] + B[2] + C[2]) / 3], n: [nx / l, ny / l, nz / l], area: l / 2, pts: [A, B, C] });
    }
  }
}
const f = (v) => v.toFixed(3).padStart(7);
if (mode === 'slices') {
  const step = +(stepArg || 0.05);
  console.log('   y     x от     x до     z от     z до   (середина x, z)');
  for (let y = 0; y < 1.0001; y += step) {
    let x0 = 9, x1 = -9, z0 = 9, z1 = -9;
    for (const t of tris) for (const p of t.pts) if (Math.abs(p[1] - y) < step / 2) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[2]); z1 = Math.max(z1, p[2]); }
    if (x0 < 9) console.log(y.toFixed(2).padStart(5), f(x0), f(x1), f(z0), f(z1), '  ', f((x0 + x1) / 2), f((z0 + z1) / 2));
  }
} else {
  const step = +(stepArg || 0.04);
  let bx0 = 9, bx1 = -9, bz0 = 9, bz1 = -9;
  for (const t of tris) for (const p of t.pts) { bx0 = Math.min(bx0, p[0]); bx1 = Math.max(bx1, p[0]); bz0 = Math.min(bz0, p[2]); bz1 = Math.max(bz1, p[2]); }
  console.log(`высота верхней грани (сотые доли размера), x от ${bx0.toFixed(2)} до ${bx1.toFixed(2)} слева направо, шаг ${step}; строки — z от ${bz0.toFixed(2)}`);
  for (let z = bz0; z <= bz1 + 1e-6; z += step) {
    let s = z.toFixed(2).padStart(6) + ' ';
    for (let x = bx0; x < bx1; x += step) {
      let top = -1;
      for (const t of tris) if (t.n[1] > 0.6 && t.c[0] >= x && t.c[0] < x + step && Math.abs(t.c[2] - z) < step / 2) top = Math.max(top, t.c[1]);
      s += top < 0 ? ' ..' : ' ' + Math.round(top * 100).toString().padStart(2);
    }
    console.log(s);
  }
}
