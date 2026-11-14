// node tools/dev/kit-color.mjs <file.gltf>… — средний цвет текстуры под развёрткой каждого материала (что за цветок)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import sharp from 'sharp';
import fs from 'node:fs';
const EXT = process.env.TEX ? fs.readFileSync(process.env.TEX) : null; // текстура, если в glTF её нет
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
for (const f of process.argv.slice(2)) {
  const doc = await io.read(f);
  const out = [];
  for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) {
    const t0 = p.getMaterial() && p.getMaterial().getBaseColorTexture();
    const t = t0 || (EXT ? { getImage: () => EXT } : null);
    const uv = p.getAttribute('TEXCOORD_0');
    if (!t || !uv) continue;
    const { data, info } = await sharp(Buffer.from(t.getImage())).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const e = [0, 0]; const s = [0, 0, 0]; let n = 0;
    for (let i = 0; i < uv.getCount(); i++) {
      uv.getElement(i, e);
      const x = Math.min(info.width - 1, Math.max(0, Math.floor((e[0] % 1 + 1) % 1 * info.width)));
      const y = Math.min(info.height - 1, Math.max(0, Math.floor((e[1] % 1 + 1) % 1 * info.height)));
      const o = (y * info.width + x) * 4;
      if (data[o + 3] < 128) continue;
      s[0] += data[o]; s[1] += data[o + 1]; s[2] += data[o + 2]; n++;
    }
    out.push(`${p.getMaterial() ? p.getMaterial().getName() : "-"}: #${s.map((v) => Math.round(v / Math.max(1, n)).toString(16).padStart(2, '0')).join('')} (${n})`);
  }
  console.log(f.split('/').pop(), out.join(' | '));
}
