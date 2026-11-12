// Текстура цвета из GLB — в PNG (карта свечения, если есть, — рядом, с «-glow» в имени): node tools/dev/dumptex.mjs <файл.glb> <куда.png>
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(process.argv[2]);
for (const mat of doc.getRoot().listMaterials()) {
  const t = mat.getBaseColorTexture();
  console.log(mat.getName(), t && t.getMimeType(), t && t.getSize(), 'emissive', mat.getEmissiveFactor(), !!mat.getEmissiveTexture(), 'normal', !!mat.getNormalTexture());
  if (t) await sharp(Buffer.from(t.getImage())).png().toFile(process.argv[3]);
  const e = mat.getEmissiveTexture();
  if (e) await sharp(Buffer.from(e.getImage())).png().toFile(process.argv[3].replace(/\.png$/, '-glow.png'));
}
