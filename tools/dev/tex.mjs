// Достаёт текстуру цвета из готовой модели: node tools/dev/tex.mjs <файл.glb> <куда.png>
import fs from 'node:fs';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const [file, out] = process.argv.slice(2);
const doc = await io.read(file);
for (const mat of doc.getRoot().listMaterials()) {
  const t = mat.getBaseColorTexture();
  if (!t) continue;
  const img = sharp(Buffer.from(t.getImage()));
  const meta = await img.metadata();
  await img.png().toFile(out);
  const st = await sharp(Buffer.from(t.getImage())).stats();
  console.log(mat.getName(), meta.width + '×' + meta.height, 'средний цвет', st.channels.slice(0, 3).map((c) => Math.round(c.mean)).join(' '), 'коэф. цвета', mat.getBaseColorFactor().map((v) => +v.toFixed(2)).join(' '));
}
