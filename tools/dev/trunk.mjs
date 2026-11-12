// Где у модели дерева комель и куда смотрит крона: node tools/dev/trunk.mjs <файл.glb> …
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
for (const file of process.argv.slice(2)) {
  const doc = await io.read(file);
  const P = [];
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    const m = node.getWorldMatrix();
    for (const prim of mesh.listPrimitives()) {
      const a = prim.getAttribute('POSITION');
      const v = [0, 0, 0];
      for (let i = 0; i < a.getCount(); i++) {
        a.getElement(i, v);
        P.push([m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12], m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13], m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14]]);
      }
    }
  }
  const box = (lo, hi) => {
    let x0 = 9, x1 = -9, z0 = 9, z1 = -9, n = 0;
    for (const p of P) if (p[1] >= lo && p[1] <= hi) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[2]); z1 = Math.max(z1, p[2]); n++; }
    return n ? `середина (${((x0 + x1) / 2).toFixed(3)}, ${((z0 + z1) / 2).toFixed(3)}) размер ${(x1 - x0).toFixed(3)} × ${(z1 - z0).toFixed(3)} [${n}]` : 'пусто';
  };
  console.log(file.split('/').pop());
  for (const [lo, hi] of [[0, 0.03], [0.03, 0.1], [0.1, 0.2], [0.2, 0.4], [0.4, 0.6], [0.6, 0.8], [0.8, 1.01]]) console.log(`  y ${lo}–${hi}:`, box(lo, hi));
}
