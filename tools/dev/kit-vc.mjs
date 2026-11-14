// node tools/dev/kit-vc.mjs <file.gltf>… — цвет вершин по материалам: среднее, разброс
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
for (const f of process.argv.slice(2)) {
  const doc = await io.read(f);
  const out = [];
  for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) {
    const c = p.getAttribute('COLOR_0');
    if (!c) { out.push(p.getMaterial().getName() + ': —'); continue; }
    const n = c.getCount(); const e = []; const mn = [9, 9, 9, 9]; const mx = [0, 0, 0, 0]; const s = [0, 0, 0, 0];
    for (let i = 0; i < n; i++) { c.getElement(i, e); e.forEach((v, k) => { mn[k] = Math.min(mn[k], v); mx[k] = Math.max(mx[k], v); s[k] += v; }); }
    out.push(`${p.getMaterial().getName()} ${c.getType()}/${c.getComponentType()}${c.getNormalized() ? 'n' : ''}: avg ${s.slice(0, c.getElementSize()).map((v) => (v / n).toFixed(2)).join(',')} min ${mn.slice(0, c.getElementSize()).map((v) => v.toFixed(2)).join(',')} max ${mx.slice(0, c.getElementSize()).map((v) => v.toFixed(2)).join(',')}`);
  }
  console.log(f.split('/').pop() + ' | ' + out.join(' | '));
}
