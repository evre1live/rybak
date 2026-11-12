// Где у модели окна: ищет на сетке тёмное синеватое стекло и голубые ставни по цвету текстуры и печатает
// их рамки по стенам. node tools/dev/windows.mjs <файл.glb>
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(process.argv[2]);
const pts = { glass: [], blue: [] };
for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const m = node.getWorldMatrix();
  const W = (v) => [m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12], m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13], m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14]];
  for (const prim of mesh.listPrimitives()) {
    const tex = prim.getMaterial().getBaseColorTexture();
    const { data, info } = await sharp(Buffer.from(tex.getImage())).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const P = prim.getAttribute('POSITION');
    const UV = prim.getAttribute('TEXCOORD_0');
    const idx = prim.getIndices();
    const n = idx ? idx.getCount() : P.getCount();
    const col = (u, v) => {
      const x = Math.min(info.width - 1, Math.max(0, Math.floor((u - Math.floor(u)) * info.width)));
      const y = Math.min(info.height - 1, Math.max(0, Math.floor((v - Math.floor(v)) * info.height)));
      const i = (y * info.width + x) * 3;
      return [data[i] / 255, data[i + 1] / 255, data[i + 2] / 255];
    };
    for (let i = 0; i < n; i += 3) {
      const id = [0, 1, 2].map((k) => (idx ? idx.getScalar(i + k) : i + k));
      const p = id.map((j) => W(P.getElement(j, [0, 0, 0])));
      const t = id.map((j) => UV.getElement(j, [0, 0]));
      const ux = p[1][0] - p[0][0], uy = p[1][1] - p[0][1], uz = p[1][2] - p[0][2], vx = p[2][0] - p[0][0], vy = p[2][1] - p[0][1], vz = p[2][2] - p[0][2];
      let nrm = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
      const l = Math.hypot(...nrm) || 1;
      nrm = nrm.map((v) => v / l);
      // точки внутри треугольника: сетка барицентрических координат
      const N = 6;
      for (let a = 0; a <= N; a++)
        for (let b = 0; b <= N - a; b++) {
          const w = [(a + 0.33) / (N + 1), (b + 0.33) / (N + 1)];
          w.push(1 - w[0] - w[1]);
          const q = [0, 1, 2].map((k) => p[0][k] * w[0] + p[1][k] * w[1] + p[2][k] * w[2]);
          const uv = [0, 1].map((k) => t[0][k] * w[0] + t[1][k] * w[1] + t[2][k] * w[2]);
          const [r, g, bl] = col(uv[0], uv[1]);
          const v = Math.max(r, g, bl);
          if (v < 0.36 && bl - r > 0.05 && bl >= g - 0.02) pts.glass.push({ q, nrm });
          else if (bl > 0.55 && bl - r > 0.28) pts.blue.push({ q, nrm });
        }
    }
  }
}
const side = (n) => (Math.abs(n[0]) > Math.abs(n[2]) ? (n[0] > 0 ? '+x' : '-x') : n[2] > 0 ? '+z' : '-z');
for (const kind of ['glass', 'blue']) {
  console.log(`\n== ${kind}: ${pts[kind].length} точек`);
  const by = {};
  for (const p of pts[kind]) if (Math.abs(p.nrm[1]) < 0.6) (by[side(p.nrm)] ||= []).push(p.q);
  for (const s of Object.keys(by).sort()) {
    // вдоль стены: для ±z — ось x, для ±x — ось z; разбиваем на группы по разрывам
    const ax = s[1] === 'z' ? 0 : 2;
    const list = by[s].sort((a, b) => a[ax] - b[ax]);
    let grp = [list[0]];
    const flush = () => {
      if (grp.length < (kind === 'glass' ? 25 : 60)) return;
      const lo = [0, 1, 2].map((k) => Math.min(...grp.map((q) => q[k])));
      const hi = [0, 1, 2].map((k) => Math.max(...grp.map((q) => q[k])));
      // по высоте группа может содержать два окна (чердачное над обычным): печатаем и гистограмму высот
      const ys = grp.map((q) => q[1]).sort((a, b) => a - b);
      console.log(s, `n=${grp.length}`, 'x', lo[0].toFixed(3), hi[0].toFixed(3), ' y', lo[1].toFixed(3), hi[1].toFixed(3), ' z', lo[2].toFixed(3), hi[2].toFixed(3), ' медиана y', ys[ys.length >> 1].toFixed(3));
    };
    for (let i = 1; i < list.length; i++) {
      if (list[i][ax] - list[i - 1][ax] > 0.03) {
        flush();
        grp = [];
      }
      grp.push(list[i]);
    }
    flush();
  }
}
// чердачные окошки в щипцах: стекло выше обычных окон
const hi = pts.glass.filter((p) => p.q[1] > 0.3);
for (const sx of [-1, 1]) {
  const g = hi.filter((p) => Math.sign(p.q[0]) === sx).map((p) => p.q);
  if (!g.length) continue;
  const lo = [0, 1, 2].map((k) => Math.min(...g.map((q) => q[k])));
  const up = [0, 1, 2].map((k) => Math.max(...g.map((q) => q[k])));
  console.log('чердак', sx > 0 ? '+x' : '-x', `n=${g.length}`, 'x', lo[0].toFixed(3), up[0].toFixed(3), ' y', lo[1].toFixed(3), up[1].toFixed(3), ' z', lo[2].toFixed(3), up[2].toFixed(3));
}
// стекло обычных окон в щипцах и в длинных стенах — подробно, по окну
const boxes = { 'щипец +x': (q) => q[0] > 0.42 && q[1] > 0.1 && q[1] < 0.28, 'щипец -x': (q) => q[0] < -0.42 && q[1] > 0.1 && q[1] < 0.28, '+z левое': (q) => q[2] > 0.29 && q[0] < 0 && q[1] > 0.1, '+z правое': (q) => q[2] > 0.29 && q[0] > 0 && q[1] > 0.1, '-z левое': (q) => q[2] < -0.24 && q[0] < -0.1 && q[1] > 0.1, '-z правое': (q) => q[2] < -0.24 && q[0] > 0.1 && q[1] > 0.1 };
for (const [name, f] of Object.entries(boxes)) {
  const g = pts.glass.filter((p) => f(p.q)).map((p) => p.q);
  if (!g.length) continue;
  const pc = (k, t) => g.map((q) => q[k]).sort((a, b) => a - b)[Math.floor((g.length - 1) * t)].toFixed(3);
  console.log(name, `n=${g.length}`, 'x', pc(0, 0.03), pc(0, 0.5), pc(0, 0.97), ' y', pc(1, 0.03), pc(1, 0.5), pc(1, 0.97), ' z', pc(2, 0.03), pc(2, 0.5), pc(2, 0.97));
}
