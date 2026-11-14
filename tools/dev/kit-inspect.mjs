// node inspect.mjs <file.gltf>... — треугольники, материалы, альфа, текстуры, размер
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { getBounds } from '@gltf-transform/core';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
for (const f of process.argv.slice(2)) {
  try {
    const doc = await io.read(f);
    const r = doc.getRoot();
    let tris = 0; const prims = [];
    for (const m of r.listMeshes()) for (const p of m.listPrimitives()) { const n = (p.getIndices() ? p.getIndices().getCount() : p.getAttribute('POSITION').getCount()) / 3; tris += n; prims.push((p.getMaterial()?.getName() || '-') + ':' + n + (p.getAttribute('COLOR_0') ? '+vc' : '')); }
    const b = getBounds(r.listScenes()[0]);
    const sz = b.max.map((v, i) => (v - b.min[i]).toFixed(2)).join('×');
    const mats = r.listMaterials().map((m) => `${m.getName()}[${m.getAlphaMode()}${m.getDoubleSided() ? ',2s' : ''}${m.getBaseColorTexture() ? ',tex=' + (m.getBaseColorTexture().getURI() || m.getBaseColorTexture().getName()) + ' ' + (m.getBaseColorTexture().getSize() || []).join('x') : ''}${m.getNormalTexture() ? ',N' : ''} c=${m.getBaseColorFactor().map((v) => v.toFixed(2)).join(',')}]`);
    const anims = r.listAnimations().map((a) => a.getName());
    console.log(`${f.split('/').pop()}: ${Math.round(tris)} tris, ${sz} m, y0=${b.min[1].toFixed(2)} | ${mats.join(' ')} | ${prims.join(' ')}${anims.length ? ' | anim: ' + anims.join(',') : ''}${r.listSkins().length ? ' skin' : ''}`);
  } catch (e) { console.log(f, 'ERR', e.message); }
}
